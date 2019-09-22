import { withLatestFrom, map, switchAll } from "rxjs/operators";
import { File, Track } from "../parseMidi/types";
import { Theme } from "../theme";
import { setTime } from "../time";
import { file } from "../file";
import { verticalScale } from "../config";
import layout, { Layout } from "./layout";
import { NORMAL, keys, keyForNoteNumber } from "./keyConfig";
import panHandler from "./panHandler";

layout
  .pipe(
    map(layout => layout.minimap),
    panHandler(),
    switchAll(),
    withLatestFrom(file, ({ y, height }, { duration }) => {
      const clampedRatio = Math.max(Math.min(y / height, 1), 0);
      return (1 - clampedRatio) * duration;
    })
  )
  .subscribe(setTime);

const note0Index = keys[0].noteNumber;

export default (
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  theme: Theme,
  file: File,
  track: Track,
  startTime: number
) => {
  const viewbox = layout.minimap;
  const endTime = startTime + viewbox.height / verticalScale;
  const yScale = viewbox.height / (file.duration + endTime - startTime);

  let lastType = -1;
  track.notes.forEach(note => {
    const { startTime, endTime, noteNumber } = note;
    const duration = endTime - startTime;
    const { type } = keyForNoteNumber(noteNumber);
    if (type !== lastType) {
      // Saves the browser from re-parsing the same hex string (see score.ts)
      lastType = type;
      ctx.fillStyle = type === NORMAL ? theme.normalNote : theme.accidentalNote;
    }
    ctx.fillRect(
      viewbox.x + noteNumber - note0Index,
      (viewbox.y + viewbox.height - endTime * yScale) | 0,
      1,
      Math.max((duration * yScale) | 0, 1)
    );
  });

  ctx.fillStyle = "rgba(128, 128, 128, 0.2)";
  ctx.fillRect(
    viewbox.x,
    (viewbox.y + viewbox.height - endTime * yScale) | 0,
    viewbox.width,
    Math.max(((endTime - startTime) * yScale) | 0, 1)
  );
};