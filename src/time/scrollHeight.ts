import { BehaviorSubject, combineLatest } from "rxjs";
import { file } from "../file";
import viewport from "../viewport";
import { verticalScale } from "../config";

export const scrollHeight = new BehaviorSubject<number>(0);

combineLatest(file, viewport, (file, viewport) =>
  file !== null ? file.duration * verticalScale + viewport.height : 0
).subscribe(scrollHeight);

const sizingElement = document.getElementById("sizing")!;
scrollHeight.subscribe(height => {
  sizingElement.style.height = `${height}px`;
});
