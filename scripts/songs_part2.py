from lib_build import S, A
from songs_part1 import song, NO_KEY

SONGS = [
song('Heart of Worship', [A('Lubone', key='A', keyText='A - LUBONE', musicians=['Lubone'], sections=[
    S('Intro', '1 - 6 - 4 - 5', 14),
    S('Verse', '1,7 - 6 - 4 - 5\n1,7 - 6 - 2 - 5', 14, notes=['👀 (marker after the verse in the PDF)']),
    S('Pre Chorus', '1- 6 - 2 - 7\n4-5', 14, name='Pre-Chorus'),
    S('Chorus', '2 - 4 - 1 - 5', 14),
])]),

song('King Of Righteousness', [A('', key='D', keyText='Key: D', sections=[
    S('Intro', '1 - 4 - 5 - 4', 14),
    S('Verse', '1 - 4 - 5 - 6 - 5 - 1', 15),
    S('Chorus', '6 - 4 - 1\n6 - 4 - 5\n6 - 4 - 5\n2 - 5 - 1', 15),
    S('Interlude', '[6 - 4 - 1] x2 → 5 → Verse', 15),
    S('Bridge', '5 - 4 - 1 x 4\n5 - 5# - 6,\n5 - 4 - 1.\nx2', 15),
])]),

song('Eternal Elixir', [A('Lubone', key='G', keyText='Key: G - Sis Lubone', musicians=['Lubone'], sections=[
    S('Intro', '[1 - 4 - 6 - 4 ] x 2', 15),
    S('Verse', '1 - 5 - 2 - 4 - 1 - 5 - 2', 15),
    S('With you', '2 - 3 - 6 - 2 - 4 - 5', 15, notes=['🙃 (marker after this line in the PDF)']),
    S('Chorus', '1 - 5 - 2 - 4 - 1 - 5 - 2 - 4-5\n1-5-2-4-6-2-2-3-4-5-1', 15),
    S('Interlude', '1 - 4 - 6 - 4 → Verse', 15),
    S('Bridge', '1… 6… 4… 4min\n1 - 5 - 2 - 4 - 5 - 2 - 5 - 2 - 4 - 5 - 1 → Chorus', 15),
])]),

song('You’re the King Of Glory', [A('', key='F', keyText='Key: F - ??',
    mod=['Bridge: "TRANSPOSE BY 1 TONE (from F to G) stay on the 5". The final chorus is in G.'],
    flags=['Musician is written as "??" in the PDF.'], sections=[
    S('Intro', '1 - 6 - 4 - 5', 15),
    S('Verse', '[1 - 6 - 4 - 5 ] x 2\n6 - 4 - 5 - 1 - 2 - 5 - 1', 16),
    S('Chorus', '5 - 4 - 1 - 5 - 4 - 1\n2 - 5 - 6 - 4 - 2 - 5 - 1 …x2', 16),
    S('Interlude', '[5 - 4 - 1 ] x 2', 16),
    S('Bridge', '[ 1 - 5 - 4 ] x 2\n[ 2 - 6 - 1 - 5 - 2 - 6 - 5 ] x 2 → TRANSPOSE BY 1 TONE (from F to G) stay on the 5', 16,
      prog='[ 1 - 5 - 4 ] x 2\n[ 2 - 6 - 1 - 5 - 2 - 6 - 5 ] x 2 → key change', notes=['TRANSPOSE BY 1 TONE (from F to G) stay on the 5']),
    S('Chorus (in G)', 'Chorus: (in G) x 2', 16, name='Chorus (in G)', prog='', key='G', ref='Chorus',
      notes=['Chorus repeated in G, x 2.']),
    S('(Outro - God of the Universe)', '(Outro - God of the Universe): 4 - 1 - 4 - 6 - 5 - 1', 16, name='Outro (God of the Universe)',
      prog='4 - 1 - 4 - 6 - 5 - 1', key='G', cue='God of the Universe',
      flags=['The PDF does not say which key the outro is in. Shown in G because it follows the chorus in G.']),
])], aliases=['Youre the King of Glory', 'King of Glory']),

song('You are the Christ', [A('Tawa', key='A', keyText='Key: A Yuu - Sis Tawa', musicians=['Tawa'],
    flags=['Key line reads "A Yuu"; "Yuu" is unclear.'], sections=[
    S('Intro', '6 - 5 - 4 - 3', 16),
    S('Verse', '6 - 4 - 1, 4 - 6 - 2 - 4 - 5 - 4 - 1 - 4 - 1 - 4 - 6 - 5\n1 - 4 - 1 - 4 - 6 - 2 - 4 - 5, 4 - 3 - 4 - 2 - 6 - 5', 16),
    S('Chorus', '[ 6 - 5 - 4 - 3 ] x 4', 16),
    S('Interlude', '6 - 5 - 4 - 3', 16),
    S('Verse 2', '6 - 5 - 4 - 3, 1# - 6# - 6 - 5# → Chorus', 16),
    S('Outro', '[6 - 1 - 3 - 6 ] x 4', 16),
])]),

song('Gracious Father', [A('Khomotso', key='C', keyText='Key: C (Khomotso)', musicians=['Khomotso'], sections=[
    S('Intro', '1 - 5 - 6 - 4\nx2', 17),
    S('Verse', '1 - 5 - 6 - 4 x2', 17),
    S('Chorus', '[1 - 5 - 2 - 6, 5 - 1 - 5 - 2,3,4 ] x 2', 17),
    S('Interlude', '1 - 5 - 6 - 4\nx2', 17),
    S('Bride', '2 - 4 - 6 - 5', 17, name='Bridge', flags=['Labelled "Bride" in the PDF; read as Bridge.']),
])]),

song('Oh How Marvelous', [A('Lubone', key='G', keyText='Key:G - Lubone', musicians=['Lubone'],
    mod=['Bridge ends "1 - 1# (transpose 1 up) → chorus".'], sections=[
    S('Intro', '1 - 5 - 4 - 5 x 2', 17),
    S('Verse', '1 - 1/7 - 4 - 2 - 5\n6-4-3-2-5', 17, flags=['"1/7" shown as a slash chord (1 over 7 in the bass).']),
    S('Chorus', '1- 4 - 5 - 3 - 4 - 5\n1 - 4 - 5 - 3 - 2 - 5 - 1 x2', 17),
    S('Interlude', '(Intro)', 17, prog='', ref='Intro'),
    S('Bridge', '1 - 4 - 5 - 6 - 3 - 2 - 5\n1 - 4 - 5 - 6 - 3 - 2 - 5 - 1 - 1# (transpose 1 up) → chorus', 17,
      prog='1 - 4 - 5 - 6 - 3 - 2 - 5\n1 - 4 - 5 - 6 - 3 - 2 - 5 - 1 - 1# → chorus', notes=['transpose 1 up → chorus']),
    S('Chorus (after key change)', '(transpose 1 up) → chorus', 17, kind='chorus', name='Chorus (after key change)', prog='', key='Ab', ref='Chorus',
      flags=['Added from the instruction "1# (transpose 1 up) → chorus". Shown a semitone up (G → Ab) because the bridge ends on 1#. Please confirm.']),
])], aliases=['Oh How Marvellous']),

song('Your Word is Eternal', [A('Lubone', key='C#', keyText='Your Word is Eternal C# / Lubone', musicians=['Lubone'], sections=[
    S('Intro', '6 - 4 - 1\n6-4-5', 17),
    S('Verse', '6 - 4 - 1\n6-4-5\n1-2-6-4-5-1', 17),
    S('Chorus', '4 - 5 - 1\n4-6-5\n4-3-2-1-7-6\n4-5-1', 18),
    S('Interlude', 'intro', 18, prog='', ref='Intro'),
    S('Bridge', '4 - 5 - 6\n4-6-5', 18),
])]),

song('Creator Of the Universe', [A('Lubone / Tawa', key='F', keyText='Key: F→F# → G - Lubone/Tawa', musicians=['Lubone', 'Tawa'],
    mod=['Song moves F → F# → G. Each new key is announced by 1 - 1# at the end of the previous section.'], sections=[
    S('Intro', '4 - 5 - 6 x 2\n2-3-6-7-1', 18),
    S('Verse', '6 - 7 - 1, 2 - 5\n6 - 7 - 1, 2 - 5\n2 - 3 - 4 - 5,\n4 - 5 - 6, 4 - 5 - 6\n2-3-6-7-1', 18),
    S('God of everything', '6 - 4 - 2 - 5 - 1 - 4 (3) 2 - 3 - 4 - 5,\n2 - 3 - 4 - 5 - 1 - 1#', 18),
    S('F#: Verse', 'F#: Verse: 6 - 7 - 1, 2 - 5\n6 - 7 - 1, 2 - 5\n2 - 3 - 4 - 5,\n4 - 5 - 6, 4 - 5 - 6\n2 - 3 - 6 - 7 - 1 - 1#', 18,
      name='Verse (F#)', key='F#', kind='verse', prog='6 - 7 - 1, 2 - 5\n6 - 7 - 1, 2 - 5\n2 - 3 - 4 - 5,\n4 - 5 - 6, 4 - 5 - 6\n2 - 3 - 6 - 7 - 1 - 1#'),
    S('G: Verse', 'G: Verse: 6 - 7 - 1, 2 - 5\n6 - 7 - 1, 2 - 5\n2 - 3 - 4 - 5,\n4 - 5 - 6, 4 - 5 - 6\n2-3-6-7-1', 18,
      name='Verse (G)', key='G', kind='verse', prog='6 - 7 - 1, 2 - 5\n6 - 7 - 1, 2 - 5\n2 - 3 - 4 - 5,\n4 - 5 - 6, 4 - 5 - 6\n2-3-6-7-1'),
])], aliases=['Creator of the Universe']),

song('King Of Eternity', [A('', key='F', keyText='Key: F', sections=[
    S('Intro', '4, 1, 6, 5, 1', 19),
    S('Verse (Solo)', '4, 5, 1, 5, 6\n4, 1, 2, 5', 19),
    S('Verse (Choir)', '1, 5, 6, 4, 5', 19),
    S('Pre Chorus', '2, 6, 5\n1, 5, 6\n2, 6, 5\n2, 6, 5', 19, name='Pre-Chorus'),
    S('Chorus', '2, 5, 1, 5, 6 x3\n2, 1, 4, 5, 1', 19),
    S('Bridge', '#6, 4, 1 x2\n#6, 1 x2\n#5, #2, 5', 19),
])]),

song('In Your Image', [A('Tawa', key='G', keyText='Key: G - Tawa', musicians=['Tawa'], pages=[19, 20, 28], sections=[
    S('Intro', '[ 1 - 2 - 6, - 4 - 5 - 1 ] x 2', 19),
    S('Verse', '[1 - 2 - 6, - 4 - 5 - 1 ] x 4', 19),
    S('Pre-chorus', '[ 5 - 4 - 1, 5 - 6 - 5 ] x 1', 20, name='Pre-Chorus'),
    S('Chorus', '[ 1 - 2 - 3 - 4 - 6 - 5 - 1 - 4 ] x 2', 20),
    S('Interlude', '1 - 2 - 6, - 4 - 5 - 1 → back to verse', 20),
    S('Bridge', '5 - 5# - 6 - 5 - 4', 20),
])], flags=['Written out twice in the PDF (pages 19–20 and page 28), identically.']),

song('Glorious God', [A('Busi', key='A', keyText='Key: A - Busi', musicians=['Busi'], sections=[
    S('Intro and Verse', '6 - 5 - 1, 4 - 5', 20),
    S('Chorus', '4 - 4 - 3 - 6 - 2 - 5 - 1', 20),
    S('Bride', '4 -6 - 5 - 1 - 1', 20, name='Bridge', flags=['Labelled "Bride" in the PDF; read as Bridge.']),
])]),

song('The Person of Sovereign Majesty', [
    A('Version 1 (page 20)', key='Bb', keyText='Key: Bb - Original / Key: A - Tawa', musicians=['Tawa'],
      keyOptions=[{'key': 'Bb', 'label': 'Original'}, {'key': 'A', 'label': 'Tawa'}], sections=[
        S('Intro', '1 - 7- 3 - 6 - 5 - 1 - 4 - 3\n2-5-3', 20),
        S('Verse', '[ 1 - 4 - 5 - 1 - 2 - 5 ] * 2\n[ 1 - (7maj) - 4 - (2maj) - 5 - 1 - 2 - 5 ] * 2', 20),
        S('Chorus', '1 - 7 - 3 - 6 - 5 - 4 - 1 - 5', 20),
        S('Holy Spirit', '1 - 7 - 3maj - 6 - 5min - 4 - 5', 20),
        S('The Greater One', '2 - 5 - 1', 20),
        S('Outro (The greater One)', '2 - 5 - 1 - 7,5,6,3,2 - 5 - 1', 20, name='Outro', cue='The greater One'),
    ]),
    A('Version 2 (page 23)', key='Bb', keyText='Key: Bb - Original / Key: A - Tawa', musicians=['Tawa'],
      keyOptions=[{'key': 'Bb', 'label': 'Original'}, {'key': 'A', 'label': 'Tawa'}], sections=[
        S('Intro', '1 - 7- 3 - 6 - 5 - 1 - 4 - 3\n2-5-3', 23),
        S('Verse', '[ 1 - 4 - 5 - 1 - 2,5 ] * 2', 23),
        S('Chorus', '1 - 3 - 7 - 6 - 5 - 1 - 4 - 3 - 5 - 1\n1736:54 5 2 5 6 32361', 23,
          prog='1 - 3 - 7 - 6 - 5 - 1 - 4 - 3 - 5 - 1', notes=['Second line as written in the PDF: 1736:54 5 2 5 6 32361'],
          flags=['Second line "1736:54 5 2 5 6 32361" is written without separators and can\'t be read reliably. Left as written.']),
        S('Bridge', '2 - 5 -1', 23),
    ]),
], aliases=['The Person of his Sovereign Majesty'],
   flags=['Appears twice: "The Person of Sovereign Majesty" (page 20) and "The Person of his Sovereign Majesty" (page 23), with different progressions.']),

song('Divinity', [
    A('Tawa', key='A', keyText='Key: A - Sis Tawa', musicians=['Tawa'], sections=[
        S('Intro', '1 - 3 - 4 - 5, 1 - 3 - 4', 21),
        S('Through it all', 'Verse:\nThrough it all: 1 - 4 - 1 - 4\n1-4-1-4', 21, name='Verse (Through it all)', cue='Through it all', kind='verse',
          prog='1 - 4 - 1 - 4\n1-4-1-4'),
        S('Lord your righteousness', '1 - 4 - 1 - 4 - 1 - 4 - 5', 21),
        S('Chorus', 'Chorus:\nThe true vine:\nThe one and only:\n4 - 1 - 4 - 1, 6 - 3 - 4 - 1\n4 - 5 - 6, 3 - 6\n4-5-4-5-4-5-1', 21,
          prog='4 - 1 - 4 - 1, 6 - 3 - 4 - 1\n4 - 5 - 6, 3 - 6\n4-5-4-5-4-5-1',
          notes=['Lyric cues "The true vine" and "The one and only" are written above the chords without their own progressions.']),
        S('Interlude', 'Intro → back to verse', 21, prog='→ back to verse', ref='Intro'),
    ]),
    A('Ab version (page 23)', key='Ab', keyText='Divinity Ab', sections=[
        S('Intro', '1, 5, 4, 5', 23),
        S('Verse', '1, 4, 1, 4\n1, 4, 1, 5', 23),
        S('Chorus', '4, 1, 4, 1 x2\n4, 5, 6, 3, 1\n4, 5, 4, 5, 4, 5, 1', 23),
    ]),
], flags=['Appears twice (page 20–21 in A for Tawa, page 23 in Ab) with different progressions.']),

song('Christ our Lord', [A('Lubone', key='A', keyText='Key A - Sis Lubone', musicians=['Lubone'], sections=[
    S('Intro', '4 - 6 - 5', 21),
    S('Verse 1', '4 - 7/1 - 7/1\n4-6-5\n4-1-5\n2-4-5', 21, flags=['"7/1" shown as a slash chord (7 over 1). Please confirm.']),
    S('Chorus', '4 - 1 - 5', 21),
    S('Verse 2', '[4 - 1 - 5]\n[2 - 4 - 5] x2', 21),
    S('Bridge', '4 - 1 - 5 - 3', 21),
])]),

song('No God Greater Than You', [A('Lubone', key='Ab', keyText='Key: Ab - Lubone', musicians=['Lubone'], sections=[
    S('Intro', '[ 4 - 2 - 1 - 5 ] x 2', 22),
    S('Verse', '[ 2 - 6 - 1 - 5 ] x 2', 22),
    S('Pre-Chorus', '[ 6 - 4 - 1, 4 - 6 - 5 ] x 2', 22),
    S('Chorus', '1 - 5 - 2 - 6 - 5 - 1 - 5 - 2,3,4,5 - 1', 22),
    S('Interlude', '1 - 5 - 2 - 6 - 5 - 1 - 5 - 2,3,4,5 - 1', 22),
    S('Almighty God', '1 - 5 - 2,3,4,5 - 1', 22),
])]),

song('There’s Nothing Impossible', [A('', key='Ab', keyText='Key: Ab', sections=[
    S('Intro', '6 - 5 - 4 x 2', 22),
    S('Verse', '6 - 4 - 1, 6 - 5 - 4\n6 - 4 - 1 - 4, 2 - 4 - 5', 22),
    S('Chorus', '1 - 4 - 6 - 5 - 4', 22),
    S('Interlude', '1 - 4', 22),
])], aliases=['Theres Nothing Impossible']),

song('You Sit Above the Cherubim', [A('Tawa', key='G', keyText='Key: G - Tawa', musicians=['Tawa'], sections=[
    S('Intro', '5 - 4 - 3 - 6 - 2 - 5 - 4 - 3 - 2 - 5 - 1', 24),
    S('Verse', '4 - 3 - 2 - ( 5,1 ) - 4 - 3 - 2 - 5\n4-3 -6-2-5-1-4-5-2-5-1\n4 - 3 - 2 - (5,1) - 4 - 3 - 6 - 2 - 5', 24),
    S('Most', '4 - 3 - 6 - 2 - 5 - 1 - 4... - 5 - 6 - 2 - 5 - 1', 24),
    S('Hallelujah', '[4 - (2maj) - 5 - 6 - 2 - 5 - 1 ] x 4', 24),
    S('Holy', '4 - (2maj) - 5 - 6 - 2 - 4 - 3 - 6 - 2 - 5… - 4', 24),
    S('Interlude', '5 - 4 - 5', 24),
    S('Bridge', '4 - 5 - 4 - 2 - 5', 24),
    S('You’re', '1 - 4 - 5', 24),
    S('Hallelujah', '[4 - (2maj) - 5 - 6 - 2 - 5 - 1 ] x 4', 24),
    S('Holy', '4 - (2maj) - 5 - 6 - 2 - 4 - 3 - 6 - 2 - 5… - 4', 24),
    S('Outro', '3 - 6 - 2… - 5 - 1', 24),
])]),

song('More Than Life', [A('Lubone', key='C', keyText='Key: C → Db - SIs Lubone', musicians=['Lubone'],
    mod=['Key is written as "C → Db". The PDF does not say exactly where the change happens; "(5#)" after "For you" may be the pivot.'],
    flags=['Key change C → Db has no clear position in the PDF.'], sections=[
    S('Intro', '1 - 4 -1 - 4', 24),
    S('Verse', '4min - 1 - 5 - 4 - 2 - 4 - 5', 24),
    S('For you', '[3 - 6 - 2 - 5 - 3 - 6 - 2 - 5 ] x 2 - 1 (5#)', 25),
    S('Chorus', '[3 - 6 - 2 - 5] x 4 … 1', 25),
    S('Demons flee', '4min - 1 (7,3) - 4 - 2… - 5', 25),
    S('Pre-chours', '[3 - 6 - 2 - 5] x 3 …1 - 5 (Your name is great Oh Lord)', 25, name='Pre-Chorus',
      flags=['Labelled "Pre-chours" in the PDF; read as Pre-Chorus. It appears after the chorus.']),
    S('Bridge', '3 - 6 - 2 - 5\nx2\n(We bless you Lord)\n4 - 5 - 3 - 6 - 2 - 5 - 6, 2 - 5 - 1\n(For your love, and your grace)', 25),
    S('Outro', '[4 - 5 - 6… - 2 - 5 - 1 ] x 2\n(Your glory is seen)', 25),
])]),

song('I Praise Your Name', [A('', keyText='Key:', flags=[NO_KEY], sections=[
    S('Intro', '6 - 4 - 6 – 4, 2 - 4', 25),
    S('Verse', '4 - 5 - 4 - 5 - 4 - 5, 6 - 5', 25),
    S('Pre-chorus', '2 - 4 -6 - 5', 25, name='Pre-Chorus'),
    S('Chorus', '4 - 1 - 5 ] x 3\n,4 - 6 - 5', 25),
    S('Interlude', 'Chorus → to verse', 25, prog='→ to verse', ref='Chorus'),
])]),

song('Lover of My Soul', [A('', keyText='Key:', flags=[NO_KEY], sections=[
    S('Intro', '[2 - 3 - 4 - 5 - 1 ] x2', 25),
    S('Verse', '3, 4 - 5 - 1 - 7 - 6 - (6# - 4) - 2 - 5 - 1\n4 - 5 - 1 - 7 - 6 - (6# - 4) - 2 - 5 - 1', 25),
    S('Chorus', '4 - 5 - 1 - 7 - 6 - 4 - 3 - 2 - 5 - 1', 25),
    S('Interlude', '4 - 5 - 1 - 7 - 6 - 4 - 3 - 2 - 5 - 1\n[back to verse, chorus]', 25),
    S('Outro', '2 - 5 - 1 - 7 - 6 - 2 - 5 - 1 - 7 - 6 - 2 - 5 - 6 - 3 - 2 - 5……. 2 - 3 - 4 - 5 - 1', 26),
])], aliases=['Lover of my soul']),

song('I Am Satisfied in Your Love', [A('', key='G', keyText='Key: G', sections=[
    S('Intro', '1, 4,', 26),
    S('Verse', '1, 5, 4, 5', 26),
    S('Chorus', '5, 4, 1, 6, 5', 26),
    S('Bridge', '1, 4, 6, 5', 26),
    S('Breakdown', '(Breakdown - 1,7,2,1', 26, prog='1,7,2,1',
      flags=['Written "(Breakdown - 1,7,2,1" with no closing bracket. "1,7,2,1" may be four separate chords rather than one bar.']),
    S('Substitution', '6 3 4 2 5 1', 26, notes=['Substitution progression (where it replaces is not stated).']),
])]),

song('Forever You Are God', [A('', keyText='Key:', flags=[NO_KEY, 'Only the chorus is written.'], sections=[
    S('Chorus', '2 - 4 - 1', 26),
])]),

song('Everlasting King', [A('', key='A', keyText='Key - A', sections=[
    S('Intro', '1 - 4 - 1 - 4', 26),
    S('Verse', '1 - 4 - 1 - 4, 1 - 4 - 1 - 2 - 3', 26),
    S('We give', '6 - 3 - 2 - 4 - 5', 26),
    S('Chorus', '[6 - 3 - 4 - 5] * 2\n4-5-1', 27),
    S('Bridge', '2 - 3 - 4 - 5', 27),
])]),

song('The Greatest Lord', [A('Tawa', key='Eb', keyText='LW Key - Eb / Key: Eb ( Tawa)', musicians=['Tawa'],
    keyOptions=[{'key': 'Eb', 'label': 'LW key'}, {'key': 'Eb', 'label': 'Tawa'}],
    perf=['Intro: bass comes in on the 3rd time.'], sections=[
    S('Intro', '[4 - 6 - 5] x 4 - bass comes in on the 3rd', 27, prog='[4 - 6 - 5] x 4', notes=['Bass comes in on the 3rd.']),
    S('Verse', '[4 - 1 - 5, 4 - 6 - 5\n2 - 4 - 5, 2 - 4 - 5 ] x 2', 27),
    S('Chorus', '4 - 1 - 6 - 5, 4 - 1 - 5\n4 - 1 - 6 - 5, 4 - 5 - 1', 27),
    S('Interlude', '[4 - 6 - 5] x 2 → BACK TO VERSE', 27),
    S('Bridge', '[2 - 4 - 6 - 5] x 4 → TO CHORUS', 27),
    S('ML', '2,2,3,2,1,6 (YOU ARE THE GREATEST LORD)', 27, name='Melody line', melody='2,2,3,2,1,6', cue='YOU ARE THE GREATEST LORD'),
])]),

song('Holy God', [A('Busi', key='Eb', keyText='LW Key - E / Key: Eb - Busi', musicians=['Busi'],
    keyOptions=[{'key': 'E', 'label': 'LW key'}, {'key': 'Eb', 'label': 'Busi'}], sections=[
    S('Intro', '1 - 2 - - 6 - 5', 27),
    S('Verse', '1 - 2 - 6 - 5\n4 - 5 - 6 - 3, 2 - 5 -1 (holy god)', 28),
    S('Bridge', '1 - 2 - 6 - 5', 28),
    S('Melody back to chorus', '1,2,3,4,5 4,3,1', 28, name='Melody back to chorus', melody='1,2,3,4,5 4,3,1',
      flags=['A melody back to the chorus is given, but no chorus progression is written.']),
])]),

song('Grateful (woman version)', [A('', key=None, keyText='Lw Key: C# / Key:', keyOptions=[{'key': 'C#', 'label': 'LW key'}],
    flags=['Only the LW key (C#) is given; the band key is blank.'], sections=[
    S('Intro', 'Intro 1 4 6 5 4\nIntro: Verse', 28, prog='1 4 6 5 4',
      flags=['Followed by "Intro: Verse", which may mean the intro uses the verse progression.']),
    S('Verse', '(6 - 7) 1 - 2 - 3 - 4 - 5 - 5 - 1 (bass comes in with choir)', 28, prog='(6 - 7) 1 - 2 - 3 - 4 - 5 - 5 - 1',
      notes=['Bass comes in with choir.']),
    S('Chorus', '6 - 4 - 1, 6 - 4 - 5, 6 - 4 - 3 - 6 - 6# - 5 - 1', 28),
    S('Bridge', '6# - 4 - 3/1, 6# - 4 - 1 → chorus', 28, flags=['"3/1" shown as a slash chord (3 over 1).']),
])], aliases=['Grateful']),

song('Almighty God', [
    A('Version 1 (page 29)', key=None, keyText='LW: C #', keyOptions=[{'key': 'C#', 'label': 'LW key'}], sections=[
        S('Intro', '4 - 1 - 4 - 1 - 4 ,5--6 - 2 - 5 - 1', 29),
        S('Melody Line', '2,3,2,1,1 - (are the works of your hand)', 29, name='Melody line', melody='2,3,2,1,1', cue='are the works of your hand'),
        S('Verse', '1 - 4 - 6 - 5 - 1 - 4 - 6 - 5 - 1', 29),
        S('Chorus', '4 - 1 - 4 - 1 - 4 ,5--6 - 2 - 5 - 1', 29),
        S('Interlude', 'Intro', 29, prog='', ref='Intro'),
        S('Bridge', '1 - 1 - 1 - 1 (4) x 4\n6 - 4 - 6 - 4…', 29),
        S('ML', '1 - 7 - 6 - 5 ] x 2\n222333666', 29, name='Melody line (bridge)', melody='1 - 7 - 6 - 5 ] x 2\n222333666',
          flags=['"222333666" is written as one run; likely melody notes 2 2 2 3 3 3 6 6 6.']),
        S('Outro', '2 - 5 - 6 - 4# - 2 - 5 - 1 (how magnificent)', 29, prog='2 - 5 - 6 - 4# - 2 - 5 - 1', cue='how magnificent'),
    ]),
    A('Version 2 (page 33)', key=None, keyText='LW: C #', keyOptions=[{'key': 'C#', 'label': 'LW key'}], sections=[
        S('Intro', '4 - 1 - 4 - 1 - 4 ,5--6 - 2 - 5 - 1', 33),
        S('Melody Line', '2,3,2,1,1 - (are the works of your hand)', 33, name='Melody line', melody='2,3,2,1,1', cue='are the works of your hand'),
        S('Verse', '1 - 4 - 6 - 5 - 1 - 4 - 6 - 5 - 1 - 4', 33),
        S('Chorus', '4 - 1 - 4 - 1 - 4 ,5--6 - 2 - 5 - 1', 33),
        S('Interlude', 'Intro', 33, prog='', ref='Intro'),
        S('Bridge', '1 - 1 - 1 - 1 (4) x 4\n6 - 4 - 6 - 4…', 33),
        S('ML', '1 - 7 - 6 - 5 ] x 2\n222333666', 33, name='Melody line (bridge)', melody='1 - 7 - 6 - 5 ] x 2\n222333666'),
        S('Outro', '2 - 5 - 6 - 4# - 2 - 5 - 1 (how magnificent)', 33, prog='2 - 5 - 6 - 4# - 2 - 5 - 1', cue='how magnificent'),
    ]),
], flags=['Written twice (page 29 and page 33). The versions differ only in the verse, which ends "- 1 - 4" on page 33.']),

song('Great King of All', [A('', key='D', keyText='Key: D', sections=[
    S('Intro', '1 - 5 - 4 - 1] * 2', 30),
    S('Verse', '1 - 5 - 4 - 1', 30),
    S('Chorus', '5 - 4 - 1 - 6 - 4 - 5 - 4 - 1', 30),
    S('Bridge', '1 - 4 - 5 - 1', 30),
])]),

song('Lord Eternal', [A('Busi', key='E', keyText='Key: E - Busi', musicians=['Busi'],
    perf=['Pastor’s corrections are given for the intro and chorus.'], sections=[
    S('Intro', '6 - 5 - 4 x 2', 30),
    S('Pastor’s correction', '634', 30, name='Pastor’s correction (intro)', prog='6 - 3 - 4',
      notes=['Replaces the intro: written "634" in the PDF.'],
      flags=['Written "634" without separators; read as 6 - 3 - 4.']),
    S('Verse', '4 - 4 - 1 - 5, 2 - 4 - 1 - 5', 30),
    S('Chorus', '2 - 4 - 5, 2 - 4 - 5 - 4', 30),
    S('Pastor’s correction', '6,4,5,3,4,5,4', 30, name='Pastor’s correction (chorus)', prog='6 - 4 - 5 - 3 - 4 - 5 - 4',
      notes=['Replaces the chorus: written "6,4,5,3,4,5,4" in the PDF.']),
    S('Interlude', 'Intro', 30, prog='', ref='Intro'),
    S('Bride', '2 - 4 - 1 -5, 2 - 4 - 1 - 5 - 1 x 1 —> chorus', 30, name='Bridge', flags=['Labelled "Bride" in the PDF; read as Bridge.']),
])]),

song('I’m Grateful', [A('Tawa', key='G', keyText='Key: G - Tawa', musicians=['Tawa'], sections=[
    S('Intro', '[ 1 - 4 - 6 - 4 ] x 2', 30),
    S('Verse', '[ 1 - 4 - 6 - 5 - 4 ] x 4', 30),
    S('Chorus', '[ 1 - 4 - 6 - 4 ] x 2', 30),
    S('Interlude', '[ 1 - 4 - 6 - 4 ] x 2 → back to verse', 30),
    S('Bridge', '1 - 4 - 6 - 4', 30),
])], aliases=['Im grateful']),

song('I Sing', [A('Tawa', key='G', keyText='Key: G (Tawa)', musicians=['Tawa'], sections=[
    S('Intro', '4 - 6 - 5, 4 - 4 - 5 (Melody for leys: 1523', 31, prog='4 - 6 - 5, 4 - 4 - 5',
      notes=['Melody for leys: 1523'], flags=['"Melody for leys: 1523" — "leys" may be "keys". Melody 1 5 2 3.']),
    S('Verse', '[ 4 - 1 - 4 - 1, 4 - 5 - 6,\n4 - 5 - 6, 4 - 5 - 1 ] x 3', 31),
    S('Chorus', '4 - 6 - 7 - 1 - 4 - 5 - 1', 31),
    S('You deserve it all', '4 - 5 - 6, 4 - 5 - 1', 31),
])]),

song('Omnipotent Father', [A('', key='A', keyText='Key: A', sections=[
    S('Intro', '4 - 6 - 5, 4 - 6 - 5\n4 - 5 - 6, 4 - 5 - 1', 31),
    S('Verse', '4 - 6 - 5, 4 - 6 - 5\n4 - 5 - 6, 4 - 5 - 1', 31),
    S('Chorus', '4.. - 1, 4 - 6 - 5\n4 - 1, 4 - 6 - 5', 31),
    S('Bridge', '6 - 4 - 1 - 5', 31),
    S('TO You', '4 - 5 - 6, 4 - 5 - 1', 31),
])]),

# ---- "Today's Songs" heading, page 31 onward ----
song('The Grace', [A('', key='A', keyText='Key: A', sections=[
    S('The grace of our Lord', '1 - 5 - 6 - 4 - 6 - 4 - 1 - 5', 31),
    S('Now and forever', '4 - 6 - 5 - 4, 6 - 5 - 4', 31),
    S('Surely', '4-1-5-4-5', 32),
    S('And we dwell', '4 - 6 - 5 - 4 - 5 - 4 - 5 - 4 - 5 - 6 - 7 - 1', 32),
    S('Outro', '4 - 5 - 4 - 5 - 6 - 7 - 1', 32),
])], collection='Today’s Songs', aliases=['The grace']),

song('One Name', [A('Busi', key='G', keyText='Key:G - Sis Busi', musicians=['Busi'], sections=[
    S('Intro', '1 - 6 - 5 - 4', 32),
    S('Verse', '1 - 6 - 5 - 4', 32),
    S('Chorus', '1 - 5 - 4 - 5 - 1', 32),
    S('Interlude', '1 - 5 - 4 - 5 - 1\nx 1 → to verse', 32),
    S('Awesome Wonder', '4 - 1', 32),
])], collection='Today’s Songs'),

song('Unending Praise', [A('', key='C', keyText='Key: C', sections=[
    S('Intro', 'Chorus', 32, prog='', ref='Chorus'),
    S('Verse', '1 - 4 - 1 - 5, 1 - 4 - 6 - 4 - 5', 32),
    S('Chorus', '1 - 4 - 6 - 5 - 3 - 4 - 6,5', 32),
    S('Interlude', 'Chorus', 32, prog='', ref='Chorus'),
])], collection='Today’s Songs'),

song('Unto You We Lift Our Voice', [A('', key='A', keyText='LW Key: F# / Key: A',
    keyOptions=[{'key': 'F#', 'label': 'LW key'}, {'key': 'A', 'label': 'Band'}], sections=[
    S('Intro', '4 - 5 - 1, 4 - 5 - 1', 32),
    S('Melody', '6,5,4 - 7,1,2 - 1', 32, name='Melody line', melody='6,5,4 - 7,1,2 - 1'),
    S('Verse', '1 - 4 - 5 - 1 - 6 - 4 - 4,5 - 6,5\n1 - 4 - 5 - 6 - 3 - 4 - 4,5 - 6,5', 33),
    S('Prechorus', '1/6 - 4 - 5 - 1 (1 on the first one, 6 for the remaining)', 33, name='Pre-Chorus',
      prog='1~6 - 4 - 5 - 1', notes=['1 on the first one, 6 for the remaining.'],
      flags=['"1/6" here means 1 the first time and 6 after that (stated in the PDF), so it is shown as "1 or 6", not a slash chord.']),
    S('Chorus', '4 - 5 - 6 - 7 - 3\n4 - 5 - 2 - 5 - 1', 33),
    S('Bridge', '4 - 5 - 6 - 3', 33),
])], collection='Today’s Songs'),

song('King Of All The Nations', [A('', keyText='', flags=[NO_KEY, 'Incomplete in the PDF: only a lyric cue and an empty "Intro:" are written.'], sections=[
    S('Intro', '(We sing to your lord)\nIntro:', 33, prog='', cue='We sing to your lord'),
])], collection='Today’s Songs'),
]

