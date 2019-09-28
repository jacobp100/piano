import { parseMidiFile } from "jasmid.ts";
import parseTimingChanges from "./parseTimingChanges";
import parseEvents, { TrackType } from "./parseEvents";
import parseTrack from "./parseTrack";
import parseMetronome from "./parseMetronome";
import concatNotes from "./concatNotes";
import { File, Track } from "./types";

export default (buffer: ArrayBuffer): File => {
  const midi = parseMidiFile(buffer);
  const { timingChanges, finalTimingChange } = parseTimingChanges(
    midi.header,
    midi.tracks[0]
  );

  const percussionNotesArray = [];
  const tracks: Track[] = [];

  for (let i = 0; i < midi.tracks.length; i += 1) {
    const { name, type, notes } = parseEvents(midi.tracks[i], timingChanges);
    switch (type) {
      case TrackType.Instrumental:
        const track = parseTrack(notes, name || `Track ${i}`);
        tracks.push(track);
        break;
      case TrackType.Percussion:
        percussionNotesArray.push(notes);
        break;
      case TrackType.Unknown:
      case TrackType.Invalid:
        break;
    }
  }

  const percussionNotes = concatNotes(percussionNotesArray);
  const percussionTrack =
    percussionNotes !== null ? parseTrack(percussionNotes, "Percussion") : null;

  const duration = tracks.reduce((currentMax, track) => {
    const { frames } = track;
    const duration = frames[frames.length - 1].endTime;
    return Math.max(currentMax, duration);
  }, 0);

  finalTimingChange.endTime = duration;

  const metronome = parseMetronome(timingChanges);

  return { timingChanges, metronome, tracks, percussionTrack, duration };
};
