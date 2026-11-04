import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useAtomValue, useSetAtom } from "jotai";
import * as THREE from "three";
import { Avatar } from "./Avatar";
import {
  createPianist, keyAtPosition, stepPianist, WALK_LIMIT, WALK_SPEED, surfaceHeightAt,
} from "./pianoMotion";
import {
  pianoActiveAtom, pianoDirectionAtom, pianoJumpAtom, pianoReplayAtom,
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
  const locomotion = useRef({ speed: 0, phase: 0 });
  const landing = useRef({ previous: false, remaining: 0 });
  const touchDirection = useAtomValue(pianoDirectionAtom);
  const touchJump = useAtomValue(pianoJumpAtom);
  const lastTouchJump = useRef(touchJump);
  const sound = useAtomValue(pianoSoundAtom);
  const replay = useAtomValue(pianoReplayAtom);
  const setActive = useSetAtom(pianoActiveAtom);
  const setDirection = useSetAtom(pianoDirectionAtom);
  const enabled = active && !menuOpened;
  const scale = size.width < 768 ? 1.05 : 1.65;

  useEffect(() => {
    setActive(enabled);
    input.current.clear();
    setDirection({ x: 0, z: 0 });
    return () => { setActive(false); input.current.clear(); setDirection({ x: 0, z: 0 }); };
  }, [enabled, setActive, setDirection]);

  useEffect(() => {
    if (!active) return;
    player.current = createPianist();
    facing.current = Math.PI;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      player.current.y = 0;
      player.current.hasLanded = true;
      player.current.landed = true;
    }
    pressed.current = -1;
    lastNote.current = -1;
    setAnimation("Luc_Falling");
    locomotion.current.speed = 0;
    landing.current = { previous: false, remaining: 0 };
  }, [active, replay]);

  useEffect(() => {
    if (!enabled) return;
    const keys = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS", "Space"]);
    const editable = (target) => target instanceof HTMLElement &&
      (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
    const down = (event) => {
      if (!keys.has(event.code) || editable(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();
      input.current.add(event.code);
    };
    const up = (event) => { input.current.delete(event.code); };
    const clear = () => {
      input.current.clear(); setDirection({ x: 0, z: 0 });
      player.current.velocityX = player.current.velocityZ = 0;
      player.current.jumpBuffer = 0;
    };
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
    const keyboardX = Number(keys.has("ArrowRight") || keys.has("KeyD")) - Number(keys.has("ArrowLeft") || keys.has("KeyA"));
    const keyboardZ = Number(keys.has("ArrowDown") || keys.has("KeyS")) - Number(keys.has("ArrowUp") || keys.has("KeyW"));
    const jumpRequested = touchJump !== lastTouchJump.current;
    lastTouchJump.current = touchJump;
    const controls = enabled ? {
      x: touchDirection.x + keyboardX,
      z: touchDirection.z + keyboardZ,
      jump: jumpRequested || keys.has("Space"),
    } : { x: 0, z: 0, jump: false };
    const current = player.current;
    stepPianist(current, controls, delta);
    const followLimit = WALK_LIMIT - (size.width < 768 ? 1.6 : 2.6);
    const followX = THREE.MathUtils.clamp(current.x, -followLimit, followLimit);
    world.current.position.x = THREE.MathUtils.damp(world.current.position.x, -followX, 4, delta);
    const speed = Math.hypot(current.velocityX, current.velocityZ);
    locomotion.current.speed = current.landed ? Math.min(1, speed / WALK_SPEED) : 0;
    locomotion.current.phase = current.distance * 15;
    const nextAnimation = current.landed ? "Luc_Standing" : "Luc_Falling";
    if (nextAnimation !== animation) setAnimation(nextAnimation);
    if (speed > 0.08) facing.current = Math.atan2(current.velocityX, current.velocityZ);
    const turn = Math.atan2(Math.sin(facing.current - character.current.rotation.y), Math.cos(facing.current - character.current.rotation.y));
    character.current.rotation.y += turn * (1 - Math.exp(-14 * delta));
    if (current.landed && !landing.current.previous) landing.current.remaining = 0.16;
    landing.current.previous = current.landed;
    landing.current.remaining = Math.max(0, landing.current.remaining - delta);
    const squash = Math.sin(landing.current.remaining / 0.16 * Math.PI) * 0.08;
    const baseScale = size.width < 768 ? 0.34 : 0.27;
    character.current.scale.set(baseScale * (1 + squash / 2), baseScale * (1 - squash), baseScale * (1 + squash / 2));
    const bob = current.landed ? Math.abs(Math.sin(current.distance * 15)) * 0.025 * locomotion.current.speed : 0;
    character.current.position.set(current.x, 0.05 + current.y + bob, current.z);
    const floor = surfaceHeightAt(current.x, current.z);
    const altitude = Math.max(0, current.y - floor);
    shadow.current.position.set(current.x, floor + 0.12, current.z);
    shadow.current.material.opacity = Math.max(0.02, 0.2 - altitude * 0.06);
    shadow.current.scale.setScalar(1 + altitude * 0.15);
    pressed.current = current.landed ? keyAtPosition(current.x, current.z) : -1;
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
            <Avatar animation={animation} locomotion={locomotion} />
          </group>
        )}
      </group>
    </group>
  );
}
