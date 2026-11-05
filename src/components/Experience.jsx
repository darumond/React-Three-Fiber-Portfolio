import { useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Office } from "./Office";
import { Avatar } from "./Avatar";
import { Background } from "./Background";
import { Projects } from "./Projects";
import { PianoScene } from "./PianoScene";
import { tourPhase } from "./sceneTransition";

export const Experience = ({ menuOpened }) => {
  const { size } = useThree();
  const scroll = useScroll();
  const mobile = size.width < 768;
  // Measure the room from the home camera, not the current close-up camera.
  // This keeps the room and project layout stable when resizing on the keys.
  const layoutHeight = 2 * Math.tan(THREE.MathUtils.degToRad(25)) * Math.hypot(3.5, 10);
  const roomScale = Math.max(0.5, Math.min(0.9 * layoutHeight * size.width / size.height / 12, 0.9));
  const pianoScale = 0.15;
  const tour = useRef();
  const projectScroll = useRef();
  const pianoAnchor = useRef();
  const seat = useRef();
  const officeAvatar = useRef();
  const follow = useRef({ x: 0.25, z: 0 });
  const lighting = useRef(0);
  const menu = useRef(0);
  const [ready, setReady] = useState(false);
  const [atHome, setAtHome] = useState(true);
  const [reduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const scratch = useMemo(() => ({ camera: new THREE.Vector3(), target: new THREE.Vector3(), seat: new THREE.Vector3(), home: new THREE.Vector3() }), []);

  useFrame(({ camera }, delta) => {
    const phase = tourPhase(reduced ? scroll.scroll.current : scroll.offset, scroll.pages);
    if (phase.ready !== ready) setReady(phase.ready);
    const home = phase.page < 0.02;
    if (home !== atHome) setAtHome(home);
    lighting.current = phase.zoom;
    // The room stays put during the dolly. Only the move to Projects scrolls it.
    tour.current.position.y = Math.max(0, phase.page - 1) * layoutHeight;
    tour.current.visible = phase.page < 1.98;
    projectScroll.current.position.y = phase.page * layoutHeight;
    pianoAnchor.current.updateWorldMatrix(true, false);
    scratch.camera.set(follow.current.x, mobile ? 2.84 : 1.84, (mobile ? 8.47 : 5.49) - follow.current.z);
    scratch.target.set(follow.current.x, mobile ? -0.127 : -0.082, -follow.current.z);
    pianoAnchor.current.localToWorld(scratch.camera);
    pianoAnchor.current.localToWorld(scratch.target);
    scratch.camera.y -= tour.current.position.y;
    scratch.target.y -= tour.current.position.y;
    menu.current = THREE.MathUtils.damp(menu.current, menuOpened ? 1 : 0, 7, delta);
    const menuOffset = menu.current * (1 - phase.zoom);
    camera.position.set(-5 * menuOffset, 3.5, 10).lerp(scratch.camera, phase.cameraBlend);
    camera.position.y += Math.sin(Math.PI * phase.zoom) * 0.6 * (1 - phase.departure);
    scratch.target.lerpVectors(scratch.home.set(5 * menuOffset, 0, 0), scratch.target, phase.cameraBlend);
    camera.lookAt(scratch.target);
    seat.current.getWorldPosition(scratch.seat);
    tour.current.worldToLocal(scratch.seat);
    officeAvatar.current.position.copy(scratch.seat);
  });

  return (
    <>
      <Background />
      <ambientLight intensity={1} />
      <group ref={tour}>
        <group ref={officeAvatar} rotation={[-Math.PI, 1.4853981633974491, Math.PI]} scale={roomScale}>
          <Avatar animation="Luc_Typing" />
        </group>
        <group position={[mobile ? 0 : 2.89 * roomScale, mobile ? -layoutHeight / 6 : 0, 3]}
          scale={roomScale} rotation-y={-Math.PI / 4}>
          <Office section={0} />
          <group ref={seat} position={[-0.15, 0.25, -0.8]} />
          <group ref={pianoAnchor} name="SharedPiano" position={[2.2, 0.922, 0.1]} scale={pianoScale}>
            <PianoScene active={ready} atHome={atHome} menuOpened={menuOpened}
              cameraFollow={follow} lighting={lighting} worldScale={pianoScale * roomScale} />
          </group>
        </group>
      </group>
      <group ref={projectScroll}>
        <Projects layoutHeight={layoutHeight} />
      </group>
    </>
  );
};
