const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../src/quoting/engine');

describe('computeLineItem edge cases', () => {
  it('handles fractional quantity', () => {
    const result = engine.computeLineItem({ basePrice: 1000, quantity: 2.5, markupPct: 10 });
    assert.equal(result.unitCost, 1000);
    assert.equal(result.unitMargin, 100);
    assert.equal(result.unitSelling, 1100);
    assert.equal(result.total, 2750);
  });

  it('handles zero basePrice', () => {
    const result = engine.computeLineItem({ basePrice: 0, quantity: 1, markupPct: 10 });
    assert.equal(result.unitCost, 0);
    assert.equal(result.unitMargin, 0);
    assert.equal(result.unitSelling, 0);
    assert.equal(result.total, 0);
  });

  it('handles markupPct = 100 (upper boundary)', () => {
    const result = engine.computeLineItem({ basePrice: 500, quantity: 2, markupPct: 100 });
    assert.equal(result.unitCost, 500);
    assert.equal(result.unitMargin, 500);
    assert.equal(result.unitSelling, 1000);
    assert.equal(result.total, 2000);
  });

  it('handles very small values', () => {
    const result = engine.computeLineItem({ basePrice: 0.01, quantity: 1, markupPct: 10 });
    assert.equal(result.unitCost, 0.01);
    assert.equal(result.unitMargin, 0);
    assert.equal(result.unitSelling, 0.01);
    assert.equal(result.total, 0.01);
  });

  it('throws on negative quantity', () => {
    assert.throws(() => engine.computeLineItem({ basePrice: 100, quantity: -1, markupPct: 10 }));
  });

  it('throws on null basePrice', () => {
    assert.throws(() => engine.computeLineItem({ basePrice: null, quantity: 1, markupPct: 10 }));
  });

  it('throws on null markupPct', () => {
    assert.throws(() => engine.computeLineItem({ basePrice: 100, quantity: 1, markupPct: null }));
  });
});

describe('computeQuoteSummary edge cases', () => {
  it('handles a single line item', () => {
    const items = [{ basePrice: 5000, quantity: 2, markupPct: 10 }];
    const result = engine.computeQuoteSummary(items);
    assert.equal(result.totalCost, 10000);
    assert.equal(result.totalMargin, 1000);
    assert.equal(result.grandTotal, 11000);
    assert.equal(result.lineItems.length, 1);
  });

  it('does not mutate input objects', () => {
    const items = [
      { basePrice: 8500, quantity: 3, markupPct: 15 },
    ];
    const beforeKeys = Object.keys(items[0]);
    engine.computeQuoteSummary(items);
    const afterKeys = Object.keys(items[0]);
    assert.deepEqual(afterKeys, beforeKeys, 'input objects should not have new properties');
    assert.equal(items[0].unitCost, undefined);
  });

  it('returns new line item objects with computed values', () => {
    const items = [{ basePrice: 8500, quantity: 3, markupPct: 15 }];
    const result = engine.computeQuoteSummary(items);
    assert.equal(result.lineItems[0].unitCost, 8500);
    assert.equal(result.lineItems[0].unitMargin, 1275);
    assert.equal(result.lineItems[0].unitSelling, 9775);
    assert.equal(result.lineItems[0].total, 29325);
  });
});

describe('getMarkupForCategory edge cases', () => {
  it('returns correct defaults for all known categories', () => {
    assert.equal(engine.getMarkupForCategory('accommodation'), 15);
    assert.equal(engine.getMarkupForCategory('transfer'), 10);
    assert.equal(engine.getMarkupForCategory('sightseeing'), 12);
    assert.equal(engine.getMarkupForCategory('guide'), 10);
    assert.equal(engine.getMarkupForCategory('meals'), 10);
    assert.equal(engine.getMarkupForCategory('activity'), 15);
    assert.equal(engine.getMarkupForCategory('misc'), 10);
  });

  it('handles null/undefined overrides', () => {
    assert.equal(engine.getMarkupForCategory('accommodation', null), 15);
    assert.equal(engine.getMarkupForCategory('transfer', undefined), 10);
  });

  it('handles empty overrides', () => {
    assert.equal(engine.getMarkupForCategory('activity', {}), 15);
  });
});

describe('generateQuoteNumber edge cases', () => {
  it('resets counter between tests', () => {
    engine.resetCounter();
    const a = engine.generateQuoteNumber(2026);
    const b = engine.generateQuoteNumber(2026);
    assert.match(a, /^Q-2026-0001$/);
    assert.match(b, /^Q-2026-0002$/);
  });

  it('handles year=0 correctly (falsy guard)', () => {
    engine.resetCounter();
    const num = engine.generateQuoteNumber(0);
    assert.match(num, /^Q-0-/);
  });
});

describe('round2 edge cases', () => {
  it('handles negative numbers', () => {
    assert.equal(engine.round2(-10.126), -10.13);
    assert.equal(engine.round2(-10.124), -10.12);
  });

  it('handles zero', () => {
    assert.equal(engine.round2(0), 0);
  });

  it('handles very large numbers', () => {
    assert.equal(engine.round2(99999999.999), 100000000);
  });

  it('handles known JS floating point case', () => {
    assert.equal(engine.round2(1.005), 1.01);
  });
});
