import { useEffect, useMemo, useRef, useState } from "react";
import { RoundedBox, Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useAtomValue, useSetAtom } from "jotai";
import * as THREE from "three";
import { Avatar } from "./Avatar";
import {
  createPianist, keyAtPosition, KEY_WIDTH,
  stepPianist, WHITE_KEY_COUNT,
} from "./pianoMotion";
import {
  pianoActiveAtom, pianoDirectionAtom, pianoReplayAtom,
  pianoSoundAtom, playPianoNote,
} from "./pianoState";
import pianoFont from "../Fonts/Poppins/Poppins-Regular.ttf";

const IVORY = "#fff8ed";
const INK = "#242239";
const GOLD = "#c6a46b";
const ACCENT = "#b8a0ec";
const ivoryColor = new THREE.Color(IVORY);
const pressedColor = new THREE.Color(ACCENT);
const BLACK_KEY_AFTER = [0, 1, 3, 4, 5];

function Box({ size, color = INK, metalness = 0, roughness = 0.3, ...props }) {
  return (
    <mesh castShadow receiveShadow {...props}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </mesh>
  );
}

function PianoKey({ index, pressed }) {
  const key = useRef();
  useFrame((_, delta) => {
    const amount = pressed.current === index ? 1 : 0;
    key.current.position.y = THREE.MathUtils.damp(key.current.position.y, -amount * 0.075, 18, delta);
    key.current.rotation.x = THREE.MathUtils.damp(key.current.rotation.x, amount * 0.035, 18, delta);
    key.current.material.color.lerp(amount ? pressedColor : ivoryColor, 1 - Math.exp(-12 * delta));
  });
  return (
    <mesh ref={key} castShadow receiveShadow position-x={(index - (WHITE_KEY_COUNT - 1) / 2) * KEY_WIDTH}>
      <boxGeometry args={[KEY_WIDTH - 0.018, 0.22, 2.5]} />
      <meshStandardMaterial color={IVORY} roughness={0.22} />
    </mesh>
  );
}

function GrandPiano({ pressed }) {
  const shape = useMemo(() => {
    const outline = new THREE.Shape();
    outline.moveTo(-7.3, 0.2);
    outline.lineTo(7.3, 0.2);
    outline.lineTo(7.3, 1.3);
    outline.bezierCurveTo(7.3, 3.8, 3.2, 6.4, -0.6, 6.4);
    outline.lineTo(-7.3, 6.4);
    outline.closePath();
    return outline;
  }, []);
  const extrude = { depth: 0.48, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.06, bevelThickness: 0.04, curveSegments: 24 };
  return (
    <group>
      {/* Curved grand-piano case, soundboard and raised lid. */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.55} castShadow receiveShadow>
        <extrudeGeometry args={[shape, extrude]} />
        <meshStandardMaterial color={INK} metalness={0.15} roughness={0.22} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.035} scale={[0.965, 0.965, 0.12]} receiveShadow>
        <extrudeGeometry args={[shape, extrude]} />
        <meshStandardMaterial color={GOLD} metalness={0.65} roughness={0.35} />
      </mesh>
      {Array.from({ length: 35 }, (_, i) => (
        <Box key={i} size={[0.013, 0.016, 4.8]} color="#ead4a7" metalness={0.6} position={[-6.5 + i * 0.25, 0.065, -3.1]} />
      ))}
      <group position={[-7.3, 0.25, 0]} rotation-z={0.22}>
        <mesh position-x={7.3} rotation-x={-Math.PI / 2} castShadow>
          <extrudeGeometry args={[shape, { ...extrude, depth: 0.12 }]} />
          <meshStandardMaterial color="#302b49" metalness={0.18} roughness={0.2} />
        </mesh>
        <Box size={[0.045, 0.05, 5.8]} color={GOLD} position={[0.06, -0.03, -3.15]} />
      </group>
      <Box size={[0.09, 2.7, 0.09]} color={GOLD} position={[4.7, 1.25, -2.1]} rotation-z={-0.16} />
      <RoundedBox args={[15.05, 0.62, 3.4]} radius={0.13} smoothness={3} position={[0, -0.36, 0.65]} castShadow receiveShadow>
        <meshStandardMaterial color={INK} roughness={0.25} metalness={0.12} />
      </RoundedBox>
      <Box size={[14.1, 0.06, 0.07]} color={GOLD} position={[0, 0.13, -0.49]} />
      <Box size={[14.1, 0.055, 0.05]} color={GOLD} position={[0, -0.18, 2.32]} />
      <group position={[0, 0, 0.94]}>
        {Array.from({ length: WHITE_KEY_COUNT }, (_, index) => (
          <PianoKey key={index} index={index} pressed={pressed} />
        ))}
        {Array.from({ length: WHITE_KEY_COUNT - 1 }, (_, index) => (
          BLACK_KEY_AFTER.includes(index % 7) && (
            <RoundedBox key={index} args={[0.3, 0.28, 1.5]} radius={0.035} smoothness={2}
              position={[(index - (WHITE_KEY_COUNT - 2) / 2) * KEY_WIDTH, 0.23, -0.5]} castShadow>
              <meshStandardMaterial color="#171522" roughness={0.25} />
            </RoundedBox>
          )
        ))}
      </group>
      {[-7.15, 7.15].map((x) => (
        <Box key={x} size={[0.35, 0.4, 3.1]} position={[x, 0.04, 0.8]} />
      ))}
      {[[-6.3, 1.1], [6.3, 1.1], [-4.4, -4.8]].map(([x, z]) => (
        <group key={x} position={[x, -1.6, z]}>
          <Box size={[0.42, 2.2, 0.42]} />
          <Box size={[0.46, 0.18, 0.46]} color={GOLD} metalness={0.7} position-y={-1.05} />
        </group>
      ))}
      <Box size={[0.17, 1.2, 0.17]} color={GOLD} position={[0, -1.05, 0.1]} />
      <Box size={[1.4, 0.13, 0.65]} color={GOLD} position={[0, -1.65, 0.45]} />
      <Text font={pianoFont} fontSize={0.22} letterSpacing={0.3} color="#e7c88f" position={[0, 0.2, -0.31]} rotation-x={-Math.PI / 2}>
        L U C
      </Text>
      <mesh rotation-x={-Math.PI / 2} position={[0, -2.85, -0.7]} receiveShadow>
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial color="#84769f" roughness={1} />
      </mesh>
    </group>
  );
}

