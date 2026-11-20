from lib_build import S, A

NO_KEY = 'No key is written for this song in the PDF.'

def song(title, arrangements, collection='Song List', aliases=None, flags=None):
    d = {'title': title, 'collection': collection, 'arrangements': arrangements}
    if aliases: d['aliases'] = aliases
    if flags: d['flags'] = flags
    return d

SONGS = [
song('Strong and Mighty God', [A('', key=None, keyText='Key -', flags=[NO_KEY], sections=[
    S('Intro', '1 - 4 - 1 - 4 - 1 - 2 - 5 (3 - 4 - 5)', 1),
    S('Verse', '1 - 4 - 1 - 4 - 1 - 2 - 5\n1 - 4 - 5 - 6 - 2 - 5 - 1', 1),
    S('Chorus', '1 - 4 - 5\n1 - 4 - 5 - 1\n4 - 5 - 2 - 6\n6 - 5 - 1', 1),
    S('Bridge', '1 - 5 - 1 - 6 - 1 - 5 - 2', 1),
])]),

song('You are God', [A('', key='E', keyText='Key: E', sections=[
    S('Intro', '5 - 4 - 2 - 6 - 5', 1),
    S('Verse', '1 - 5 - 4 - 5\n1 - 5 - 4 - 5', 1),
    S('Prechorus', '5 - 4 - 2 - 6 - 5', 1, name='Pre-Chorus'),
    S('Chorus', '1 - 4 - 2 - 6 - 5] * 3\n2 - 5 - 6, 2 - 5 - 1', 1,
      flags=['Closing bracket "]" has no matching opening bracket in the PDF; read as the first line repeated 3 times.']),
    S('Interlude', '5 - 4 - 2 - 6 - 5', 1),
    S('Bridge', '5 - 4 - 1\n2 - 4 - 6 - 5\n5 - 4 - 1\n2 - 6 - 5', 1, flags=['Bridge continues onto page 2.']),
])]),

song('The Reason', [A('', keyText='Key:', flags=[NO_KEY], sections=[
    S('Intro', '6 - 7 - 1 - 4 - 1 - 5', 2),
    S('Verse', '6 - 4 - 1 - 5 - 6 - 5 - 4', 2),
    S('Chorus', '1 - 4 - 6 - 5 - 4\n1 - 4 - 6 - 5', 2),
    S('Interlude', '1 - 4 - 5 - 6', 2),
])]),

song('Beyond Description', [A('', keyText='Key:', sections=[
    S('Intro', '7 - 6 - 4 - 2 - 1', 2),
    S('Prechorus', '4 - 6 - 5', 2, name='Pre-Chorus'),
    S('Chorus', '1 - 4 - 6 - 5 - 3 - 4 - 2 - 5 - 2 - 5 - 1', 2),
    S('Bridge', '2 - 4 - 1 - 5', 2),
], flags=[NO_KEY, 'No verse is written for this song.'])]),

song('Monarch of the Universe', [A('', key='A', keyText='Key: A', sections=[
    S('Intro', '4 - 1 - 5 - 6 - 2 - 5 - 1] * 2, 2 - 5 - 1', 3,
      flags=['Closing bracket "]" has no matching opening bracket in the PDF.']),
    S('Verse', '1 - 2 - 1 - 4 - 5 - 4 - 1 - 5 - 6\n2 - 5 - 6 - 2 - 5 - 1', 3),
    S('Chorus', '4 - 1 - 5 - 6 - 4 - 1 - 6 - 2 - 5 - 1', 3),
    S('Bridge', '4 - 1 - 5 - 6 - 4 - 1 - 5 - 1', 3),
])], aliases=['Monarch of the universe']),

song("I'm One With You", [A('', keyText='Key:', flags=[NO_KEY], sections=[
    S('Intro', '1 - 6 - 4 - 3 - 6# - 4', 3),
    S('Verse', '1 - 6 - 4 - 3 - 2 - 5', 3),
    S('Chorus', '1 - 6 - 4 - 3 - 2 - 5', 3),
    S('Bridge', '2 - 6 - 4 - 5', 3),
])], aliases=['Im one with you']),

song('Your Word is Truth and Life', [A('', keyText='', flags=[NO_KEY, 'Only one progression is written, with no section label.'], sections=[
    S('Progression', '1 - 5 - 2 - 6 - 5', 3),
])]),

song('Lord Saviour Divine', [A('', key='C#', keyText='Key: C#', sections=[
    S('Intro', '6 - 4 - 1', 3),
    S('Verse', '6 - 4 - 1] *3\n6 - 4 - 1 - 5', 3),
    S('PreChorus', '4 - 5 - 1 - 7 - 6…. 4 - 5 - 1 - 6 - 4 - 1\n4 - 5 - 1 - 7 - 6…. 4 - 5 - 1', 3, name='Pre-Chorus'),
    S('Chorus', '4 - 5 - 1 - 7 - 6…. 4 - 5 - 1', 4),
    S('Bridge', '1 - 4 - 1 - 5 - 4 - 1 - 4 - 2 - 5 - 1', 4),
])]),

song('Spirit of Truth', [A('', keyText='Key:', flags=[NO_KEY], sections=[
    S('Intro', '2 - 4', 4),
    S('Verse', '1 - 4 - 1 - 4', 4),
    S('Prechorus', '6 - 5 - 2 - 4 - 6 - 7 - 1', 4, name='Pre-Chorus'),
    S('Chorus', '1 - 6 - 4 - 5 - 1 - 6 - 2 - 5 - 1 - 6', 4),
    S('Interlude', 'Interlude = Intro', 4, prog='', ref='Intro'),
])]),

song('Precious Word of Truth', [
    A('Version 1 (page 4)', keyText='', flags=[NO_KEY], sections=[
        S('Intro', '1 - 6 - 4 - 5', 4),
        S('Verse', '1 - 3 - 4 - 5 - 1', 4),
        S('Chorus', '4 - 6 - 5 - 4 - 6 - 5', 4),
        S('Interlude', '1 - 4', 4),
        S('Bridge', '7 - 6 - 4 - 7 - 6 - 4', 4),
    ]),
    A('Lubone', key='C', keyText='Key: C (Lubone)', musicians=['Lubone'], sections=[
        S('Intro', '1 - 6 - 4 - 5', 6),
        S('Verse', '1 - 6 - 4 - 5\nx2', 6),
        S('Chorus', '[4 - 6 - 5] x 4\n——> 4', 7),
        S('Interlude', '4 - 1 - 4 - 1', 7),
        S('Bridge', '5 - 6 - 4', 7),
    ]),
], aliases=['Precious Word Of Truth'], flags=['Appears twice in the PDF (pages 4 and 6–7) with different progressions; kept as two arrangements.']),

song('You are Great', [A('', key='Ab', keyText='Key: Ab', sections=[
    S('Intro', '1 - 4 - 2 - 5', 5),
    S('Verse', '1 - 4 - 6 - 5', 5),
    S('Chorus', '1 - 4 - 2 - 5', 5),
    S('Bridge', '1 - 4 - 2 - 5', 5),
    S('Your love', '1 - 5 - 4 - 5', 5),
])]),

song('You are my Life', [A('', keyText='', flags=[NO_KEY], sections=[
    S('Intro', '4 - 5 - 1] * 3\n2 - 5 - 1', 5),
    S('Verse', '4 - 1 - 6 - 5 - 4 - 3 - 6 - 2 - 5 - 1', 5),
    S('Chorus', '4 - 1 - 6 - 5 - 4 - 3 - 6 - 2 - 5 - 1', 5),
    S('Interlude', 'Interlude - Intro', 5, prog='', ref='Intro'),
    S('Outro', '2 - 5 - 6', 5),
])]),

song('Righteousness and Salvation', [A('', key='C#', keyText='Key: C#', sections=[
    S('Intro', '1 - 4 - 6 - 5 - 4', 5),
    S('Verse', '1 - 4 - 6 - 5', 5),
    S('Chorus', '1 - 4 - 6 - 5\n1 - 4 - 6 - 5 - 1', 5),
    S('Interlude', '1 - 4 - 6 - 5 - 4\n1 - 4 - 6 - 5 - 4 - 1', 5),
    S('Bridge', '1 - 4 - 6 - 5', 6),
    S('Lord Jesus you reign', '1 - 4 - 6 - 1', 6),
])]),

song('Lord I Bless Your Name', [A('Lubone', key='F', keyText='Key: F (Lubone)', musicians=['Lubone'], sections=[
    S('Intro', '4 - 5- 3- 6 - 2 - 5 - 1', 6),
    S('Verse', '1 - 2,3 - 4 - 3 - 6 -5 - 6,7\nX2', 6),
    S('Chorus', '4 - 5- 3- 6 - 2 - 5 - 1', 6),
    S('Interlude', '(same as chorus)', 6, prog='', ref='Chorus'),
])], aliases=['Lord I bless Your Name']),

song('We Give You Thanks', [A('', key='G', keyText='Key: G - Ab',
    mod=['Key is written as "G - Ab". This looks like a key change from G to Ab, but the PDF does not say where it happens.'],
    flags=['Key change G → Ab has no position in the PDF.'], sections=[
    S('Intro', '1 - 4 - 6 - 5 - 6 - 5', 6),
    S('Verse', '1 - 4 - 6 - 5\n1 - 4 - 6 - 5 - 6 - 5\n2 - 465', 6,
      prog='1 - 4 - 6 - 5\n1 - 4 - 6 - 5 - 6 - 5\n2 - 465',
      flags=['"465" is written without separators; it may mean 4 - 6 - 5. Left as written.']),
])], aliases=['We give you thanks']),

song('The Creator That Was Never Created', [A('Tawa', key='Ab', keyText='Key: Ab (Tawa)', musicians=['Tawa'], sections=[
    S('Intro', '1 - 7,6 - 2 - 5 - 1', 7),
    S('Verse', '[1 - 6 - 4 - 5 - 1 - 6,5\n1 - 6 - 4 - 5 - 1] x2', 7),
    S('Chorus', '[4 - 5 - 6 - 2 - 5 - 1\n4 - 5 - 6 - 5 - 1]x2\n→ BACK TO VERSE', 7),
    S('Bride', '[1 - 4 - 5 - 1] x\n[1 - 2,3 - 4 - 2 - 5 → 3 - 6 - 2 - 5 - 1\n1 - 2,3 - 4 - 2 - 5 - 1 ] x 2\n→ TO CHORUS (END)9', 7, name='Bridge',
      flags=['Labelled "Bride" in the PDF; read as Bridge.', 'First line ends "x" with no repeat count.', 'Stray "9" after "(END)".']),
])]),

song('Everything You Do Is Good', [A('Lubone', key='D', keyText='Key: D - Lubone', musicians=['Lubone'], sections=[
    S('Intro', '7 - 1 - 4', 7),
    S('Verse', '1 - 2 - 3 - 4 - 5 - 5/4 - 1', 7, flags=['"5/4" shown as a slash chord (5 over 4 in the bass). Confirm this is the intended meaning.']),
    S('Chorus', '5 - 4 - 1, 5 - 4 - 1', 7),
])]),

song('Beautiful', [A('', key='Eb', keyText='Key: Eb - Busi / Key: E - Tawa', musicians=['Busi', 'Tawa'],
    keyOptions=[{'key': 'Eb', 'label': 'Busi'}, {'key': 'E', 'label': 'Tawa'}],
    perf=['Two keys are listed for one progression: Eb (Busi) and E (Tawa).'], sections=[
    S('Intro', '(4- 6- 5) x2', 8),
    S('Solo (Verse)', '4 - 6 - 5, 4 - 5\n2 - 5, 2 - 5', 8),
    S('Verse', '4-1-6-5, 4-5\n2-4-5, 2-4-5', 8),
    S('Pre-Chorus', '4-1-6-5, 4-1-5', 8),
    S('Chorus', '2-4-6-5 x3\n2-4-5', 8),
    S('Bridge', '2-4-6-5', 8),
])]),

song('Magnificent You Are', [A('Tawa', key='G', keyText='Key: G - Tawa', musicians=['Tawa'],
    mod=['Bridge ends on 5# and the final chorus moves up to G#/Ab.'], sections=[
    S('Intro', '1 - 6 - 4 - 2 - 5\n1 - 6 - 2 - 3 - 4 - 5', 8),
    S('Verse', '1 - 6 - 4 - 5', 8),
    S('Pre-Chorus', '[ 4 - 1 - 6 - 5 ] x2', 8),
    S('Chorus', '1 - 5 - 2 - 4 - 5\n1 - 5 - 2 - 4 - 5 - 1', 8),
    S('Interlude', '1 - 6 - 4 - 2 - 5\n1 - 6 - 2 - 3 - 4 - 5', 8),
    S('Bridge', '5 - 6 - 4 - 5\n5 - 6 - 4 - 5 - 5#', 8),
    S('Chorus (G#/Ab)', 'Chorus: (G#/Ab): 1 - 5 - 2 - 4 - 5\n1 - 5 - 2 - 4 - 5 - 1', 9, name='Chorus (key change)',
      prog='1 - 5 - 2 - 4 - 5\n1 - 5 - 2 - 4 - 5 - 1', key='Ab', notes=['Played in G#/Ab, a semitone up.']),
])], aliases=['Magnificent you Are']),

song('Oh Wise God', [A('Lubone', key='F#', keyText='Key: F# - Lubone', musicians=['Lubone'], sections=[
    S('Intro', '5 - 4 - 1', 9),
    S('Verse', '5 - 4 - 1', 9),
    S('Chorus', '5 - 4 - 1', 9),
    S('Bride', '1 - 4 - 4 - 1 - 6 - 4 - 4 - 1', 9, name='Bridge', flags=['Labelled "Bride" in the PDF; read as Bridge.']),
])]),

song('Thine Is The Kingdom', [A('Busi', key='E', keyText='Key: E - Busi', musicians=['Busi'], sections=[
    S('Intro', '6 - 5 - 3 - 6 x 2', 9),
    S('Verse', '4 - 2 - 3 - 6', 9),
    S('Chorus', '4 - 5 - 3 - 6', 9),
    S('Interlude', '(intro)', 9, prog='', ref='Intro'),
    S('Intro', '4171', 9, name='Intro (second block)', prog='4171',
      flags=['A second Intro/Verse block follows, written without separators ("4171"). It may be 4 - 1 - 7 - 1. Left as written.']),
    S('Verse', '14651\n2564#', 10, name='Verse (second block)', prog='14651\n2564#',
      flags=['Written without separators ("14651", "2564#"). May be 1 - 4 - 6 - 5 - 1 and 2 - 5 - 6 - 4#. Left as written.']),
])]),

song('Dearest Shepherd', [A('Lubone', key='C', keyText='Key: C - Lubone', musicians=['Lubone'], sections=[
    S('Intro', '1 - 3 - 4 - 5 - 6\n6 - 3 - 4 - 5 - 1', 10),
    S('Verse', '1 - 3 - 4 - 5 - 6, 3 - 4 - 4 - 5 - 1', 10),
    S('Chorus', '6/1 - 3 - 4 - 5 - 1\n6 - 3 - 4 - 5 - 1', 10,
      flags=['"6/1" could be a slash chord (6 over 1) or "6 or 1". Shown as a slash chord; please confirm.']),
    S('Master', '1 - 4 - 4 - 5 - 6, 3 - 4 - 4 - 5 - 1', 10),
    S('Interlude', 'Intro', 10, prog='', ref='Intro'),
    S("We’re not afraid", '1 - 4 - 4 - 5 - 6, 3 - 4 - 4 - 5 - 6 - 7 - 1', 10),
    S('Everyday', '4 - 4 - 5 - 6 - 3 - 4 - 4 - 5 - 1', 10),
    S('Chorus', 'Chorus:\nAll we’ve known: 4 - 4 - 5 - 6 - 3 - 4 - 4 - 5 - 1 hi', 10, name='Chorus (All we’ve known)',
      cue='All we’ve known', prog='4 - 4 - 5 - 6 - 3 - 4 - 4 - 5 - 1 hi', flags=['Stray word "hi" at the end of the line.']),
])]),

song('King Of Kings', [A('', key='G', keyText='Key: G', sections=[
    S('Intro', '4 - 2 - 1 - 6 - 5', 10),
    S('Verse', '[4 - 2 - 1 - 6 - 5 ] x 6', 10),
    S('Chorus', '4 - 5 - 1, 6 - 4 - 5\n3 - 4 - 5 - 6 - 2 - 5 - 1', 10),
    S('Interlude', '4 - 2 - 1 - 6 - 5 → back to verse', 10),
])]),

song('Dateless Love', [A('', key='Ab', keyText='Key: Ab', sections=[
    S('Intro', '1, 7, 6, 5, 4, 3, 2, 5', 11),
    S('Verse', '4, 3, 2, b5-5\n4, 3-6, 2, b5-5', 11),
    S('Chorus', '4, 3-6, 2, 1-4m, 1-4m', 11),
    S('Bridge', '4, 5, 6, 7\n4, 5, 6, 7, 1, 4', 11),
])]),

song('My Alabaster Box', [A('Lubone', key='Ab', keyText='Key: Ab - Lubone', musicians=['Lubone'], sections=[
    S('Intro', '6 - 3 - 2 - 6 - 5', 11),
    S('Verse', '[1 - 3 - 4 - 5] x 2', 11),
    S('Chorus', '[ 6 - 3 - 2 - 5 - 6 - 3\n6 - 3 - 2 - 5 - 1 ]x2', 11),
    S('Interlude', '6 - 3 - 2 - 4 - 6 - 3 - 6 - 3 - 2 - 5 - 1', 11),
    S('Verse 2', '[1 - 3 - 4 - 5] x 2', 11),
    S('Chorus', '[ 6 - 3 - 2 - 5 - 6 - 3\n6 - 3 - 2 - 5 - 1 ]x2', 12),
    S('Bridge', '[6 - 3 - 2 - 5, 6 - 3 - 4 - 5 ] x 3', 12),
    S('Thank you', '6 - 3 - 4 - 5, 6 - 3 - 4 - 5 - 1', 12),
    S('Outro', '2 - 5 - 1', 12),
])]),

song('Sovereign Lord You Are', [A('Lubone', key='D', keyText='Key: D - Lubone', musicians=['Lubone'], sections=[
    S('Intro', '1 - 5 - 6# - 4', 12),
    S('Verse', '1 - 4 - 1 - 4 - 5 - 6 - 4', 12),
    S('Chorus', '1 - 6 - 4 - 3 - 2 - 5\n1 - 6 - 4 - 5 - 1', 12),
    S('Interlude', 'Chorus', 12, prog='', ref='Chorus'),
    S('Bridge', 'Bridge:Version:1.0 1 - 6 – 2 – 4, 1 – 6 – 2 – 5', 12, prog='1 - 6 – 2 – 4, 1 – 6 – 2 – 5',
      flags=['Text "Version:1.0" appears before the bridge progression; it looks like a paste error and is not shown in the progression.']),
])]),

song('The Splendour of Your Majesty', [A('', key='A', keyText='Key: A', flags=['Only one progression is written, with no section label.'], sections=[
    S('Progression', '2 - 4 - 1 - 5', 12),
])]),

song('The Fullness of God', [A('', keyText='', flags=[NO_KEY], sections=[
    S('Intro', '5 - 4 - 5 - 4', 13),
    S('Verse', '1 - 5 - 4 - 5', 13),
    S('Pre-chorus', '4 - 5 - 1 - 5', 13, name='Pre-Chorus'),
    S('Chorus', '[1 - 4 - 5] x2\n6 - 3 - 2 - 5 - 1', 13),
])]),

song('Freely', [A('', keyText='', flags=[NO_KEY], sections=[
    S('Intro', '6 - 4 - 1 - 5', 13),
    S('Verse', '6 - 4 - 1 - 5\n6 - 2 - 4 - 5', 13),
    S('Pre - chorus', '6 - 2 - 4 - 5', 13, name='Pre-Chorus'),
    S('Chorus', '6 - 2 - 4 - 5', 13),
])]),

song('Your Dominion is for Eternity', [A('Tawa', key='E', keyText='(E) Sis Tawa', musicians=['Tawa'], sections=[
    S('Intro', '6m 5 4', 14),
    S('Verse', '6m 5 4\n6m 5 6\n2m 1 5\n♭7 6m 5', 14),
    S('Chorus', '1 2m 4 6m 5\n1 2m 4 5', 14),
    S('Interlude', '6m 5 4', 14),
    S('Bridge', '4 5 1/3\n6 5 4 3', 14),
])]),
]
