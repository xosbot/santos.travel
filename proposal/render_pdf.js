const puppeteer = require('puppeteer');
const path = require('path');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('🚀 Launching Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--font-render-hinting=none',
    ],
  });

  const page = await browser.newPage();

  const htmlPath = path.resolve(__dirname, 'proposal.html');
  console.log(`📄 Loading HTML from: ${htmlPath}`);

  await page.goto(`file://${htmlPath}`, {
    waitUntil: 'networkidle0',
    timeout: 60000,
  });

  // Wait for Google Fonts to load
  await sleep(3000);

  const outputPath = path.resolve(__dirname, '..', 'pdf_output', 'santos_travel_IVA_cortex_proposal.pdf');

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: false,
  });

  await browser.close();
  console.log(`✅ PDF saved to: ${outputPath}`);
})();
