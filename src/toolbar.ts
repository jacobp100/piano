import { fromEvent } from "rxjs";
import { map, distinctUntilChanged } from "rxjs/operators";
import { playingSubject, togglePlaying } from "./playback";
import playbackRate from "./playbackRate";

export const height = 50;

const playButton = document.getElementById("play")!;

fromEvent(playButton, "click").subscribe(togglePlaying);

playingSubject.subscribe(playing => {
  playButton.textContent = playing ? "Pause" : "Play";
});

const playbackRateSlider = document.getElementById(
  "playbackRate"
)! as HTMLInputElement;

playbackRate.subscribe(value => {
  playbackRateSlider.valueAsNumber = value;
});

fromEvent(playbackRateSlider, "input")
  .pipe(
    map((e: any): number => e.currentTarget.valueAsNumber),
    distinctUntilChanged()
  )
  .subscribe(playbackRate);
