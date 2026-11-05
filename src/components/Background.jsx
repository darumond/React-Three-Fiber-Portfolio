import { Sphere, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
export const Background = () => {
  const material = useRef();
  const color = useRef({
    color: "#b9bcff",
  });
  const data = useScroll();

  const tl = useRef();

  useFrame(() => {
    tl.current?.progress(data.scroll.current);
    if (material.current) material.current.color.set(color.current.color);
  });

  useEffect(() => {
    tl.current = gsap.timeline();
    tl.current.to(color.current, {
      color: "#7b5a7e",
    });
    tl.current.to(color.current, {
      color: "#7a7ca5",
    });
    return () => tl.current?.kill();
  }, []);

  return (
    <group>
      <Sphere scale={[30, 30, 30]}>
        <meshBasicMaterial
          ref={material}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </Sphere>
    </group>
  );
};
