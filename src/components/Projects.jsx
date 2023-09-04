import { Image, Text, useVideoTexture, RoundedBox, Text3D } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { animate, useMotionValue } from "framer-motion";

import { motion } from "framer-motion-3d";
import { atom, useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";

export const projects = [

  {
    title: "Portfolio",
    url: "https://www.youtube.com/watch?v=YkHqpqJgLKw",
    image: "projects/portfoliopic.png",
    description: "My portfolio website made with ReactJS and ThreeJS",
    icon: ["https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg", "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg", "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg"],

    video: "projects/portfolio.mp4"
  },
  {
    title: "Spider IDE",
    url: "https://github.com/darumond/SpiderIDE",
    image: "projects/main.png",
    description: "A minimalist IDE for student to create and send request easily",
    icon: ["https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg", "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg", "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/electron/electron-original.svg"],
    video: "projects/SpiderIDE2.mp4"
  },

  {
    title: "Chess Engine",
    url: "https://github.com/darumond/chess-move",
    image: "projects/chesspic.png",
    description: "Chess Engine that can calculate every possible move with any depth",
    icon: ["https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg","https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg","https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg"],
    video: "projects/chess.mp4"
  },

  {
    title: "My Notes",
    url: "https://github.com/darumond/MyNotes",
    image: "projects/mynotespic.png",
    description: "Simple note app made with Vue 3 and Firebase",
    icon: ["https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg","https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg","https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg"],
    video: "projects/mynotes.mp4"
  },




];


const Project = (props) => {
  const { project, highlighted, isCurrentProject } = props;
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = window.innerWidth < 768;
  const background = useRef();
  const bgOpacity = useMotionValue(0.4);
  const videoTexture = useVideoTexture(project.video)
  useEffect(() => {
    animate(bgOpacity, highlighted ? 0.7 : 0.4);
  }, [highlighted]);
  useEffect(() => {
    console.log(isHovered);
  }, [isHovered]);
  useFrame(() => {
    background.current.material.opacity = bgOpacity.get();
  });
  const planeGeometryArgs = isCurrentProject ? [9.2, 7.4, 0.99] : [4.1, 3.8, 0.99];
  const projectTitlePos = isCurrentProject ? [-4, -1.3, 1] : [-1, -1, 1];
  const iconPos = isCurrentProject ? [-3.78, -2.15, 1] : [-0.9, -1.5, 1];
  const descriptionPos = isCurrentProject ? [-4, -2.5, 1] : [-1, -1.7, 1];
  const maxWidthDescription = isCurrentProject ? 6 : 2.5;
  const videoPos = isCurrentProject ? [8.61, 4.5] : [3, 2];
  const meshVideoPos = isCurrentProject ? [0.01, 0.99, 0.696] : [0.01, 0.5, 0.496];
  const fontSizeTitle = isCurrentProject ? 0.4 : 0.2;
  const fontSizeDescription = isCurrentProject ? 0.15 : 0.1;
  const scaleIcon = isCurrentProject ? [0.40, 0.40, 0.40] : [0.20, 0.20, 0.20];
  const opacity = isCurrentProject ? 0.6 : 0.4;
  const imageSize = isCurrentProject ? [8.75, 4.5, 0] : [3.5, 1.9, 1.5];
  const imagePos = isCurrentProject ? [0, 1, 0.5] : [0.05, 0.5, 0.5];

  const responsivePlaneGeometryArgs = isMobile ? [4.1, 6.8, 0.99] : planeGeometryArgs;
  const responsiveImageSize = isMobile ? [3.5, 1.9, 1.5] : imageSize;
  const responsiveImagePos = isMobile ? [0, 2, 0.5] : imagePos;
  const responsiveProjectTitlePos = isMobile ? [-1.7, 0.7, 1] : projectTitlePos;
  const responsiveIconPos = isMobile ? [-1.5, -0.3, 1] : iconPos;
  const responsiveDescriptionPos = isMobile ? [-1.7, -0.85, 1] : descriptionPos;
  const responsiveMaxWidthDescription = isMobile ? 3 : maxWidthDescription;
  return (
    <group
      {...props}
      onPointerEnter={() => setIsHovered(isCurrentProject)}
      onPointerLeave={() => setIsHovered(false)}
    >

      <mesh
        position-z={-0.001}
        onClick={() => window.open(project.url, "_blank")}
        ref={background}
      >
        <RoundedBox
          args={responsivePlaneGeometryArgs} // Width, height, depth. Default is [1, 1, 1]
          radius={0.5} // Radius of the rounded corners. Default is 0.05
          smoothness={4} // The number of curve segments. Default is 4
          creaseAngle={0.4} // Smooth normals everywhere except faces that meet at an angle greater than the crease angle// All THREE.Mesh props are valid
        >
          <meshBasicMaterial color="black" transparent opacity={opacity} />
        </RoundedBox>

      </mesh>
      {(
        <>
          <Image
            scale={responsiveImageSize}
            url={project.image}
            toneMapped={false}
            position={responsiveImagePos}


          />

          <Text
            font="../src/Fonts/Poppins/Poppins-Bold.ttf"
            maxWidth={4}
            anchorX={"left"}
            anchorY={"top"}
            fontSize={fontSizeTitle}
            position={responsiveProjectTitlePos}
          >
            {project.title}
          </Text>

          <Text
            font="../src/Fonts/Poppins/Poppins-Regular.ttf"
            maxWidth={responsiveMaxWidthDescription}
            anchorX="left"
            anchorY="top"
            fontSize={fontSizeDescription}
            position={responsiveDescriptionPos}
          >
            {project.description}

          </Text>
          {project.icon && (
            <group position={responsiveIconPos} scale={scaleIcon}>
              {project.icon.map((iconUrl, idx) => (
                <Image key={`icon_${idx}`} url={iconUrl} position={[idx * 1.2, 0, 0]} transparent={true} />
              ))}
            </group>
          )}



        </>
      )}
      {isHovered && !isMobile && (
        <mesh position={meshVideoPos}>
          <planeBufferGeometry args={videoPos} />
          <meshStandardMaterial map={videoTexture} transparent opacity={1} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

export const currentProjectAtom = atom(Math.floor(projects.length / 2));

export const Projects = () => {
  const { viewport } = useThree();
  const [currentProject] = useAtom(currentProjectAtom);
  const isMobile = window.innerWidth < 768;
  const gapSpace = isMobile? 1.2 : 3;
  const init = {
    opacity: 0,
    y: 25,
  };
  return (
    <motion.group position-y={-viewport.height * 2 - 0.5}
    >
      {projects.map((project, index) => (
        <motion.group
          key={"project_" + index}
          position={[index * (3.5 + gapSpace), 0, -3]}
          animate={{
            x: 0 + (index - currentProject) * (3.5 + gapSpace),
            y: currentProject === index ? 0 : -0.1,
            z: currentProject === index ? -2 : -4,
            rotateX: currentProject === index ? -0.5 : -Math.PI / 3,
            rotateZ: currentProject === index ? 0 : -0.1 * Math.PI,
          }}

        >
          <Project project={project}
            highlighted={index === currentProject}
            isCurrentProject={index === currentProject}
          />
        </motion.group>
      ))}
    </motion.group>
  );
};
