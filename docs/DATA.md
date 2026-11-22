# Song data guide

`public/data/library.json` is generated. Edit the transcription in
`scripts/songs_part1.py` / `scripts/songs_part2.py`, then run `npm run data`
and commit both the scripts and the regenerated JSON.

## Model

```
Library
├─ songs: Song[]
│   ├─ id, title, aliases?, collection ("Song List" | "Today’s Songs"), sourcePages, flags?
│   └─ arrangements: Arrangement[]
│       ├─ id, label ("Lubone", "Version 1 (page 4)", "" for the only one)
│       ├─ musicians[], originalKey (null if not given), keyText (verbatim key line)
│       ├─ keyOptions? [{ key, label }]   e.g. Busi Eb / Tawa E, LW key
│       ├─ performanceNotes?, modulationNotes?, flags?, sourcePages
│       └─ sections: SongSection[]
│           ├─ id, name, kind (intro|verse|prechorus|chorus|bridge|interlude|outro|melody|cue|correction|other)
│           ├─ source       verbatim PDF text (never edited)
│           ├─ progression  what the engine renders (defaults to source)
│           ├─ melody?      scale degrees, e.g. "2,3,2,1,1"
│           ├─ key?         this section's key when it modulates
│           ├─ refersTo?    "Interlude: Intro" → id of the Intro section
│           ├─ lyricCue?, sourceLabel? (e.g. "Bride"), instructions?, flags?, page
└─ accompaniment: AccompanimentItem[]   (prayer, offering, reference recordings)
```

Personal data (favourites, notes, setlists…) is **not** in this file. It lives in each browser.

## Progression syntax

The engine reads the band's own notation:

| Write | Meaning | In A |
| --- | --- | --- |
| `1 - 4 - 5` | Dash or en-dash between chords | A – D – E |
| `6`, `2`, `3` | Plain numbers take the key's natural chord (2, 3, 6 minor; 7 diminished) | F#m, Bm, C#m |
| `4m` `4min` `5min` | Force minor | Dm |
| `3maj` `(2maj)` | Force major | C#, B |
| `57` `2m7` `4maj7` `5sus4` | Extensions | E7, Bm7, Dmaj7, Esus4 |
| `6#` (6 sharp) or `#6`, `b7` or `♭7` | Sharpened / flattened degree (quality unknown, shown with ?) | F (?), G (?) |
| `1/3` | Slash chord | A/C# |
| `2,3` | Passing chord: 2 passes into 3 (comma, no space). In `2,3,4,5` the last number is the target | Bm › C#m |
| `1~6` | Either chord (only used for Unto You’s “1/6, 1 on the first one”) | A or F#m |
| `[ … ] x2`, `* 3`, `X2` | Repeats | kept |
| `→ BACK TO VERSE`, `…`, `(…)`, words | Cues, kept as written | kept |
| `{key:G}` | Key change in the middle of a line | follows the song’s transposition |
| `4171` (digits run together) | Not read as chords. Left as text and flagged | 4171 |

## Recipes

**Fix a key:** change `key=` on the `A(...)` and update `keyText` if the PDF changes.

**Add an arrangement** (for example Busi's version of a song): add another `A('Busi', key='Eb', musicians=['Busi'], sections=[...])` to the song's list.

**Add a song:** append `song('Title', [A(...)])` in either file. `S(label, source, page, ...)` takes the label as written, the verbatim text and the PDF page. Use `prog=` only when the playable progression must differ from the source, and add `flags=[...]` saying why.

**Mark a key change:** give the section `key='G'`. If it repeats another section, add `ref='Chorus'` and `prog=''`.

After editing: `npm run data && npm test`.

## Songs added in the app

Songs added with **Library → Add a song** are not written into `library.json`. Band additions live in the
Supabase table `band_songs` (one JSON `Song` per row); personal ones live in the device's local data
(`customSongs`). They use the same `Song` shape with `collection` set to `Band additions` or `My songs`,
`sourcePages: []` and section `page: 0`, and are shown as “Added in the app”. Ids start with `added-` so they
never clash with PDF songs. To move a band addition into the PDF data permanently, copy its JSON from
the table into `scripts/songs_part*.py` and run `npm run data`.
