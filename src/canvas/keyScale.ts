import { Key, NORMAL, keys, firstNoteNumber, keyboardWidth } from "./keyConfig";

export type KeyScale = Uint32Array;

export const create = (width: number): KeyScale => {
  const horizontalScale = (width + 1) / keyboardWidth;
  const scale = new Uint32Array(keys.length * 2);
  let currentNormalKeyX1 = 0;
  keys.forEach((key, index) => {
    let x;
    let width;
    if (key.type === NORMAL) {
      x = currentNormalKeyX1;
      currentNormalKeyX1 = ((key.x + key.width) * horizontalScale) | 0;
      width = (currentNormalKeyX1 - x - 1) | 0;
    } else {
      x = (key.x * horizontalScale) | 0;
      width = (key.width * horizontalScale) | 0;
    }
    scale[index << 1] = x;
    scale[(index << 1) + 1] = width;
  });
  return scale;
};

export const x = (key: Key, scale: KeyScale) => {
  const index = key.noteNumber - firstNoteNumber;
  return scale[index << 1];
};

export const width = (key: Key, scale: KeyScale) => {
  const index = key.noteNumber - firstNoteNumber;
  return scale[(index << 1) + 1];
};
