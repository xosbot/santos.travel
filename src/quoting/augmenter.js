// ============================================================================
// Prose Augmenter — LLM writes descriptive itinerary text
// ============================================================================
// This is the ONLY place the LLM touches a quote. It receives:
//   - The computed line items (prices, quantities, totals)
//   - The destination and pax info
// It returns prose ONLY. It NEVER modifies prices.
// ============================================================================

const db = require('../../db/connection');
const llm = require('../llm/client');
const prompts = require('../llm/prompts');

async function augmentQuote(quoteId) {
  // 1. Load quote + line items from DB
  const { rows: quotes } = await db.query(
    'SELECT q.*, i.destination, i.pax_adults, i.pax_children FROM quotes q JOIN inquiries i ON i.id = q.inquiry_id WHERE q.id = $1',
    [quoteId]
  );

  if (quotes.length === 0) {
    throw new Error(`Quote not found: ${quoteId}`);
  }

  const quote = quotes[0];

  const { rows: lineItems } = await db.query(
    'SELECT description, quantity, unit_selling, total, sort_order FROM quote_line_items WHERE quote_id = $1 ORDER BY sort_order',
    [quoteId]
  );

  // 2. Build the data payload for the LLM (numbers only — no raw costs)
  const llmPayload = {
    quote_number: quote.quote_number,
    destination: quote.destination,
    travelers: {
      adults: quote.pax_adults,
      children: quote.pax_children || 0,
    },
    grand_total: Number(quote.total_cost) + Number(quote.total_margin),
    line_items: lineItems.map(item => ({
      description: item.description,
      quantity: item.quantity,
      total: Number(item.total),
    })),
  };

  // 3. Call LLM for prose
  const result = await llm.call({
    messages: [
      { role: 'system', content: prompts.proseSystemPrompt() },
      { role: 'user', content: prompts.proseUserPrompt(llmPayload) },
    ],
    model: process.env.PROSE_MODEL || 'gpt-4o',
    temperature: 0.7,
    maxTokens: 2048,
  });

  // 4. Store prose in DB
  const { rows: updated } = await db.query(
    "UPDATE quotes SET llm_prose = $1, updated_at = now() WHERE id = $2 RETURNING *",
    [result.content, quoteId]
  );

  return {
    ...updated[0],
    _usage: result.usage,
    _model: result.model,
  };
}

module.exports = { augmentQuote };
