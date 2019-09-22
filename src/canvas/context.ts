import { map } from "rxjs/operators";
import canvas from "./canvas";
import layout, { Layout } from "./layout";

export default map<Layout, CanvasRenderingContext2D>(layout => {
  const { pixelRatio } = layout;
  canvas.setAttribute("width", `${layout.width * pixelRatio}`);
  canvas.setAttribute("height", `${layout.height * pixelRatio}`);
  canvas.style.width = `${layout.width}px`;
  canvas.style.height = `${layout.height}px`;

  const ctx = canvas.getContext("2d", { alpha: false })!;
  ctx.scale(pixelRatio, pixelRatio);

  return ctx;
})(layout);
