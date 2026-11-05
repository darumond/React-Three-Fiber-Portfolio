import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const GOLD = "#ae8a43";
const BLACK = "#080a0d";

// Plan view of a concert grand: a straight bass spine and a curved treble rim.
// The 15.6 × 27.4 proportion follows the Steinway Model D silhouette.
// Reference: https://www.steinway.com/pianos/steinway/grand/model-d
function outline() {
  const shape = new THREE.Shape();
  shape.moveTo(-7.8, 1.9);
  shape.lineTo(7.8, 1.9);
  shape.lineTo(7.8, 6.7);
  shape.bezierCurveTo(7.8, 10.6, 3.9, 11.5, 2.3, 15.6);
  shape.bezierCurveTo(1.1, 18.6, 1.6, 23.8, -1.5, 24.6);
  shape.bezierCurveTo(-3.3, 25.2, -7.8, 24.8, -7.8, 21.2);
  shape.lineTo(-7.8, 1.9);
  return shape;
}
function insetPath(shape, scale) {
  return new THREE.Path(shape.getPoints(48).map((p) => new THREE.Vector2(p.x * scale, 13 + (p.y - 13) * scale)));
}
function extrude(shape, depth, bevel = 0.05) {
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, steps: 1, curveSegments: 48 });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

function studioReflection() {
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const background = ctx.createLinearGradient(0, 0, 0, 256);
  background.addColorStop(0, "#5d6574"); background.addColorStop(0.48, "#151a24"); background.addColorStop(1, "#080a0e");
  ctx.fillStyle = background; ctx.fillRect(0, 0, 512, 256);
  ctx.shadowBlur = 12; ctx.shadowColor = "#ffffff";
  ctx.fillStyle = "#e8edf5"; ctx.fillRect(66, 26, 24, 165);
  ctx.fillStyle = "#b1bbc9"; ctx.fillRect(220, 40, 12, 145);
  ctx.fillStyle = "#fff7e7"; ctx.fillRect(350, 24, 64, 50);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}
function soundboardTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#c99d60"; ctx.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 2) {
    ctx.strokeStyle = x % 6 ? "#b68b503c" : "#e9c88c80";
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.bezierCurveTo(x + 2, 85, x - 2, 170, x + 1, 256); ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(0.15, 0.15);
  return texture;
}
function nameplateTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024; canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#c2a665"; ctx.strokeStyle = "#c2a665"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(482, 30); ctx.bezierCurveTo(470, 72, 486, 105, 512, 110);
  ctx.bezierCurveTo(538, 105, 554, 72, 542, 30); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(481, 40); ctx.quadraticCurveTo(512, 62, 543, 40); ctx.stroke();
  for (let x = 496; x <= 528; x += 8) { ctx.beginPath(); ctx.moveTo(x, 52); ctx.lineTo(x, 100); ctx.stroke(); }
  ctx.fillRect(489, 109, 46, 5);
  ctx.textAlign = "center"; ctx.font = '54px "Times New Roman", serif';
  ctx.fillText("STEINWAY & SONS", 512, 193);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Rod({ from, to, radius = 0.08, material }) {
  const transform = useMemo(() => {
    const start = new THREE.Vector3(...from), end = new THREE.Vector3(...to);
    return { position: start.clone().add(end).multiplyScalar(0.5), quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize()), length: start.distanceTo(end) };
  }, [from.join(), to.join()]);
  return <mesh position={transform.position} quaternion={transform.quaternion} material={material} castShadow>
    <cylinderGeometry args={[radius, radius, transform.length, 10]} />
  </mesh>;
}
function LacquerBlock({ size, material, radius = 0.06, ...props }) {
  return <RoundedBox args={size} radius={radius} smoothness={2} material={material} castShadow receiveShadow {...props} />;
}
function Strings({ material, bass = false }) {
  const mesh = useRef();
  const strings = useMemo(() => {
    const lines = [];
    for (let note = 0; note < 88; note++) {
      if ((note < 23) !== bass) continue;
      const t = note / 87;
      const wires = note < 23 ? 1 : note < 40 ? 2 : 3;
      for (let wire = 0; wire < wires; wire++) {
        const offset = (wire - (wires - 1) / 2) * 0.045;
        lines.push({ from: new THREE.Vector3(-6.85 + 13.7 * t + offset, 1.02, -3.05), to: new THREE.Vector3(-6.1 + 11.8 * Math.pow(t, 0.8) + offset, 1.03, -22.5 + 16.4 * Math.pow(t, 0.72)) });
      }
    }
    return lines;
  }, [bass]);
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    for (let i = 0; i < strings.length; i++) {
      const { from, to } = strings[i];
      dummy.position.copy(from).add(to).multiplyScalar(0.5);
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
      dummy.scale.set(bass ? 0.024 : 0.012, from.distanceTo(to), bass ? 0.024 : 0.012);
      dummy.updateMatrix(); mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [strings, bass]);
  return <instancedMesh ref={mesh} args={[null, material, strings.length]} frustumCulled={false}>
    <cylinderGeometry args={[1, 1, 1, 5]} />
  </instancedMesh>;
}
function Leg({ x, z, materials }) {
  return <group position={[x, -1.15, z]}>
    <mesh position-y={-3.2} material={materials.black} castShadow><cylinderGeometry args={[0.58, 0.27, 6.4, 4]} /></mesh>
    <mesh position-y={-6.5} material={materials.brass}><cylinderGeometry args={[0.32, 0.32, 0.4, 16]} /></mesh>
    {[-0.16, 0.16].map((offset) => <mesh key={offset} position={[offset, -6.95, 0]} rotation-z={Math.PI / 2} material={materials.brass} castShadow>
      <cylinderGeometry args={[0.28, 0.28, 0.16, 16]} />
    </mesh>)}
  </group>;
}
function Bench({ materials }) {
  return <group position={[0, -3.7, 6.7]}>
    <LacquerBlock size={[8.5, 0.65, 3.7]} material={materials.leather} radius={0.22} />
    <LacquerBlock size={[8, 0.4, 3.25]} position-y={-0.42} material={materials.black} />
    {[-3.6, 3.6].flatMap((x) => [-1.2, 1.2].map((z) => <mesh key={x + "," + z} position={[x, -2.6, z]} material={materials.black} castShadow>
      <boxGeometry args={[0.38, 4.4, 0.38]} />
    </mesh>))}
    {[-2.6, -0.85, 0.85, 2.6].flatMap((x) => [-0.85, 0.85].map((z) => <mesh key={x + "," + z} position={[x, 0.32, z]} material={materials.black}>
      <sphereGeometry args={[0.065, 8, 6]} />
    </mesh>))}
  </group>;
}

