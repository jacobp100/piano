import { withLatestFrom, map, switchAll, filter } from "rxjs/operators";
import { File, Track } from "../parseMidi/types";
import { Theme } from "../theme";
import { setUserTime } from "../time";
import { file } from "../file";
import { verticalScale } from "../config";
import layout, { Layout } from "./layout";
import { NORMAL, keys, keyForNoteNumber } from "./keyConfig";
import panHandler from "./panHandler";

layout
  .pipe(
    map(layout => layout.minimap!),
    filter(viewbox => viewbox !== null),
    panHandler(),
    switchAll(),
    withLatestFrom(file, ({ y, height }, file) => {
      if (file === null) return 0;
      const clampedRatio = Math.max(Math.min(y / height, 1), 0);
      return (1 - clampedRatio) * file.duration;
    })
  )
  .subscribe(setUserTime);

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

  if (viewbox === null) return;

  const endTime = startTime + viewbox.height / verticalScale;
  const yScale = viewbox.height / (file.duration + endTime - startTime);

  let lastType = -1;
  track.notes.forEach(note => {
    const { startTime, endTime, noteNumber } = note;
    const duration = endTime - startTime;

    const key = keyForNoteNumber(noteNumber);
    if (key === undefined) return;

    const { type } = key;
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
