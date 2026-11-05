import { useAtom } from "jotai";
import { currentProjectAtom, projects } from "./Projects";

import ArrowCircleRightOutlinedIcon from "@mui/icons-material/ArrowCircleRightOutlined";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import { motion } from "framer-motion";
import { PianoControls } from "./PianoControls";

const Section = (props) => {
  const { children, mobileTop } = props;

  return (
    <motion.section
      className={`
    h-screen w-screen p-8 mx-auto
    flex flex-col items-start
    ${mobileTop ? "justify-start md:justify-center" : "justify-center"}
    `}
      initial={{
        opacity: 0,
        y: 50,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 1,
          delay: 0.5,
        },
      }}
    >
      {children}
    </motion.section>
  );
};

export const Interface = () => {
  return (
    <div className="flex flex-col items-center w-screen">
      <AboutSection />
      <PianoSection />
      <ProjectsSection />
    </div>
  );
};

const AboutSection = () => {
  return (
    <Section mobileTop>
      <motion.h1
        className="text-sm md:text-xl font-poppins font-bold text-pink "
        initial={{
          opacity: 0,
          y: 25,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 1,
            delay: 1,
          },
        }}
      >
        Hello, my name is
      </motion.h1>
      <motion.h1
        className="text-xl md:text-5xl font-extrabold leading-snug font-poppins text-purple-dark mt-2"
        initial={{
          opacity: 0,
          y: 25,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 1,
            delay: 1.25,
          },
        }}
      >
        <span>Luc NGUYEN.</span>
      </motion.h1>
      <motion.p
        className="text-xl md:text-5xl font-extrabold font-poppins text-purple-light mt-4"
        initial={{
          opacity: 0,
          y: 25,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 1,
            delay: 1.5,
          },
        }}
      >
        I am a <br /> Software Engineer.
      </motion.p>

      <motion.p
        className="text-sm md:text-xl font-extrabold font-poppins text-purple-light mt-4"
        initial={{
          opacity: 0,
          y: 25,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 1,
            delay: 1.75,
          },
        }}
      >
        I am currently working at{" "}
        <span className="text-pink">Google</span>.
      </motion.p>
    </Section>
  );
};

const PianoSection = () => (
  <section className="piano-section" aria-labelledby="piano-title">
    <div className="piano-heading">
      <p className="piano-eyebrow">02 / The interlude</p>
      <h2 id="piano-title">Between the notes.</h2>
      <p className="piano-description">Run across the keys. Find your own rhythm.</p>
    </div>
    <PianoControls />
    <span className="piano-section-number" aria-hidden="true">02 / PLAY</span>
  </section>
);

const ProjectsSection = () => {
  const [currentProject, setCurrentProject] = useAtom(currentProjectAtom);

  const nextProject = () => {
    setCurrentProject((currentProject + 1) % projects.length);
  };

  const previousProject = () => {
    setCurrentProject((currentProject - 1 + projects.length) % projects.length);
  };
  const iconSize = 70;

  const iconStyle = {
    fontSize: iconSize,
  };

  return (
    <Section>
      <div className="text-3xl md:text-6xl h-full w-full text-center  mt-10 font-poppins font-extrabold">
        <button
          className="hover:text-purple-light transition-colors"
          onClick={previousProject}
        >
          <ArrowCircleLeftOutlinedIcon style={iconStyle} />
        </button>
        Projects
        <button
          className="hover:text-purple-light transition-colors"
          onClick={nextProject}
        >
          <ArrowCircleRightOutlinedIcon style={iconStyle} />
        </button>
      </div>
    </Section>
  );
};
