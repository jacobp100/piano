import {
  map,
  filter,
  distinctUntilChanged,
  switchAll,
  endWith,
  startWith,
  withLatestFrom
} from "rxjs/operators";
import { Track } from "../parseMidi/types";
import { Theme } from "../theme";
import layout, { Layout } from "./layout";
import {
  NORMAL,
  ACCIDENTAL,
  Key,
  normalKeys,
  accidentalKeys,
  keyForNoteNumber
} from "./keyConfig";
import keyScale, { KeyScale, x as keyX, width as keyWidth } from "./keyScale";
import panHandler, { PanEvent } from "./panHandler";
import { player } from "../playback/player";

const panHandlerKeys = layout.pipe(
  map(layout => layout.keyboard),
  panHandler(),
  withLatestFrom(keyScale, (o, keyScale) =>
    o.pipe(
      map<PanEvent, number>(({ x, y }) => {
        const hasKey = (key: Key) => {
          const kX = keyX(key, keyScale);
          const kWidth = keyWidth(key, keyScale);
          return x >= kX && x <= kX + kWidth && y <= key.height;
        };

        let key = accidentalKeys.find(hasKey);
        if (key === undefined) key = normalKeys.find(hasKey);

        return key !== undefined ? key.noteNumber : -1;
      }),
      distinctUntilChanged(),
      startWith(-1),
      endWith(-1)
    )
  ),
  switchAll(),
  startWith(-1)
);

panHandlerKeys.pipe(filter(key => key !== -1)).subscribe(player);

export const data = panHandlerKeys;

const getActiveKeys = (track: Track, startTime: number, data: number) => {
  const activeKeys: number[] = [];

  track.notes.forEach(note => {
    if (note.startTime <= startTime && note.endTime > startTime) {
      activeKeys.push(note.noteNumber);
    }
  });

  if (data !== -1) {
    activeKeys.push(data);
  }

  return activeKeys;
};

export default (
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  theme: Theme,
  track: Track,
  startTime: number,
  keyScale: KeyScale,
  data: number
) => {
  const { pixelWidth } = layout;
  const viewbox = layout.keyboard;
  const activeKeys = getActiveKeys(track, startTime, data);

  ctx.fillStyle = theme.background;
  ctx.fillRect(
    viewbox.x,
    viewbox.y - pixelWidth,
    viewbox.width,
    viewbox.height + pixelWidth
  );

  const renderKey = (key: Key) => {
    ctx.fillRect(
      viewbox.x + keyX(key, keyScale),
      viewbox.y,
      keyWidth(key, keyScale),
      key.height
    );
  };

  ctx.fillStyle = theme.normalKey;
  normalKeys.forEach(renderKey);

  if (accidentalKeys !== undefined) {
    ctx.fillStyle = theme.normalNoteFocus;
    activeKeys.forEach(noteNumber => {
      const key = keyForNoteNumber(noteNumber);
      if (key.type === NORMAL) renderKey(key);
    });
  }

  ctx.fillStyle = theme.accidentalKey;
  accidentalKeys.forEach(renderKey);

  if (accidentalKeys !== undefined) {
    ctx.fillStyle = theme.accidentalNoteFocus;
    activeKeys.forEach(noteNumber => {
      const key = keyForNoteNumber(noteNumber);
      if (key.type === ACCIDENTAL) renderKey(key);
    });
  }
};
