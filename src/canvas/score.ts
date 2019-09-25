import { Track } from "../parseMidi/types";
import { Theme } from "../theme";
import { verticalScale } from "../config";
import { Layout } from "./layout";
import { NORMAL, keyForNoteNumber } from "./keyConfig";
import { x as keyX, width as keyWidth } from "./keyScale";

export default (
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  theme: Theme,
  track: Track,
  startTime: number
) => {
  const { score: viewbox, keyScale } = layout;
  const endTime = (startTime + viewbox.height / verticalScale) | 0;
  const { notes } = track;

  let lastType = -1;
  for (let i = 0; i < notes.length; i += 1) {
    const note = notes[i];

    if (note.endTime < startTime) continue;
    if (note.startTime > endTime) break;

    const key = keyForNoteNumber(note.noteNumber);
    const { type } = key;
    const noteY =
      (viewbox.height - (note.endTime - startTime) * verticalScale) | 0;
    const noteHeight = Math.max(
      ((note.endTime - note.startTime) * verticalScale) | 0,
      1
    );

    const isNormal = type === NORMAL;
    if (note.startTime <= startTime && note.endTime > startTime) {
      lastType = -1;
      ctx.fillStyle = isNormal
        ? theme.normalNoteFocus
        : theme.accidentalNoteFocus;
    } else if (type !== lastType) {
      // Optimisation to stop the browser repeatedly parsing the same hex string
      // In a simple piece, we can re-use the previously parsed colour ~15 times
      lastType = type;
      ctx.fillStyle = isNormal ? theme.normalNote : theme.accidentalNote;
    }

    ctx.fillRect(
      viewbox.x + keyX(key, keyScale),
      noteY,
      keyWidth(key, keyScale),
      noteHeight
    );
  }
};
