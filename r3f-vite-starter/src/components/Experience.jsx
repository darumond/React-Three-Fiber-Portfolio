import { OrbitControls } from "@react-three/drei";
import {Office} from "./Office";
import { motion } from "framer-motion-3d";
import { Avatar } from "./Avatar";
import { useThree,useFrame } from "@react-three/fiber";
import { useMotionValue, useTransform,animate} from "framer-motion";
import { useEffect } from "react";
import { framerMotionConfig } from "../config";
export const Experience = (props) => {
  const { section,menuOpened} = props;
  const {viewport} = useThree();
  const cameraPositionX = useMotionValue();
  const cameraLookAtX = useMotionValue();

  useEffect(() => {
    animate(cameraPositionX, menuOpened ? -5 : 0, {
      ...framerMotionConfig,
    });
    animate(cameraLookAtX, menuOpened ? 5 : 0, {
      ...framerMotionConfig,
    });
  }, [menuOpened]);

  useFrame((state) => {
    state.camera.position.x = cameraPositionX.get();
    state.camera.lookAt(cameraLookAtX.get(), 0, 0);
  });

  return (
    <>
      <ambientLight intensity={1} />
      <motion.group position={[1.5, 2, 3]}
        scale={[0.9, 0.9, 0.9]}
        rotation-y={-Math.PI / 4}
        animate={{
          y: section === 0 ? 0 : -1,
        }}>
        
      <Office section={section} />
      
      </motion.group>
      <motion.group position={[0,-1.5,-10]}
      animate={{
        z: section === 1 ? 0 : -10,
        y:  section === 1 ? -viewport.height : -1.5,
      }}>
      <group scale={[4,4,4]} position-y={-4}>
        <Avatar animation={section === 0 ? "Luc_Falling" : "Luc_Standing"} />
      </group>
      </motion.group>
    </>
  );
};
