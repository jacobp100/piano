import { from, Observable } from "rxjs";
import { scan, flatMap, withLatestFrom, map } from "rxjs/operators";
import { Track, Frame, Note } from "../parseMidi/types";
import { frameForTime } from "../activeFrame";
import { track } from "../file";

type NotesAccum = {
  lastFrame: Frame | undefined;
  lastTrack: Track | null;
  lastTime: number;
  notes: Note[];
};

export default (backcheck = false) => (o: Observable<number>) =>
  o.pipe(
    withLatestFrom(track, (time, track) => ({ time, track })),
    scan(
      ({ lastFrame, lastTrack, lastTime }: NotesAccum, { time, track }) => {
        const frame = frameForTime(time, track);
        let nextNotes: Note[];
        if (frame === undefined || lastTrack !== track) {
          // We could use `window` when the track changes, but this is easier
          nextNotes = [];
        } else if (lastFrame === undefined) {
          nextNotes = frame.notes;
        } else {
          const lastNotes = lastFrame.notes;
          nextNotes = frame.notes.filter(note => !lastNotes.includes(note));

          if (backcheck && time - lastTime < 50) {
            // Add all notes from frames between last and current
            // Uses branch above to avoid nextNotes.includes check for current frame
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
        return {
          lastFrame: frame,
          lastTrack: track,
          lastTime: time,
          notes: nextNotes
        };
      },
      { lastFrame: undefined, lastTrack: null, lastTime: 0, notes: [] }
    ),
    flatMap(accum => from(accum.notes)),
    map(note => note.noteNumber)
  );
