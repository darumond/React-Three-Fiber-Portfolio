import { memo, useRef, useState } from "react";
import { Html, useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useAtomValue } from "jotai";
import { pianoActiveAtom } from "./pianoState";

const stopSceneEvent = (event) => event.stopPropagation();
const clamp = (value) => Math.max(0, Math.min(1, value));

function Inscription({ x, journey, children, from, to }) {
  const active = useAtomValue(pianoActiveAtom);
  const { fixed } = useScroll();
  const { size } = useThree();
  const root = useRef();
  const link = useRef();
  const words = useRef(new Map());
  const generation = useRef(-1);
  const [reduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useFrame((_, delta) => {
    if (!root.current || !journey) return;
    const state = journey.current;
    const reset = generation.current !== state.generation;
    generation.current = state.generation;
    const showing = active && state.landed;
    const progress = clamp((state.furthestX - from) / (to - from));
    root.current.style.setProperty("--journey", showing ? progress : 0);
    root.current.setAttribute("aria-hidden", !showing || progress === 0 ? "true" : "false");
    for (const word of words.current.values()) {
      const target = showing ? clamp((state.furthestX - word.from) / 0.45) : 0;
      // Ease by time rather than frames. Replay clears every word immediately.
      word.amount = reset || !showing ? 0 : reduced ? target : word.amount + (target - word.amount) * (1 - Math.exp(-9 * Math.min(delta, 0.05)));
      if (Math.abs(word.amount - target) < 0.0001) word.amount = target;
      word.element.style.setProperty("--reveal", word.amount);
    }
    if (link.current) {
      const clickable = showing && progress >= 1;
      link.current.tabIndex = clickable ? 0 : -1;
      link.current.inert = !clickable;
      link.current.style.pointerEvents = clickable ? "auto" : "none";
    }
  });

  const word = (text, at, key = text) => <span key={key} className="piano-reveal" ref={(element) => {
    if (element) words.current.set(key, { element, from: at, amount: 0 });
    else words.current.delete(key);
  }}>{text}{" "}</span>;

  return <Html transform portal={{ current: fixed }} position={[x, 0.86, -1.735]}
    distanceFactor={size.width < 768 ? 2.45 : 2.6} zIndexRange={[4, 0]} pointerEvents="none">
    <div ref={root} className={"piano-inscription" + (active ? " is-visible" : "")} data-scene-ui
      aria-hidden="true" inert={active ? undefined : ""}
      onPointerDown={stopSceneEvent} onPointerUp={stopSceneEvent} onPointerMove={stopSceneEvent}
      onClick={stopSceneEvent} onDoubleClick={stopSceneEvent}
      onKeyDown={stopSceneEvent} onKeyUp={stopSceneEvent}>
      {children(word, link)}
      <span className="piano-inscription-flourish" aria-hidden="true" />
    </div>
  </Html>;
}

export const PianoInscription = memo(function PianoInscription({ journey }) {
  return <>
    <Inscription x={-4.5} from={-6.8} to={-4.2} journey={journey}>
      {(word) => <>
        <p className="piano-inscription-label">{["I", "am", "proficient", "in"].map((text, i) => word(text, -6.85 + i * 0.1))}</p>
        <p className="piano-inscription-languages">
          <span className="piano-inscription-line">{word("C++", -6.05)}{word("·", -5.85, "dot-one")}{word("Python", -5.6)}</span>
          <span className="piano-inscription-line">{word("Kotlin", -5.25)}{word("·", -5, "dot-two")}{word("TypeScript", -4.7)}</span>
        </p>
      </>}
    </Inscription>
    <Inscription x={0} from={-2.35} to={0.3} journey={journey}>
      {(word, link) => <>
        <p className="piano-inscription-label">{["You", "can", "check"].map((text, i) => word(text, -2.35 + i * 0.18))}</p>
        <p className="piano-inscription-languages">{["my", "recent", "work"].map((text, i) => word(text, -1.7 + i * 0.3))}</p>
        <a ref={link} className="piano-inscription-link" href="https://github.com/darumond" target="_blank" rel="noopener noreferrer"
          tabIndex={-1} aria-label="Check my recent work on GitHub (opens in a new tab)">
          {word("on", -0.7)}{word("GitHub", -0.4)}{word("↗", -0.15)}
        </a>
      </>}
    </Inscription>
    <Inscription x={4.5} from={2.1} to={5.05} journey={journey}>
      {(word) => <>
        <p className="piano-inscription-label">{["In", "my", "free", "time"].map((text, i) => word(text, 2.1 + i * 0.2))}</p>
        <p className="piano-inscription-languages piano-inscription-personal">
          <span className="piano-inscription-line">{word("I", 2.95)}{word("also", 3.25)}{word("play", 3.7)}</span>
          <span className="piano-inscription-line">{word("piano.", 4.6)}</span>
        </p>
      </>}
    </Inscription>
  </>;
});
