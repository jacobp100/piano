import parseTimingChanges from "../parseTimingChanges";
import parseEvents from "../parseEvents";
import processEvents, { Event } from "../processEvents";
import midi from "../__testUtil__/midiFile";

const { timingChanges } = parseTimingChanges(midi.header, midi.tracks[0]);
const { notes } = parseEvents(midi.tracks[1], timingChanges);
const { events } = processEvents(notes);

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
