// Zod-based request validation middleware

const { z } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    try {
      req.validated = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const issues = err.issues || err.errors || [];
        return res.status(422).json({
          error: 'validation failed',
          details: issues.map(e => ({
            field: (e.path || []).join('.'),
            message: e.message,
          })),
        });
      }
      next(err);
    }
  };
}

// ── Schemas ─────────────────────────────────────────────

const inquiryWebhookSchema = z.object({
  message: z.string().min(1, 'message is required'),
  source: z.enum(['whatsapp', 'email', 'web', 'voice', 'manual']).optional(),
});

const quotePipelineSchema = z.object({
  message: z.string().min(1, 'message is required'),
  source: z.enum(['whatsapp', 'email', 'web', 'voice', 'api', 'manual']).optional(),
  selections: z.array(z.object({
    productId: z.string().regex(/^[0-9a-fA-F-]{36}$/, 'productId must be a valid UUID'),
    quantity: z.number().int().min(1, 'quantity must be >= 1').default(1),
  })).min(1, 'at least one product selection is required'),
  markupOverrides: z.record(z.number().min(0).max(100)).optional(),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'validUntil must be YYYY-MM-DD').optional(),
  termsConditions: z.string().optional(),
});

const createInquirySchema = z.object({
  message: z.string().min(1, 'message is required'),
  source: z.enum(['whatsapp', 'email', 'web', 'voice', 'manual']).optional(),
});

module.exports = { validate, inquiryWebhookSchema, quotePipelineSchema, createInquirySchema };
