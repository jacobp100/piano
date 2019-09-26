import parseEvents from "../parseEvents";
import parseTimingChanges from "../parseTimingChanges";
import processEvents from "../processEvents";
import processFrames from "../processFrames";
import midi from "../__testUtil__/midiFile";

const { timingChanges } = parseTimingChanges(midi.header, midi.tracks[0]);
const { notes } = parseEvents(midi.tracks[1], timingChanges);
const { events, numEvents } = processEvents(notes);
const frames = processFrames(events, numEvents);

it("Should only contain notes within the frame", () => {
  frames.forEach(frame => {
    frame.notes.forEach(note => {
      const overlap =
        note.startTime <= frame.endTime && frame.startTime <= note.endTime;
      expect(overlap).toBe(true);
    });
  });
});
