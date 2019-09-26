import { MidiEvent } from "jasmid.ts";
import { convertMidiTime } from "./parseTimingChanges";
import { TimingChange, Note } from "./types";

export enum TrackType {
  Unknown,
  Instrumental,
  Percussion,
  Invalid
}

export default (
  track: MidiEvent[],
  timingChanges: TimingChange
): { name: string | undefined; type: TrackType; notes: Note[] } => {
  let name: string | undefined;
  let type = TrackType.Unknown;
  let midiTime = 0;
  let volume = 1;

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

    if (event.type === "meta" && event.subType === "trackName") {
      name = event.text;
    }

    if (event.type !== "midi") return;

    const eventType =
      event.channel === 9 ? TrackType.Percussion : TrackType.Instrumental;

    if (type === TrackType.Unknown) {
      type = eventType;
    } else if (type !== eventType) {
      type = TrackType.Invalid;
    }

    switch (event.subType) {
      case "controller":
        if (event.controllerType === 7) {
          volume = event.value / 100;
        }
        break;
      case "noteOn": {
        const startTime = getTime();
        const note = {
          index: notes.length,
          noteNumber: event.note,
          gain: (volume * event.velocity) / 128,
          startTime,
          endTime: startTime
        };
        notes.push(note);
        pendingNotes[event.note].push(note);
        break;
      }
      case "noteOff": {
        const note = pendingNotes[event.note].shift()!;
        note.endTime = getTime();
        break;
      }
      default:
        break;
    }
  });

  return { name, type, notes };
};