export function PianoScene({ active, menuOpened, viewportHeight }) {
  const { viewport, camera, size } = useThree();
  const input = useRef(new Set());
  const character = useRef();
  const shadow = useRef();
  const player = useRef(createPianist());
  const pressed = useRef(-1);
  const lastNote = useRef(-1);
  const facing = useRef(0);
  const [animation, setAnimation] = useState("Luc_Falling");
  const [walking, setWalking] = useState(false);
  const touchDirection = useAtomValue(pianoDirectionAtom);
  const sound = useAtomValue(pianoSoundAtom);
  const replay = useAtomValue(pianoReplayAtom);
  const setActive = useSetAtom(pianoActiveAtom);
  const setDirection = useSetAtom(pianoDirectionAtom);
  const enabled = active && !menuOpened;
  const visibleViewport = viewport.getCurrentViewport(camera, [0, 0, 1]);
  const scale = Math.min(visibleViewport.width / 17.8, visibleViewport.height / 10, 0.95);

  useEffect(() => {
    setActive(enabled);
    input.current.clear();
    setDirection(0);
    return () => { setActive(false); input.current.clear(); setDirection(0); };
  }, [enabled, setActive, setDirection]);

  useEffect(() => {
    if (!active) return;
    player.current = createPianist();
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
    const moving = current.landed && Math.abs(current.x - oldX) > 0.0001;
    if (moving !== walking) setWalking(moving);
    const nextAnimation = current.landed ? "Luc_Standing" : "Luc_Falling";
    if (nextAnimation !== animation) setAnimation(nextAnimation);
    if (moving) facing.current = direction < 0 ? -Math.PI / 2 : Math.PI / 2;
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
    <group position={[0, -viewportHeight - (size.width < 768 ? 0.1 : 0.7), 0]} scale={scale} visible={active}>
      <directionalLight castShadow position={[-4, 9, 5]} intensity={1.8} shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-0.001} />
      <pointLight position={[5, 4, -3]} intensity={0.8} color="#dbb5ff" />
      <GrandPiano pressed={pressed} />
      <mesh ref={shadow} rotation-x={-Math.PI / 2} position={[0.25, 0.12, 1.68]}>
        <circleGeometry args={[0.26, 24]} />
        <meshBasicMaterial color="#393047" transparent opacity={0.2} depthWrite={false} />
      </mesh>
      {active && (
        <group ref={character} position={[0.25, 6, 1.68]} scale={0.5}>
          <Avatar animation={animation} walking={walking} />
        </group>
      )}
    </group>
  );
}
