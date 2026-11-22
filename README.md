# CEYC Band Library

A digital music library for the CEYC worship band, built from the
**“CEYC BAND PROGRESSIONS”** document. Musicians can find a song, read its
Nashville-number progression or the actual chords in any key, follow key
changes, build service setlists and play from a large, high-contrast
Performance Mode.

It's a static React app that runs on **GitHub Pages** for free. There's no server
and no database: the song library is a JSON file, and each musician's
favourites, notes, keys and setlists are saved in their own browser.

---

## Features

| Area | What it does |
| --- | --- |
| **Music Library** | Search by title, alias or lyric cue (“Hallelujah”). Filter by key, musician (Lubone, Tawa, Busi, Khomotso) or list (Song List / Today’s Songs). Card view or A–Z with letter jump. Each card shows keys, number of arrangements, musicians and PDF pages. |
| **Song page** | Every arrangement as a tab. Sections with colour-coded labels and a sticky section jump bar. **Numbers / Chords / Both** switch (Both shows each chord name with its number degree underneath). Key control (−/+ semitone, any key, labelled presets such as *Busi Eb / Tawa E*, reset to the written key). Key-change badges on modulating sections. “Same as Intro” references resolved. Lyric cues, melody lines (shown as note names in chord view), performance and modulation notes, pastor’s corrections, the PDF page for each section, and the original PDF text one tap away. Flags where the PDF is unclear. Personal notes per arrangement. |
| **Transposition engine** | Proper interval maths with letter-correct spelling (degree 7 of F# is E#, not F). Diatonic default qualities, explicit `m`/`min`/`maj`/`dim` overrides, extensions (`7`, `maj7`, `sus4`…), slash chords, passing chords (`2,3` = 2 passing into 3), sharps/flats written either side (`6#`, `#6`, `♭7`). Modulating sections move with the song, so Creator of the Universe stays F → F# → G when you move it to G → Ab → A. |
| **Performance Mode** | Black, high-contrast stage view. One section at a time or the whole song. Big previous/next buttons with the next section’s name, swipe left/right, arrow/space/PageUp/PageDown (works with Bluetooth page-turner pedals). Quick key changes, a Numbers / Chords / Both switch that's always in the top bar (or press N), font size 60–220 %, full screen, screen wake lock where the browser supports it. Works for a single song or a whole setlist. |
| **Setlists** | Create, rename, date, duplicate, delete. Add songs from the library, drag to reorder (mouse and touch) or use the up/down buttons, choose the arrangement and performance key per song, add a note per song, and start Performance Mode from the top or from any song. **Share** makes a read-only link (the setlist is packed into the URL) that anyone can open, perform from, or save a copy of. No account or server is needed. A link is a snapshot, so share again after editing. |
| **Band setlists** | When band sharing is switched on (see below), the MD unlocks editing once with the band PIN and makes setlists that appear on **everyone’s** phone automatically: on the home page as “Next service”, and under Setlists. Changes save as the MD types and reach others within about 30 seconds (or as soon as they open the app). Everyone else gets a read-only view, Performance Mode and “Save a copy”. Each phone keeps the last copy for when there’s no signal. Personal setlists can be published to the band in one tap. |
| **Add a song** | Library → **Add a song** for songs that aren’t in the PDF: title, key (optional), musician, sections with numbers and lyric cues, and notes, with a live Numbers / Chords preview. Save it for the whole band (needs the PIN) or only on this device. Added songs are marked “Added in the app” and can be edited or deleted; PDF songs can’t be edited. |
| **Service Accompaniment** | Prayer and Offering progressions from page 34 with their recording links, kept separate from the song library, with key control for chord view. |
| **Favourites & notes** | Favourite songs, personal notes, preferred key and arrangement per song, recently viewed. |
| **Review screen** | `#/review` lists every place where the PDF was unclear, for the music team to check. |
| **Settings** | Default notation, light/dark/auto theme, performance text size, keep-screen-on, export/import a backup of your personal data, clear data. |
| **Offline** | After the first visit the whole app (including fonts, every screen and the song data) is cached by a service worker, so it works with no signal. |

---

## Run it locally

Requires Node.js 20+.

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # unit tests (transposition engine, data, storage)
npm run build        # production build in dist/
```

To test the build exactly as GitHub Pages will serve it (under `/<repo>/`):

```bash
npm run build:pages  # builds with base /ceyc-music-library/
npm run serve:pages  # serves dist/ at http://localhost:4173/ceyc-music-library/
npm run e2e          # in a second terminal: browser smoke test (needs Playwright + Chromium)
```

---

## Deploy to GitHub Pages

### 1. Create the repository
1. On GitHub, click **New repository**. Name it, for example, `ceyc-music-library`. It can be public or private (private Pages needs a paid plan, so public is the free option).
2. Push this folder to it:
   ```bash
   git init -b main          # skip if this folder is already a git repo
   git add .
   git commit -m "CEYC Band Library"
   git remote add origin https://github.com/<your-user>/ceyc-music-library.git
   git push -u origin main
   ```

### 2. Turn on GitHub Pages with Actions
1. In the repository go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. That's all. No branch or folder needs picking.

### 3. Deploy
Every push to `main` runs `.github/workflows/deploy.yml`, which:
1. installs dependencies (`npm ci`),
2. runs the unit tests (a failing test stops the deploy),
3. builds with `VITE_BASE=/<repository-name>/`,
4. uploads `dist/` and publishes it with the official `actions/deploy-pages` action.

Watch it under the **Actions** tab. When it's green the site is live at
`https://<your-user>.github.io/<repository-name>/`. You can also re-run it any time
from **Actions → Deploy to GitHub Pages → Run workflow**.

### The Vite base path
The base path is set automatically from the repository name in the workflow,
so renaming the repo just works. If you need to change it by hand:

- **Project site** (`https://user.github.io/repo/`): base `/repo/` (default; the workflow does this).
- **User/organisation site** (repo named `user.github.io`) **or a custom domain**: base `/`.
  Edit the `VITE_BASE` line in `.github/workflows/deploy.yml` to `VITE_BASE: /`.

Locally the base defaults to `./` (relative), which works on any static host.
Routing uses `HashRouter` (`…/#/song/beautiful`), so refreshing any page or
sharing a deep link never hits a GitHub Pages 404.

### Deploying future changes
Edit, commit and push to `main`. The site updates in a minute or two. Musicians
who already have the app open get the new version on their next visit (the
service worker re-caches automatically on every build).

---

## Updating the songs

The song data lives in **`public/data/library.json`**, generated from the
transcription scripts in `scripts/`:

- `scripts/songs_part1.py` and `scripts/songs_part2.py`: one entry per song, in PDF order, with the PDF text for every section.
- `scripts/build_library.py`: writes the JSON. Run `npm run data` after editing (Python 3, no packages needed). It also regenerates `docs/REVIEW.md`.

See **[docs/DATA.md](docs/DATA.md)** for the data model, the progression syntax and how to add a song, fix a key or add an arrangement.

---

## Project structure

```
.github/workflows/deploy.yml   Build, test and publish to GitHub Pages
public/
  data/library.json            The song library (generated, static JSON)
  sw.js                        Offline service worker (file list injected at build)
  favicon.svg, icon-*.png, manifest.webmanifest
scripts/
  songs_part1.py, songs_part2.py   Song transcription from the PDF
  lib_build.py, build_library.py   Turn the transcription into library.json
  review_list.py               Writes docs/REVIEW.md
  make-icons.cjs               Renders the PNG app icons
  e2e/serve.mjs, e2e/smoke.cjs GitHub Pages-style server + browser smoke test
  e2e/fake-supabase.mjs, band.cjs  Local stand-in for Supabase + two-phone band sharing test
supabase/setup.sql             Band sharing database: tables, read-only access, PIN-checked save functions
docs/
  DATA.md                      Data model and editing guide
  REVIEW.md                    Items to verify against the PDF
src/
  music/                       Pure music theory: notes, keys, chords, progression tokenizer, melody (+ tests)
  data/                        Types, repository (data-access layer), library queries (+ tests), LibraryProvider
  store/                       Local-first user data store (+ tests) and React provider
  band/                        Band sharing: config, Supabase REST repository, BandProvider, added songs (+ tests)
  components/                  Layout, icons, Progression renderer, KeyControl, SectionCard, SongCard, UI primitives
  hooks/                       Theme, wake lock, full screen, drag-to-reorder
  pages/                       Home, Library, Song, Song editor, Performance, Setlists, Setlist editor, Band setlist, Accompaniment, Favourites, Settings, Review
  styles/index.css             Design tokens (light, dark, stage) and component classes
```

### Architecture notes
- **Static, local-first.** `LibraryRepository` (`src/data/repository.ts`) is the only place that loads songs; `UserStore` (`src/store/userStore.ts`) is the only place that saves personal data. Swapping either for Firebase/Supabase means writing one new class. The UI doesn't change.
- **Music logic is separate from the UI.** `src/music` has no React in it and is fully unit-tested. Chords are never transposed by text replacement: every number is parsed to a scale degree and rendered from interval maths in the target key.
- **Nothing in the source is lost.** The tokenizer keeps brackets, repeats, arrows and words, and each section keeps the verbatim PDF text.
- **Dependencies:** React, React Router, two self-hosted variable fonts. Tailwind, Vite, TypeScript and Vitest at build time only. No UI kit or icon package; icons are inline SVG.

---

## Band sharing (shared setlists and songs)

Everything works without a server. Band sharing adds one free [Supabase](https://supabase.com) database
so the MD's setlists and added songs show up for everyone who opens the app.

**Set up once (about 10 minutes):**
1. Create a free Supabase account and a new project (any name, choose the region closest to you).
2. In the project, open **SQL Editor → New query**, paste all of [`supabase/setup.sql`](supabase/setup.sql),
   change the PIN on the line marked `>>> CHANGE THIS <<<`, and click **Run**.
3. Open **Project Settings → API** and copy the **Project URL** and the **anon public** key.
4. Put them in [`src/band/config.ts`](src/band/config.ts) and push. (Or set repository variables
   `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.) The anon key is meant to be public.
5. On the MD's phone: Setlists → **I’m the MD** → enter the PIN once.

**How it's protected.** Anyone can read band setlists and songs. Nobody can write to the tables
directly: every change goes through a database function that checks the PIN against a bcrypt hash
(the PIN itself is never stored or sent anywhere except in the change request). Wrong PINs are
slowed down. To change the PIN later, run in the SQL Editor:
`update band_settings set edit_pin_hash = extensions.crypt('NEW-PIN', extensions.gen_salt('bf')) where id = 1;`
Phones that had the old PIN are asked for the new one on their next change.

**Good to know.** Supabase's free plan pauses a project after about a week with no visits.
Opening the app regularly keeps it awake; if it does pause, click **Restore** in the Supabase dashboard.
While the server is unreachable, phones show the last copy they saved.

**Code.** `src/band/repository.ts` (REST calls with `fetch`, no SDK), `src/band/BandProvider.tsx`
(polling, local cache, PIN on device, debounced saves that never overwrite unsaved edits),
`src/band/customSongs.ts` (added songs). Test against a local Postgres with
`node scripts/e2e/fake-supabase.mjs` and `node scripts/e2e/band.cjs` (two phones: MD and band member).

---

## Known limitations
- Personal data is per browser. Clearing site data removes it. Use the export backup.
- Share links are snapshots. Band setlists (above) are the live version.
- Band setlists update every 30 seconds while the app is open, not instantly. If two people with the PIN edit the same setlist at the same moment, the last save wins.
- If a browser refuses to save data (private window, some in-app browsers), the app shows a warning banner.
- Songs with no key in the PDF show numbers until someone picks a key. The chosen key is then treated as the reference key.
- Chromatic numbers (`5#`, `#6`, `b7`) show the root only with a `?`, because the PDF doesn't say whether they are major, minor or diminished.
- Screen wake lock depends on browser support (current Chrome, Edge, Safari 16.4+). Full screen isn't available on iPhone Safari; adding the site to the home screen gives a similar result.
- Lyrics aren't in the source document, so there are none in the app.
