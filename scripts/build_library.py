"""Build src/data/library.json. Run: python3 scripts/build_library.py"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from lib_build import finish
from songs_part1 import SONGS as P1
from songs_part2 import SONGS as P2, ACCOMPANIMENT

out = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'library.json')
os.makedirs(os.path.dirname(out), exist_ok=True)
lib = finish(P1 + P2, ACCOMPANIMENT, out)
n_arr = sum(len(s['arrangements']) for s in lib['songs'])
print(f"{len(lib['songs'])} songs, {n_arr} arrangements, {len(lib['accompaniment'])} accompaniment items")
