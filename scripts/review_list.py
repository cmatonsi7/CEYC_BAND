"""Write docs/REVIEW.md: every flagged item in the library, for checking against the PDF."""
import json, os
root = os.path.join(os.path.dirname(__file__), '..')
lib = json.load(open(os.path.join(root, 'public/data/library.json')))
lines = ['# Items to verify against the PDF', '',
         'Generated from `public/data/library.json` by `scripts/review_list.py`. Nothing below was guessed or silently corrected in the app; each item is shown with a flag on the song page and on the in-app **Review** screen (`#/review`).', '']
n = 0
for s in lib['songs']:
    items = list(s.get('flags', []))
    for a in s['arrangements']:
        prefix = f"{a['label']}: " if len(s['arrangements']) > 1 and a['label'] else ''
        items += [prefix + f for f in a.get('flags', [])]
        for sec in a['sections']:
            items += [f"{prefix}{sec['name']} (p. {sec['page']}): {f}" for f in sec.get('flags', [])]
    if items:
        lines.append(f"## {s['title']} — p. {', '.join(map(str, s['sourcePages']))}")
        lines += [f'- {i}' for i in items]
        lines.append('')
        n += len(items)
acc = [a for a in lib['accompaniment'] if a['flags']]
if acc:
    lines.append('## Service accompaniment — p. 34')
    for a in acc:
        lines += [f"- {a['title']}: {f}" for f in a['flags']]
        n += len(a['flags'])
    lines.append('')
lines.insert(3, f'**{n} items.**\n')
os.makedirs(os.path.join(root, 'docs'), exist_ok=True)
open(os.path.join(root, 'docs/REVIEW.md'), 'w').write('\n'.join(lines))
print(n, 'items')
