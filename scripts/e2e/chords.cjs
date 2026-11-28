/*
 * End-to-end test of editing a PDF song's chords: the MD changes a section for
 * the band and a band member sees it; a member's own change stays on their
 * phone; going back to the PDF chords works. Same setup as band.cjs.
 */
const { chromium, devices } = require('playwright');
const B = process.env.BASE_URL || 'http://localhost:4181/CEYC_BAND/';
const PIN = process.env.BAND_PIN || 'CHANGE-ME-123';
const SONG = 'strong-and-mighty-god';
const results = [];
const check = (name, ok, extra = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`); };

(async () => {
  const browser = await chromium.launch();
  const md = await (await browser.newContext({ ...devices['iPhone 13'] })).newPage();
  const member = await (await browser.newContext({ ...devices['Pixel 7'] })).newPage();
  const errors = [];
  for (const p of [md, member]) p.on('pageerror', (e) => errors.push(e.message));
  const verse = (p) => p.locator('#sec-verse');

  try {
    await md.goto(B + `#/song/${SONG}`);
    await md.getByRole('link', { name: 'Edit chords' }).click();
    await md.waitForURL(/\/chords/);
    check('PDF song has an Edit chords page', true);

    await md.getByLabel('Key the numbers are in').selectOption('G');
    await md.getByLabel('Verse', { exact: true }).fill('1 4 2,3 4 | 6# 5');
    await md.getByText('Changed').first().waitFor();
    check('changed section is marked and shows the PDF numbers', await md.getByText('PDF:').count() === 1);
    await md.getByLabel('Band PIN').fill(PIN);
    await md.getByRole('button', { name: 'Unlock editing' }).click();
    await md.getByRole('button', { name: 'Save for the band' }).click();
    await md.waitForURL(new RegExp(`#/song/${SONG}(\\?|$)`));
    await md.getByText('Chords updated for the band').waitFor();
    check('MD saves for the band', true);
    check('song page shows the new key in chords', (await verse(md).innerText()).includes('G'), (await verse(md).innerText()).slice(0, 80));

    await member.goto(B + `#/song/${SONG}`);
    await member.getByText('Chords updated for the band').waitFor({ timeout: 8000 });
    const mv = await verse(member).innerText();
    check('member sees the edited section', /Edited/.test(mv), mv.replace(/\s+/g, ' ').slice(0, 120));
    await verse(member).getByRole('button', { name: /PDF text/ }).click();
    check('member can still see the PDF numbers', (await verse(member).innerText()).includes('Numbers before the edit'));

    // Member makes a change for themselves only.
    await member.getByRole('link', { name: 'Edit chords' }).click();
    check('editor starts from the band version', (await member.getByLabel('Verse', { exact: true }).inputValue()) === '1 4 2,3 4 | 6# 5');
    await member.getByText('Only me, on this device').click();
    await member.getByLabel('Bridge', { exact: true }).fill('1 5 6 4');
    await member.getByRole('button', { name: 'Save on this device' }).click();
    await member.getByText('Chords changed on this device only').waitFor();
    check('member saves on their device', true);
    await md.reload();
    await md.getByText('Chords updated for the band').waitFor();
    check('MD does not get the member’s own change', !(await md.locator('#sec-bridge').innerText()).includes('Edited'));
    await member.reload();
    await member.getByText('Chords changed on this device only').waitFor();
    check('device change survives a refresh', true);

    // Perform view uses the edits too.
    await md.goto(B + `#/perform/song/${SONG}`);
    await md.waitForTimeout(800);
    check('perform view shows edited numbers', (await md.locator('body').innerText()).length > 0 && !(await md.locator('body').innerText()).includes('1 - 4 - 1 - 4 - 1 - 2 - 5\n1 - 4 - 5'));

    // MD goes back to the PDF chords for everyone.
    await md.goto(B + `#/song/${SONG}/chords`);
    await md.getByRole('button', { name: 'Go back to the PDF chords' }).click();
    await md.waitForURL(new RegExp(`#/song/${SONG}(\\?|$)`));
    await md.waitForTimeout(300);
    check('reset removes the band edit', (await md.getByText('Chords updated for the band').count()) === 0);

    // Added songs keep using the full editor.
    await md.goto(B + `#/song/${SONG}/chords`);
    check('editor reopens on the PDF version', (await md.getByLabel('Verse', { exact: true }).inputValue()).startsWith('1 - 4 - 1 - 4'));
    await md.screenshot({ path: process.env.SHOT || '/var/tmp/chords.png', fullPage: false });
  } catch (e) {
    check('no unexpected failure', false, e.message.split('\n')[0]);
  }
  check('no page errors', errors.length === 0, errors.join(' | '));
  await browser.close();
  const passed = results.filter((r) => r.ok).length;
  console.log(`\n${passed}/${results.length} passed`);
  process.exit(passed === results.length ? 0 : 1);
})();
