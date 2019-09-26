import { File } from "../parseMidi/types";
import { Theme } from "../theme";
import { Layout } from "./layout";
import { accidentalKeys, keyForNoteNumber } from "./keyConfig";
import { x as keyX, width as keyWidth } from "./keyScale";
import { verticalScale } from "../config";

export default (
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  theme: Theme,
  file: File,
  startTime: number
) => {
  const { height, pixelWidth, score, keyScale } = layout;
  const endTime = (startTime + score.height / verticalScale) | 0;
  const { x, y } = score;

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
  for (let note = 24; note <= 96; note += 12) {
    const key = keyForNoteNumber(note)!;
    ctx.fillRect(
      x + keyX(key, keyScale) - pixelWidth,
      y,
      pixelWidth,
      height - pixelWidth
    );
  }

  let lastWasEmphasized = true;
  ctx.fillStyle = theme.barDivision;
  const ticks = file.metronome;
  for (let i = 0; i < ticks.length; i += 1) {
    const { time, emphasized } = ticks[i];
    if (time < startTime) continue;
    if (time > endTime) break;
    const y = (score.height - (time - startTime) * verticalScale) | 0;

    if (lastWasEmphasized !== emphasized) {
      ctx.fillStyle = emphasized ? theme.barDivision : theme.beatDivision;
      lastWasEmphasized = emphasized;
    }

    ctx.fillRect(score.x, y, score.width, 1);
  }
};
