// ============================================================================
// Full Pipeline Orchestrator
// ============================================================================
// Ties the core modules into an end-to-end workflow:
//   extract() → buildQuote() → augmentQuote() → generateQuotePdf()
//
// Each step is independently testable. The orchestrator just sequences them.
// ============================================================================

const { extract } = require('./intake/extractor');
const { buildQuote } = require('./quoting/builder');
const { augmentQuote } = require('./quoting/augmenter');
const { saveQuotePdf } = require('./pdf/generator');
const db = require('../db/connection');
const path = require('path');

async function runFullPipeline(rawMessage, selections, options = {}) {
  const {
    source = 'whatsapp',
    markupOverrides = {},
    currency = 'INR',
    validUntil = null,
    termsConditions = null,
    pdfOutputDir = null,
  } = options;

  // ── Step 1: Extract inquiry ──────────────────────────
  const inquiry = await extract(rawMessage, source);

  // ── Step 2: Build quote (deterministic math) ─────────
  const quote = await buildQuote(inquiry.id, selections, {
    markupOverrides,
    currency,
    validUntil,
    termsConditions,
  });

  // ── Step 3: Augment with LLM prose ───────────────────
  let quoteWithProse;
  try {
    quoteWithProse = await augmentQuote(quote.id);
  } catch (err) {
    console.warn('Prose augmentation failed (LLM may not be configured), continuing without prose:', err.message);
    const { rows } = await db.query('SELECT * FROM quotes WHERE id = $1', [quote.id]);
    quoteWithProse = rows[0];
  }

  // ── Step 4: Generate PDF ─────────────────────────────
  const { rows: lineItems } = await db.query(
    'SELECT description, quantity, unit_selling, total, sort_order FROM quote_line_items WHERE quote_id = $1 ORDER BY sort_order',
    [quote.id]
  );

  const { rows: inquiryData } = await db.query(
    'SELECT destination, pax_adults, pax_children, lead_name FROM inquiries WHERE id = $1',
    [inquiry.id]
  );

  const grandTotal = Number(quote.total_cost) + Number(quote.total_margin);

  const pdfData = {
    data: {
      quote_number: quote.quote_number,
      destination: inquiryData[0]?.destination || 'N/A',
      pax_adults: inquiryData[0]?.pax_adults || 0,
      pax_children: inquiryData[0]?.pax_children || 0,
      lead_name: inquiryData[0]?.lead_name || null,
      total_cost: quote.total_cost,
      total_margin: quote.total_margin,
      grand_total: grandTotal,
      currency: quote.currency,
      valid_until: quote.valid_until,
      terms_conditions: quote.terms_conditions,
    },
    prose: quoteWithProse?.llm_prose || null,
    lineItems: lineItems.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unit_selling: item.unit_selling,
      total: item.total,
    })),
  };

  const outputDir = pdfOutputDir || path.resolve(__dirname, '..', 'pdf_output');
  const pdfPath = path.join(outputDir, `${quote.quote_number}.pdf`);

  let pdfSaved = false;
  try {
    await saveQuotePdf(pdfData, pdfPath);
    pdfSaved = true;
  } catch (err) {
    console.warn('PDF generation skipped:', err.message);
  }

  return {
    inquiry_id: inquiry.id,
    quote_id: quote.id,
    quote_number: quote.quote_number,
    pdf_path: pdfSaved ? pdfPath : null,
    grand_total: grandTotal,
    currency: quote.currency,
    line_items: lineItems.length,
    has_prose: !!quoteWithProse?.llm_prose,
  };
}

module.exports = { runFullPipeline };
