import {
  BehaviorSubject,
  from,
  interval,
  animationFrameScheduler,
  combineLatest
} from "rxjs";
import {
  filter,
  map,
  withLatestFrom,
  mapTo,
  switchMap,
  scan
} from "rxjs/operators";
import time, { timeSubject, userTime } from "../time";
import playbackRate from "../playbackRate";
import { velocity } from "../operators";
import { player } from "./player";
import notes from "./notes";

export let playingSubject = new BehaviorSubject(false);

export const togglePlaying = () => {
  playingSubject.next(!playingSubject.value);
};

userTime.pipe(mapTo(false)).subscribe(playingSubject);

const nanTime = Number.MIN_SAFE_INTEGER;
const playbackTime = playingSubject.pipe(
  withLatestFrom(time, (playing, time) => (playing ? time : nanTime)),
  switchMap(startTime => {
    if (startTime === nanTime) return from([]);

    return interval(0, animationFrameScheduler).pipe(
      withLatestFrom(playbackRate, (_, playbackRate) => playbackRate),
      scan(
        ({ lastSystemTime, lastPlaybackTime }, playbackRate) => {
          const systemTime = Date.now();
          const systemTimeIncrement =
            lastSystemTime !== nanTime ? systemTime - lastSystemTime : 0;
          const time =
            (lastPlaybackTime + systemTimeIncrement * playbackRate) | 0;
          return { lastSystemTime: systemTime, lastPlaybackTime: time };
        },
        { lastSystemTime: nanTime, lastPlaybackTime: startTime }
      )
    );
  }),
  map(accum => accum.lastPlaybackTime)
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
