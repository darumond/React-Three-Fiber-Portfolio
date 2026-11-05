import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useAtomValue, useSetAtom } from "jotai";
import * as THREE from "three";
import { Avatar } from "./Avatar";
import {
  createPianist, keyAtPosition, stepPianist, WALK_LIMIT, PIANIST_START_X, RUN_SPEED, RUN_STRIDE, surfaceHeightAt,
} from "./pianoMotion";
import {
  pianoActiveAtom, pianoDirectionAtom, pianoJumpAtom, pianoReplayAtom,
  pianoSoundAtom, playPianoNote,
} from "./pianoState";
import { PianoEnvironment } from "./PianoEnvironment";

export function PianoScene({ active, atHome, menuOpened, cameraFollow, lighting, worldScale }) {
  const { size } = useThree();
  const input = useRef(new Set());
  const character = useRef();
  const shadow = useRef();
  const player = useRef(createPianist());
  const journey = useRef({ furthestX: PIANIST_START_X, landed: false, generation: 0 });
  const pressed = useRef(-1);
  const lastNote = useRef(-1);
  const facing = useRef(Math.PI);
  const [entered, setEntered] = useState(false);
  const [animation, setAnimation] = useState("Luc_Falling");
  const locomotion = useRef({ speed: 0, phase: 0 });
  const landing = useRef({ previous: false, remaining: 0 });
  const touchDirection = useAtomValue(pianoDirectionAtom);
  const touchJump = useAtomValue(pianoJumpAtom);
  const lastTouchJump = useRef(touchJump);
  const sound = useAtomValue(pianoSoundAtom);
  const replay = useAtomValue(pianoReplayAtom);
  const lastReplay = useRef(replay);
  const setActive = useSetAtom(pianoActiveAtom);
  const setDirection = useSetAtom(pianoDirectionAtom);
  const enabled = active && !menuOpened;
  const avatarScale = size.width < 768 ? 0.38 : 0.34;
  const startCameraX = Math.max(PIANIST_START_X, -WALK_LIMIT + (size.width < 768 ? 0.95 : 2));

  useEffect(() => {
    setActive(enabled);
    input.current.clear();
    setDirection({ x: 0, z: 0 });
    return () => { setActive(false); input.current.clear(); setDirection({ x: 0, z: 0 }); };
  }, [enabled, setActive, setDirection]);

  useEffect(() => {
    if (atHome) {
      setEntered(false);
      pressed.current = -1;
      cameraFollow.current = { x: startCameraX, z: 0 };
    }
  }, [atHome, cameraFollow, startCameraX]);

  useEffect(() => {
    if (!active || (entered && lastReplay.current === replay)) return;
    lastReplay.current = replay;
    setEntered(true);
    cameraFollow.current = { x: startCameraX, z: 0 };
    player.current = createPianist();
    journey.current = { furthestX: PIANIST_START_X, landed: false, generation: journey.current.generation + 1 };
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
  }, [active, replay, entered, cameraFollow, startCameraX]);

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
    if (!entered || !character.current) return;
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
    journey.current.landed = current.hasLanded;
    if (enabled && current.hasLanded) journey.current.furthestX = Math.max(journey.current.furthestX, current.x);
    const followLimit = WALK_LIMIT - (size.width < 768 ? 0.95 : 2);
    const followX = THREE.MathUtils.clamp(current.x, -followLimit, followLimit);
    cameraFollow.current.x = THREE.MathUtils.damp(cameraFollow.current.x, followX, 4, delta);
    const followZ = THREE.MathUtils.clamp((1.68 - current.z) * 0.4, -0.12, 0.9);
    cameraFollow.current.z = THREE.MathUtils.damp(cameraFollow.current.z, followZ, 3, delta);
    const speed = Math.hypot(current.velocityX, current.velocityZ);
    locomotion.current.speed = current.landed ? Math.min(1, speed / RUN_SPEED) : 0;
    locomotion.current.phase = current.distance / (avatarScale * RUN_STRIDE);
    const nextAnimation = current.landed ? "Luc_Standing" : "Luc_Falling";
    if (nextAnimation !== animation) setAnimation(nextAnimation);
    if (speed > 0.08) facing.current = Math.atan2(current.velocityX, current.velocityZ);
    const turn = Math.atan2(Math.sin(facing.current - character.current.rotation.y), Math.cos(facing.current - character.current.rotation.y));
    character.current.rotation.y += turn * (1 - Math.exp(-14 * delta));
    if (current.landed && !landing.current.previous) landing.current.remaining = 0.16;
    landing.current.previous = current.landed;
    landing.current.remaining = Math.max(0, landing.current.remaining - delta);
    const squash = Math.sin(landing.current.remaining / 0.16 * Math.PI) * 0.08;
    const baseScale = avatarScale;
    character.current.scale.set(baseScale * (1 + squash / 2), baseScale * (1 - squash), baseScale * (1 + squash / 2));
    character.current.position.set(current.x, 0.05 + current.y, current.z);
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
    <group>
      <group>
        <PianoEnvironment pressed={pressed} lighting={lighting} worldScale={worldScale} journey={journey} />
        <mesh ref={shadow} visible={entered} rotation-x={-Math.PI / 2} position={[PIANIST_START_X, 0.12, 1.68]}>
          <circleGeometry args={[0.18, 24]} />
          <meshBasicMaterial color="#3d3e1f" transparent opacity={0.2} depthWrite={false} />
        </mesh>
        {entered && (
          <group ref={character} position={[PIANIST_START_X, 6, 1.68]} rotation-y={Math.PI} scale={avatarScale}>
            <Avatar animation={animation} locomotion={locomotion} />
          </group>
        )}
      </group>
    </group>
  );
}
