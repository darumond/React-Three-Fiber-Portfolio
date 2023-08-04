import { Image, Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { animate, useMotionValue } from "framer-motion";

import { motion} from "framer-motion-3d";
import { atom, useAtom } from "jotai";
import { useEffect, useRef,useState } from "react";

export const projects = [
  {
    title: "Wawatmos",
    url: "https://r3f-wawatmos-final.vercel.app/",
    image: "projects/main.png",
    description: "Recreating the Atmos Awwwards website with React Three Fiber",
  },
  {
    title: "Portfolio",
    url: "https://www.youtube.com/watch?v=YkHqpqJgLKw",
    image: "projects/main.png",
    description: "Learn how to bake a 3D model with Blender and use it in r3f",
  },
  {
    title: "3D Avatar",
    url: "https://www.youtube.com/watch?v=pGMKIyALcK0",
    image: "projects/main.png",
    description: "Learn how to use ReadyPlayerMe to create a 3D avatar",
  },
  {
    title: "Kanagame",
    url: "https://www.youtube.com/watch?v=zwNF1-lsia8",
    image: "projects/main.png",
    description: "Use React Three Fiber to create a 3D game",
  },
  {
    title: "Loader",
    url: "https://www.youtube.com/watch?v=L12wIvuZTOY",
    image: "projects/main.png",
    description: "Create a loading screen for your r3f projects",
  },
  
];

const Project = (props) => {
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
            position-y={0.4}
          />
          <Text
            maxWidth={2.5}
            anchorX={"left"}
            anchorY={"top"}
            fontSize={0.3}
            position={[-1.5, -0.7, 0]}
          >
            {project.title.toUpperCase()}
          </Text>
          <Text
            maxWidth={2.5}
            anchorX="left"
            anchorY="top"
            fontSize={0.15}
            position={[-1.5, -1, 0]}
          >
            {project.description}
          </Text>
        </>
      )}
      {isHovered && (
        <Text
          maxWidth={2.5}
          anchorX="left"
          anchorY="top"
          fontSize={0.2}
          position={[-1.5, 1, 0]} // Adjust the position as needed
          color="white" // Set the color for the text
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
      <motion.group position-y={-viewport.height * 2 + 1}
      >
        {projects.map((project, index) => (
          <motion.group
            key={"project_" + index}
            position={[index * (3.5 + gapSpace), 0, -3]}
            animate={{
              x: 0 + (index - currentProject) * (3.5 + gapSpace),
              y: currentProject === index ? 0 : -0.1,
              z: currentProject === index ? -2 : -3,
              rotateX: currentProject === index ? 0 : -Math.PI / 3,
              rotateZ: currentProject === index ? 0 : -0.1 * Math.PI,
            }}
            transition={{
              duration: 0.5,
            }}
        
          >
            <Project project={project} highlighted={index === currentProject} />
          </motion.group>
        ))}
      </motion.group>
    );
  };
  