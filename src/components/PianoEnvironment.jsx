import { useEffect, useMemo, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { KEY_WIDTH, WHITE_KEY_COUNT } from "./pianoMotion";

const GOLD = "#b2944c";
const GREEN = "#526f3d";
const IVORY = new THREE.Color("#e9dbb3");
const PRESSED = new THREE.Color("#f6d78b");
const BLACK_KEY_AFTER = [0, 1, 3, 4, 5];

function makeTexture(pages = false) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = pages ? "#d8c69b" : "#ddd8c3";
  ctx.fillRect(0, 0, 256, 256);
  let seed = 71;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 1500; i++) {
    ctx.fillStyle = `rgba(52, 37, 11, ${random() * (pages ? 0.15 : 0.06)})`;
    ctx.fillRect(random() * 256, random() * 256, pages ? 256 : 12 + random() * 110, 0.5);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Block({ size, color = GREEN, radius = 0.03, map, metalness = 0, roughness = 0.55, ...props }) {
  return (
    <RoundedBox args={size} radius={radius} smoothness={2} castShadow receiveShadow {...props}>
      <meshStandardMaterial color={color} map={map} metalness={metalness} roughness={roughness} />
    </RoundedBox>
  );
}

function Candle({ position, height = 1, color = "#e8d9ad", phase = 0 }) {
  const flame = useRef();
  useFrame(({ clock }) => {
    const flicker = 1 + Math.sin(clock.elapsedTime * 8 + phase) * 0.06;
    flame.current.scale.set(0.07 * flicker, 0.19 / flicker, 0.07);
  });
  return (
    <group position={position}>
      <mesh position-y={height / 2} castShadow receiveShadow>
        <cylinderGeometry args={[0.17, 0.185, height, 16]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position-y={0.015} rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[0.32, 24]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {[0.3, 1.7, 3.8, 5].map((angle, i) => (
        <mesh key={angle} position={[Math.sin(angle) * 0.17, height - 0.12 - i * 0.05, Math.cos(angle) * 0.17]}>
          <capsuleGeometry args={[0.035, 0.16 + i * 0.05, 3, 6]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
      <mesh position-y={height + 0.025}>
        <cylinderGeometry args={[0.012, 0.012, 0.1, 6]} />
        <meshBasicMaterial color="#362616" />
      </mesh>
      <mesh ref={flame} position-y={height + 0.18} scale={[0.07, 0.19, 0.07]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial color="#ffd17d" toneMapped={false} />
      </mesh>
      <mesh position-y={height + 0.14} scale={[0.035, 0.09, 0.035]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#fff7cf" toneMapped={false} />
      </mesh>
    </group>
  );
}

function BookStack({ position, count = 5, rotation = 0, pages }) {
  const covers = ["#7a6141", "#806247", "#435338", "#927546", "#654237"];
  return (
    <group position={position} rotation-y={rotation}>
      {Array.from({ length: count }, (_, i) => (
        <group key={i} position={[Math.sin(i * 3) * 0.09, i * 0.25, Math.cos(i * 2) * 0.07]} rotation-y={Math.sin(i * 5) * 0.08}>
          <Block size={[1.65, 0.2, 1.1]} position-y={0.12} color="#e1d4b3" map={pages} radius={0.015} />
          <Block size={[1.75, 0.045, 1.16]} position-y={0.015} color={covers[i % covers.length]} radius={0.01} />
          <Block size={[1.75, 0.045, 1.16]} position-y={0.235} color={covers[i % covers.length]} radius={0.01} />
          <Block size={[0.045, 0.24, 1.16]} position={[-0.87, 0.12, 0]} color={covers[i % covers.length]} radius={0.01} />
        </group>
      ))}
    </group>
  );
}

function WhiteKey({ index, pressed }) {
  const key = useRef();
  useFrame((_, delta) => {
    const amount = pressed.current === index ? 1 : 0;
    key.current.position.y = THREE.MathUtils.damp(key.current.position.y, -amount * 0.075, 18, delta);
    key.current.rotation.x = THREE.MathUtils.damp(key.current.rotation.x, amount * 0.025, 18, delta);
    key.current.children[0].material.color.lerp(amount ? PRESSED : IVORY, 1 - Math.exp(-12 * delta));
  });
  return (
    <group ref={key} position-x={(index - (WHITE_KEY_COUNT - 1) / 2) * KEY_WIDTH}>
      <Block size={[KEY_WIDTH - 0.015, 0.22, 3.6]} position-z={0.35} color="#e9dbb3" radius={0.015} roughness={0.4} />
      <Block size={[0.18, 0.006, 0.22]} position={[0, 0.114, 1.22]} color="#c6ad55" radius={0.005} roughness={0.9} />
      <Block size={[0.055, 0.008, 0.075]} position={[0, 0.12, 1.22]} color="#74642f" radius={0.002} />
    </group>
  );
}

export function PianoEnvironment({ pressed }) {
  const grain = useMemo(() => makeTexture(), []);
  const pages = useMemo(() => makeTexture(true), []);
  useEffect(() => () => { grain.dispose(); pages.dispose(); }, [grain, pages]);
  return (
    <group>
      {/* The keyboard extends beyond the frame: this is a place to explore. */}
      <Block size={[15.1, 0.65, 5]} position={[0, -0.43, 0.45]} color="#586a3d" map={grain} radius={0.1} />
      <Block size={[15.4, 0.18, 0.65]} position={[0, -0.12, 2.55]} color="#667b43" map={grain} radius={0.08} />
      <Block size={[15.4, 0.055, 0.06]} position={[0, -0.1, 2.89]} color={GOLD} metalness={0.5} radius={0.01} />
      <Block size={[15.5, 12, 0.7]} position={[0, -6.5, 2.5]} color="#426332" map={grain} radius={0.08} />
      <Block size={[15.6, 0.12, 0.95]} position={[0, -0.77, 2.7]} color="#91a25a" radius={0.04} />
      <Block size={[15.5, 1.6, 0.5]} position={[0, 0.8, -1.75]} color="#536b39" map={grain} radius={0.04} />
      <Block size={[15.55, 0.065, 0.065]} position={[0, 0.2, -1.45]} color={GOLD} metalness={0.45} radius={0.01} />
      <Block size={[15.6, 0.13, 2.7]} position={[0, 1.62, -2.75]} color="#79613e" map={grain} radius={0.045} />
      <Block size={[15.65, 0.065, 0.09]} position={[0, 1.7, -1.43]} color="#c6ab69" metalness={0.4} radius={0.015} />
      <Block size={[15.3, 0.55, 0.16]} position={[0, 1.98, -3.6]} color="#3f4d2b" map={grain} radius={0.03} />
      {Array.from({ length: WHITE_KEY_COUNT }, (_, index) => <WhiteKey key={index} index={index} pressed={pressed} />)}
      {Array.from({ length: WHITE_KEY_COUNT - 1 }, (_, index) => BLACK_KEY_AFTER.includes(index % 7) && (
        <Block key={index} size={[0.29, 0.31, 2.25]} position={[(index - (WHITE_KEY_COUNT - 2) / 2) * KEY_WIDTH, 0.24, -0.58]}
          color="#24241b" roughness={0.3} radius={0.025} />
      ))}
      {[-7.2, 7.2].map((x) => <Block key={x} size={[0.35, 0.45, 4.1]} position={[x, 0, 0.34]} map={grain} radius={0.08} />)}

      {/* Oversized music books and wax make the miniature scale readable. */}
      <BookStack position={[-3.5, 1.71, -2.6]} count={7} rotation={0.06} pages={pages} />
      <BookStack position={[1.9, 1.71, -3]} count={10} rotation={-0.12} pages={pages} />
      <BookStack position={[5.7, 1.71, -2.8]} count={5} rotation={0.1} pages={pages} />
      <BookStack position={[-6.3, 1.71, -2.5]} count={4} rotation={-0.2} pages={pages} />
      <Candle position={[-1.65, 1.71, -2]} height={1.05} color="#c88e83" phase={1} />
      <Candle position={[-1.13, 1.71, -2.45]} height={1.5} color="#b77c73" phase={2} />
      <Candle position={[-0.55, 1.71, -2.3]} height={0.65} color="#e9d3a5" phase={3} />
      <Candle position={[0.1, 1.71, -2.05]} height={1.15} color="#e6d8ab" phase={4} />
      <Candle position={[4.1, 1.71, -2.05]} height={0.75} color="#cb9785" phase={5} />
      <Candle position={[4.6, 1.71, -2.4]} height={1.4} color="#e6d8ab" phase={6} />
      <Candle position={[-5.1, 1.71, -2.05]} height={0.55} color="#e9d3a5" phase={7} />

      <Block size={[60, 25, 0.5]} position={[0, 5, -8]} color="#b0a887" map={grain} radius={0.01} roughness={1} />
      {[-10, -5, 0, 5, 10].map((x) => (
        <Block key={x} size={[0.075, 18, 0.2]} position={[x, 4, -7.7]} color="#93815c" radius={0.01} />
      ))}
      <directionalLight castShadow color="#fff0cb" position={[-4, 8, 2]} intensity={2.2}
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-11} shadow-camera-right={11}
        shadow-camera-top={10} shadow-camera-bottom={-5} shadow-normalBias={0.025} shadow-bias={-0.0001} />
      <pointLight position={[-0.9, 3.3, -1]} color="#ffb858" intensity={2} distance={8} decay={2} />
      <pointLight position={[4.2, 3.2, -1]} color="#ffd68c" intensity={1.5} distance={7} decay={2} />
      <hemisphereLight args={["#f5e2b7", "#44452d", 0.7]} />
    </group>
  );
}
