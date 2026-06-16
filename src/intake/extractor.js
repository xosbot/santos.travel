// AI Intake & Triage — NLP Extraction Agent
// Receives raw WhatsApp/email message, calls LLM function-calling,
// returns structured data to insert into `inquiries` table.
//
// LLM never writes to DB directly. This module validates LLM output
// before returning to the caller.

const db = require('../../db/connection');
const llm = require('../llm/client');
const prompts = require('../llm/prompts');

const EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    pax_adults:       { type: 'integer', minimum: 1, maximum: 100 },
    pax_children:     { type: 'integer', minimum: 0, maximum: 50 },
    check_in:         { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    check_out:        { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    destination:      { type: 'string', maxLength: 255 },
    budget_min:       { type: 'number', minimum: 0 },
    budget_max:       { type: 'number', minimum: 0 },
    lead_name:        { type: 'string', maxLength: 255 },
    lead_email:       { type: 'string' },
    lead_phone:       { type: 'string', maxLength: 50 },
    is_travel_inquiry: { type: 'boolean' },
  },
  required: ['is_travel_inquiry'],
  additionalProperties: false,
};

function sanitize(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const cleaned = value.trim().toLowerCase();
    if (cleaned === '' || cleaned === 'null' || cleaned === 'undefined' || cleaned === 'none' || cleaned === 'n/a') {
      return null;
    }
  }
  return value;
}

function sanitizeDate(value) {
  const cleaned = sanitize(value);
  if (cleaned && /^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;
  return null;
}

async function extract(rawMessage, source = 'whatsapp') {
  if (!rawMessage || rawMessage.trim().length === 0) {
    throw new Error('Empty message');
  }

  // 1. Call LLM with structured output
  const result = await llm.callStructured({
    messages: [
      { role: 'system', content: prompts.extractionSystemPrompt() },
      { role: 'user', content: prompts.extractionUserPrompt(rawMessage) },
    ],
    schema: EXTRACTION_SCHEMA,
    schemaName: 'travel_extraction',
    model: process.env.EXTRACTION_MODEL || 'gpt-4o',
    temperature: 0.1,
  });

  const extracted = result.parsed;

  // 2. Reject non-travel messages
  if (extracted.is_travel_inquiry === false) {
    throw new Error('Message is not a travel inquiry');
  }

  // 3. Validate required fields for travel
  if (!extracted.pax_adults || !extracted.destination) {
    throw new Error('Extraction incomplete: missing pax or destination');
  }

  // 4. Sanitize LLM output before DB write
  const checkIn = sanitizeDate(extracted.check_in);
  const checkOut = sanitizeDate(extracted.check_out);
  const leadName = sanitize(extracted.lead_name);
  const leadEmail = sanitize(extracted.lead_email);
  const leadPhone = sanitize(extracted.lead_phone);

  // 5. Build budget_range JSONB
  const budgetRange = {};
  const budgetMin = sanitize(extracted.budget_min);
  const budgetMax = sanitize(extracted.budget_max);
  if (budgetMin != null && budgetMin !== 0) budgetRange.min = budgetMin;
  if (budgetMax != null && budgetMax !== 0) budgetRange.max = budgetMax;

  // 6. Write to inquiries table
  const dbResult = await db.query(
    `INSERT INTO inquiries (source, raw_message, extracted_data, status, pax_adults, pax_children, check_in, check_out, destination, budget_range, lead_name, lead_email, lead_phone)
     VALUES ($1, $2, $3, 'triaged', $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      source,
      rawMessage,
      JSON.stringify(extracted),
      extracted.pax_adults,
      extracted.pax_children || 0,
      checkIn,
      checkOut,
      extracted.destination,
      JSON.stringify(budgetRange),
      leadName,
      leadEmail,
      leadPhone,
    ]
  );

  return dbResult.rows[0];
}

module.exports = { extract, EXTRACTION_SCHEMA };
