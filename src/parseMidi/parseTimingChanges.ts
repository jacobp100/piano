import { MidiEvent } from "jasmid.ts";
import { TimingChange } from "./types";
import { microsecondsPerBeatToBpm } from "./util";

const createTimingChange = (
  ticksPerBeat: number,
  microsecondsPerBeat: number,
  numerator: number,
  denominator: number,
  midiTime: number,
  time: number
): TimingChange => ({
  startMidiTime: midiTime,
  endMidiTime: Number.MAX_SAFE_INTEGER,
  startTime: time,
  endTime: Number.MAX_SAFE_INTEGER,
  ticksPerBeat,
  microsecondsPerBeat,
  numerator,
  denominator,
  next: null
});

export const convertMidiTime = (
  timingChange: TimingChange,
  midiTime: number
): number => {
  const {
    startTime,
    startMidiTime,
    endMidiTime,
    ticksPerBeat,
    microsecondsPerBeat
  } = timingChange;

  if (
    process.env.NODE_ENV === "development" &&
    (startMidiTime > midiTime || endMidiTime < midiTime)
  ) {
    // We assume you always add a time at or after startEvent.time
    throw new Error("Logic error");
  }

  const bpm = microsecondsPerBeatToBpm(microsecondsPerBeat);
  const msPerTick = 60000 / (bpm * ticksPerBeat);

  return (startTime + (midiTime - startMidiTime) * msPerTick) | 0;
};

const appendTimingChange = (
  currentTimingChange: TimingChange,
  microsecondsPerBeat: number,
  numerator: number,
  denominator: number,
  midiTime: number
): TimingChange => {
  const time = convertMidiTime(currentTimingChange, midiTime);

  const timingChange = createTimingChange(
    currentTimingChange.ticksPerBeat,
    microsecondsPerBeat,
    numerator,
    denominator,
    midiTime,
    time
  );

  currentTimingChange.endMidiTime = midiTime;
  currentTimingChange.endTime = time;
  currentTimingChange.next = timingChange;

  return timingChange;
};

export default (
  header: { ticksPerBeat: number },
  track: MidiEvent[]
): { timingChanges: TimingChange; finalTimingChange: TimingChange } => {
  let midiTime = 0;

  const microSecondsPerBeat120 = 500e3 /* 120bpm default */;
  const timingChanges = createTimingChange(
    header.ticksPerBeat,
    microSecondsPerBeat120,
    4,
    4,
    0,
    0
  );
  let currentTimingChange = timingChanges;

  track.forEach(event => {
    midiTime += event.deltaTime;

    if (event.type !== "meta") return;

    switch (event.subType) {
      case "timeSignature": {
        const { numerator, denominator } = event;
        if (currentTimingChange.startMidiTime === midiTime) {
          currentTimingChange.numerator = numerator;
          currentTimingChange.denominator = denominator;
        } else {
          currentTimingChange = appendTimingChange(
            currentTimingChange,
            currentTimingChange.microsecondsPerBeat,
            numerator,
            denominator,
            midiTime
          );
        }
        break;
      }
      case "setTempo": {
        const { microsecondsPerBeat } = event;
        if (currentTimingChange.startMidiTime === midiTime) {
          currentTimingChange.microsecondsPerBeat = microsecondsPerBeat;
        } else {
          currentTimingChange = appendTimingChange(
            currentTimingChange,
            microsecondsPerBeat,
            currentTimingChange.numerator,
            currentTimingChange.denominator,
            midiTime
          );
        }
        break;
      }
      default:
        break;
    }
  });

  return { timingChanges, finalTimingChange: currentTimingChange };
};
