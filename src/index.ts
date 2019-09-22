import "./index.css";
import { fromEvent, from, merge } from "rxjs";
import { switchMap, map } from "rxjs/operators";
import parseMidi from "./parseMidi";
import { file } from "./file";

import "./playback";
import "./canvas";
import "./keyboard";
import "./toolbar";

fromEvent(document, "dragover").subscribe(e => {
  e.preventDefault();
});

const dropEvents = fromEvent<DragEvent>(document, "drop");

dropEvents.subscribe(e => {
  e.preventDefault();
});

const midiDropFiles = dropEvents.pipe(
  switchMap(e => {
    const item = e.dataTransfer !== null ? e.dataTransfer.items[0] : undefined;
    const file = item !== undefined ? item.getAsFile() : null;
    if (file !== null) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      return fromEvent<ProgressEvent>(reader, "load");
    } else {
      return from([]);
    }
  }),
  map(e => {
    return (e.target as any).result as ArrayBuffer;
  })
);

let midiFiles = midiDropFiles;
if (process.env.NODE_ENV === "development") {
  const initialMidiFile =
    (window.location.pathname.slice("/".length) || "aladdin") + ".mid";

  const initialFetchRequest = fetch(initialMidiFile).then(res =>
    res.arrayBuffer()
  );
  const midiInitialLoad = from(initialFetchRequest);

  midiFiles = merge(midiInitialLoad, midiFiles);
}

midiFiles
  .pipe(
    map((arrayBuffer: ArrayBuffer) => {
      const buffer = new Uint8Array(arrayBuffer);
      return parseMidi(buffer);
    })
  )
  .subscribe(file);
