import fs from "fs";
import path from "path";
import { parseMidi } from "midi-file";
import parseTimingChanges from "../parseTimingChanges";
import parseNotes from "../parseNotes";
import processEvents, { Event } from "../processEvents";

const midi = parseMidi(
  fs.readFileSync(path.join(__dirname, "../../../public/test.mid"))
);
const { timingChanges } = parseTimingChanges(midi.header, midi.tracks[0]);
const notes = parseNotes(midi.tracks[1], timingChanges);
const events = processEvents(notes);

const flatMap = <T>(event: Event, fn: (event: Event) => T) => {
  const out = [];
  let current: Event | null = event;
  while (current != null) {
    out.push(fn(current));
    current = current.next;
  }
  return out;
};

const times = flatMap(events, event => event.time);

it("Should create events sequentially", () => {
  let current = events;
  while (current != null && current.next != null) {
    expect(current.time).toBeLessThan(current.next.time);
    current = current.next;
  }
});

it("Should contain all start times", () => {
  notes.forEach(note => {
    expect(times).toContain(note.startTime);
  });
});

it("Should contain all end times", () => {
  notes.forEach(note => {
    expect(times).toContain(note.endTime);
  });
});
