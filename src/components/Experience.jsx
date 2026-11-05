import { useScroll } from "@react-three/drei";
import { Office } from "./Office";
import { motion } from "framer-motion-3d";
import { Avatar } from "./Avatar";
import { useThree, useFrame } from "@react-three/fiber";
import { useMotionValue, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { framerMotionConfig } from "../config";
import { Background } from "./Background";
import { Projects } from "./Projects";
import { PianoScene } from "./PianoScene";
export const Experience = (props) => {
  const { menuOpened } = props;
  const [section, setSection] = useState(0);
  const [characterAnimation, setCharacterAnimation] = useState("Luc_Typing");
  const { viewport } = useThree();
  const data = useScroll();
  const isMobile = window.innerWidth < 768;
  const responsiveRatio = viewport.width / 12;
  const officeScaleRatio = Math.max(0.5, Math.min(0.9 * responsiveRatio, 0.9));
  const cameraPositionX = useMotionValue(0);
  const cameraLookAtX = useMotionValue(0);
  const characterContainerAboutRef = useRef();
  const characterGroup = useRef();
  useEffect(() => {
    const showMenu = section === 0 && menuOpened;
    const cameraMove = animate(cameraPositionX, showMenu ? -5 : 0, {
      ...framerMotionConfig,
    });
    const cameraLook = animate(cameraLookAtX, showMenu ? 5 : 0, {
      ...framerMotionConfig,
    });
    return () => { cameraMove.stop(); cameraLook.stop(); };
  }, [menuOpened, section, cameraPositionX, cameraLookAtX]);

  useEffect(() => {
    setCharacterAnimation("Luc_Falling");


    const timeout = setTimeout(() => {
      if(section === 0){
        setCharacterAnimation("Luc_Typing");
      }
      else
      {
        setCharacterAnimation("Luc_Salute");
      }
    }, 600);
    return () => clearTimeout(timeout);
  }, [section]);

  useFrame((state) => {
    let curSection = Math.floor(data.scroll.current * data.pages);
    curSection = Math.min(curSection, data.pages - 1);

    if (curSection !== section) {
      setSection(curSection);
    }
    if (section === 0 && characterGroup.current) {
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
      {section === 0 && <motion.group ref={characterGroup} rotation={[-3.1415926535897922, 1.4853981633974491, 3.1415926535897922]}
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

        }}>
        <Avatar animation={characterAnimation} />
      </motion.group>}
      <PianoScene active={section === 1} menuOpened={menuOpened} viewportHeight={viewport.height} />
      <ambientLight intensity={1} />
      <motion.group position={[isMobile ? 0 : 2.89 * officeScaleRatio, isMobile ? -viewport.height/6 : 2, 3]}
        scale={[officeScaleRatio,officeScaleRatio, officeScaleRatio]}
        rotation-y={-Math.PI / 4}
        animate={{
          y: isMobile? -viewport.height/6 : 0,
        }}
        transition={{
          duration: 1.5,
        }}>

        <group visible={section === 0}>
          <Office section={section} />
        </group>
        <group
          ref={characterContainerAboutRef}
          name="CharacterSpot"
          position={[-0.15, 0.25, -0.8]}
          rotation={[-Math.PI, 0.7, -Math.PI]}
        >

        </group>
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
