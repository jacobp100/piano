import { Observable, Subject, BehaviorSubject, combineLatest } from "rxjs";
import { filter } from "rxjs/operators";
import { File, Track } from "./parseMidi/types";

export const file = new Subject<File>();
export const trackIndex = new BehaviorSubject(0);
export const track = combineLatest(
  file,
  trackIndex,
  (file, trackIndex) => file.tracks[trackIndex]
).pipe(filter(x => x !== undefined)) as Observable<Track>;
