import { fromEvent } from "rxjs";
import { filter, withLatestFrom, map } from "rxjs/operators";
import { togglePlaying } from "./playback";
import { file, trackIndex } from "./file";

fromEvent<KeyboardEvent>(document, "keypress")
  .pipe(filter(e => e.key === " "))
  .subscribe(() => togglePlaying());

fromEvent<KeyboardEvent>(document, "keypress")
  .pipe(
    withLatestFrom(file, trackIndex),
    map(([e, file, trackIndex]) => {
      if (e.key === ",") {
        return Math.max(trackIndex - 1, 0);
      } else if (e.key === ".") {
        return Math.min(trackIndex + 1, file.tracks.length - 1);
      } else {
        return trackIndex;
      }
    })
  )
  .subscribe(trackIndex);
