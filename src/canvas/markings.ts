import { File, TimingChange } from "../parseMidi/types";
import { Theme } from "../theme";
import { verticalScale } from "../config";
import { Layout } from "./layout";
import { microsecondsPerBeatToBpm } from "../parseMidi/util";

export default (
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  theme: Theme,
  file: File,
  time: number
) => {
  const viewbox = layout.markings;

  if (viewbox === null) return;

  ctx.font = "16px sans-serif";
  ctx.textAlign = "right";
  ctx.fillStyle = theme.foreground;
  const baseY = viewbox.height + time * verticalScale;
  for (
    let timingChange: TimingChange | null = file.timingChanges;
    timingChange !== null;
    timingChange = timingChange.next
  ) {
    const startY = (baseY - timingChange.startTime * verticalScale) | 0;
    const endY = (baseY - timingChange.endTime * verticalScale + 32) | 0;
    const yPos = Math.max(Math.min(startY, viewbox.y + viewbox.height), endY);
    const bpm = microsecondsPerBeatToBpm(timingChange.microsecondsPerBeat) | 0;
    ctx.fillText(`♩ = ${bpm}`, viewbox.x + viewbox.width - 8, yPos - 12);
  }
};
