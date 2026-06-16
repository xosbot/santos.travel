// ============================================================================
// Quoting Engine — Pure Deterministic Math
// ============================================================================
// This is the heart of the hybrid philosophy:
//   - All pricing math happens here, in pure functions.
//   - LLM receives only the final numbers to generate prose.
//   - LLM never touches, calculates, or modifies a price.
// ============================================================================

const DEFAULT_MARKUP = {
  accommodation: 15.00,
  transfer:      10.00,
  sightseeing:   12.00,
  guide:         10.00,
  meals:         10.00,
  activity:      15.00,
  misc:          10.00,
};

function validateLineItemInput({ basePrice, quantity, markupPct }) {
  if (basePrice == null || basePrice < 0) {
    throw new Error(`Invalid basePrice: ${basePrice}`);
  }
  if (quantity == null || quantity < 1) {
    throw new Error(`Invalid quantity: ${quantity}`);
  }
  if (markupPct == null || markupPct < 0 || markupPct > 100) {
    throw new Error(`Invalid markupPct: ${markupPct}`);
  }
}

function computeLineItem({ basePrice, quantity, markupPct }) {
  validateLineItemInput({ basePrice, quantity, markupPct });

  const unitCost    = round2(basePrice);
  const unitMargin  = round2(basePrice * markupPct / 100);
  const unitSelling = round2(unitCost + unitMargin);
  const total       = round2(unitSelling * quantity);

  return { unitCost, unitMargin, unitSelling, total };
}

function computeQuoteSummary(lineItems) {
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    throw new Error('lineItems must be a non-empty array');
  }

  let totalCost   = 0;
  let totalMargin = 0;
  let grandTotal  = 0;

  for (const item of lineItems) {
    const { unitCost, unitMargin, total } = computeLineItem(item);
    item.unitCost    = unitCost;
    item.unitMargin  = unitMargin;
    item.unitSelling = unitCost + unitMargin;
    item.total       = total;

    totalCost   = round2(totalCost   + unitCost * item.quantity);
    totalMargin = round2(totalMargin + unitMargin * item.quantity);
    grandTotal  = round2(grandTotal  + total);
  }

  return { lineItems, totalCost, totalMargin, grandTotal };
}

function getMarkupForCategory(category, overrides = {}) {
  return overrides[category] ?? DEFAULT_MARKUP[category] ?? DEFAULT_MARKUP.misc;
}

let _counter = 0;

function generateQuoteNumber(year) {
  _counter += 1;
  const y = year || new Date().getFullYear();
  return `Q-${y}-${String(_counter).padStart(4, '0')}`;
}

function resetCounter() {
  _counter = 0;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = {
  computeLineItem,
  computeQuoteSummary,
  getMarkupForCategory,
  generateQuoteNumber,
  resetCounter,
  round2,
  DEFAULT_MARKUP,
};
