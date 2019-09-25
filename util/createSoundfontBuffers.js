const path = require("path");
const fs = require("fs");
const vm = require("vm");
const fetch = require("node-fetch");

// https://github.com/danigb/soundfont-player/blob/42f2e6ee5afb84dc5c483a906f7b9d108ba2c0ad/lib/index.js#L72-L76
const nameToUrl = (name, sf, format) => {
  format = format === "ogg" ? format : "mp3";
  sf = sf === "FluidR3_GM" ? sf : "MusyngKite";
  return `https://gleitz.github.io/midi-js-soundfonts/${sf}/${name}-${format}.js`;
};

const notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
if (notes.length !== 12) throw new Error("Logic error");
const noteNameToNumber = name => {
  const [, note, octave] = name.match(/([A-G]b?)(-?\d)/);
  const noteNumber = notes.indexOf(note) + (Number(octave) + 1) * 12;
  return noteNumber;
};

const processSoundBuffer = (name, sf, format, filter) =>
  fetch(nameToUrl(name, sf, format))
    .then(res => res.text())
    .then(js => {
      const script = new vm.Script(js);
      const context = vm.createContext();
      script.runInContext(context);

      let data = context.MIDI.Soundfont[name];
      if (filter) {
        data = filter.reduce((accum, key) => {
          const name =
            typeof key === "string"
              ? key
              : `${notes[key % 12]}${(key / 12) | 0}`;
          accum[name] = data[name];
          return accum;
        }, {});
      }

      const writeStream = fs.createWriteStream(
        path.join(__dirname, `../public/${name}.sfbuf`),
        { encoding: "binary" }
      );

      const entries = Object.entries(data);

      const metaHeaderEntry = new ArrayBuffer(1);
      const writer = new DataView(metaHeaderEntry);
      writer.setUint8(0, entries.length);
      const metaHeader = Buffer.from(metaHeaderEntry);
      writeStream.write(metaHeader);

      entries.forEach(([name, base64url]) => {
        const base64 = base64url.replace(/^[^,]+/, "");
        const data = Buffer.from(base64, "base64");

        const headerEntry = new ArrayBuffer(5);
        const writer = new DataView(headerEntry);
        writer.setUint8(0, noteNameToNumber(name));
        writer.setUint32(1, data.length);
        const header = Buffer.from(headerEntry);

        writeStream.write(header);
        writeStream.write(data);
      });
    });

processSoundBuffer("acoustic_grand_piano");
processSoundBuffer("percussion", "FluidR3_GM", undefined, [31, 32]);
