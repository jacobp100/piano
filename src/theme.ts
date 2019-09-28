import { Observable } from "rxjs";

export type Theme = {
  normalNote: string;
  normalNoteFocus: string;
  accidentalNote: string;
  accidentalNoteFocus: string;
  normalKey: string;
  accidentalKey: string;
  octaveDivision: string;
  accidentalDivision: string;
  barDivision: string;
  beatDivision: string;
  background: string;
  foreground: string;
};

const light: Theme = {
  normalNote: "#4CAF50",
  normalNoteFocus: "#81C784",
  accidentalNote: "#000",
  accidentalNoteFocus: "#424242",
  normalKey: "#F5F5F5",
  accidentalKey: "#E0E0E0",
  octaveDivision: "#EEE",
  accidentalDivision: "#FAFAFA",
  barDivision: "#EEE",
  beatDivision: "#F5F5F5",
  background: "#FFF",
  foreground: "#BDBDBD"
};

const dark: Theme = {
  normalNote: "#BDBDBD",
  normalNoteFocus: "#FFF",
  accidentalNote: "#2E7D32",
  accidentalNoteFocus: "#43A047",
  normalKey: "#222",
  accidentalKey: "#111",
  octaveDivision: "#222",
  accidentalDivision: "#080808",
  barDivision: "#222",
  beatDivision: "#111",
  background: "#000",
  foreground: "#424242"
};

export default new Observable<Theme>(o => {
  const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const emitEvent = () => o.next(darkMediaQuery.matches ? dark : light);

  emitEvent();
  darkMediaQuery.addListener(emitEvent);

  return () => darkMediaQuery.removeListener(emitEvent);
});
