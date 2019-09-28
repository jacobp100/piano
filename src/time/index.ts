import { combineLatest } from "rxjs";
import viewport, { Viewport } from "../viewport";
import { verticalScale } from "../config";
import { scrollHeight } from "./scrollHeight";
import {
  setScrollTop,
  setUserScrollTop,
  scrollTop,
  userScrollTop
} from "./scrollTop";

const timeToScrollTop = (time: number) => {
  const scrollBottom = time * verticalScale;
  const scrollTop =
    (scrollHeight.value - scrollBottom - viewport.value.height) | 0;
  return scrollTop;
};

export const setUserTime = (time: number) => {
  const scrollTop = timeToScrollTop(time);
  setUserScrollTop(scrollTop);
};

export const setTime = (time: number) => {
  const scrollTop = timeToScrollTop(time);
  setScrollTop(scrollTop);
};

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

scrollHeight.subscribe(setUserScrollTop);
