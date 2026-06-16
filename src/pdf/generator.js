// ============================================================================
// PDF Generator — Puppeteer HTML → PDF pipeline
// ============================================================================
// Takes quote data + prose, renders branded HTML, outputs PDF buffer/file.
// Uses the existing Puppeteer setup from proposal/ (reuses pattern).
// ============================================================================

const { buildItineraryHtml } = require('./template');

let _puppeteer = null;
async function getPuppeteer() {
  if (!_puppeteer) {
    _puppeteer = require('puppeteer');
  }
  return _puppeteer;
}

const PDF_OPTIONS = {
  format: 'A4',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
  preferCSSPageSize: false,
};

async function generateQuotePdf(quoteData) {
  if (process.env.PUPPETEER_DISABLE === 'true') {
    throw new Error('PDF generation disabled via PUPPETEER_DISABLE');
  }

  const html = buildItineraryHtml(quoteData);
  const puppeteer = await getPuppeteer();

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

    const pdfBuffer = await page.pdf(PDF_OPTIONS);

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

async function saveQuotePdf(quoteData, filePath) {
  const fs = require('fs');
  const pdfBuffer = await generateQuotePdf(quoteData);
  fs.writeFileSync(filePath, pdfBuffer);
  return filePath;
}

module.exports = { generateQuotePdf, saveQuotePdf };
