import { OrbitControls } from "@react-three/drei";
import {Office} from "./Office";
export const Experience = () => {
  return (
    <>
      <ambientLight intensity={1} />
      <group position={[1.5, 2, 3]}
        scale={[0.9, 0.9, 0.9]}
        rotation-y={-Math.PI / 4}>
      <Office />
      </group>
    </>
  );
};
