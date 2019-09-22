import { pipe } from "rxjs";
import { map, scan, timestamp } from "rxjs/operators";

type Timestamp<T> = { timestamp: number; value: T };

type VelocityAccum = {
  previous: Timestamp<number> | null;
  current: Timestamp<number> | null;
};

export const velocity = pipe(
  timestamp<number>(),
  scan(
    (accum: VelocityAccum, current: Timestamp<number>): VelocityAccum => ({
      previous: accum.current,
      current
    }),
    { previous: null, current: null }
  ),
  map(({ previous: p, current: c }: VelocityAccum) =>
    c !== null && p !== null
      ? (c.value - p.value) / Math.min(c.timestamp - p.timestamp, 16)
      : 0
  )
);
