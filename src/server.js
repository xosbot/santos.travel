// ============================================================================
// IVA Cortex — Production API Server
// ============================================================================
// Routes:
//   Public:    GET /health
//   Webhooks:  POST /webhook/whatsapp, /webhook/inquiry
//   Admin UI:  GET /admin (and /admin/* static)
//   Demo:      GET /demo
//   API:       GET  /api/products, /api/inquiries, /api/quotes, /api/quotes/:id
//              POST /api/quotes (full pipeline)
//   B2B:       POST /api/v1/b2b/quote
//   Static:    GET /pdf/:filename
// ============================================================================

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const { extract } = require('./intake/extractor');
const { runFullPipeline } = require('./orchestrator');
const { requireAuth } = require('./middleware/auth');
const { validate, quotePipelineSchema, createInquirySchema } = require('./middleware/validate');
const db = require('../db/connection');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(requireAuth);

// ── Static: Admin UI ───────────────────────────────────
const adminDir = path.resolve(__dirname, 'admin');
app.use('/admin', express.static(adminDir, { index: false }));
app.get('/admin', (_req, res) => res.sendFile(path.join(adminDir, 'index.html')));

// ── Static: Owner Demo Page ────────────────────────────
app.get('/demo', (_req, res) => {
  res.sendFile(path.join(adminDir, 'demo.html'));
});

// ── Static: Generated PDFs ─────────────────────────────
app.use('/pdf', express.static(path.resolve(__dirname, '..', 'pdf_output')));

// ── Health ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'santos-travel-iva', version: '0.1.0' });
});

// ═══════════════════════════════════════════════════════
// WEBHOOKS (public intake)
// ═══════════════════════════════════════════════════════

app.post('/webhook/whatsapp', validate(createInquirySchema), async (req, res) => {
  try {
    const inquiry = await extract(req.validated.message, 'whatsapp');
    res.status(201).json({
      status: 'triaged',
      inquiry_id: inquiry.id,
      destination: inquiry.destination,
      pax: inquiry.pax_adults + (inquiry.pax_children || 0),
    });
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

app.post('/webhook/inquiry', validate(createInquirySchema), async (req, res) => {
  try {
    const inquiry = await extract(req.validated.message, req.validated.source || 'email');
    res.status(201).json({ status: 'triaged', inquiry_id: inquiry.id });
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════
// CORE API
// ═══════════════════════════════════════════════════════

// ── Products ───────────────────────────────────────────
app.get('/api/products', async (_req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT vp.id, vp.name, vp.category, vp.base_price, vp.pricing_unit,
              vp.valid_from, vp.valid_until, v.name AS vendor_name
       FROM vendor_products vp
       JOIN vendors v ON v.id = vp.vendor_id
       WHERE vp.is_active = true AND vp.valid_from <= CURRENT_DATE AND vp.valid_until >= CURRENT_DATE
       ORDER BY v.name, vp.name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Inquiries ──────────────────────────────────────────
app.get('/api/inquiries', async (_req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, source, status, pax_adults, pax_children, destination,
              lead_name, lead_email, lead_phone, raw_message, created_at
       FROM inquiries ORDER BY created_at DESC LIMIT 50`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Quotes list ────────────────────────────────────────
app.get('/api/quotes', async (_req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT q.id, q.quote_number, q.status, q.total_cost, q.total_margin,
              q.currency, q.created_at, i.destination, i.lead_name
       FROM quotes q
       JOIN inquiries i ON i.id = q.inquiry_id
       ORDER BY q.created_at DESC LIMIT 50`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Quote by ID ────────────────────────────────────────
app.get('/api/quotes/:id', async (req, res) => {
  try {
    const { rows: quotes } = await db.query(
      `SELECT q.*, i.destination, i.pax_adults, i.pax_children, i.lead_name
       FROM quotes q JOIN inquiries i ON i.id = q.inquiry_id WHERE q.id = $1`,
      [req.params.id]
    );
    if (quotes.length === 0) return res.status(404).json({ error: 'quote not found' });

    const { rows: lineItems } = await db.query(
      'SELECT * FROM quote_line_items WHERE quote_id = $1 ORDER BY sort_order',
      [req.params.id]
    );
    res.json({ ...quotes[0], line_items: lineItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Full pipeline quote ────────────────────────────────
app.post('/api/quotes', validate(quotePipelineSchema), async (req, res) => {
  try {
    const { message, source, selections, markupOverrides, validUntil, termsConditions } = req.validated;

    const result = await runFullPipeline(message, selections, {
      source: source || 'manual',
      markupOverrides,
      validUntil,
      termsConditions,
    });

    res.status(201).json({
      ...result,
      pdf_url: `/pdf/${result.quote_number}.pdf`,
    });
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════
// B2B WHITELABEL API (Phase 5 scaffold)
// ═══════════════════════════════════════════════════════

app.post('/api/v1/b2b/quote', async (req, res) => {
  // B2B partners get a whitelabel quote under their own brand
  // TODO: multi-tenant pricing, partner commission, branded PDF
  res.status(501).json({ error: 'B2B API — coming in Phase 5' });
});

app.get('/api/v1/b2b/products', async (_req, res) => {
  res.status(501).json({ error: 'B2B API — coming in Phase 5' });
});

// ═══════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════

app.use((_req, res) => {
  res.status(404).json({ error: 'not found' });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'internal server error' });
});

// ── Start ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`IVA Cortex server listening on http://localhost:${PORT}`);
  console.log(`  Admin UI: http://localhost:${PORT}/admin`);
  console.log(`  Health:   http://localhost:${PORT}/health`);
});

module.exports = app;
