// CLI demo script — runs the full pipeline end-to-end
// Usage: node scripts/demo-pipeline.js
//
// Requires:
//   - PostgreSQL running with schema + seed applied
//   - LLM_API_KEY set (for extraction + prose, optional)
//   - Puppeteer installed (for PDF)

require('dotenv').config();

const { extract } = require('../src/intake/extractor');
const { buildQuote } = require('../src/quoting/builder');
const { augmentQuote } = require('../src/quoting/augmenter');
const { saveQuotePdf } = require('../src/pdf/generator');
const db = require('../db/connection');

async function main() {
  console.log('\n═══ IVA CORTEX — Pipeline Demo ═══\n');

  // ── Step 1: Extract ──────────────────────────────────
  console.log('1. Extracting inquiry from message...');
  const sampleMessage = 'Hi, we are a group of 4 adults looking for a 5-day Kerala trip in December. We want to stay in Kochi and Munnar. Budget around 1.5 lakhs.';

  let inquiry;
  try {
    inquiry = await extract(sampleMessage, 'demo');
    console.log(`   ✓ Inquiry created: ${inquiry.id}`);
    console.log(`   Destination: ${inquiry.destination}, Pax: ${inquiry.pax_adults}`);
  } catch (err) {
    console.log(`   ⚠ Extraction failed: ${err.message}`);
    console.log('   Using fallback — fetching most recent inquiry...');
    const { rows } = await db.query('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 1');
    if (rows.length === 0) {
      console.error('   ✗ No inquiries found. Insert a test row first.');
      process.exit(1);
    }
    inquiry = rows[0];
  }

  // ── Step 2: Fetch available products ─────────────────
  console.log('\n2. Fetching active vendor products...');
  const { rows: products } = await db.query(
    `SELECT vp.id, vp.name, vp.category, vp.base_price, v.name AS vendor
     FROM vendor_products vp
     JOIN vendors v ON v.id = vp.vendor_id
     WHERE vp.is_active = true
     LIMIT 5`
  );

  if (products.length === 0) {
    console.error('   ✗ No products found. Run db:seed first.');
    process.exit(1);
  }

  console.log(`   Found ${products.length} products. Selecting first 3 for quote...`);
  products.forEach(p => console.log(`   - ${p.name} (${p.category}): ₹${p.base_price} — ${p.vendor}`));

  const selections = products.slice(0, 3).map(p => ({
    productId: p.id,
    quantity: p.category === 'accommodation' ? 2 : 1,
  }));

  // ── Step 3: Build quote ──────────────────────────────
  console.log('\n3. Building quote (deterministic math)...');
  const quote = await buildQuote(inquiry.id, selections);
  console.log(`   ✓ Quote created: ${quote.quote_number} (ID: ${quote.id})`);
  console.log(`   Cost: ₹${quote.total_cost} | Margin: ₹${quote.total_margin}`);

  // ── Step 4: Augment with prose ───────────────────────
  console.log('\n4. Generating itinerary prose (LLM)...');
  let quoteWithProse;
  try {
    quoteWithProse = await augmentQuote(quote.id);
    console.log(`   ✓ Prose generated (${quoteWithProse.llm_prose?.length || 0} chars)`);
  } catch (err) {
    console.log(`   ⚠ LLM prose skipped: ${err.message}`);
    const { rows } = await db.query('SELECT * FROM quotes WHERE id = $1', [quote.id]);
    quoteWithProse = rows[0];
  }

  // ── Step 5: Generate PDF ─────────────────────────────
  console.log('\n5. Generating PDF...');
  const { rows: lineItems } = await db.query(
    'SELECT description, quantity, unit_selling, total FROM quote_line_items WHERE quote_id = $1 ORDER BY sort_order',
    [quote.id]
  );

  const pdfPath = `pdf_output/${quote.quote_number}.pdf`;
  const pdfData = {
    data: {
      quote_number: quote.quote_number,
      destination: inquiry.destination || 'N/A',
      pax_adults: inquiry.pax_adults || 0,
      pax_children: inquiry.pax_children || 0,
      lead_name: inquiry.lead_name || null,
      total_cost: quote.total_cost,
      total_margin: quote.total_margin,
      grand_total: Number(quote.total_cost) + Number(quote.total_margin),
      currency: quote.currency,
      valid_until: quote.valid_until,
      terms_conditions: quote.terms_conditions,
    },
    prose: quoteWithProse?.llm_prose || null,
    lineItems: lineItems.map(i => ({
      description: i.description,
      quantity: i.quantity,
      unit_selling: i.unit_selling,
      total: i.total,
    })),
  };

  try {
    const savedPath = await saveQuotePdf(pdfData, pdfPath);
    console.log(`   ✓ PDF saved: ${savedPath}`);
  } catch (err) {
    console.log(`   ⚠ PDF generation failed: ${err.message}`);
  }

  // ── Summary ──────────────────────────────────────────
  console.log('\n═══ PIPELINE COMPLETE ═══');
  console.log(`  Inquiry:    ${inquiry.id}`);
  console.log(`  Quote:      ${quote.quote_number}`);
  console.log(`  Line items: ${lineItems.length}`);
  console.log(`  Total:      ₹${Number(quote.total_cost) + Number(quote.total_margin)}`);
  console.log(`  PDF:        pdf_output/${quote.quote_number}.pdf`);
  console.log('');
}

main().catch(err => {
  console.error('Pipeline demo failed:', err);
  process.exit(1);
});
