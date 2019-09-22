import { fromEvent } from "rxjs";
import { startWith, map } from "rxjs/operators";

export type Viewport = {
  width: number;
  height: number;
  pixelWidth: number;
  pixelRatio: number;
};

const getViewport = (): Viewport => ({
  width: window.innerWidth,
  height: window.innerHeight,
  pixelWidth: 1 / window.devicePixelRatio,
  pixelRatio: window.devicePixelRatio
});

export default fromEvent(window, "resize").pipe(
  map(getViewport),
  startWith(getViewport())
);
