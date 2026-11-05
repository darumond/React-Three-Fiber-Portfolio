import { useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { pianoActiveAtom, pianoMusicEnabledAtom, pianoMusicStatusAtom } from "./pianoState";
import { createPianoMusicController, PIANO_TRACK } from "./pianoMusicController";

let requestPlayback = () => {};
// Called directly from the music button, while browser user activation is live.
export const startPianoMusic = () => requestPlayback();

export function PianoMusic() {
  const active = useAtomValue(pianoActiveAtom);
  const enabled = useAtomValue(pianoMusicEnabledAtom);
  const report = useSetAtom(pianoMusicStatusAtom);
  const audio = useRef();
  const controller = useRef();
  const preferences = useRef({ active, enabled });
  preferences.current = { active, enabled };

  useEffect(() => {
    const music = createPianoMusicController(audio.current, report);
    controller.current = music;
    const sync = () => music.setDesired(preferences.current.active && preferences.current.enabled && !document.hidden, document.hidden);
    const gesture = (event) => {
      if (event.target instanceof Element && event.target.closest("[data-music-toggle]")) return;
      if (event.type === "keydown" && (event.repeat || event.ctrlKey || event.metaKey || event.altKey)) return;
      if (preferences.current.active && preferences.current.enabled && !document.hidden) music.retry();
    };
    requestPlayback = () => { if (preferences.current.active && !document.hidden) music.setDesired(true); };
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pointerdown", gesture, true);
    window.addEventListener("keydown", gesture, true);
    window.addEventListener("touchend", gesture, true);
    return () => {
      requestPlayback = () => {};
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointerdown", gesture, true);
      window.removeEventListener("keydown", gesture, true);
      window.removeEventListener("touchend", gesture, true);
      music.dispose();
    };
  }, [report]);

  useEffect(() => {
    controller.current?.setDesired(active && enabled && !document.hidden);
  }, [active, enabled]);

  return <audio ref={audio} preload="none" loop playsInline hidden data-testid="piano-music" aria-label="Liebestraum No. 3 by Franz Liszt, performed by Martha Goldstein">
    <source src={PIANO_TRACK.mp3} type="audio/mpeg" />
    <source src={PIANO_TRACK.ogg} type="audio/ogg" />
  </audio>;
}
