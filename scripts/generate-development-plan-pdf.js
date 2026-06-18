// ============================================================================
// Generate IVA Cortex Phase 2 Development Plan PDF
// ============================================================================
// Usage: node scripts/generate-development-plan-pdf.js
// Output: pdf_output/IVA_Cortex_Phase2_Development_Plan.pdf
// ============================================================================

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { buildDevelopmentPlanHtml } = require('../src/pdf/development-plan-template');

const OUTPUT_DIR = path.join(__dirname, '..', 'pdf_output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'IVA_Cortex_Phase2_Development_Plan.pdf');

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const html = buildDevelopmentPlanHtml();

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: false,
    });

    fs.writeFileSync(OUTPUT_FILE, pdfBuffer);
    console.log(`Development plan PDF generated: ${OUTPUT_FILE}`);
    console.log(`File size: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Failed to generate development plan PDF:', err);
  process.exit(1);
});
