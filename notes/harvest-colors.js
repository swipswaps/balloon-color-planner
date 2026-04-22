// harvest-colors.js
// Run this locally to get ALL real balloon images + names

const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Launching browser to harvest The Balloon Lady color chart...');

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.calltheballoonlady.com/color-chart', { waitUntil: 'networkidle2' });

  // Scroll to bottom to force all lazy images to load
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 4000));

  const colors = await page.evaluate(() => {
    const results = [];
    const images = document.querySelectorAll('img');

    images.forEach(img => {
      const src = img.src || img.getAttribute('data-src') || '';
      if (!src.includes('0e982e') && !src.includes('wixstatic.com/media')) return;

      // Find color name (Wix puts it near the image)
      let name = '';
      let parent = img.parentElement;
      while (parent && !name) {
        const text = parent.textContent.trim();
        if (text && text.length > 3 && text.length < 45 && !text.includes('http')) {
          name = text.replace(/\n/g, ' ').trim();
        }
        parent = parent.parentElement;
      }

      if (name) {
        results.push({
          name: name,
          thumbnail: src.split('?')[0]  // clean URL
        });
      }
    });

    // Deduplicate
    return Array.from(new Map(results.map(item => [item.name, item])).values());
  });

  console.log(`✅ Found ${colors.length} colors!`);
  console.log(JSON.stringify(colors, null, 2));

  await browser.close();
})();