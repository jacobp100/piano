import {
  BehaviorSubject,
  from,
  interval,
  animationFrameScheduler,
  combineLatest,
  of
} from "rxjs";
import {
  filter,
  map,
  withLatestFrom,
  mapTo,
  switchMap,
  scan,
  switchAll
} from "rxjs/operators";
import { file } from "../file";
import time, { timeSubject, userTime } from "../time";
import playbackRate from "../playbackRate";
import { velocity } from "../operators";
import { piano, percusson } from "../player";
import notes from "./notes";
import metronome from "./metronome";

export let playingSubject = new BehaviorSubject(false);

export const togglePlaying = () => {
  playingSubject.next(!playingSubject.value);
};

file.pipe(mapTo(false)).subscribe(playingSubject);

playingSubject
  .pipe(
    switchMap(playing => (playing ? userTime : of())),
    mapTo(false)
  )
  .subscribe(playingSubject);

playingSubject
  .pipe(
    withLatestFrom(time, (playing, startTime) => {
      if (!playing) return from([]);

      const startSystemTime = Date.now();
      return interval(0, animationFrameScheduler).pipe(
        withLatestFrom(playbackRate, (_, playbackRate) => playbackRate),
        scan(
          ({ lastSystemTime, lastPlaybackTime }, playbackRate) => {
            const systemTime = Date.now();
            const systemTimeIncrement = systemTime - lastSystemTime;
            const time =
              (lastPlaybackTime + systemTimeIncrement * playbackRate) | 0;
            return { lastSystemTime: systemTime, lastPlaybackTime: time };
          },
          { lastSystemTime: startSystemTime, lastPlaybackTime: startTime }
        )
      );
    }),
    switchAll(),
    map(accum => accum.lastPlaybackTime)
  )
  .subscribe(timeSubject);

const userTimeFiltered = combineLatest(
  userTime,
  velocity(userTime),
  (userTime, velocity) =>
    velocity > -2 && velocity < 5 ? userTime : Number.MAX_SAFE_INTEGER
).pipe(filter(time => time !== Number.MAX_SAFE_INTEGER));

const playTime = playingSubject.pipe(
  switchMap(playing => (playing ? time : userTimeFiltered))
);

playTime.pipe(notes()).subscribe(piano);

playTime.pipe(metronome()).subscribe(percusson);
