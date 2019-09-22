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

const name = process.argv[2] || "acoustic_grand_piano";

const notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
if (notes.length !== 12) throw new Error("Logic error");
const noteNameToNumber = name => {
  const [, note, octave] = name.match(/([A-G]b?)(-?\d)/);
  const noteNumber = notes.indexOf(note) + (Number(octave) + 1) * 12;
  return noteNumber;
};

fetch(nameToUrl(name))
  .then(res => res.text())
  .then(js => {
    const script = new vm.Script(js);
    const context = vm.createContext();
    script.runInContext(context);
    const data = context.MIDI.Soundfont[name];

    const writeStream = fs.createWriteStream(
      path.join(__dirname, `../public/${name}.sfbuf`),
      { encoding: "binary" }
    );

    Object.entries(data).forEach(([name, base64]) => {
      const data = Buffer.from(base64, "base64");

      const headerEntry = new ArrayBuffer(8);
      const writer = new DataView(headerEntry);
      writer.setUint32(0, noteNameToNumber(name));
      writer.setUint32(4, data.length);

      writeStream.write(data);
    });
  });