export function GrandPiano({ children }) {
  const assets = useMemo(() => {
    const env = studioReflection(), wood = soundboardTexture(), logo = nameplateTexture();
    const black = new THREE.MeshPhysicalMaterial({ color: BLACK, roughness: 0.16, metalness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08, envMap: env, envMapIntensity: 0.65 });
    const brass = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.78, roughness: 0.3, envMap: env });
    const steel = new THREE.MeshStandardMaterial({ color: "#bfc1c5", metalness: 0.9, roughness: 0.34, envMap: env });
    const copper = new THREE.MeshStandardMaterial({ color: "#aa6940", metalness: 0.8, roughness: 0.4, envMap: env });
    const spruce = new THREE.MeshStandardMaterial({ color: "#f1d8a8", map: wood, roughness: 0.65 });
    const leather = new THREE.MeshStandardMaterial({ color: "#121316", roughness: 0.66 });
    const bodyShape = outline(); bodyShape.holes.push(insetPath(bodyShape, 0.945));
    const plateShape = outline(); plateShape.holes.push(insetPath(plateShape, 0.85));
    const soundShape = new THREE.Shape(insetPath(outline(), 0.94).getPoints());
    const rim = extrude(bodyShape, 2.8), plate = extrude(plateShape, 0.12, 0.025), soundboard = extrude(soundShape, 0.12, 0.02), lid = extrude(outline(), 0.14, 0.055);
    lid.translate(7.8, 0, 0);
    return { env, wood, logo, black, brass, steel, copper, spruce, leather, rim, plate, soundboard, lid };
  }, []);
  useEffect(() => () => Object.values(assets).forEach((asset) => asset.dispose()), [assets]);
  return <group name="ConcertGrand">
    <mesh geometry={assets.rim} position-y={-1.1} material={assets.black} castShadow receiveShadow />
    <mesh geometry={assets.soundboard} position-y={0.25} material={assets.spruce} receiveShadow />
    <mesh geometry={assets.plate} position-y={0.64} material={assets.brass} receiveShadow />
    <Strings material={assets.copper} bass />
    <Strings material={assets.steel} />
    {[[-6.9, -21.4], [-3.7, -18.9], [-0.7, -14.8], [3.5, -9.5]].map(([x, z]) =>
      <Rod key={x} from={[x, 0.78, z]} to={[x * 0.75, 0.78, -3.2]} radius={0.16} material={assets.brass} />)}
    <LacquerBlock size={[15.5, 0.65, 4.6]} position={[0, -0.45, 0.4]} material={assets.black} radius={0.09} />
    <LacquerBlock size={[15.5, 0.42, 0.6]} position={[0, -0.12, 2.48]} material={assets.black} />
    <LacquerBlock size={[15.45, 0.025, 0.035]} position={[0, 0.11, 2.65]} material={assets.brass} radius={0.008} />
    <LacquerBlock size={[15.45, 1.65, 0.32]} position={[0, 0.82, -1.92]} material={assets.black} />
    <mesh position={[0, 0.97, -1.752]}>
      <planeGeometry args={[3.2, 0.8]} /><meshBasicMaterial map={assets.logo} transparent toneMapped={false} depthWrite={false} />
    </mesh>
    <LacquerBlock size={[14.3, 0.035, 0.055]} position={[0, 0.42, -1.7]} material={assets.leather} radius={0.008} />
    {[-7.35, 7.35].map((x) => <LacquerBlock key={x} size={[0.65, 0.55, 4.4]} position={[x, 0.05, 0.35]} material={assets.black} radius={0.12} />)}
    {children}
    <group position={[-7.8, 1.78, 0]} rotation-z={0.57} name="RaisedLid">
      <mesh geometry={assets.lid} material={assets.black} castShadow receiveShadow />
    </group>
    <Rod from={[4.8, 1.72, -9.2]} to={[2.3, 8.25, -9.2]} radius={0.095} material={assets.black} />
    {[-4, -9, -14, -19].map((z) => <mesh key={z} position={[-7.83, 1.73, z]} rotation-x={Math.PI / 2} material={assets.brass}>
      <cylinderGeometry args={[0.06, 0.06, 0.48, 10]} />
    </mesh>)}
    <Leg x={-6.6} z={0.7} materials={assets} /><Leg x={6.6} z={0.7} materials={assets} /><Leg x={-4.8} z={-21} materials={assets} />
    <Rod from={[-0.65, -1, -0.8]} to={[-0.65, -7.1, 1.5]} radius={0.14} material={assets.black} />
    <Rod from={[0.65, -1, -0.8]} to={[0.65, -7.1, 1.5]} radius={0.14} material={assets.black} />
    <LacquerBlock size={[2.9, 0.4, 0.75]} position={[0, -7.25, 1.55]} material={assets.black} />
    {[-0.8, 0, 0.8].map((x) => <group key={x}>
      <Rod from={[x, -7.05, 1.35]} to={[x, -7.95, 3.1]} radius={0.07} material={assets.brass} />
      <LacquerBlock size={[0.48, 0.15, 1.15]} position={[x, -7.96, 3]} rotation-x={-0.12} material={assets.brass} radius={0.12} />
    </group>)}
    <Bench materials={assets} />
  </group>;
}
