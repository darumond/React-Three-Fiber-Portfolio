import { useEffect, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { KEY_WIDTH, WHITE_KEY_COUNT, BLACK_KEY_AFTER } from "./pianoMotion";
import { GrandPiano } from "./GrandPiano";

const IVORY = new THREE.Color("#f4f0e6");
const PRESSED = new THREE.Color("#e3cb95");
const EBONY = new THREE.Color("#0a0b0d");
const EBONY_PRESSED = new THREE.Color("#302b24");

function WhiteKey({ index, pressed }) {
  const key = useRef();
  useFrame((_, delta) => {
    const amount = pressed.current === index ? 1 : 0;
    key.current.position.y = THREE.MathUtils.damp(key.current.position.y, -amount * 0.075, 18, delta);
    key.current.rotation.x = THREE.MathUtils.damp(key.current.rotation.x, amount * 0.025, 18, delta);
    key.current.children[0].material.color.lerp(amount ? PRESSED : IVORY, 1 - Math.exp(-12 * delta));
  });
  return <group ref={key} position-x={(index - (WHITE_KEY_COUNT - 1) / 2) * KEY_WIDTH}>
    <RoundedBox args={[KEY_WIDTH - 0.008, 0.22, 3.6]} radius={0.012} smoothness={2} position-z={0.35} castShadow receiveShadow>
      <meshStandardMaterial color="#f4f0e6" roughness={0.25} />
    </RoundedBox>
  </group>;
}
function BlackKey({ index, pressed }) {
  const key = useRef();
  useFrame((_, delta) => {
    const amount = pressed.current === WHITE_KEY_COUNT + index ? 1 : 0;
    key.current.position.y = THREE.MathUtils.damp(key.current.position.y, -amount * 0.045, 18, delta);
    key.current.children[0].material.color.lerp(amount ? EBONY_PRESSED : EBONY, 1 - Math.exp(-12 * delta));
  });
  return <group ref={key}>
    <RoundedBox args={[KEY_WIDTH * 0.58, 0.31, 2.25]} radius={0.016} smoothness={2}
      position={[(index - (WHITE_KEY_COUNT - 2) / 2) * KEY_WIDTH, 0.24, -0.58]} castShadow receiveShadow>
      <meshStandardMaterial color="#0a0b0d" roughness={0.28} />
    </RoundedBox>
  </group>;
}

export function PianoEnvironment({ pressed, lighting, worldScale = 1, journey }) {
  const keyLight = useRef();
  const lightTarget = useRef();
  const fill = useRef();
  const hemisphere = useRef();
  useEffect(() => { keyLight.current.target = lightTarget.current; }, []);
  useFrame(() => {
    keyLight.current.intensity = 2.2 * lighting.current;
    fill.current.intensity = 0.8 * worldScale * worldScale * lighting.current;
    hemisphere.current.intensity = 0.6 * lighting.current;
  });
  return <group>
    <GrandPiano journey={journey}>
      {Array.from({ length: WHITE_KEY_COUNT }, (_, index) => <WhiteKey key={index} index={index} pressed={pressed} />)}
      {Array.from({ length: WHITE_KEY_COUNT - 1 }, (_, index) => BLACK_KEY_AFTER.includes(index % 7) &&
        <BlackKey key={index} index={index} pressed={pressed} />)}
    </GrandPiano>
    <object3D ref={lightTarget} />
    <directionalLight ref={keyLight} castShadow color="#fff8ed" position={[-4, 10, 6]} intensity={0}
      shadow-mapSize={[2048, 2048]} shadow-camera-left={-20 * worldScale} shadow-camera-right={20 * worldScale}
      shadow-camera-top={32 * worldScale} shadow-camera-bottom={-12 * worldScale}
      shadow-camera-near={0.01} shadow-camera-far={30} shadow-normalBias={0.02 * worldScale} shadow-bias={-0.0001} />
    <pointLight ref={fill} position={[4, 5, 3]} color="#e0e9ff" intensity={0} distance={12 * worldScale} decay={2} />
    <hemisphereLight ref={hemisphere} args={["#e4ebf5", "#39312c", 0]} />
  </group>;
}
