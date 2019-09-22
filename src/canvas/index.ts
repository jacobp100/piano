import { combineLatest, animationFrameScheduler } from "rxjs";
import { throttleTime } from "rxjs/operators";
import time from "../time";
import theme, { Theme } from "../theme";
import { file, track } from "../file";
import ctx from "./context";
import keyScale from "./keyScale";
import layout, { Layout } from "./layout";
import background from "./background";
import score from "./score";
import keyboard, { data as keyboardData } from "./keyboard";
import minimap from "./minimap";
import markings from "./markings";

const ui = (ctx: CanvasRenderingContext2D, layout: Layout, theme: Theme) => {
  const { markings, keyboard, minimap } = layout;
  ctx.fillStyle = theme.normalKey;
  ctx.fillRect(markings.x, keyboard.y, markings.width, keyboard.height);
  ctx.fillRect(minimap.x, keyboard.y, minimap.width, keyboard.height);
};

combineLatest(
  ctx,
  layout,
  theme,
  file,
  track,
  time,
  keyScale,
  keyboardData,
  (ctx, layout, theme, file, track, time, keyScale, keyboardData) => {
    return { ctx, layout, theme, file, track, time, keyScale, keyboardData };
  }
)
  .pipe(
    throttleTime(0, animationFrameScheduler, { leading: true, trailing: true })
  )
  .subscribe(
    ({ ctx, layout, theme, file, track, time, keyScale, keyboardData }) => {
      background(ctx, layout, theme, keyScale);
      minimap(ctx, layout, theme, file, track, time);
      markings(ctx, layout, theme, file, time);
      score(ctx, layout, theme, track, time, keyScale);
      keyboard(ctx, layout, theme, track, time, keyScale, keyboardData);
      ui(ctx, layout, theme);
    }
  );
