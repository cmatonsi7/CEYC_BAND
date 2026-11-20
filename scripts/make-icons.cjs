// Renders public/favicon.svg to the PNG app icons. Run: node scripts/make-icons.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const svg = fs.readFileSync(path.join(__dirname, '../public/favicon.svg'), 'utf8');
  const b = await chromium.launch();
  for (const size of [192, 512]) {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    await p.setContent(`<style>html,body{margin:0;background:transparent}</style>${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}`);
    await p.screenshot({ path: path.join(__dirname, `../public/icon-${size}.png`), omitBackground: true });
  }
  await b.close();
})();
