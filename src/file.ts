import { BehaviorSubject, combineLatest } from "rxjs";
import { File } from "./parseMidi/types";

export const file = new BehaviorSubject<File | null>(null);
export const trackIndex = new BehaviorSubject(0);
export const track = combineLatest(file, trackIndex, (file, trackIndex) =>
  file !== null ? file.tracks[trackIndex] : null
);
