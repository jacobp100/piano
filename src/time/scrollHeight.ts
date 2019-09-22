import { Subject, combineLatest } from "rxjs";
import { file } from "../file";
import viewport from "../viewport";
import { verticalScale } from "../config";

export const scrollHeight = new Subject<number>();

combineLatest(
  file,
  viewport,
  (file, viewport) => file.duration * verticalScale + viewport.height
).subscribe(scrollHeight);

const sizingElement = document.getElementById("sizing")!;
scrollHeight.subscribe(height => {
  sizingElement.style.height = `${height}px`;
});
