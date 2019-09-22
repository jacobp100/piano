declare module "midi-file" {
  type MidiEvent =
    | { type: "sequenceNumber"; deltaTime: number; number: number }
    | { type: "text"; deltaTime: number; text: string }
    | { type: "copyrightNotice"; deltaTime: number; text: string }
    | { type: "trackName"; deltaTime: number; text: string }
    | { type: "instrumentName"; deltaTime: number; text: string }
    | { type: "lyrics"; deltaTime: number; text: string }
    | { type: "marker"; deltaTime: number; text: string }
    | { type: "cuePoint"; deltaTime: number; text: string }
    | { type: "channelPrefix"; deltaTime: number; channel: number }
    | { type: "portPrefix"; deltaTime: number; port: number }
    | { type: "endOfTrack"; deltaTime: number }
    | { type: "setTempo"; deltaTime: number; microsecondsPerBeat: number }
    | {
        type: "smpteOffset";
        deltaTime: number;
        hourByte: number;
        frameRate: number;
        hour: number;
        min: number;
        sec: number;
        frame: number;
        subFrame: number;
      }
    | {
        type: "timeSignature";
        deltaTime: number;
        numerator: number;
        denominator: number;
        metronome: number;
        thirtyseconds: number;
      }
    | { type: "keySignature"; deltaTime: number; key: number; scale: number }
    | { type: "sequencerSpecific"; deltaTime: number; data: number[] }
    | {
        type: "unknownMeta";
        deltaTime: number;
        data: number[];
        metatypeByte: number;
      }
    | { type: "sysEx"; deltaTime: number; data: number[] }
    | { type: "endSysEx"; deltaTime: number; data: number[] }
    | {
        type: "noteOff";
        deltaTime: number;
        noteNumber: number;
        velocity: number;
      }
    | {
        type: "noteOn";
        deltaTime: number;
        noteNumber: number;
        velocity: number;
      }
    | {
        type: "noteAftertouch";
        deltaTime: number;
        noteNumber: number;
        amount: number;
      }
    | {
        type: "controller";
        deltaTime: number;
        controllerType: number;
        value: number;
      }
    | { type: "programChange"; deltaTime: number; programNumber: number }
    | { type: "channelAftertouch"; deltaTime: number; amount: number }
    | { type: "pitchBend"; deltaTime: number; value: number };

  type MidiHeaderTiming =
    | { framesPerSecond: number; ticksPerFrame: number }
    | { ticksPerBeat: number };

  type MidiHeader = MidiHeaderTiming & {
    format: number;
    numTracks: number;
    ticksPerBeat: number;
  };

  type MidiTrack = MidiEvent[];

  type MidiFile = {
    header: MidiHeader;
    tracks: MidiTrack[];
  };

  export let parseMidi = (buffer: any) => MidiFile;
}
