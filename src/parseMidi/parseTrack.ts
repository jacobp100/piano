import processEvents from "./processEvents";
import processFrames from "./processFrames";
import { Note, Track } from "./types";

export default (notes: Note[], name: string): Track => {
  const { events, numEvents } = processEvents(notes);
  const frames = processFrames(events, numEvents);
  return { name, notes, frames };
};
