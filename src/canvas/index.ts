import { combineLatest, animationFrameScheduler } from "rxjs";
import { debounceTime } from "rxjs/operators";
import time from "../time";
import theme, { Theme } from "../theme";
import { file, track } from "../file";
import ctx from "./context";
import layout, { Layout } from "./layout";
import background from "./background";
import score from "./score";
import keyboard, { data as keyboardData } from "./keyboard";
import minimap from "./minimap";
import markings from "./markings";

const ui = (ctx: CanvasRenderingContext2D, layout: Layout, theme: Theme) => {
  const { markings, keyboard, minimap } = layout;

  if (markings === null || minimap === null) return;

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
  keyboardData,
  (ctx, layout, theme, file, track, time, keyboardData) => {
    return { ctx, layout, theme, file, track, time, keyboardData };
  }
)
  .pipe(debounceTime(0, animationFrameScheduler))
  .subscribe(({ ctx, layout, theme, file, track, time, keyboardData }) => {
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, layout.width, layout.height);

    if (file === null || track === null) return;

    background(ctx, layout, theme, file, time);
    minimap(ctx, layout, theme, file, track, time);
    markings(ctx, layout, theme, file, time);
    score(ctx, layout, theme, track, time);
    keyboard(ctx, layout, theme, track, time, keyboardData);
    ui(ctx, layout, theme);
  });
