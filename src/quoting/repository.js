const db = require('../../db/connection');

async function getVendorProducts(productIds) {
  if (!productIds || productIds.length === 0) return [];
  const { rows } = await db.query(
    `SELECT vp.*, v.name AS vendor_name, v.type AS vendor_type
     FROM vendor_products vp
     JOIN vendors v ON v.id = vp.vendor_id
     WHERE vp.id = ANY($1::uuid[]) AND vp.is_active = true`,
    [productIds]
  );
  return rows;
}

async function getInquiry(inquiryId) {
  const { rows } = await db.query('SELECT * FROM inquiries WHERE id = $1', [inquiryId]);
  return rows[0] || null;
}

async function createQuote({ inquiryId, quoteNumber, totalCost, totalMargin, markupPct, currency, validUntil, termsConditions, llmProse, status }) {
  const { rows } = await db.query(
    `INSERT INTO quotes (inquiry_id, quote_number, status, total_cost, total_margin, markup_pct, currency, valid_until, terms_conditions, llm_prose)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [inquiryId, quoteNumber, status || 'draft', totalCost, totalMargin, markupPct, currency || 'INR', validUntil, termsConditions, llmProse]
  );
  return rows[0];
}

async function createLineItems(quoteId, items) {
  if (items.length === 0) return [];
  const values = items.map((item, i) => {
    const idx = i * 8;
    return `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6}, $${idx + 7}, $${idx + 8})`;
  }).join(', ');

  const params = items.flatMap((item, i) => [
    quoteId,
    item.vendorProductId || null,
    item.description,
    item.quantity,
    item.unitCost,
    item.unitMargin,
    item.unitSelling,
    item.total,
  ]);

  const { rows } = await db.query(
    `INSERT INTO quote_line_items (quote_id, vendor_product_id, description, quantity, unit_cost, unit_margin, unit_selling, total)
     VALUES ${values}
     RETURNING *`,
    params
  );
  return rows;
}

async function updateInquiryStatus(inquiryId, status) {
  const { rows } = await db.query(
    'UPDATE inquiries SET status = $1, updated_at = now() WHERE id = $2 RETURNING *',
    [status, inquiryId]
  );
  return rows[0];
}

async function findQuoteByNumber(quoteNumber) {
  const { rows } = await db.query('SELECT id FROM quotes WHERE quote_number = $1', [quoteNumber]);
  return rows[0] || null;
}

module.exports = {
  getVendorProducts,
  getInquiry,
  createQuote,
  createLineItems,
  updateInquiryStatus,
  findQuoteByNumber,
};
