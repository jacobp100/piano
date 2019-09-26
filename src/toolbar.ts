import { fromEvent } from "rxjs";
import { map, distinctUntilChanged } from "rxjs/operators";
import { insetTop } from "./config";
import { playingSubject, playbackRate, togglePlaying } from "./playback";
import { audioContext } from "./player";
import "./toolbar.css";

if (!process.env.REACT_APP_APP_BUILD) {
  const height = 50;
  insetTop.next(height);

  const toolbarTemplate = document.createElement("template");
  toolbarTemplate.innerHTML = `
    <div id="toolbar">
      <button id="unmute" type="button">Unmute</button>
      <div class="spacer"></div>
      <input id="playbackRate" type="range" min="0.1" max="2" step="0.1" />
      <button id="play" type="button">Play</button>
    </div>
  `;
  document.documentElement.appendChild(toolbarTemplate.content);

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

  const unmuteButton = document.getElementById("unmute")!;

  fromEvent(unmuteButton, "click").subscribe(() => {
    audioContext.resume();
  });

  fromEvent(audioContext, "statechange").subscribe(() => {
    unmuteButton.style.display =
      audioContext.state === "suspended" ? "" : "none";
  });
}
