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

export default (events: Event): Frame[] => {
  const frames = [];
  let currentFrame = null;

  for (let i = 0, event = events; event !== null; event = event.next!, i += 1) {
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

    frames.push(currentFrame);
  }

  if (currentFrame === null) {
    throw new Error("Logic error");
  }

  const duration = currentFrame.notes.reduce(
    (accum, note) => Math.max(accum, note.endTime),
    currentFrame.startTime
  );
  currentFrame.endTime = duration;

  return frames;
};