ACCOMPANIMENT = [
    {'title': 'Prayer', 'kind': 'prayer', 'page': 34, 'key': None,
     'progression': '4 - 5 - 6, - 5 - 2 - 3 - 6,- 4', 'source': 'Prayer: The Spirit of Prayer || Sunday Service || 30th August 2026\n4 - 5 - 6, - 5 - 2 - 3 - 6,- 4',
     'reference': {'label': 'The Spirit of Prayer || Sunday Service || 30th August 2026', 'url': 'https://www.youtube.com/watch?v=adIH19t9RcU&t=3475s'},
     'notes': [], 'flags': ['No key is given.']},
    {'title': 'Offering', 'kind': 'offering', 'page': 34, 'key': None,
     'progression': '4 - 5 - 6,\n2 - 3 - 6', 'source': 'Offering: Worship Night | 14 Oct 2026 | CE Waterfront\n4 - 5 - 6,\n2 - 3 - 6 (only in certain moments)',
     'reference': {'label': 'Worship Night | 14 Oct 2026 | CE Waterfront', 'url': 'https://www.youtube.com/watch?v=O1nPM_ggqdY&t=3245s'},
     'notes': ['2 - 3 - 6 only in certain moments.'], 'flags': ['No key is given.']},
    {'title': 'Worship Night recording (21 Oct 2026)', 'kind': 'reference', 'page': 34, 'key': None,
     'progression': '', 'source': 'Worship Night | 21 Oct 2026 | CE Waterfront',
     'reference': {'label': 'Worship Night | 21 Oct 2026 | CE Waterfront', 'url': 'https://www.youtube.com/watch?v=uIwmTnM3wnk'},
     'notes': [], 'flags': ['A recording link with no progression or label. It may belong with the Offering entry.']},
]
