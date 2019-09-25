import { from, Observable } from "rxjs";
import { scan, flatMap, switchMap } from "rxjs/operators";
import { Frame, Note, Track } from "../parseMidi/types";
import { frameForTime } from "../activeFrame";
import { track } from "../file";

type NotesAccum = {
  lastFrame: Frame | undefined;
  lastTime: number;
  notes: Note[];
};

const defaultAccum: NotesAccum = {
  lastFrame: undefined,
  lastTime: 0,
  notes: []
};

const notesForTrack = (track: Track) =>
  scan(({ lastFrame, lastTime }: NotesAccum, time: number) => {
    const frame = frameForTime(time, track);

    let nextNotes: Note[];
    if (frame === undefined) {
      // We could use `window` when the track changes, but this is easier
      nextNotes = [];
    } else if (lastFrame === undefined) {
      nextNotes = frame.notes;
    } else {
      const lastNotes = lastFrame.notes;
      nextNotes = frame.notes.filter(note => !lastNotes.includes(note));

      if (time > lastTime && time - lastTime < 50) {
        /*
        When moving forward a short amount of time,
        Add all notes from frames between last and current to account for
        short frames

        Uses branch above to avoid nextNotes.includes check for current frame
        */
        for (let i = lastFrame.index; i < frame.index; i += 1) {
          const frame = track.frames[i];
          frame.notes.forEach(note => {
            if (!lastNotes.includes(note) && !nextNotes.includes(note)) {
              nextNotes.push(note);
            }
          });
        }
      }
    }

    return { lastFrame: frame, lastTime: time, notes: nextNotes };
  }, defaultAccum);

export default () => (o: Observable<number>) =>
  track.pipe(
    switchMap(track => {
      return track !== null ? o.pipe(notesForTrack(track)) : from([]);
    }),
    flatMap(accum => from(accum.notes))
  );
