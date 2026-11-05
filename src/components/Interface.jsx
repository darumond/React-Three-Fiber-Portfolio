import { useAtom } from "jotai";
import { currentProjectAtom, projects } from "./Projects";

import ArrowCircleRightOutlinedIcon from "@mui/icons-material/ArrowCircleRightOutlined";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import { motion } from "framer-motion";
import { GitHub, Linkedin, Mail } from "react-feather";
import IconButton from "./IconButton";
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

export const Interface = (props) => {
  const { setSection } = props;
  return (
    <div className="flex flex-col items-center w-screen">
      <AboutSection setSection={setSection} />
      <PianoSection />
      <ProjectsSection />
      <ContactSection />
    </div>
  );
};

const AboutSection = (props) => {
  const { setSection } = props;
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
      <motion.div
        className="flex flex-row space-x-4 mt-4"
        initial={{
          opacity: 0,
          y: 25,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 1,
            delay: 2,
          },
        }}
      >
        <motion.button
          onClick={() => setSection(3)}
          className={`bg-purple-light text-white  font-poppins py-2 px-4 md:py-4 md:px-8 
      rounded-lg font-bold text-lg mt-2 md:mt-3`}
        >
          Contact me
        </motion.button>
      </motion.div>
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
const handleRedirect = (url) => {
  window.open(url, "_blank");
};

const ContactSection = () => {
  return (
    <Section>
      <div className="h-full w-full text-center items-center flex flex-col mt-20">
        <h2 className="text-5xl font-bold font-poppins ml">Contact me</h2>
        <div className="mt-8 p-8 rounded-md bg-white w-96 max-w-full bg-opacity-40 flex flex-col">
          <form className="flex flex-col items-center">
            <label className="font-bold font-poppins text-gray-900 block mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              className="block w-full font-poppins rounded-md border-0 text-lightblack shadow-sm   placeholder:text-lightblack p-3 bg-prettywhite"
            />
            <label className="font-bold font-poppins text-gray-900 block mb-1 mt-8">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="block w-full font-poppins rounded-md border-0 text-lightblack shadow-sm   placeholder:text-lightblack p-3 bg-prettywhite"
            />
            <label className="font-bold font-poppins text-gray-900 block mb-1 mt-8">
              Message
            </label>
            <textarea
              name="message"
              id="message"
              className="h-32 block w-full font-poppins rounded-md border-0 text-lightblack shadow-sm   placeholder:text-lightblack p-3 bg-prettywhite"
            />
            <button className="w-1/2 bg-purple-light text-prettywhite font-poppins py-4 px-8 rounded-lg font-bold text-lg mt-8 ">
              Submit
            </button>

           
          </form>
          <div className="flex flex-row mt-8 gap-4 justify-center">
              <IconButton
                text="Darumond"
                onClick={() => handleRedirect("https://github.com/Darumond")}
              >
                <GitHub size={20} />
              </IconButton>
              <IconButton
                text="/lucngy"
                color="bg-blue"
                onClick={() => handleRedirect("https://linkedin.com/in/lucngy")}
              >
                <Linkedin size={20} />
              </IconButton>

              <IconButton
                text="Mail"
                color="bg-lightblue"
                onClick={() =>
                  (window.location.href = "luc.programmer@gmail.com")
                }
              >
                <Mail size={20} />
              </IconButton>
            </div>
        </div>
      </div>
    </Section>
  );
};
