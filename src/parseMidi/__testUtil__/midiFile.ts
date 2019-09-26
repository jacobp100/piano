import fs from "fs";
import path from "path";
import { TextDecoder } from "util";
import { parseMidiFile } from "jasmid.ts";

// @ts-ignore
global.TextDecoder = TextDecoder;

const midiBuffer = fs.readFileSync(path.join(__dirname, "aladdin.mid"));
const midiArrayBuffer = midiBuffer.buffer.slice(
  midiBuffer.byteOffset,
  midiBuffer.byteOffset + midiBuffer.byteLength
);
export default parseMidiFile(midiArrayBuffer);
