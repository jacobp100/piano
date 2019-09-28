import { Observable } from "rxjs";
import { insetTop } from "./config";
import {
  playing,
  playbackRate,
  metronomeVolume,
  metronomeUsesPercussionTrack
} from "./playback";

if (process.env.REACT_APP_APP_BUILD) {
  const app: { [key: string]: Observable<any> } = {
    insetTop,
    playing,
    playbackRate,
    metronomeVolume,
    metronomeUsesPercussionTrack
  };

  // @ts-ignore
  global.app = app;

  playing.subscribe(playing => {
    // @ts-ignore
    webkit.messageHandlers.playing.postMessage(playing);
  });
}
