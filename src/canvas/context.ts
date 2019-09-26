import { map } from "rxjs/operators";
import { canvasElement } from "../dom";
import layout, { Layout } from "./layout";

export default map<Layout, CanvasRenderingContext2D>(layout => {
  const { pixelRatio } = layout;
  canvasElement.setAttribute("width", `${layout.width * pixelRatio}`);
  canvasElement.setAttribute("height", `${layout.height * pixelRatio}`);
  canvasElement.style.width = `${layout.width}px`;
  canvasElement.style.height = `${layout.height}px`;

  const ctx = canvasElement.getContext("2d", { alpha: false })!;
  ctx.scale(pixelRatio, pixelRatio);

  return ctx;
})(layout);
