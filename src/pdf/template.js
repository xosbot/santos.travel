function buildItineraryHtml(quote) {
  const { data, prose, lineItems } = quote;
  const itemsHtml = lineItems.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escHtml(item.description)}</td>
      <td class="num">${item.quantity}</td>
      <td class="num">${fmt(item.unit_selling)}</td>
      <td class="num">${fmt(item.total)}</td>
    </tr>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  :root {
    --gold: #C9A84C; --gold-light: #E8CC7A;
    --deep-teal: #0A2E2B; --teal: #0D4A42; --teal-mid: #1A6B5E;
    --ink: #1C1C2E; --ink-soft: #3D3D52; --muted: #7A7A9D;
    --white: #FFFFFF; --off-white: #FAFAF8; --border: #E2E2E8;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    background: var(--off-white);
    color: var(--ink);
    font-size: 10pt;
    line-height: 1.6;
  }
  @page { size: A4; margin: 0; }

  .page {
    width: 210mm; min-height: 297mm;
    margin: 0 auto; background: var(--white);
    position: relative;
  }

  /* Header */
  .header {
    background: var(--deep-teal);
    padding: 32px 40px 28px;
    color: var(--white);
  }
  .header-row {
    display: flex; justify-content: space-between; align-items: flex-start;
  }
  .brand {
    font-family: 'Playfair Display', 'Georgia', serif;
    font-size: 22px; font-weight: 700;
  }
  .brand span { color: var(--gold-light); }
  .brand-sub {
    font-size: 8px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--gold-light); margin-top: 2px;
  }
  .badge {
    background: rgba(201,168,76,0.15);
    border: 1px solid rgba(201,168,76,0.4);
    border-radius: 6px; padding: 6px 14px;
    font-size: 8px; font-weight: 600;
    color: var(--gold-light); letter-spacing: 1.5px; text-transform: uppercase;
  }
  .header-meta {
    display: flex; gap: 32px; margin-top: 20px;
  }
  .header-meta-item label {
    display: block; font-size: 7.5px; font-weight: 600;
    color: rgba(255,255,255,0.4); letter-spacing: 1.5px; text-transform: uppercase;
  }
  .header-meta-item span {
    font-size: 10px; font-weight: 500; color: rgba(255,255,255,0.85);
  }
  .gold-bar {
    height: 4px;
    background: linear-gradient(90deg, var(--gold), var(--gold-light), var(--gold));
  }

  /* Content */
  .content { padding: 32px 40px; }

  /* Prose */
  .prose {
    font-size: 10pt; line-height: 1.8;
    color: var(--ink-soft); margin-bottom: 28px;
    white-space: pre-wrap;
  }

  /* Table */
  table {
    width: 100%; border-collapse: collapse; font-size: 9pt;
    margin-bottom: 24px;
  }
  thead tr { background: var(--teal); color: var(--white); }
  thead th {
    padding: 10px 14px; text-align: left;
    font-size: 8px; font-weight: 600; letter-spacing: 0.5px;
  }
  thead th:first-child { border-radius: 6px 0 0 0; }
  thead th:last-child { border-radius: 0 6px 0 0; text-align: right; }
  thead th:nth-child(3),
  thead th:nth-child(4) { text-align: right; }

  tbody tr { border-bottom: 1px solid var(--border); }
  tbody tr:last-child { border-bottom: none; }
  tbody td { padding: 9px 14px; color: var(--ink-soft); }
  tbody td.num { text-align: right; font-variant-numeric: tabular-nums; }
  tbody tr:nth-child(even) { background: var(--off-white); }

  /* Totals */
  .totals { margin-left: auto; width: 260px; }
  .totals-row {
    display: flex; justify-content: space-between;
    padding: 6px 0; font-size: 9pt;
  }
  .totals-row.total {
    border-top: 2px solid var(--deep-teal);
    padding-top: 8px; margin-top: 4px;
    font-weight: 700; color: var(--deep-teal); font-size: 11pt;
  }

  /* Terms */
  .terms {
    margin-top: 32px; padding-top: 16px;
    border-top: 1px solid var(--border);
    font-size: 7.5pt; color: var(--muted); line-height: 1.6;
  }
  .terms h4 {
    font-size: 7.5pt; font-weight: 600; color: var(--ink-soft);
    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;
  }

  /* Footer */
  .footer {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 16px 40px;
    border-top: 1px solid var(--border);
    display: flex; justify-content: space-between;
    font-size: 7pt; color: var(--muted);
  }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { width: 100%; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-row">
      <div>
        <div class="brand">santos<span>.travel</span></div>
        <div class="brand-sub">Kerala · South India · Inbound Tours</div>
      </div>
      <div class="badge">Quote ${escHtml(data.quote_number)}</div>
    </div>
    <div class="header-meta">
      <div class="header-meta-item">
        <label>Destination</label>
        <span>${escHtml(data.destination)}</span>
      </div>
      <div class="header-meta-item">
        <label>Travelers</label>
        <span>${data.pax_adults} Adult${data.pax_adults !== 1 ? 's' : ''}${data.pax_children ? ` + ${data.pax_children} Child${data.pax_children !== 1 ? 'ren' : ''}` : ''}</span>
      </div>
      <div class="header-meta-item">
        <label>Valid Until</label>
        <span>${data.valid_until || 'N/A'}</span>
      </div>
      <div class="header-meta-item">
        <label>Prepared For</label>
        <span>${escHtml(data.lead_name || 'Valued Guest')}</span>
      </div>
    </div>
  </div>
  <div class="gold-bar"></div>

  <div class="content">
    ${prose ? `<div class="prose">${escHtml(prose)}</div>` : ''}

    <table>
      <thead>
        <tr>
          <th style="width:32px">#</th>
          <th>Description</th>
          <th style="width:60px;text-align:right">Qty</th>
          <th style="width:90px;text-align:right">Unit Price</th>
          <th style="width:100px;text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Total Cost</span>
        <span>${fmt(data.total_cost)}</span>
      </div>
      <div class="totals-row">
        <span>Service Fee</span>
        <span>${fmt(data.total_margin)}</span>
      </div>
      <div class="totals-row total">
        <span>Grand Total</span>
        <span>${fmt(data.grand_total)}</span>
      </div>
      <div class="totals-row" style="font-size:7pt;color:var(--muted);border:none;padding-top:2px;">
        <span>Currency</span>
        <span>${data.currency || 'INR'}</span>
      </div>
    </div>

    ${data.terms_conditions ? `
    <div class="terms">
      <h4>Terms & Conditions</h4>
      ${escHtml(data.terms_conditions)}
    </div>` : ''}
  </div>

  <div class="footer">
    <span>santos.travel — IVA Cortex Generated</span>
    <span>Page 1 of 1</span>
  </div>
</div>
</body>
</html>`;
}

function escHtml(s) {
  if (typeof s !== 'string') return s;
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function fmt(n) {
  if (n == null) return '-';
  const num = typeof n === 'string' ? parseFloat(n) : n;
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

module.exports = { buildItineraryHtml };
