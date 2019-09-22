import { map } from "rxjs/operators";
import viewport, { Viewport } from "../viewport";
import { height as toolbarHeight } from "../toolbar";
import { keyboardHeight, keys } from "./keyConfig";

const marginBottom = keyboardHeight;
const marginHorizontal = keys.length + 1;

export type Viewbox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Layout = Viewport & {
  score: Viewbox;
  keyboard: Viewbox;
  minimap: Viewbox;
  markings: Viewbox;
};

export default map<Viewport, Layout>(viewport => {
  const { width, height, pixelWidth, pixelRatio } = viewport;
  const insetTop = toolbarHeight;
  const scoreHeight = height - marginBottom;
  const scoreWidth = width - 2 * marginHorizontal;
  const innerHeight = scoreHeight - insetTop;
  const score = {
    x: marginHorizontal,
    y: 0,
    width: scoreWidth,
    height: scoreHeight
  };
  const keyboard = {
    x: marginHorizontal,
    y: height - marginBottom,
    width: scoreWidth,
    height: marginBottom
  };
  const minimap = {
    x: marginHorizontal + scoreWidth + 1,
    y: insetTop,
    height: innerHeight,
    width: marginHorizontal
  };
  const markings = {
    x: 0,
    y: 0,
    height: scoreHeight,
    width: marginHorizontal - 1
  };
  return {
    width,
    height,
    pixelWidth,
    pixelRatio,
    score,
    keyboard,
    minimap,
    markings
  };
})(viewport);
