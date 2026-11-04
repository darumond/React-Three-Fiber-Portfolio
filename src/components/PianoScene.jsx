import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useAtomValue, useSetAtom } from "jotai";
import * as THREE from "three";
import { Avatar } from "./Avatar";
import {
  createPianist, keyAtPosition, stepPianist, WALK_LIMIT,
} from "./pianoMotion";
import {
  pianoActiveAtom, pianoDirectionAtom, pianoReplayAtom,
  pianoSoundAtom, playPianoNote,
} from "./pianoState";
import { PianoEnvironment } from "./PianoEnvironment";

export function PianoScene({ active, menuOpened, viewportHeight }) {
  const { size } = useThree();
  const world = useRef();
  const input = useRef(new Set());
  const character = useRef();
  const shadow = useRef();
  const player = useRef(createPianist());
  const pressed = useRef(-1);
  const lastNote = useRef(-1);
  const facing = useRef(Math.PI);
  const [animation, setAnimation] = useState("Luc_Falling");
  const [walking, setWalking] = useState(false);
  const touchDirection = useAtomValue(pianoDirectionAtom);
  const sound = useAtomValue(pianoSoundAtom);
  const replay = useAtomValue(pianoReplayAtom);
  const setActive = useSetAtom(pianoActiveAtom);
  const setDirection = useSetAtom(pianoDirectionAtom);
  const enabled = active && !menuOpened;
  const scale = size.width < 768 ? 1.05 : 1.65;

  useEffect(() => {
    setActive(enabled);
    input.current.clear();
    setDirection(0);
    return () => { setActive(false); input.current.clear(); setDirection(0); };
  }, [enabled, setActive, setDirection]);

  useEffect(() => {
    if (!active) return;
    player.current = createPianist();
    facing.current = Math.PI;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      player.current.y = 0;
      player.current.landed = true;
    }
    pressed.current = -1;
    lastNote.current = -1;
    setAnimation("Luc_Falling");
    setWalking(false);
  }, [active, replay]);

  useEffect(() => {
    if (!enabled) return;
    const keys = new Set(["ArrowLeft", "ArrowRight", "KeyA", "KeyD"]);
    const editable = (target) => target instanceof HTMLElement &&
      (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
    const down = (event) => {
      if (!keys.has(event.code) || editable(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();
      input.current.add(event.code);
    };
    const up = (event) => { input.current.delete(event.code); };
    const clear = () => { input.current.clear(); setDirection(0); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", clear);
    return () => {
      clear();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", clear);
    };
  }, [enabled, setDirection]);

  useFrame((_, delta) => {
    if (!active || !character.current) return;
    const keys = input.current;
    const keyboard = Number(keys.has("ArrowRight") || keys.has("KeyD")) - Number(keys.has("ArrowLeft") || keys.has("KeyA"));
    const direction = enabled ? (touchDirection || keyboard) : 0;
    const current = player.current;
    const oldX = current.x;
    stepPianist(current, direction, delta);
    const followLimit = WALK_LIMIT - (size.width < 768 ? 1.6 : 2.6);
    const followX = THREE.MathUtils.clamp(current.x, -followLimit, followLimit);
    world.current.position.x = THREE.MathUtils.damp(world.current.position.x, -followX, 4, delta);
    const moving = current.landed && Math.abs(current.x - oldX) > 0.0001;
    if (moving !== walking) setWalking(moving);
    const nextAnimation = current.landed ? "Luc_Standing" : "Luc_Falling";
    if (nextAnimation !== animation) setAnimation(nextAnimation);
    facing.current = moving ? (direction < 0 ? -Math.PI / 2 : Math.PI / 2) : Math.PI;
    character.current.rotation.y = THREE.MathUtils.damp(character.current.rotation.y, facing.current, 10, delta);
    const bob = moving ? Math.abs(Math.sin(current.distance * 15)) * 0.045 : 0;
    character.current.position.set(current.x, 0.05 + current.y + bob, 1.68);
    shadow.current.position.x = current.x;
    shadow.current.material.opacity = current.landed ? 0.2 : Math.max(0.01, 0.2 - current.y * 0.03);
    shadow.current.scale.setScalar(current.landed ? 1 : 1 + current.y * 0.13);
    pressed.current = current.landed ? keyAtPosition(current.x) : -1;
    if (pressed.current !== lastNote.current) {
      lastNote.current = pressed.current;
      if (sound && enabled && pressed.current >= 0) playPianoNote(pressed.current);
    }
  });

  return (
    <group position={[0, -viewportHeight + 0.15, 0]} scale={scale} visible={active}>
      <group ref={world} position-x={-0.25}>
        <PianoEnvironment pressed={pressed} />
        <mesh ref={shadow} rotation-x={-Math.PI / 2} position={[0.25, 0.12, 1.68]}>
          <circleGeometry args={[0.18, 24]} />
          <meshBasicMaterial color="#3d3e1f" transparent opacity={0.2} depthWrite={false} />
        </mesh>
        {active && (
          <group ref={character} position={[0.25, 6, 1.68]} rotation-y={Math.PI} scale={size.width < 768 ? 0.34 : 0.27}>
            <Avatar animation={animation} walking={walking} />
          </group>
        )}
      </group>
    </group>
  );
}
