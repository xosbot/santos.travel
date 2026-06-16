const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../src/quoting/engine');

describe('computeLineItem', () => {
  it('calculates a standard line item correctly', () => {
    const result = engine.computeLineItem({ basePrice: 8500, quantity: 3, markupPct: 15 });
    assert.equal(result.unitCost, 8500);
    assert.equal(result.unitMargin, 1275);
    assert.equal(result.unitSelling, 9775);
    assert.equal(result.total, 29325);
  });

  it('handles zero markup', () => {
    const result = engine.computeLineItem({ basePrice: 1000, quantity: 2, markupPct: 0 });
    assert.equal(result.unitMargin, 0);
    assert.equal(result.unitSelling, 1000);
    assert.equal(result.total, 2000);
  });

  it('throws on negative basePrice', () => {
    assert.throws(() => engine.computeLineItem({ basePrice: -100, quantity: 1, markupPct: 10 }));
  });

  it('throws on zero quantity', () => {
    assert.throws(() => engine.computeLineItem({ basePrice: 100, quantity: 0, markupPct: 10 }));
  });

  it('throws on markup over 100', () => {
    assert.throws(() => engine.computeLineItem({ basePrice: 100, quantity: 1, markupPct: 101 }));
  });

  it('rounds to two decimal places', () => {
    const result = engine.computeLineItem({ basePrice: 99.99, quantity: 3, markupPct: 33.33 });
    assert.equal(result.unitMargin, 33.33);
    assert.equal(result.unitSelling, 133.32);
    assert.equal(result.total, 399.96);
  });
});

describe('computeQuoteSummary', () => {
  it('sums multiple line items correctly', () => {
    const items = [
      { basePrice: 8500, quantity: 3, markupPct: 15 },
      { basePrice: 1200, quantity: 2, markupPct: 10 },
      { basePrice: 2500, quantity: 4, markupPct: 15 },
    ];

    const result = engine.computeQuoteSummary(items);

    assert.equal(result.totalCost, 37900);
    assert.equal(result.totalMargin, 5565);
    assert.equal(result.grandTotal, 43465);

    // Verify items were mutated with computed values
    assert.equal(result.lineItems[0].unitSelling, 9775);
    assert.equal(result.lineItems[0].total, 29325);
  });

  it('throws on empty array', () => {
    assert.throws(() => engine.computeQuoteSummary([]));
  });

  it('throws on non-array', () => {
    assert.throws(() => engine.computeQuoteSummary(null));
  });
});

describe('getMarkupForCategory', () => {
  it('returns default markup for known categories', () => {
    assert.equal(engine.getMarkupForCategory('accommodation'), 15);
    assert.equal(engine.getMarkupForCategory('transfer'), 10);
  });

  it('returns misc default for unknown categories', () => {
    assert.equal(engine.getMarkupForCategory('unknown_category'), 10);
  });

  it('respects overrides', () => {
    assert.equal(engine.getMarkupForCategory('accommodation', { accommodation: 20 }), 20);
  });
});

describe('generateQuoteNumber', () => {
  it('generates sequential numbers', () => {
    engine.resetCounter();
    assert.match(engine.generateQuoteNumber(2026), /^Q-2026-0001$/);
    assert.match(engine.generateQuoteNumber(2026), /^Q-2026-0002$/);
  });

  it('uses current year by default', () => {
    engine.resetCounter();
    const num = engine.generateQuoteNumber();
    assert.match(num, /^Q-\d{4}-0001$/);
  });
});

describe('round2', () => {
  it('rounds to two decimal places', () => {
    assert.equal(engine.round2(10.123), 10.12);
    assert.equal(engine.round2(10.125), 10.13);
    assert.equal(engine.round2(10), 10);
  });
});
