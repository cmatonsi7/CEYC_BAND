import { Key, degreeNote, keyPrefersFlats } from './keys';
import { noteToString, simplifyNote } from './notes';

/**
 * Render a melody written as scale degrees ("2,3,2,1,1" or "1 - 7 - 6 - 5")
 * as note names in a key. Anything that isn't a single degree 1–7 (with an
 * optional # or b) is left untouched, so runs like "222333666" stay as written.
 */
export function renderMelody(melody: string, key: Key | null): string {
  if (!key) return melody;
  return melody.replace(/(^|[^0-9A-Za-z#])([#b]?)([1-7])(#?)(?=$|[^0-9A-Za-z#])/g, (_m, pre: string, accPre: string, deg: string, accPost: string) => {
    const alter = (accPre === '#' ? 1 : accPre === 'b' ? -1 : 0) + (accPost ? 1 : 0);
    const note = simplifyNote(degreeNote(key, Number(deg), alter), keyPrefersFlats(key));
    return pre + noteToString(note);
  });
}
