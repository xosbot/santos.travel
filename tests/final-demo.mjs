// Final demo verification script
// Starts the server, runs the full pipeline, and verifies all outputs.

import { createRequire } from 'module';
const require = createRequire('/mnt/d/SANTOS.TRAVEL/');

require('dotenv').config({ path: '/mnt/d/SANTOS.TRAVEL/.env' });

console.log('Starting IVA Cortex server for demo verification...');
console.log('  LLM:', process.env.EXTRACTION_MODEL);
console.log('  PDF enabled:', process.env.PUPPETEER_DISABLE !== 'true');

require('/mnt/d/SANTOS.TRAVEL/src/server.js');

console.log('\nWaiting for server boot (Express ~6s + Puppeteer ~3s)...');
await new Promise(r => setTimeout(r, 15000));

const API = 'http://localhost:3000';
const results = [];

async function t(name, fn) {
  try { const data = await fn(); results.push({ name, ok: true, data }); }
  catch(e) { results.push({ name, ok: false, error: e.message }); }
}

async function get(path) {
  const res = await fetch(API + path);
  return { status: res.status, body: await res.text() };
}

async function getJSON(path) {
  const res = await fetch(API + path);
  return { status: res.status, body: await res.json() };
}

async function postJSON(path, body) {
  const res = await fetch(API + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

await t('Health', async () => {
  const r = await getJSON('/health');
  if (r.body.status !== 'ok') throw new Error('bad status');
  return 'OK';
});

await t('Admin UI', async () => {
  const r = await get('/admin');
  if (r.status !== 200) throw new Error('HTTP ' + r.status);
  return r.body.length + ' bytes';
});

await t('Owner Demo Page', async () => {
  const r = await get('/demo');
  if (r.status !== 200) throw new Error('HTTP ' + r.status);
  if (!r.body.includes('Live Quote Generator')) throw new Error('Missing demo content');
  return r.body.length + ' bytes';
});

await t('Products API', async () => {
  const r = await getJSON('/api/products');
  if (!Array.isArray(r.body) || r.body.length === 0) throw new Error('No products');
  return r.body.length + ' products';
});

await t('Full Pipeline + PDF', async () => {
  const r = await postJSON('/api/quotes', {
    message: 'Family of 4 adults and 2 children, 6 days in Kerala, Kochi Munnar Thekkady, budget 2.5 lakhs',
    selections: [
      { productId: 'b0000000-0000-0000-0000-000000000001', quantity: 3 },
      { productId: 'b0000000-0000-0000-0000-000000000004', quantity: 4 },
      { productId: 'b0000000-0000-0000-0000-000000000007', quantity: 4 },
    ],
  });
  if (!r.body.quote_number) throw new Error('Failed: ' + JSON.stringify(r.body));
  if (!r.body.pdf_url) throw new Error('PDF not generated');
  return `${r.body.quote_number} | ₹${r.body.grand_total} | ${r.body.line_items} items | ${r.body.pdf_url}`;
});

await t('Strategic Proposal PDF exists', async () => {
  const res = await fetch(API + '/pdf/santos_travel_IVA_cortex_proposal.pdf');
  if (res.status !== 200) throw new Error('HTTP ' + res.status);
  const len = res.headers.get('content-length');
  return len ? `${(parseInt(len)/1024).toFixed(0)} KB` : 'exists';
});

console.log('\n═══════════════════════════════════════════');
console.log('  DEMO VERIFICATION RESULTS');
console.log('═══════════════════════════════════════════');
let passed = 0, failed = 0;
for (const r of results) {
  const icon = r.ok ? '✓' : '✗';
  console.log(`  ${icon} ${r.name}: ${r.ok ? r.data : r.error}`);
  if (r.ok) passed++; else failed++;
}
console.log('───────────────────────────────────────────');
console.log(`  ${passed}/${results.length} passed`);
console.log('═══════════════════════════════════════════\n');

if (failed === 0) {
  console.log('🎉 Demo is ready! Open:');
  console.log('   Admin:  http://localhost:3000/admin');
  console.log('   Demo:   http://localhost:3000/demo');
  console.log('   PDFs:   http://localhost:3000/pdf/');
}

process.exit(failed > 0 ? 1 : 0);
