export type TimingChange = {
  startMidiTime: number;
  endMidiTime: number;
  startTime: number;
  endTime: number;
  ticksPerBeat: number;
  microsecondsPerBeat: number;
  numerator: number;
  denominator: number;
  next: TimingChange | null;
};

export type Tick = {
  index: number;
  time: number;
  emphasized: boolean;
};

export type Ticks = Tick[];

export type Note = {
  index: number;
  noteNumber: number;
  velocity: number;
  startTime: number;
  endTime: number;
};

export type Frame = {
  index: number;
  startTime: number;
  endTime: number;
  notes: Note[];
};

export type Track = {
  notes: Note[];
  frames: Frame[];
};

export type File = {
  timingChanges: TimingChange;
  metronome: Ticks;
  tracks: Track[];
  duration: number;
};
