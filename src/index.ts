import "./index.css";
import { fromEvent, from, merge } from "rxjs";
import { switchMap, map } from "rxjs/operators";
import parseMidi from "./parseMidi";
import { file } from "./file";

import "./playback";
import "./canvas";
import "./keyboard";
import "./toolbar";

const midiSources = [];

if (!process.env.REACT_APP_APP_BUILD) {
  fromEvent(document, "dragover").subscribe(e => {
    e.preventDefault();
  });

  const dropEvents = fromEvent<DragEvent>(document, "drop");

  dropEvents.subscribe(e => {
    e.preventDefault();
  });

  const midiDropFiles = dropEvents.pipe(
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

  midiSources.push(midiDropFiles);
}

const initialMidiFile = window.location.search.slice("?".length);
if (initialMidiFile) {
  const initialFetchRequest = fetch(`/midi/${initialMidiFile}`).then(res =>
    res.arrayBuffer()
  );
  const initialMidiLoad = from(initialFetchRequest);

  midiSources.push(initialMidiLoad);
}

if (midiSources.length > 0) {
  merge(...midiSources)
    .pipe(map(parseMidi))
    .subscribe(file);
}
