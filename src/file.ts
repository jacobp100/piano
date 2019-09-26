import { BehaviorSubject, combineLatest } from "rxjs";
import { mapTo } from "rxjs/operators";
import { File } from "./parseMidi/types";

export const file = new BehaviorSubject<File | null>(null);
export const trackIndex = new BehaviorSubject(0);

file.pipe(mapTo(0)).subscribe(trackIndex);

export const track = combineLatest(file, trackIndex, (file, trackIndex) => {
  return file !== null && trackIndex >= 0 && trackIndex < file.tracks.length
    ? file.tracks[trackIndex]
    : null;
});
