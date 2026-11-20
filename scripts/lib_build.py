"""Helpers for building src/data/library.json from the hand-transcribed source.

Every section keeps `source` exactly as it appears in the PDF. `progression`
is the same text unless an override is given (and every override carries a
flag explaining it), so nothing changes silently.
"""
import json, re

KINDS = [
    (r'^intro and verse$', 'intro'), (r'^intro', 'intro'), (r'^solo', 'verse'), (r'^verse', 'verse'),
    (r'^pre[\s-]*ch', 'prechorus'), (r'^chorus', 'chorus'), (r'^bridge|^bride$', 'bridge'),
    (r'^interlude', 'interlude'), (r'^outro|^\(outro', 'outro'), (r'^(ml|melody|melody line)\b', 'melody'),
    (r'^breakdown', 'other'), (r'^substitution', 'other'), (r'^pastor', 'correction'), (r'^progression$', 'other'),
]

def slug(s):
    s = s.lower().replace("’", "").replace("'", "")
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')

def kind_of(label):
    l = label.lower().strip()
    for pat, k in KINDS:
        if re.search(pat, l):
            return k
    return 'cue'

def S(label, source, page, name=None, prog=None, melody=None, key=None, ref=None, notes=None, flags=None, cue=None, kind=None):
    """One section. label = text before ':' in the PDF (verbatim)."""
    k = kind or kind_of(label)
    sec = {'name': name or label, 'kind': k, 'source': source, 'page': page}
    if name and name != label:
        sec['sourceLabel'] = label
    if k == 'cue' and not cue:
        sec['lyricCue'] = label
    if cue:
        sec['lyricCue'] = cue
    if melody is not None:
        sec['melody'] = melody
    elif k != 'melody':
        sec['progression'] = source if prog is None else prog
    if key: sec['key'] = key
    if ref: sec['refersTo'] = ref
    if notes: sec['instructions'] = notes
    if flags: sec['flags'] = flags
    return sec

def A(label, sections, key=None, keyText='', musicians=(), pages=None, keyOptions=None, perf=None, mod=None, flags=None):
    pages = pages or sorted({s['page'] for s in sections}) or []
    a = {'label': label, 'musicians': list(musicians), 'originalKey': key, 'keyText': keyText,
         'sourcePages': pages, 'sections': sections}
    if keyOptions: a['keyOptions'] = keyOptions
    if perf: a['performanceNotes'] = perf
    if mod: a['modulationNotes'] = mod
    if flags: a['flags'] = flags
    return a

def finish(songs, accompaniment, out_path):
    seen = set()
    for song in songs:
        song['id'] = slug(song['title'])
        assert song['id'] not in seen, song['id']
        seen.add(song['id'])
        pages = set()
        for i, a in enumerate(song['arrangements']):
            base = slug(a['label']) if a['label'] else 'main'
            a['id'] = f"{song['id']}--{base}"
            ids = {}
            for s in a['sections']:
                sid = slug(s['name']) or 'section'
                n = ids.get(sid, 0) + 1
                ids[sid] = n
                s['id'] = sid if n == 1 else f'{sid}-{n}'
            # resolve refersTo labels to ids
            names = {s['name'].lower(): s['id'] for s in a['sections']}
            for s in a['sections']:
                r = s.get('refersTo')
                if r:
                    rid = names.get(r.lower())
                    assert rid, (song['title'], r)
                    s['refersTo'] = rid
            pages.update(a['sourcePages'])
        song['sourcePages'] = sorted(pages)
    for item in accompaniment:
        item['id'] = slug(item['title'])
    lib = {
        'version': 1,
        'source': {'title': 'CEYC BAND PROGRESSIONS', 'file': 'CEYC BAND PROGRESSIONS (1).pdf', 'pages': 34},
        'songs': songs,
        'accompaniment': accompaniment,
    }
    with open(out_path, 'w') as f:
        json.dump(lib, f, ensure_ascii=False, indent=1)
    return lib
