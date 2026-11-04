import { useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import { ArrowLeft, ArrowRight, RotateCcw, Volume2, VolumeX } from "react-feather";
import {
  enablePianoSound, pianoActiveAtom, pianoDirectionAtom,
  pianoReplayAtom, pianoSoundAtom,
} from "./pianoState";

export function PianoControls() {
  const [active] = useAtom(pianoActiveAtom);
  const [sound, setSound] = useAtom(pianoSoundAtom);
  const setDirection = useSetAtom(pianoDirectionAtom);
  const replay = useSetAtom(pianoReplayAtom);

  useEffect(() => {
    const release = () => setDirection(0);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("blur", release);
    return () => {
      release();
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("blur", release);
    };
  }, [setDirection]);

  const moveButton = (direction, label, Icon) => (
    <button
      type="button"
      className="piano-move"
      aria-label={label}
      disabled={!active}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        setDirection(direction);
      }}
      onPointerUp={() => setDirection(0)}
      onPointerCancel={() => setDirection(0)}
      onLostPointerCapture={() => setDirection(0)}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          setDirection(direction);
        }
      }}
      onKeyUp={(event) => {
        if (event.key === " " || event.key === "Enter") setDirection(0);
      }}
      onBlur={() => setDirection(0)}
    >
      <Icon size={22} aria-hidden="true" />
    </button>
  );

  return (
    <div className="piano-controls">
      <div className="piano-controls-main">
        {moveButton(-1, "Move left on the piano", ArrowLeft)}
        <p>Walk the keys<span>Hold ← / → or A / D</span></p>
        {moveButton(1, "Move right on the piano", ArrowRight)}
      </div>
      <div className="piano-controls-extras">
        <button type="button" disabled={!active} onClick={() => replay((value) => value + 1)}>
          <RotateCcw size={15} aria-hidden="true" /> Drop again
        </button>
        <span className="piano-control-divider" aria-hidden="true" />
        <button
          type="button"
          aria-pressed={sound}
          disabled={!active}
          onClick={async () => {
            if (sound) setSound(false);
            else setSound(await enablePianoSound());
          }}
        >
          {sound ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
          Sound {sound ? "on" : "off"}
        </button>
      </div>
    </div>
  );
}
