import { fromEvent, Observable, merge } from "rxjs";
import {
  withLatestFrom,
  filter,
  takeUntil,
  startWith,
  map,
  switchAll
} from "rxjs/operators";
import { canvasElement, scrollableElement } from "../dom";
import { Viewbox } from "./layout";

export type PanEvent = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Position = { x: number; y: number };

const mousePosition = (e: MouseEvent) => ({
  x: e.clientX,
  y: e.clientY
});

const touchPosition = (e: TouchEvent) => {
  const firstTouch = e.touches[0];
  return { x: firstTouch.clientX, y: firstTouch.clientY };
};

const eventHandler = <T extends Event>(
  startEvents: Observable<T>,
  moveEvents: Observable<T>,
  endEvents: Observable<T>,
  mapFn: (t: T) => Position,
  viewbox: Observable<Viewbox>
) => {
  const panEvents = startEvents.pipe(
    withLatestFrom(viewbox, (e, viewbox) => {
      const p = mapFn(e);
      const x = p.x - viewbox.x;
      const y = p.y - viewbox.y;
      const inside =
        x >= 0 && y >= 0 && x <= viewbox.width && y <= viewbox.height;
      return (inside ? e : null) as T;
    }),
    filter(event => event !== null),
    map(e => {
      return moveEvents.pipe(
        takeUntil(endEvents),
        startWith(e)
      );
    })
  );

  panEvents.pipe(switchAll()).subscribe(e => {
    e.preventDefault();
  });

  return panEvents.pipe(
    withLatestFrom(viewbox, (panEvents, viewbox) => {
      return panEvents.pipe(
        map(e => {
          const p = mapFn(e);
          return {
            x: p.x - viewbox.x,
            y: p.y - viewbox.y,
            width: viewbox.width,
            height: viewbox.height
          } as PanEvent;
        })
      );
    })
  );
};

const notPassive = { passive: false };
export default () => (viewbox: Observable<Viewbox>) => {
  const touchEvents = eventHandler(
    fromEvent<TouchEvent>(scrollableElement, "touchstart", notPassive),
    fromEvent<TouchEvent>(scrollableElement, "touchmove", notPassive),
    merge(
      fromEvent<TouchEvent>(scrollableElement, "touchend", notPassive),
      fromEvent<TouchEvent>(scrollableElement, "touchcancel", notPassive)
    ),
    touchPosition,
    viewbox
  );

  if (process.env.REACT_APP_APP_BUILD) {
    return touchEvents;
  } else {
    const mouseEvents = eventHandler(
      fromEvent<MouseEvent>(canvasElement, "mousedown"),
      fromEvent<MouseEvent>(document, "mousemove"),
      fromEvent<MouseEvent>(document, "mouseup"),
      mousePosition,
      viewbox
    );

    return merge(mouseEvents, touchEvents);
  }
};
