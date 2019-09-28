import { Subject, from, BehaviorSubject } from "rxjs";
import { withLatestFrom } from "rxjs/operators";
import { Note } from "../parseMidi/types";
import { loadSamples, playSample } from "./samplePlayer";

const AudioContextConstructor: any =
  (window as any).AudioContext || (window as any).webkitAudioContext;
export const audioContext: AudioContext = new AudioContextConstructor();

if (process.env.REACT_APP_APP_BUILD) {
  audioContext.resume();
}

export const createInstrument = (
  name: string,
  gain: BehaviorSubject<number>
) => {
  const instrument = new Subject<Note | number>();

  const request = from(loadSamples(name, audioContext));

  instrument.pipe(withLatestFrom(request)).subscribe(([note, piano]) => {
    if (audioContext.state === "suspended" || gain.value === 0) return;
    if (typeof note === "number") {
      playSample(piano, note, gain.value);
    } else {
      playSample(piano, note.noteNumber, note.gain * gain.value);
    }
  });

  return instrument;
};

export const piano = createInstrument(
  "acoustic_grand_piano",
  new BehaviorSubject(1)
);
