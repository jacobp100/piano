import { Event } from "./processEvents";
import { Frame } from "./types";

const addNotesFromPreviousFrame = (
  currentFrame: Frame,
  previousFrame: Frame
) => {
  const { startTime, notes } = currentFrame;
  previousFrame.notes.forEach(note => {
    if (note.endTime > startTime) notes.push(note);
  });
};

export default (events: Event, numEvents: number): Frame[] => {
  let currentFrame: Frame | null = null;
  let event = events;

  // Use Array.from(new Array) to generate a packed array of fixed length
  // to save resizing the array while constructing
  const frames = Array.from(new Array(numEvents), (_, i) => {
    const previousFrame = currentFrame;
    currentFrame = {
      index: i,
      startTime: event.time,
      endTime: 0,
      notes: event.startNotes
    };

    if (previousFrame !== null) {
      previousFrame.endTime = event.time;
      addNotesFromPreviousFrame(currentFrame, previousFrame);
    }

    event = event.next!;

    return currentFrame;
  });

  if (currentFrame === null) {
    throw new Error("Logic error");
  }

  const duration = currentFrame!.notes.reduce(
    (accum, note) => Math.max(accum, note.endTime),
    currentFrame!.startTime
  );
  currentFrame!.endTime = duration;

  return frames;
};
