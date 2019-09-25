import { MidiTrack } from "midi-file";
import { convertMidiTime } from "./parseTimingChanges";
import { TimingChange, Note } from "./types";

export default (track: MidiTrack, timingChanges: TimingChange): Note[] => {
  let midiTime = 0;

  let currentTimingChange = timingChanges;
  const getTime = () => {
    while (
      midiTime > currentTimingChange.endMidiTime &&
      currentTimingChange.next !== null
    ) {
      currentTimingChange = currentTimingChange.next;
    }

    return convertMidiTime(currentTimingChange, midiTime);
  };

  const notes: Note[] = [];
  const pendingNotes: Note[][] = Array.from(new Array(128), () => []);

  track.forEach(event => {
    midiTime += event.deltaTime;

    switch (event.type) {
      case "noteOn": {
        const startTime = getTime();
        const note = {
          index: notes.length,
          noteNumber: event.noteNumber,
          velocity: event.velocity,
          startTime,
          endTime: startTime
        };
        notes.push(note);
        pendingNotes[event.noteNumber].push(note);
        break;
      }
      case "noteOff": {
        const note = pendingNotes[event.noteNumber].shift()!;
        note.endTime = getTime();
        break;
      }
      default:
        break;
    }
  });

  return notes;
};
