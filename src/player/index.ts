import { Subject, from } from "rxjs";
import { withLatestFrom } from "rxjs/operators";
import { Note } from "../parseMidi/types";
import { loadSamples, playSample } from "./samplePlayer";

const AudioContextConstructor: any =
  (window as any).AudioContext || (window as any).webkitAudioContext;
export const audioContext: AudioContext = new AudioContextConstructor();

const createInstrument = (name: string) => {
  const instrument = new Subject<Note | number>();

  const request = from(loadSamples(name, audioContext));

  instrument.pipe(withLatestFrom(request)).subscribe(([note, piano]) => {
    if (audioContext.state === "suspended") return;
    if (typeof note === "number") {
      playSample(piano, note, 1);
    } else {
      playSample(piano, note.noteNumber, note.velocity / 128);
    }
  });

  return instrument;
};

export const piano = createInstrument("acoustic_grand_piano");
export const percusson = createInstrument("percussion");
