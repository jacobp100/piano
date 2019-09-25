type Sample = {
  buffer: AudioBuffer;
  existingNode: AudioBufferSourceNode | null;
};

type SamplesMap = Map<number, Sample>;

type Samples = {
  audioContext: AudioContext;
  samples: SamplesMap;
};

export const playSample = (
  { audioContext, samples }: Samples,
  noteNumber: number,
  volume: number
) => {
  const sample = samples.get(noteNumber)!;

  if (sample.existingNode !== null) {
    sample.existingNode.stop();
  }

  const source = audioContext.createBufferSource();
  source.buffer = sample.buffer;
  const gain = audioContext.createGain();
  gain.gain.value = volume;
  source.connect(gain);
  gain.connect(audioContext.destination);

  source.addEventListener("ended", () => {
    if (sample.existingNode === source) {
      sample.existingNode = null;
    }
  });

  sample.existingNode = source;

  source.start();
};

export const loadSamples = async (
  name: string,
  audioContext: AudioContext
): Promise<Samples> => {
  const res = await fetch(`${process.env.PUBLIC_URL}/${name}.sfbuf`);
  const arrayBuffer = await res.arrayBuffer();

  const view = new DataView(arrayBuffer);
  let i = 0;

  const numSamples = view.getUint8(i);
  i += 1;

  const samples: SamplesMap = new Map();

  const decodePromises = Array.from(new Array(numSamples), async () => {
    const noteNumber = view.getUint8(i);
    i += 1;
    const length = view.getUint32(i);
    i += 4;
    const start = i;
    const end = i + length;
    const data = arrayBuffer.slice(start, end);
    i = end;

    const buffer = await new Promise<AudioBuffer>((res, rej) =>
      audioContext.decodeAudioData(data, res, rej)
    );

    const sample = { buffer, existingNode: null };

    samples.set(noteNumber, sample);
  });
  await Promise.all(decodePromises);

  return { audioContext, samples };
};
