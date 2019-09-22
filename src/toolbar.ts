import { playingSubject, togglePlaying } from "./playback";

export const height = 50;

const playButton = document.getElementById("play")!;

playButton.addEventListener("click", togglePlaying);

playingSubject.subscribe(playing => {
  playButton.textContent = playing ? "Pause" : "Play";
});
