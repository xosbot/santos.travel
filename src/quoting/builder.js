// ============================================================================
// Quote Builder — Deterministic Orchestrator
// ============================================================================
// Flow:
//   1. Load inquiry + selected vendor products from DB
//   2. Compute line items via pure math engine
//   3. Write quote + line items to DB
//   4. Return complete quote object
//
// The LLM prose generation is called separately (see prose/augmenter.js)
// after this builder returns the computed numbers.
// ============================================================================

const engine = require('./engine');
const repo = require('./repository');

async function buildQuote(inquiryId, selections, options = {}) {
  const {
    markupOverrides = {},
    currency = 'INR',
    validUntil = null,
    termsConditions = null,
  } = options;

  // 1. Load inquiry
  const inquiry = await repo.getInquiry(inquiryId);
  if (!inquiry) {
    throw new Error(`Inquiry not found: ${inquiryId}`);
  }

  // 2. Load products
  const productIds = selections.map(s => s.productId);
  const products = await repo.getVendorProducts(productIds);

  if (products.length !== productIds.length) {
    const found = new Set(products.map(p => p.id));
    const missing = productIds.filter(id => !found.has(id));
    throw new Error(`Products not found or inactive: ${missing.join(', ')}`);
  }

  const productMap = new Map(products.map(p => [p.id, p]));

  // 3. Compute line items
  const lineItems = selections.map(sel => {
    const product = productMap.get(sel.productId);
    const markupPct = engine.getMarkupForCategory(product.category, markupOverrides);
    return {
      vendorProductId: product.id,
      description: product.name,
      category: product.category,
      quantity: sel.quantity || 1,
      basePrice: Number(product.base_price),
      markupPct,
    };
  });

  const summary = engine.computeQuoteSummary(lineItems);

  // 4. Generate a unique quote number
  const quoteNumber = await generateUniqueQuoteNumber(repo);

  // 5. Write quote
  const quote = await repo.createQuote({
    inquiryId,
    quoteNumber,
    totalCost: summary.totalCost,
    totalMargin: summary.totalMargin,
    grandTotal: summary.grandTotal,
    markupPct: 0, // individual per line item
    currency,
    validUntil: validUntil || defaultValidUntil(),
    termsConditions,
    llmProse: null,
    status: 'draft',
  });

  // 6. Write line items
  const dbLineItems = await repo.createLineItems(
    quote.id,
    summary.lineItems.map(item => ({
      vendorProductId: item.vendorProductId,
      description: item.description,
      quantity: item.quantity,
      unitCost: item.unitCost,
      unitMargin: item.unitMargin,
      unitSelling: item.unitSelling,
      total: item.total,
    }))
  );

  // 7. Update inquiry status
  await repo.updateInquiryStatus(inquiryId, 'quoted');

  return {
    ...quote,
    line_items: dbLineItems,
  };
}

function defaultValidUntil() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
}

async function generateUniqueQuoteNumber(repo) {
  // Try the deterministic counter first; if it collides (e.g. process restart),
  // fall back to a timestamp-based number.
  const baseNumber = engine.generateQuoteNumber();
  const existing = await repo.findQuoteByNumber(baseNumber);
  if (!existing) return baseNumber;

  const now = new Date();
  const dateSuffix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const { randomInt } = require('crypto');

  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `Q-${dateSuffix}-${String(randomInt(1, 9999)).padStart(4, '0')}`;
    const exists = await repo.findQuoteByNumber(candidate);
    if (!exists) return candidate;
  }

  throw new Error('Unable to generate a unique quote number after 10 attempts');
}

module.exports = { buildQuote };
