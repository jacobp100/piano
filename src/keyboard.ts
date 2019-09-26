import { fromEvent } from "rxjs";
import { filter, withLatestFrom } from "rxjs/operators";
import { togglePlaying } from "./playback";
import { file, trackIndex } from "./file";

if (!process.env.REACT_APP_APP_BUILD) {
  fromEvent<KeyboardEvent>(document, "keypress")
    .pipe(filter(e => e.key === " "))
    .subscribe(e => {
      e.preventDefault();
      togglePlaying();
    });

  fromEvent<KeyboardEvent>(document, "keypress")
    .pipe(
      withLatestFrom(file, trackIndex, (e, file, trackIndex) => {
        console.log(file, trackIndex);
        if (e.key === ",") {
          return Math.max(trackIndex - 1, 0);
        } else if (e.key === "." && file !== null) {
          return Math.min(trackIndex + 1, file.tracks.length - 1);
        } else {
          return trackIndex;
        }
      })
    )
    .subscribe(trackIndex);
}
