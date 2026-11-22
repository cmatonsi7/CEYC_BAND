/*
 * End-to-end test of band sharing: the MD makes a setlist and adds a song on
 * one phone, and a band member sees both on another phone without any link.
 * Needs: a build made with VITE_SUPABASE_URL=http://localhost:54400 VITE_SUPABASE_ANON_KEY=test-anon-key,
 * served at BASE_URL, and scripts/e2e/fake-supabase.mjs running. PIN via BAND_PIN.
 */
const { chromium, devices } = require('playwright');
const B = process.env.BASE_URL || 'http://localhost:4181/CEYC_BAND/';
const PIN = process.env.BAND_PIN || 'CHANGE-ME-123';
const results = [];
const check = (name, ok, extra = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`); };
const stamp = Date.now().toString(36);
const SETLIST = `Sunday ${stamp}`;
const SONG = `Test Song ${stamp}`;

(async () => {
  const browser = await chromium.launch();
  const md = await (await browser.newContext({ ...devices['iPhone 13'] })).newPage();
  const member = await (await browser.newContext({ ...devices['Pixel 7'] })).newPage();
  const errors = [];
  for (const p of [md, member]) p.on('pageerror', (e) => errors.push(e.message));

  // MD: unlock with a wrong PIN, then the right one.
  await md.goto(B + '#/setlists');
  await md.getByRole('heading', { name: 'Band setlists' }).waitFor();
  check('band section shows when sharing is set up', true);
  await md.getByRole('button', { name: 'I’m the MD' }).click();
  await md.getByLabel('Band PIN').fill('wrong-pin');
  await md.getByRole('button', { name: 'Unlock editing' }).click();
  await md.getByText('That PIN isn’t right.').waitFor();
  check('wrong PIN is refused', true);
  await md.getByLabel('Band PIN').fill(PIN);
  await md.getByRole('button', { name: 'Unlock editing' }).click();
  await md.getByRole('button', { name: 'New band setlist' }).waitFor();
  check('right PIN unlocks editing', true);

  // MD: create a band setlist, rename it, add two songs, set a note.
  await md.getByRole('button', { name: 'New band setlist' }).click();
  await md.waitForURL(/#\/band\//);
  await md.getByLabel('Setlist name').fill(SETLIST);
  await md.getByLabel('Find a song to add').fill('creator of the universe');
  await md.getByRole('button', { name: /Creator Of the Universe/ }).first().click();
  await md.getByLabel('Find a song to add').fill('beautiful');
  await md.getByRole('button', { name: /^.{0,4}Beautiful/ }).first().click();
  await md.getByRole('button', { name: 'Done' }).click();
  await md.getByText('Saved for the band.').waitFor({ timeout: 8000 });
  check('band setlist saves', true);

  // MD: add a song that isn't in the PDF, for the band.
  await md.goto(B + '#/songs/new');
  await md.getByLabel('Title').fill(SONG);
  await md.getByLabel('Key the numbers are in').selectOption('G');
  await md.getByLabel('Numbers for section 1').fill('1 5 2,3 4');
  await md.getByLabel('Preview').getByText('G', { exact: true }).first().waitFor();
  check('song editor previews chords in the chosen key', true);
  await md.getByRole('button', { name: 'Add for the band' }).click();
  await md.getByRole('heading', { name: SONG }).waitFor();
  check('band song saved and opens', (await md.getByText('Added in the app').count()) > 0);

  // MD adds the new song to the band setlist from the song page.
  await md.getByRole('button', { name: 'Add to setlist' }).click();
  await md.getByRole('menuitem', { name: new RegExp(SETLIST) }).click();
  await md.waitForTimeout(1500);

  // Member: just opens the app. No link, no PIN.
  await member.goto(B);
  await member.getByText(SETLIST).first().waitFor({ timeout: 8000 });
  check('member sees the setlist on the home page', true);
  await member.getByRole('link', { name: new RegExp(SETLIST) }).first().click();
  await member.waitForURL(/#\/band\//);
  await member.getByRole('link', { name: SONG, exact: true }).waitFor();
  const songsShown = await member.locator('ol > li').count();
  check('member sees all 3 songs in order', songsShown === 3, `got ${songsShown}`);
  check('member view is read-only', (await member.getByLabel('Setlist name').count()) === 0 && (await member.getByText('Only someone with the band PIN').count()) === 1);
  await member.getByRole('link', { name: SONG, exact: true }).click();
  await member.getByRole('heading', { name: SONG }).waitFor();
  check('member can open the added song', true);

  // Member performs the band setlist.
  await member.goto(B + '#/setlists');
  await member.getByRole('link', { name: 'Perform' }).first().click();
  await member.waitForURL(/#\/perform\/band\//);
  await member.getByText('Creator Of the Universe').first().waitFor();
  check('member can perform the band setlist', true);

  // MD renames; member picks it up when they come back to the app.
  await md.goto(B + '#/setlists');
  await md.getByRole('link', { name: new RegExp(SETLIST) }).first().click();
  await md.getByLabel('Setlist name').fill(SETLIST + ' v2');
  await md.getByText('Saved for the band.').waitFor({ timeout: 8000 });
  await md.waitForTimeout(800);
  await member.goto(B + '#/setlists');
  await member.evaluate(() => window.dispatchEvent(new Event('focus')));
  await member.getByText(SETLIST + ' v2').first().waitFor({ timeout: 8000 });
  check('member sees the MD’s changes', true);

  // Member offline: still sees the last copy.
  await member.context().setOffline(true);
  await member.reload();
  await member.getByText(SETLIST + ' v2').first().waitFor({ timeout: 8000 });
  check('band setlist still shows offline', (await member.getByText(/Offline: showing the copy saved/).count()) > 0);
  await member.context().setOffline(false);

  // Clean up: MD deletes the song and setlist.
  await md.goto(B + '#/library?q=' + encodeURIComponent(SONG));
  await md.getByRole('link', { name: new RegExp(SONG) }).first().click();
  await md.getByRole('link', { name: 'Edit song' }).click();
  await md.getByRole('button', { name: 'Delete song' }).click();
  await md.getByRole('button', { name: 'Delete for everyone' }).click();
  await md.waitForURL(/#\/library/);
  await md.goto(B + '#/setlists');
  await md.getByRole('link', { name: new RegExp(SETLIST) }).first().click();
  await md.getByRole('button', { name: 'Delete band setlist' }).click();
  await md.getByRole('button', { name: 'Delete for everyone' }).click();
  await md.waitForURL(/#\/setlists$/);
  check('MD can delete band items', true);

  check('no page errors', errors.length === 0, errors.join(' | '));
  await browser.close();
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch(async (e) => {
  console.error('FAIL ', e.message.split('\n').slice(0, 6).join('\n'));
  process.exit(1);
});
