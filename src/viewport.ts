import { BehaviorSubject, fromEvent } from "rxjs";
import { map } from "rxjs/operators";

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

const viewport = new BehaviorSubject(getViewport());
export default viewport;

fromEvent(window, "resize")
  .pipe(map(getViewport))
  .subscribe(viewport);
