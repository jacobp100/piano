import { TimingChange, Tick, Ticks } from "./types";

type TickRange = {
  startIndex: number;
  endIndex: number;
  startTime: number;
  microsecondIncrement: number;
  emphasizeEvery: number;
  next: TickRange | null;
};

const createTick = (
  timingChange: TimingChange,
  startIndex: number
): TickRange => {
  const { denominator, numerator, microsecondsPerBeat } = timingChange;
  const startTime = timingChange.startTime | 0;
  const endTime = timingChange.endTime | 0;
  const microsecondIncrement = microsecondsPerBeat * (denominator / 4);
  const numTicks =
    (((endTime - startTime - 1) * 1e3) / microsecondIncrement) | 0;
  const endIndex = startIndex + numTicks;
  return {
    startIndex,
    endIndex,
    startTime,
    microsecondIncrement,
    emphasizeEvery: numerator,
    next: null
  };
};

export default (timingChanges: TimingChange): Ticks => {
  const tickRanges = createTick(timingChanges, 0);

  let numTicks;
  if (timingChanges.next !== null) {
    let currentTickRange = tickRanges;
    for (
      let timingChange: TimingChange | null = timingChanges.next;
      timingChange !== null;
      timingChange = timingChange.next
    ) {
      const nextTick = createTick(timingChange, currentTickRange.endIndex + 1);
      currentTickRange.next = nextTick;
      currentTickRange = nextTick;
    }
    numTicks = currentTickRange.endIndex;
  } else {
    numTicks = tickRanges.endIndex;
  }

  let currentTickRange = tickRanges;
  const ticks = Array.from(
    new Array(numTicks),
    (_, i): Tick => {
      if (i > currentTickRange.endIndex) {
        currentTickRange = currentTickRange.next!;
      }

      const {
        startIndex,
        startTime,
        microsecondIncrement,
        emphasizeEvery
      } = currentTickRange;

      const rangeIndex = i - startIndex;
      const time = (startTime + (rangeIndex * microsecondIncrement) / 1e3) | 0;
      const emphasized = rangeIndex % emphasizeEvery === 0;
      return { index: i, time, emphasized };
    }
  );

  return ticks;
};
