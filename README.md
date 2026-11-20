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
| **Setlists** | Create, rename, date, duplicate, delete. Add songs from the library, drag to reorder (mouse and touch) or use the up/down buttons, choose the arrangement and performance key per song, add a note per song, and start Performance Mode from the top or from any song. |
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
docs/
  DATA.md                      Data model and editing guide
  REVIEW.md                    Items to verify against the PDF
src/
  music/                       Pure music theory: notes, keys, chords, progression tokenizer, melody (+ tests)
  data/                        Types, repository (data-access layer), library queries (+ tests), LibraryProvider
  store/                       Local-first user data store (+ tests) and React provider
  components/                  Layout, icons, Progression renderer, KeyControl, SectionCard, SongCard, UI primitives
  hooks/                       Theme, wake lock, full screen, drag-to-reorder
  pages/                       Home, Library, Song, Performance, Setlists, Setlist editor, Accompaniment, Favourites, Settings, Review
  styles/index.css             Design tokens (light, dark, stage) and component classes
```

### Architecture notes
- **Static, local-first.** `LibraryRepository` (`src/data/repository.ts`) is the only place that loads songs; `UserStore` (`src/store/userStore.ts`) is the only place that saves personal data. Swapping either for Firebase/Supabase means writing one new class. The UI doesn't change.
- **Music logic is separate from the UI.** `src/music` has no React in it and is fully unit-tested. Chords are never transposed by text replacement: every number is parsed to a scale degree and rendered from interval maths in the target key.
- **Nothing in the source is lost.** The tokenizer keeps brackets, repeats, arrows and words, and each section keeps the verbatim PDF text.
- **Dependencies:** React, React Router, two self-hosted variable fonts. Tailwind, Vite, TypeScript and Vitest at build time only. No UI kit or icon package; icons are inline SVG.

---

## Optional: shared team data

Everything works without a backend. The trade-off is that setlists and notes stay on the
device where they were made (use **Settings → Export/Import backup** to move them).

If the team later wants **shared setlists** that the music director publishes for everyone:
1. Create a free Firebase project, enable Firestore and (optionally) Google sign-in.
2. Add the web config as repository secrets and expose them as `VITE_FIREBASE_*` env vars in the workflow.
3. Implement `UserStore` (or a separate `SetlistRepository`) against Firestore, and keep `LocalUserStore` as the offline cache.
Song data can stay as static JSON, or move to Firestore behind `LibraryRepository` if the team wants to edit songs in the browser.

---

## Known limitations
- Personal data is per browser. Clearing site data removes it. Use the export backup.
- No shared or real-time setlists without adding a backend (see above).
- Songs with no key in the PDF show numbers until someone picks a key. The chosen key is then treated as the reference key.
- Chromatic numbers (`5#`, `#6`, `b7`) show the root only with a `?`, because the PDF doesn't say whether they are major, minor or diminished.
- Screen wake lock depends on browser support (current Chrome, Edge, Safari 16.4+). Full screen isn't available on iPhone Safari; adding the site to the home screen gives a similar result.
- Lyrics aren't in the source document, so there are none in the app.
