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
import { Note } from "../parseMidi/types";
import { file, track } from "../file";
import time, { timeSubject, userTime } from "../time";
import { piano, percusson } from "../player";
import notes from "./notes";
import metronome from "./metronome";
import { velocity } from "./util";

export const playingSubject = new BehaviorSubject(false);
export const playbackRate = new BehaviorSubject(1);
export const enablePercussionTrack = new BehaviorSubject(true);

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

track
  .pipe(
    switchMap(track =>
      track !== null ? playTime.pipe(notes(track)) : from([])
    )
  )
  .subscribe(piano);

combineLatest(file, enablePercussionTrack, (file, enablePercussionTrack) =>
  enablePercussionTrack && file !== null ? file.percussionTrack : null
)
  .pipe(
    switchMap(percussionTrack => {
      const percussionNotes: any =
        percussionTrack !== null ? notes(percussionTrack) : metronome();
      return playTime.pipe<Note>(percussionNotes);
    })
  )
  .subscribe(percusson);
