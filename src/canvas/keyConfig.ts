export const NORMAL = 0;
export const ACCIDENTAL = 1;

export type Key = {
  noteNumber: number;
  x: number;
  width: number;
  height: number;
  type: 0 | 1;
};

export const accidentalHeight = 35;

const baseKeys = [
  { x: 0, width: 12, height: 60, type: NORMAL },
  { x: 10, width: 8, height: 35, type: ACCIDENTAL },
  { x: 12, width: 12, height: 60, type: NORMAL },
  { x: 24, width: 12, height: 60, type: NORMAL },
  { x: 31, width: 8, height: 35, type: ACCIDENTAL },
  { x: 36, width: 12, height: 60, type: NORMAL },
  { x: 45, width: 8, height: 35, type: ACCIDENTAL },
  { x: 48, width: 12, height: 60, type: NORMAL },
  { x: 60, width: 12, height: 60, type: NORMAL },
  { x: 66, width: 8, height: 35, type: ACCIDENTAL },
  { x: 72, width: 12, height: 60, type: NORMAL },
  { x: 80, width: 8, height: 35, type: ACCIDENTAL }
];

const keyWidth = 84;
export const firstNoteNumber = 21;
const lastNoteNumber = 87 + 21;

export const keys: Key[] = Array.from(new Array(88), (_, i) => {
  const { x, width, height, type } = baseKeys[i % 12];
  return {
    noteNumber: i + firstNoteNumber,
    x: x + keyWidth * ((i / 12) | 0),
    width,
    height,
    type: type as 0 | 1
  };
});

export const keyForNoteNumber = (note: number): Key | undefined =>
  note >= firstNoteNumber && note <= lastNoteNumber
    ? keys[note - firstNoteNumber]
    : undefined;

export const normalKeys = keys.filter(note => note.type === NORMAL);
export const accidentalKeys = keys.filter(note => note.type === ACCIDENTAL);

const lastKey = keys[keys.length - 1];
export const keyboardWidth = lastKey.x + lastKey.width;
export const keyboardHeight = 60;
