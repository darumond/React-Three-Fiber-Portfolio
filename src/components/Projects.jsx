  import { Image, Text, useVideoTexture } from "@react-three/drei";
  import { useFrame, useThree } from "@react-three/fiber";
  import { animate, useMotionValue } from "framer-motion";

  import { motion } from "framer-motion-3d";
  import { atom, useAtom } from "jotai";
  import { useEffect, useRef, useState } from "react";

  export const projects = [

    {
      title: "Portfolio",
      url: "https://www.youtube.com/watch?v=YkHqpqJgLKw",
      image: "projects/main.png",
      description: "Learn how to bake a 3D model with Blender and use it in r3f",
      video: "textures/vscode.mp4"
    },
    {
      title: "Spider IDE",
      url: "https://github.com/darumond/SpiderIDE",
      image: "projects/main.png",
      description: "A minimalist IDE for student to create and send request easily",
      icon: ["https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg", "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"],
      video: "textures/vscode.mp4"
    },
    {
      title: "Kanagame",
      url: "https://www.youtube.com/watch?v=zwNF1-lsia8",
      image: "projects/main.png",
      description: "Use React Three Fiber to create a 3D game",
      icon: ["https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg", "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"],
      video: "textures/vscode.mp4"
    },


  ];


  const Project = (props) => {
    const { project, highlighted, isCurrentProject } = props;
    const [isHovered, setIsHovered] = useState(false);

    const background = useRef();
    const bgOpacity = useMotionValue(0.4);
    const videoTexture = useVideoTexture(project.video)
    useEffect(() => {
      animate(bgOpacity, highlighted ? 0.7 : 0.4);
    }, [highlighted]);

    useFrame(() => {
      background.current.material.opacity = bgOpacity.get();
    });
    const planeGeometryArgs = isCurrentProject ? [9.2, 7.4] : [4.1, 3.8];
    const imageSize = isCurrentProject ? [9.1,5, 1] : [4, 2, 1];
    const projectTitlePos = isCurrentProject ? [-4.50, -1.7, 0] : [-2, -0.7, 0];
    const iconPos = isCurrentProject ? [-2.7, -1.82, 0] : [-0.2, -0.8, 0];
    const descriptionPos = isCurrentProject ? [-4.5, -2.3, 0] : [-2, -1.1, 0];
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
          <planeGeometry args={planeGeometryArgs} />
          <meshBasicMaterial color="black" transparent opacity={0.4} />
        </mesh>
        {!isHovered && (
          <>
            <Image
              scale={imageSize}
              url={project.image}
              toneMapped={false}
              position-y={1}
            />
            <Text
              maxWidth={2.5}
              anchorX={"left"}
              anchorY={"top"}
              fontSize={0.3}
              position={projectTitlePos}
            >
              {project.title.toUpperCase()}
            </Text>
            <Text
              maxWidth={6}
              anchorX="left"
              anchorY="top"
              fontSize={0.15}
              position={descriptionPos}
            >
              {project.description}
            </Text>
            {project.icon && (
              <group position={iconPos} scale={[0.30, 0.30, 0.30]}>
                {project.icon.map((iconUrl, idx) => (
                  <Image key={`icon_${idx}`} url={iconUrl} position={[idx * 1.2, 0, 0]} transparent={true} />
                ))}
              </group>
            )}
          </>
        )}
        {isHovered && (
          <mesh position={[0.01, -0.2, 1.65]}>
            <planeBufferGeometry args={[6.45, 5.67]} />
            <meshStandardMaterial map={videoTexture} transparent opacity={1} />
          </mesh>
        )}
      </group>
    );
  };

  export const currentProjectAtom = atom(Math.floor(projects.length / 2));

  export const Projects = () => {
    const { viewport } = useThree();
    const [currentProject] = useAtom(currentProjectAtom);
    const gapSpace = 2;
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
            <Project  project={project}
              highlighted={index === currentProject}
              isCurrentProject={index === currentProject} 
             />
          </motion.group>
        ))}
      </motion.group>
    );
  };
