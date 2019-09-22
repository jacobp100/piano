import { MidiTrack, parseMidi } from "midi-file";
import parseTimingChanges from "./parseTimingChanges";
import parseNotes from "./parseNotes";
import processEvents from "./processEvents";
import processFrames from "./processFrames";
import { TimingChange, File, Track } from "./types";

const parseTrack = (timingChanges: TimingChange, track: MidiTrack): Track => {
  const notes = parseNotes(track, timingChanges);
  const events = processEvents(notes);
  const frames = processFrames(events);

  let minOctave = 6;
  let maxOctave = 0;
  notes.forEach(note => {
    const octave = (note.noteNumber / 12) | 0;
    minOctave = Math.min(minOctave, octave);
    maxOctave = Math.max(maxOctave, octave);
  });

  return { notes, frames, minOctave, maxOctave };
};

export default (buffer: Uint8Array): File => {
  const midi = parseMidi(buffer as any);
  const { timingChanges, finalTimingChange } = parseTimingChanges(
    midi.header,
    midi.tracks[0]
  );
  const tracks = Array.from(new Array(midi.tracks.length - 1), (_, i) =>
    parseTrack(timingChanges, midi.tracks[i + 1])
  );

  const duration = tracks.reduce((currentMax, track) => {
    const { frames } = track;
    const duration = frames[frames.length - 1].endTime;
    return Math.max(currentMax, duration);
  }, 0);

  finalTimingChange.endTime = duration;

  return { timingChanges, tracks, duration };
};
