/*
 * End-to-end smoke test against the production build served under a
 * GitHub Pages-style sub-path. Run: npm run build:pages && node scripts/e2e/serve.mjs & node scripts/e2e/smoke.cjs
 */
const { chromium, devices } = require('playwright');
const B = process.env.BASE_URL || 'http://localhost:4173/ceyc-music-library/';
const results = [];
const check = (name, ok, extra = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`); };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await ctx.newPage();
  const bad = [];
  page.on('response', (r) => r.status() >= 400 && bad.push(`${r.status()} ${r.url()}`));
  page.on('pageerror', (e) => bad.push('error ' + e.message));

  // Nested route + refresh
  await page.goto(B + '#/song/creator-of-the-universe');
  await page.getByRole('heading', { name: 'Creator Of the Universe' }).waitFor();
  await page.reload();
  check('refresh on nested route renders the song', await page.getByRole('heading', { name: 'Creator Of the Universe' }).isVisible());

  // Notation + transposition
  await page.getByRole('radio', { name: 'Chords' }).click();
  const intro = page.locator('#sec-intro');
  const before = (await intro.innerText()).replace(/\s+/g, ' ');
  await page.getByRole('button', { name: 'Key up a semitone' }).click();
  await page.getByRole('button', { name: 'Key up a semitone' }).click();
  const after = (await intro.innerText()).replace(/\s+/g, ' ');
  check('chords in F', before.includes('Bb – C – Dm'), before.slice(0, 60));
  check('transposed to G', after.includes('C – D – Em'), after.slice(0, 60));
  const fsharp = (await page.locator('#sec-verse-f').innerText());
  check('modulated section follows (F# → Ab when song is in G)', /Key change · Ab/.test(fsharp));
  await page.getByRole('radio', { name: 'Both' }).click();
  const bothText = (await intro.innerText()).replace(/\s+/g, ' ');
  check('"Both" shows chord names with number degrees', bothText.includes('C 4') && bothText.includes('Em 6'), bothText.slice(0, 60));
  await page.getByRole('radio', { name: 'Numbers' }).click();
  check('number notation shows original numbers', (await intro.innerText()).includes('4'));
  await page.goto(B + '#/song/lord-i-bless-your-name');
  const verse = page.locator('#sec-verse');
  await verse.waitFor();
  check('passing chords in numbers read 2›3', (await verse.innerText()).replace(/\s+/g, '').includes('2›3'));

  // Favourites persist
  await page.goto(B + '#/song/beautiful');
  await page.getByRole('button', { name: /Favourite/ }).first().click();
  await page.reload();
  await page.goto(B + '#/favourites');
  check('favourite persists after reload', await page.getByRole('heading', { name: 'Beautiful' }).waitFor({ timeout: 3000 }).then(() => true, () => false));

  // Arrangements switch independently
  await page.goto(B + '#/song/divinity');
  await page.getByRole('tab', { name: /Ab version/ }).click();
  check('arrangement switch shows Ab version', (await page.locator('main aside').innerText()).includes('Divinity Ab'));
  await page.getByRole('tab', { name: /Tawa/ }).click();
  check('arrangement switch back to Tawa', (await page.locator('main aside').innerText()).includes('Sis Tawa'));

  // Search
  await page.goto(B + '#/library');
  await page.getByRole('searchbox').fill('alabaster');
  await page.waitForTimeout(150);
  const cards = await page.locator('main h3').allInnerTexts();
  check('search finds My Alabaster Box only', cards.length === 1 && cards[0] === 'My Alabaster Box', JSON.stringify(cards));

  // Setlist
  await page.goto(B + '#/setlists');
  await page.getByRole('button', { name: 'New setlist' }).first().click();
  await page.getByLabel('Setlist name').fill('Sunday 22 Nov');
  for (const q of ['Beautiful', 'One Name', 'King Of Kings']) {
    await page.getByLabel('Find a song to add').fill(q);
    await page.locator('ul button', { hasText: q }).first().click();
  }
  await page.getByRole('button', { name: 'Done' }).click();
  // Drag the third song to the top
  const handle = page.getByRole('button', { name: 'Drag to reorder 3' });
  const box = await handle.boundingBox();
  const first = await page.getByRole('button', { name: 'Drag to reorder 1' }).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, first.y - 10, { steps: 12 });
  await page.mouse.up();
  await page.reload();
  await page.locator('ol li a.font-semibold').first().waitFor();
  const order = await page.locator('ol li a.font-semibold').allInnerTexts();
  check('setlist persists and drag reorder worked', JSON.stringify(order) === JSON.stringify(['King Of Kings', 'Beautiful', 'One Name']), JSON.stringify(order));

  // Share link opens read-only for someone with no saved data
  await page.getByRole('button', { name: 'Share' }).click();
  await page.getByRole('button', { name: 'Link copied' }).waitFor();
  const link = await page.evaluate(() => navigator.clipboard.readText());
  const other = await browser.newContext();
  const op = await other.newPage();
  await op.goto(link);
  await op.getByText('Shared setlist · view only').waitFor();
  const sharedTitles = await op.locator('ol li a').allInnerTexts();
  check('share link shows the setlist to someone else', JSON.stringify(sharedTitles) === JSON.stringify(['King Of Kings', 'Beautiful', 'One Name']), JSON.stringify(sharedTitles));
  await op.getByRole('link', { name: 'Perform' }).click();
  check('shared setlist opens in performance mode', await op.getByText('Song 1 of 3').waitFor({ timeout: 3000 }).then(() => true, () => false));
  await other.close();

  // Perform setlist
  await page.getByRole('link', { name: 'Perform setlist' }).click();
  await page.getByText('Song 1 of 3').waitFor();
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
  check('performance mode advances into song 2', await page.getByText('Song 2 of 3').isVisible());
  await page.getByRole('button', { name: 'Larger text' }).click();
  check('font size control', await page.getByText('110%').isVisible());
  await page.getByRole('link', { name: 'Exit performance mode' }).click();

  // Accompaniment
  await page.goto(B + '#/accompaniment');
  await page.getByRole('heading', { name: 'Prayer', exact: true }).waitFor();
  check('accompaniment lists Prayer and Offering', (await page.getByRole('heading', { name: 'Prayer', exact: true }).isVisible()) && (await page.getByRole('heading', { name: 'Offering', exact: true }).isVisible()));

  // Offline
  await page.goto(B);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.goto(B + '#/song/beautiful'); // warm caches with lazy chunks
  await page.goto(B + '#/setlists');
  await page.waitForTimeout(600);
  await ctx.setOffline(true);
  await page.reload();
  await page.goto(B + '#/song/creator-of-the-universe');
  const offlineOk = await page.getByRole('heading', { name: 'Creator Of the Universe' }).waitFor({ timeout: 4000 }).then(() => true, () => false);
  check('works offline after first visit', offlineOk);
  await ctx.setOffline(false);

  // Mobile performance
  const m = await browser.newContext({ ...devices['iPhone 13'] });
  const mp = await m.newPage();
  mp.on('pageerror', (e) => bad.push('mobile error ' + e.message));
  await mp.goto(B + '#/perform/song/youre-the-king-of-glory');
  await mp.getByRole('button', { name: /Next/ }).tap();
  check('mobile performance next button', await mp.getByRole('heading', { name: 'Verse', exact: true }).waitFor({ timeout: 3000 }).then(() => true, () => false));

  const realBad = bad.filter((b) => !b.includes('offline') && !b.startsWith('503'));
  check('no 404s or page errors', realBad.length === 0, realBad.join(' | '));
  await browser.close();
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
})();
