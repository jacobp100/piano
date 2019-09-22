import { Subject, from } from "rxjs";
import { withLatestFrom } from "rxjs/operators";
import Soundfont from "soundfont-player";
import scrollableElement from "../scrollableElement";

const AudioContextConstructor: any =
  (window as any).AudioContext || (window as any).webkitAudioContext;
const audioContext: AudioContext = new AudioContextConstructor();

scrollableElement.addEventListener("click", () => {
  audioContext.resume();
});

const piano = from(
  Soundfont.instrument(audioContext as any, "acoustic_grand_piano", {
    nameToUrl(name: string, _soundfont: string, format: string = "mp3") {
      return `${process.env.PUBLIC_URL}/${name}-${format}.js`;
    }
  })
);

export const player = new Subject<number>();

player.pipe(withLatestFrom(from(piano))).subscribe(([noteNumber, piano]) => {
  if (audioContext.state !== "suspended") {
    piano.play(noteNumber as any);
  }
});
