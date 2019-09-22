import { fromEvent } from "rxjs";
import { map, filter } from "rxjs/operators";
import scrollableElement from "../scrollableElement";

let subjectValue = Number.MIN_SAFE_INTEGER;

export const setUserScrollTop = (value: number) => {
  scrollableElement.scrollTo(0, value | 0);
};

export const setScrollTop = (value: number) => {
  subjectValue = value | 0;
  scrollableElement.scrollTo(0, value | 0);
};

export const scrollTop = fromEvent(scrollableElement, "scroll", {
  passive: true
}).pipe(
  map((e: any) => {
    const element: Window | HTMLElement = e.currentTarget;
    const scrollTop: number =
      element === window ? element.scrollY : (element as HTMLElement).scrollTop;
    return scrollTop | 0;
  })
);

export const userScrollTop = scrollTop.pipe(
  filter(scrollTop => scrollTop !== subjectValue)
);
