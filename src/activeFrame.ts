import { combineLatest } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { Track } from "./parseMidi/types";
import { track } from "./file";
import time from "./time";
import { orderedArraySearch, Order } from "./util";

export const frameForTime = (time: number, track: Track) => {
  return orderedArraySearch(track.frames, frame => {
    if (frame.startTime > time) return Order.Before;
    if (frame.endTime <= time) return Order.After;
    return Order.Match;
  });
};

export default combineLatest(time, track, frameForTime).pipe(
  distinctUntilChanged()
);
