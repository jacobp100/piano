declare module "sample-player" {
  type SamplePlayer = {
    connect(ac: AudioContext): SamplePlayer;
    play(noteNumber: number): void;
  };

  export default (audioContext: AudioContext, samples: any) => SamplePlayer;
}
