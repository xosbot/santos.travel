const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { ZodError } = require('zod');

// ── Auth Middleware Tests ─────────────────────────────────

describe('auth middleware', () => {
  let auth;

  before(() => {
    delete require.cache[require.resolve('../src/middleware/auth')];
    process.env.API_KEYS = 'st_testkey1,st_testkey2';
    process.env.NODE_ENV = 'production';
    auth = require('../src/middleware/auth');
  });

  it('generates API keys with correct prefix', () => {
    const key = auth.generateApiKey();
    assert.ok(key.startsWith('st_'));
    assert.equal(key.length, 51); // 'st_' + 48 hex chars (24 bytes)
  });

  it('rejects missing token', () => {
    const req = { path: '/api/quotes', headers: {}, query: {} };
    const res = { status: (code) => ({ json: (body) => ({ code, body }) }) };
    let calledNext = false;
    const next = () => { calledNext = true; };

    const result = auth.requireAuth(req, res, next);
    if (result) {
      assert.equal(result.code, 401);
      assert.equal(result.body.error, 'unauthorized: invalid or missing API key');
    }
    assert.equal(calledNext, false);
  });

  it('allows health check without auth', () => {
    const req = { path: '/health', headers: {}, query: {} };
    let calledNext = false;
    const next = () => { calledNext = true; };

    auth.requireAuth(req, null, next);
    assert.equal(calledNext, true);
  });

  it('allows webhook endpoints without auth', () => {
    const req = { path: '/webhook/whatsapp', headers: {}, query: {} };
    let calledNext = false;
    const next = () => { calledNext = true; };

    auth.requireAuth(req, null, next);
    assert.equal(calledNext, true);
  });

  it('allows admin endpoints without auth', () => {
    const req = { path: '/admin', headers: {}, query: {} };
    let calledNext = false;
    const next = () => { calledNext = true; };

    auth.requireAuth(req, null, next);
    assert.equal(calledNext, true);
  });
});

describe('auth middleware (dev mode)', () => {
  let auth;

  before(() => {
    delete require.cache[require.resolve('../src/middleware/auth')];
    process.env.API_KEYS = '';
    process.env.NODE_ENV = 'development';
    auth = require('../src/middleware/auth');
  });

  it('passes all requests when no keys configured and not production', () => {
    const req = { path: '/api/quotes', headers: {}, query: {} };
    let calledNext = false;
    const next = () => { calledNext = true; };

    auth.requireAuth(req, null, next);
    assert.equal(calledNext, true);
  });
});

// ── Validation Middleware Tests ───────────────────────────

describe('validation middleware', () => {
  const { inquiryWebhookSchema, quotePipelineSchema, createInquirySchema } = require('../src/middleware/validate');

  it('exports valid schemas', () => {
    assert.ok(inquiryWebhookSchema);
    assert.ok(quotePipelineSchema);
    assert.ok(createInquirySchema);
    assert.equal(typeof inquiryWebhookSchema.parse, 'function');
    assert.equal(typeof quotePipelineSchema.parse, 'function');
    assert.equal(typeof createInquirySchema.parse, 'function');
  });

  it('validates a valid inquiry payload', () => {
    const result = inquiryWebhookSchema.parse({ message: 'I want to visit Kerala' });
    assert.equal(result.message, 'I want to visit Kerala');
    assert.equal(result.source, undefined);
  });

  it('rejects empty message in inquiry', () => {
    assert.throws(() => inquiryWebhookSchema.parse({ message: '' }), ZodError);
  });

  it('rejects missing message in inquiry', () => {
    assert.throws(() => inquiryWebhookSchema.parse({}), ZodError);
  });

  it('validates quote pipeline with selections', () => {
    const result = quotePipelineSchema.parse({
      message: 'Trip to Munnar',
      selections: [{ productId: '550e8400-e29b-41d4-a716-446655440000', quantity: 2 }],
    });
    assert.equal(result.selections.length, 1);
    assert.equal(result.selections[0].quantity, 2);
  });

  it('defaults quantity to 1', () => {
    const result = quotePipelineSchema.parse({
      message: 'Trip',
      selections: [{ productId: '550e8400-e29b-41d4-a716-446655440000' }],
    });
    assert.equal(result.selections[0].quantity, 1);
  });

  it('rejects non-UUID productId', () => {
    assert.throws(() => quotePipelineSchema.parse({
      message: 'Trip',
      selections: [{ productId: 'not-a-uuid' }],
    }), ZodError);
  });

  it('rejects empty selections array', () => {
    assert.throws(() => quotePipelineSchema.parse({
      message: 'Trip',
      selections: [],
    }), ZodError);
  });

  it('validates optional markupOverrides', () => {
    const result = quotePipelineSchema.parse({
      message: 'Trip',
      selections: [{ productId: '550e8400-e29b-41d4-a716-446655440000' }],
      markupOverrides: { accommodation: 20 },
    });
    assert.equal(result.markupOverrides.accommodation, 20);
  });

  it('rejects markup over 100', () => {
    assert.throws(() => quotePipelineSchema.parse({
      message: 'Trip',
      selections: [{ productId: '550e8400-e29b-41d4-a716-446655440000' }],
      markupOverrides: { accommodation: 150 },
    }), ZodError);
  });

  it('validates create inquiry schema', () => {
    const result = createInquirySchema.parse({ message: 'Hello', source: 'web' });
    assert.equal(result.message, 'Hello');
    assert.equal(result.source, 'web');
  });

  it('rejects invalid source', () => {
    assert.throws(() => createInquirySchema.parse({ message: 'Hello', source: 'fax' }), ZodError);
  });
});
