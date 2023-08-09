import { OrbitControls, useScroll } from "@react-three/drei";
import { Office } from "./Office";
import { motion } from "framer-motion-3d";
import { Avatar } from "./Avatar";
import { useThree, useFrame } from "@react-three/fiber";
import { useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { framerMotionConfig } from "../config";
import * as THREE from "three";
import { Background } from "./Background";
import { Projects } from "./Projects";
export const Experience = (props) => {
  const { menuOpened } = props;
  const [section, setSection] = useState(0);
  const [characterAnimation, setCharacterAnimation] = useState("Luc_Typing");
  const { viewport } = useThree();
  const data = useScroll();
  const isMobile = window.innerWidth < 768;
  const responsiveRatio = viewport.width / 12;
  const officeScaleRatio = Math.max(0.5, Math.min(0.9 * responsiveRatio, 0.9));
  const cameraPositionX = useMotionValue();
  const cameraLookAtX = useMotionValue();
  const characterContainerAboutRef = useRef();
  const characterGroup = useRef();
  useEffect(() => {
    if (section !== 0) {
      return;
    }
    animate(cameraPositionX, menuOpened ? -5 : 0, {
      ...framerMotionConfig,
    });
    animate(cameraLookAtX, menuOpened ? 5 : 0, {
      ...framerMotionConfig,
    });
  }, [menuOpened]);

  useEffect(() => {
    setCharacterAnimation("Luc_Falling");


    setTimeout(() => {
      if(section === 0){
        setCharacterAnimation("Luc_Typing");
      }
      else if(section === 1){
        setCharacterAnimation("Luc_Listening");
      }
      else
      {
        setCharacterAnimation("Luc_Salute");
      }
      // setCharacterAnimation(section === 0 ? "Luc_Typing" : "Luc_Standing");
    }, 600);
  }, [section]);

  useFrame((state) => {
    let curSection = Math.floor(data.scroll.current * data.pages);
    if (curSection > 3) {
      curSection = 3;
    }

    if (curSection !== section) {
      setSection(curSection);
    }
    if (section === 0) {
      characterContainerAboutRef.current.getWorldPosition(
        characterGroup.current.position
      );
    }
    state.camera.position.x = cameraPositionX.get();
    state.camera.lookAt(cameraLookAtX.get(), 0, 0);

  });

  return (
    <>
      <Background />
      <motion.group ref={characterGroup} rotation={[-3.1415926535897922, 1.4853981633974491, 3.1415926535897922]}
        animate={"" + section}
        transition={{
          duration: 0.7,
        }}
        variants={{
          0: {
            scaleX: officeScaleRatio,
            scaleY: officeScaleRatio,
            scaleZ: officeScaleRatio,
          },
          1: {
            y: -viewport.height + 1.5,
            x: 0,
            z: 7,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
          },
          3: {
            y: -viewport.height * 3 + 1.5,
            x: isMobile ? 0.3 : 1.1,
            z: isMobile? 7.2: 8.5,
            rotateX: 0,
            rotateY: isMobile? -Math.PI / 8 : -Math.PI / 5,
            rotateZ: 0,
          },

        }}>
        <Avatar animation={characterAnimation} />
      </motion.group>
      <ambientLight intensity={1} />
      <motion.group position={[isMobile ? 0 : 2.89 * officeScaleRatio, isMobile ? -viewport.height/6 : 2, 3]}
        scale={[officeScaleRatio,officeScaleRatio, officeScaleRatio]}
        rotation-y={-Math.PI / 4}
        animate={{
          y: isMobile? -viewport.height/6 : 0,
        }}>

        <Office section={section} />
        <group
          ref={characterContainerAboutRef}
          name="CharacterSpot"
          position={[-0.15, 0.25, -0.8]}
          rotation={[-Math.PI, 0.7, -Math.PI]}
        >

        </group>
      </motion.group>
      <motion.group position={[0, -1.5, -10]}
        animate={{
          z: section === 1 ? 0 : -10,
          y: section === 1 ? -viewport.height : -1.5,
        }}>
        {/* <group scale={[4,4,4]} position-y={-4}>
        <Avatar animation={section === 0 ? "Luc_Falling" : "Luc_Standing"} />
      </group> */}
      </motion.group>
      <motion.group animate={{
        y: section === 1 ? -viewport.height : -0.5,
      }}
      transition={{
        duration: 0.7,
      }}>
        <Projects />
      </motion.group>

    </>
  );
};
