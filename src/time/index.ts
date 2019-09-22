import { combineLatest, Subject } from "rxjs";
import { distinctUntilChanged, withLatestFrom } from "rxjs/operators";
import viewport, { Viewport } from "../viewport";
import { file } from "../file";
import { verticalScale } from "../config";
import { scrollHeight } from "./scrollHeight";
import {
  setUserScrollTop,
  setScrollTop,
  scrollTop,
  userScrollTop
} from "./scrollTop";

const mapTimeToScrollTop = (
  time: number,
  scrollHeight: number,
  viewport: Viewport
) => {
  const scrollBottom = time * verticalScale;
  const scrollTop = (scrollHeight - scrollBottom - viewport.height) | 0;
  return scrollTop;
};

const userTimeSubject = new Subject<number>();
combineLatest(userTimeSubject, scrollHeight, viewport, mapTimeToScrollTop)
  .pipe(distinctUntilChanged())
  .subscribe(setUserScrollTop);
export const setTime = (value: number) => userTimeSubject.next(value);

export const timeSubject = new Subject<number>();
combineLatest(timeSubject, scrollHeight, viewport, mapTimeToScrollTop)
  .pipe(distinctUntilChanged())
  .subscribe(setScrollTop);

const mapCombinedScrollEvents = (
  scrollTop: number,
  scrollHeight: number,
  viewport: Viewport
): number => {
  const scrollBottom = scrollHeight - scrollTop - viewport.height;
  const time = scrollBottom / verticalScale;
  return time;
};

export const userTime = combineLatest(
  userScrollTop,
  scrollHeight,
  viewport,
  mapCombinedScrollEvents
);

export default combineLatest(
  scrollTop,
  scrollHeight,
  viewport,
  mapCombinedScrollEvents
);

file
  .pipe(withLatestFrom(scrollHeight, (_, height) => height))
  .subscribe(setUserScrollTop);
