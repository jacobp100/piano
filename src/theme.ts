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
  background: "#FFF",
  foreground: "#BDBDBD"
};

const dark: Theme = {
  normalNote: "#bdbdbd",
  normalNoteFocus: "#FFF",
  accidentalNote: "#2e7d32",
  accidentalNoteFocus: "#43a047",
  normalKey: "#222",
  accidentalKey: "#111",
  octaveDivision: "#222",
  accidentalDivision: "#080808",
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
