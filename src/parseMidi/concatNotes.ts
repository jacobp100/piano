import { Note } from "./types";

export default (notes: Note[][]): Note[] | null => {
  switch (notes.length) {
    case 0:
      return null;
    case 1:
      return notes[0];
    default:
      return ([] as Note[])
        .concat(...notes)
        .sort((a, b) => a.startTime - b.startTime);
  }
};
