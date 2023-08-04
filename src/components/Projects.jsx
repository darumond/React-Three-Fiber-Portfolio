import { Image, Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { animate, useMotionValue } from "framer-motion";

import { motion} from "framer-motion-3d";
import { atom, useAtom } from "jotai";
import { useEffect, useRef,useState } from "react";

export const projects = [

  {
    title: "Portfolio",
    url: "https://www.youtube.com/watch?v=YkHqpqJgLKw",
    image: "projects/main.png",
    description: "Learn how to bake a 3D model with Blender and use it in r3f",
  },
  {
    title: "Spider IDE",
    url: "https://github.com/darumond/SpiderIDE",
    image: "projects/main.png",
    description: "A minimalist IDE for student to create and send request easily",
    icon: ["https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg", "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"],
  },
  {
    title: "Kanagame",
    url: "https://www.youtube.com/watch?v=zwNF1-lsia8",
    image: "projects/main.png",
    description: "Use React Three Fiber to create a 3D game",
  },

  
];


const Project = (props) => {
  const linebreak = "\n";  
  const { project, highlighted } = props;
  const [isHovered, setIsHovered] = useState(false);

  const background = useRef();
  const bgOpacity = useMotionValue(0.4);

  useEffect(() => {
    animate(bgOpacity, highlighted ? 0.7 : 0.4);
  }, [highlighted]);

  useFrame(() => {
    background.current.material.opacity = bgOpacity.get();
  });

  return (
    <group
      {...props}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <mesh
        position-z={-0.001}
        onClick={() => window.open(project.url, "_blank")}
        ref={background}
      >
        <planeGeometry args={[4.1, 3.8]} />
        <meshBasicMaterial color="black" transparent opacity={0.4} />
      </mesh>
      {!isHovered && (
        <>
          <Image
            scale={[4, 2, 1]}
            url={project.image}
            toneMapped={false}
            position-y={0.75}
          />
          <Text
            maxWidth={2.5}
            anchorX={"left"}
            anchorY={"top"}
            fontSize={0.3}
            position={[-2, -0.7, 0]}
          >
            {project.title.toUpperCase()}
          </Text>
          <Text
            maxWidth={3}
            anchorX="left"
            anchorY="top"
            fontSize={0.15}
            position={[-2, -1.1, 0]}
          >
            {project.description}
          </Text>
          {project.icon && (
            <group position={[-0.2, -0.8, 0]} scale={[0.30, 0.30, 0.30]}>
              {project.icon.map((iconUrl, idx) => (
                <Image key={`icon_${idx}`} url={iconUrl} position={[idx * 1.2, 0, 0]} transparent={true} />
              ))}
            </group>
          )}
        </>
      )}
      {isHovered && (
        <Text
          maxWidth={2.5}
          anchorX="left"
          anchorY="top"
          fontSize={0.2}
          position={[-1.5, 1, 0]} 
          color="white"
        >
          Test
        </Text>
      )}
    </group>
  );
};

export const currentProjectAtom = atom(Math.floor(projects.length / 2));

export const Projects = () => {
    const { viewport } = useThree();
    const [currentProject] = useAtom(currentProjectAtom);
    const gapSpace = 1.5;
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
              z: currentProject === index ? -2 : -3,
              rotateX: currentProject === index ? -0.5 : -Math.PI / 3,
              rotateZ: currentProject === index ? 0 : -0.1 * Math.PI,
            }}
        
          >
            <Project project={project} highlighted={index === currentProject} />
          </motion.group>
        ))}
      </motion.group>
    );
  };
  