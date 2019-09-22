import fs from "fs";
import path from "path";
import { parseMidi } from "midi-file";
import parseNotes from "../parseNotes";
import parseTimingChanges from "../parseTimingChanges";
import processEvents from "../processEvents";
import processFrames from "../processFrames";

const midi = parseMidi(
  fs.readFileSync(path.join(__dirname, "../../../public/test.mid"))
);
const { timingChanges } = parseTimingChanges(midi.header, midi.tracks[0]);
const notes = parseNotes(midi.tracks[1], timingChanges);
const events = processEvents(notes);
const frames = processFrames(events);

it("Should only contain notes within the frame", () => {
  frames.forEach(frame => {
    frame.notes.forEach(note => {
      const overlap =
        note.startTime <= frame.endTime && frame.startTime <= note.endTime;
      expect(overlap).toBe(true);
    });
  });
});
