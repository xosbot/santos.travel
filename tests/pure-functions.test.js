const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { sanitize, sanitizeDate } = require('../src/intake/extractor');
const { escHtml, fmt } = require('../src/pdf/template');

describe('sanitize', () => {
  it('returns null for null/undefined', () => {
    assert.equal(sanitize(null), null);
    assert.equal(sanitize(undefined), null);
  });

  it('returns null for empty or noise strings', () => {
    assert.equal(sanitize(''), null);
    assert.equal(sanitize('  '), null);
    assert.equal(sanitize('null'), null);
    assert.equal(sanitize('NULL'), null);
    assert.equal(sanitize('undefined'), null);
    assert.equal(sanitize('none'), null);
    assert.equal(sanitize('N/A'), null);
    assert.equal(sanitize('n/a'), null);
  });

  it('returns original for valid strings', () => {
    assert.equal(sanitize('Kerala'), 'Kerala');
    assert.equal(sanitize('Alice'), 'Alice');
  });

  it('passes through non-string values', () => {
    assert.equal(sanitize(42), 42);
    assert.equal(sanitize(0), 0);
    assert.equal(sanitize(false), false);
  });

  it('does not trim valid strings', () => {
    assert.equal(sanitize('  Munnar  '), '  Munnar  ');
  });
});

describe('sanitizeDate', () => {
  it('returns valid ISO dates', () => {
    assert.equal(sanitizeDate('2026-06-15'), '2026-06-15');
  });

  it('returns null for invalid dates', () => {
    assert.equal(sanitizeDate('not-a-date'), null);
    assert.equal(sanitizeDate('15-06-2026'), null);
    assert.equal(sanitizeDate('2026/06/15'), null);
  });

  it('returns null for null/undefined/empty', () => {
    assert.equal(sanitizeDate(null), null);
    assert.equal(sanitizeDate(undefined), null);
    assert.equal(sanitizeDate(''), null);
    assert.equal(sanitizeDate('none'), null);
  });
});

describe('escHtml', () => {
  it('escapes & < > " and \'', () => {
    assert.equal(escHtml('&'), '&amp;');
    assert.equal(escHtml('<'), '&lt;');
    assert.equal(escHtml('>'), '&gt;');
    assert.equal(escHtml('"'), '&quot;');
    assert.equal(escHtml("'"), '&#39;');
  });

  it('escapes all special chars in a string', () => {
    assert.equal(escHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('returns non-string values unchanged', () => {
    assert.equal(escHtml(42), 42);
    assert.equal(escHtml(null), null);
  });

  it('returns empty string unchanged', () => {
    assert.equal(escHtml(''), '');
  });
});

describe('fmt (Indian rupee format)', () => {
  it('formats a number with ₹ prefix and locale formatting', () => {
    const result = fmt(15000);
    assert.ok(result.startsWith('₹'));
    assert.ok(result.includes('15,000') || result.includes('15000'));
  });

  it('returns dash for null/undefined', () => {
    assert.equal(fmt(null), '-');
    assert.equal(fmt(undefined), '-');
  });

  it('handles string numbers', () => {
    const result = fmt('25000');
    assert.ok(result.startsWith('₹'));
  });

  it('handles zero', () => {
    const result = fmt(0);
    assert.equal(result, '₹0');
  });

  it('handles decimal values', () => {
    const result = fmt(99.99);
    assert.ok(result.startsWith('₹'));
  });
});
