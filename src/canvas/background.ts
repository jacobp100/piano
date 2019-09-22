import { Theme } from "../theme";
import { Layout } from "./layout";
import { accidentalKeys, keyForNoteNumber } from "./keyConfig";
import { KeyScale, x as keyX, width as keyWidth } from "./keyScale";

export default (
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  theme: Theme,
  keyScale: KeyScale
) => {
  const { width, height, pixelWidth, score } = layout;
  const { x, y } = score;
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = theme.accidentalDivision;
  accidentalKeys.forEach(key => {
    ctx.fillRect(
      x + keyX(key, keyScale),
      y,
      keyWidth(key, keyScale),
      height - pixelWidth
    );
  });

  ctx.fillStyle = theme.octaveDivision;
  for (let noteNumber = 24; noteNumber <= 96; noteNumber += 12) {
    const key = keyForNoteNumber(noteNumber);
    ctx.fillRect(
      x + keyX(key, keyScale) - pixelWidth,
      y,
      pixelWidth,
      height - pixelWidth
    );
  }
};
