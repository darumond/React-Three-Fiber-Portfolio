import { useEffect, useRef, useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import { ArrowUp, Move, RotateCcw, Volume2, VolumeX } from "react-feather";
import {
  pianoActiveAtom, pianoDirectionAtom, pianoJumpAtom,
  pianoReplayAtom, pianoMusicEnabledAtom, pianoMusicStatusAtom,
} from "./pianoState";
import { startPianoMusic } from "./PianoMusic";
import { PIANO_TRACK } from "./pianoMusicController";

const stopSceneEvent = (event) => event.stopPropagation();

export function PianoControls() {
  const [active] = useAtom(pianoActiveAtom);
  const setMusicEnabled = useSetAtom(pianoMusicEnabledAtom);
  const [musicStatus] = useAtom(pianoMusicStatusAtom);
  const playing = musicStatus === "playing";
  const musicLabel = playing ? "Music on" : musicStatus === "loading" ? "Loading music…" :
    musicStatus === "blocked" ? "Play music" : musicStatus === "error" ? "Retry music" : "Music off";
  const toggleMusic = () => {
    if (playing || musicStatus === "loading") setMusicEnabled(false);
    else { setMusicEnabled(true); startPianoMusic(); }
  };
  const setDirection = useSetAtom(pianoDirectionAtom);
  const jump = useSetAtom(pianoJumpAtom);
  const replay = useSetAtom(pianoReplayAtom);
  const joystickPointer = useRef(null);
  const [knob, setKnob] = useState({ x: 0, z: 0 });
  const release = () => {
    joystickPointer.current = null;
    setKnob({ x: 0, z: 0 });
    setDirection({ x: 0, z: 0 });
  };
  useEffect(() => {
    const up = (event) => { if (event.pointerId === joystickPointer.current) release(); };
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", release);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("blur", release);
      document.removeEventListener("visibilitychange", release);
      setDirection({ x: 0, z: 0 });
    };
  }, [setDirection]);
  useEffect(() => { if (!active) release(); }, [active]);

  const move = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const range = rect.width * 0.31;
    const dx = (event.clientX - rect.left - rect.width / 2) / range;
    const dz = (event.clientY - rect.top - rect.height / 2) / range;
    const length = Math.hypot(dx, dz);
    const amount = Math.min(1, length);
    const direction = length < 0.12 ? { x: 0, z: 0 } : { x: dx / length * amount, z: dz / length * amount };
    setKnob(direction);
    setDirection(direction);
  };

  return (
    <div className="piano-controls" data-scene-ui
      onPointerDown={stopSceneEvent} onPointerUp={stopSceneEvent}
      onPointerMove={stopSceneEvent} onPointerCancel={stopSceneEvent}
      onClick={stopSceneEvent} onDoubleClick={stopSceneEvent}>
      <div className="piano-controls-main">
        <button
          type="button"
          className="piano-joystick"
          aria-label="Move on the piano. Drag in any direction"
          aria-describedby="piano-movement-help"
          disabled={!active}
          onPointerDown={(event) => {
            event.preventDefault();
            joystickPointer.current = event.pointerId;
            event.currentTarget.setPointerCapture(event.pointerId);
            move(event);
          }}
          onPointerMove={(event) => { if (event.pointerId === joystickPointer.current) move(event); }}
          onPointerUp={release}
          onPointerCancel={release}
          onLostPointerCapture={release}
        >
          <span className="piano-joystick-cross" aria-hidden="true" />
          <span className="piano-joystick-knob" style={{ transform: "translate(" + knob.x * 25 + "px, " + knob.z * 25 + "px)" }}>
            <Move size={19} aria-hidden="true" />
          </span>
        </button>
        <p id="piano-movement-help">Explore the keys<span>WASD / arrows to run</span><span>Space to jump · drag to steer</span></p>
        <button
          type="button"
          className="piano-jump"
          aria-label="Jump"
          aria-keyshortcuts="Space"
          disabled={!active}
          onClick={() => jump((value) => value + 1)}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault(); event.stopPropagation();
              if (!event.repeat) jump((value) => value + 1);
            }
          }}
          onKeyUp={(event) => {
            if (event.key === " " || event.key === "Enter") { event.preventDefault(); event.stopPropagation(); }
          }}
        >
          <ArrowUp size={21} aria-hidden="true" /><span>Jump</span>
        </button>
      </div>
      <div className="piano-controls-extras">
        <button type="button" disabled={!active} onClick={() => replay((value) => value + 1)}>
          <RotateCcw size={15} aria-hidden="true" /> Drop again
        </button>
        <span className="piano-control-divider" aria-hidden="true" />
        <button type="button" data-music-toggle aria-pressed={playing} disabled={!active} onClick={toggleMusic}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault(); event.stopPropagation();
              if (!event.repeat) toggleMusic();
            }
          }} onKeyUp={(event) => {
            if (event.key === " " || event.key === "Enter") { event.preventDefault(); event.stopPropagation(); }
          }}>
          {playing ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
          {musicLabel}
        </button>
      </div>
      <div className="piano-music-caption">
        <span>{PIANO_TRACK.title} <span aria-hidden="true">·</span> Liszt</span>
        <span className="piano-music-credit">
          <a href={PIANO_TRACK.source} target="_blank" rel="noopener noreferrer">{PIANO_TRACK.performer}</a>
          <span aria-hidden="true"> · </span>
          <a href={PIANO_TRACK.license} target="_blank" rel="noopener noreferrer">CC BY-SA 2.0</a>
        </span>
      </div>
    </div>
  );
}
