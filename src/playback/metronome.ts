import { Observable, from } from "rxjs";
import {
  switchMap,
  scan,
  filter,
  distinctUntilChanged,
  map
} from "rxjs/operators";
import { Tick } from "../parseMidi/types";
import { file } from "../file";
import { orderedArraySearch, Order } from "../util";

const TickNormal = 32;
const TickEmphasized = 31;

const initialTimeWindow = 8;

export default () => (o: Observable<number>) =>
  file.pipe(
    switchMap(file => {
      if (file === null) return from([]);

      const { metronome } = file;
      return o.pipe(
        scan((currentTick: Tick, time) => {
          let nextTick: Tick | undefined;
          if (currentTick === undefined) {
            nextTick = orderedArraySearch(metronome, tick => {
              const tickTime = tick.time;
              if (tickTime > time + initialTimeWindow) {
                return Order.Before;
              } else if (tickTime < time - initialTimeWindow) {
                return Order.After;
              }
              return Order.Match;
            });
          } else if (currentTick.time > time) {
            nextTick = currentTick;
            let tickBefore =
              nextTick.index > 0 ? metronome[nextTick.index - 1] : null;
            while (tickBefore !== null && tickBefore.time > time) {
              nextTick = tickBefore;
              tickBefore =
                nextTick.index > 0 ? metronome[nextTick.index - 1] : null;
            }
          } else {
            nextTick = currentTick;
            let tickAfter =
              nextTick.index < metronome.length - 1
                ? metronome[nextTick.index + 1]
                : null;
            while (tickAfter !== null && tickAfter.time < time) {
              nextTick = tickAfter;
              tickAfter =
                nextTick.index < metronome.length - 1
                  ? metronome[nextTick.index + 1]
                  : null;
            }
          }
          return nextTick!;
        }, undefined!)
      );
    }),
    filter(tick => tick !== undefined),
    distinctUntilChanged(),
    map(tick => (tick.emphasized ? TickEmphasized : TickNormal))
  );
