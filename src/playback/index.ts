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
import time, { setTime, userTime } from "../time";
import { createInstrument, piano } from "../player";
import notes from "./notes";
import metronome from "./metronome";
import { velocity } from "./util";

export const playing = new BehaviorSubject(false);
export const playbackRate = new BehaviorSubject(1);

export const metronomeVolume = new BehaviorSubject(1);
export const metronomeUsesPercussionTrack = new BehaviorSubject(true);
const percussion = createInstrument("percussion", metronomeVolume);

export const togglePlaying = () => {
  playing.next(!playing.value);
};

file.pipe(mapTo(false)).subscribe(playing);

playing
  .pipe(
    switchMap(playing => (playing ? userTime : of())),
    mapTo(false)
  )
  .subscribe(playing);

playing
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
  .subscribe(setTime);

const userTimeFiltered = combineLatest(
  userTime,
  velocity(userTime),
  (userTime, velocity) =>
    velocity > -2 && velocity < 5 ? userTime : Number.MAX_SAFE_INTEGER
).pipe(filter(time => time !== Number.MAX_SAFE_INTEGER));

const playTime = playing.pipe(
  switchMap(playing => (playing ? time : userTimeFiltered))
);

track
  .pipe(
    switchMap(track =>
      track !== null ? playTime.pipe(notes(track)) : from([])
    )
  )
  .subscribe(piano);

combineLatest(
  file,
  metronomeUsesPercussionTrack,
  (file, enablePercussionTrack) =>
    enablePercussionTrack && file !== null ? file.percussionTrack : null
)
  .pipe(
    switchMap(percussionTrack => {
      const percussionNotes: any =
        percussionTrack !== null ? notes(percussionTrack) : metronome();
      return playTime.pipe<Note>(percussionNotes);
    })
  )
  .subscribe(percussion);
