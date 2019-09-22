import "./index.css";
import { fromEvent, from, merge } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { switchMap, map } from "rxjs/operators";
import parseMidi from "./parseMidi";
import { file } from "./file";

import "./playback";
import "./canvas";
import "./keyboard";
import "./toolbar";

const dropFile = (element: HTMLDocument | HTMLElement) => {
  fromEvent(element, "dragover").subscribe(e => {
    e.preventDefault();
  });

  const dropEvents = fromEvent<DragEvent>(element, "drop");

  dropEvents.subscribe(e => {
    e.preventDefault();
  });

  return dropEvents.pipe(
    switchMap(e => {
      const item =
        e.dataTransfer !== null ? e.dataTransfer.items[0] : undefined;
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
};

const initialMidiFile =
  (window.location.pathname.slice("/".length) || "test") + ".mid";

const midiInitialLoad = fromFetch(initialMidiFile).pipe(
  switchMap(res => res.arrayBuffer())
);

merge(midiInitialLoad, dropFile(document))
  .pipe(
    map((arrayBuffer: ArrayBuffer) => {
      const buffer = new Uint8Array(arrayBuffer);
      return parseMidi(buffer);
    })
  )
  .subscribe(file);
