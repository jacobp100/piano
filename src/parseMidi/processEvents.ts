import { Note } from "./types";

export type Event = {
  time: number;
  startNotes: Note[];
  next: Event | null;
};

const createNoteEvent = (time: number): Event => ({
  time,
  startNotes: [],
  next: null
});

const insertTime = (startEvent: Event, time: number) => {
  let currentEvent = startEvent;
  while (currentEvent.time !== time) {
    if (process.env.NODE_ENV === "development" && currentEvent.time > time) {
      // We assume you always add a time at or after startEvent.time
      throw new Error("Logic error");
    }

    const nextEvent = currentEvent.next;
    if (nextEvent === null) {
      const newEvent = createNoteEvent(time);
      currentEvent.next = newEvent;
      return newEvent;
    } else if (nextEvent.time > time) {
      const newEvent = createNoteEvent(time);
      newEvent.next = nextEvent;
      currentEvent.next = newEvent;
      return newEvent;
    } else {
      currentEvent = nextEvent;
    }
  }
  return currentEvent;
};

export default (notes: Note[]): Event => {
  const events = createNoteEvent(0);

  let currentNoteEvent = events;
  notes.forEach(note => {
    currentNoteEvent = insertTime(currentNoteEvent, note.startTime);
    currentNoteEvent.startNotes.push(note);
    insertTime(currentNoteEvent, note.endTime);
  });

  return events;
};
