import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { ScrollControls, Scroll } from "@react-three/drei";
import { Interface } from "./components/Interface";
import { ScrollManager } from "./components/ScrollManager";
import { useState,useEffect } from "react";
import { Menu } from "./components/Menu";
function App() {
  const [section, setSection] = useState(0);
  const [menuOpened, setMenuOpened] = useState(false);

  useEffect(() => {
    setMenuOpened(false);
  }, [section]);
  return (
    <>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
        <color attach="background" args={["#e6e7ff"]} />
        <ScrollControls pages={4} damping={0.1}>
          <ScrollManager section={section} onSectionChange={setSection} />
          <Experience />
          <Scroll html>
            <Interface />
          </Scroll>
        </ScrollControls>
      </Canvas>
      <Menu onSectionChange={setSection}
       menuOpened={menuOpened}
        setMenuOpened={setMenuOpened} />

    </>

  );
}

export default App;
