import { Html, useScroll } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useAtomValue } from "jotai";
import { pianoActiveAtom } from "./pianoState";

const stopSceneEvent = (event) => event.stopPropagation();

export function PianoInscription() {
  const active = useAtomValue(pianoActiveAtom);
  const { size } = useThree();
  // Keep the projected inscription in the stationary layer, not the scroll track.
  const { fixed } = useScroll();
  return (
    <Html transform portal={{ current: fixed }} position={[0, 0.73, -1.735]} distanceFactor={size.width < 768 ? 2.45 : 2.6}
      zIndexRange={[4, 0]} pointerEvents={active ? "auto" : "none"}>
      <div className={"piano-inscription" + (active ? " is-visible" : "")} data-scene-ui
        aria-hidden={!active} inert={active ? undefined : ""}
        onPointerDown={stopSceneEvent} onPointerUp={stopSceneEvent} onPointerMove={stopSceneEvent}
        onClick={stopSceneEvent} onDoubleClick={stopSceneEvent}
        onKeyDown={stopSceneEvent} onKeyUp={stopSceneEvent}>
        <p className="piano-inscription-label">Proficient in</p>
        <p className="piano-inscription-languages">C++ <span>·</span> Python <span>·</span> Kotlin <span>·</span> TypeScript</p>
        <a className="piano-inscription-link" href="https://github.com/darumond" target="_blank" rel="noopener noreferrer"
          tabIndex={active ? 0 : -1} aria-label="Recent work on GitHub (opens in a new tab)">
          <span>Recent work</span><span className="piano-inscription-link-divider" aria-hidden="true">/</span>
          GitHub <span className="piano-inscription-arrow" aria-hidden="true">↗</span>
        </a>
      </div>
    </Html>
  );
}
