import {
  BehaviorSubject,
  from,
  interval,
  animationFrameScheduler,
  combineLatest,
  merge,
  fromEvent
} from "rxjs";
import { filter, map, withLatestFrom, mapTo, switchMap } from "rxjs/operators";
import time, { timeSubject, userTime } from "../time";
import { velocity } from "../operators";
import { player } from "./player";
import notes from "./notes";

export let playingSubject = new BehaviorSubject(false);

export const togglePlaying = () => {
  playingSubject.next(!playingSubject.value);
};

merge(userTime, fromEvent(document, "touchmove", { passive: true }))
  .pipe(mapTo(false))
  .subscribe(playingSubject);

const playbackTime = playingSubject.pipe(
  withLatestFrom(time),
  switchMap(([playing, startTime]) => {
    const t0 = Date.now();
    return playing
      ? interval(0, animationFrameScheduler).pipe(
          map(() => startTime + (Date.now() - t0))
        )
      : from([]);
  })
);

playbackTime.subscribe(timeSubject);

playbackTime.pipe(notes(true)).subscribe(player);

combineLatest(userTime, velocity(userTime), (userTime, velocity) =>
  velocity > -2 && velocity < 5 ? userTime : Number.MAX_SAFE_INTEGER
)
  .pipe(
    filter(time => time !== Number.MAX_SAFE_INTEGER),
    notes()
  )
  .subscribe(player);
