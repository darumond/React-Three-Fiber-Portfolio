import React from "react";
import { useAtom } from "jotai";
import { currentProjectAtom, projects } from "./Projects";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ArrowCircleRightOutlinedIcon from "@mui/icons-material/ArrowCircleRightOutlined";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import { motion } from "framer-motion";
import PoppinsBold from "../Fonts/Poppins/Poppins-Bold.ttf";
import { GitHub, Linkedin, Mail } from "react-feather";
import IconButton from "./IconButton";

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
      <SkillsSection />
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
        <span className="text-pink">Google </span> <br /> and a
        student at <span className="text-pink"> EPITA </span>.
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

const languages = [
  {
    title: "🇫🇷 French",
    level: 100,
  },
  {
    title: "🇺🇸 English",
    level: 85,
  },
  {
    title: "🇻🇳 Vietnamese",
    level: 20,
  },
];
const init = {
  opacity: 0,
  y: 25,
};
const whileInViewInit = {
  opacity: 1,
  y: 0,
  transition: {
    duration: 1,
    delay: 0.2,
  },
};
const images = [
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
    init,
    whileInView: whileInViewInit,
  },
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
    init,
    whileInView: whileInViewInit,
  },
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/swift/swift-original.svg",
    init,
    whileInView: whileInViewInit,
  },
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    init,
    whileInView: whileInViewInit,
  },
];
const images2 = [
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
    spaces: 4,
  },
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
    spaces: 4,
  },

  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
    spaces: 4,
  },
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
    spaces: 4,
  },
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
    spaces: 4,
  },
];
const images3 = [
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    spaces: 4,
  },
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
    spaces: 4,
  },
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg",
    spaces: 4,
  },
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg",
    spaces: 4,
  },
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
    spaces: 0,
  },
];

const SkillsSection = () => {
  return (
    <Section>
      <motion.div whileInView={"visible"}>
        <motion.h2
          className="text-2xl md:text-5xl font-bold"
          initial={init}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: {
              duration: 1,
              delay: 0.1,
            },
          }}
        >
          Programming Languages
        </motion.h2>
        <div className="h-8 w-8 md:h-16 md:w-16 ml-1 mt-8 flex flex-row items-center">
          {images.map((image, index) => (
            <React.Fragment key={index}>
              <motion.img
                src={image.src}
                initial={image.init}
                whileInView={{
                  ...image.whileInView,
                  transition: {
                    ...image.whileInView.transition,
                    delay: index * 0.1 + 0.2,
                  },
                }}
              />
              &nbsp;&nbsp;&nbsp;&nbsp;
            </React.Fragment>
          ))}
        </div>

        <div className="h-8 w-8 md:h-16 md:w-16 ml-1 mt-8 flex">
          {images2.map((image, index) => (
            <React.Fragment key={index}>
              <motion.img
                src={image.src}
                initial={init}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 1,
                    delay: index * 0.1 + 0.2,
                  },
                }}
              />
              {Array.from({ length: image.spaces }, (_, i) => (
                <>&nbsp;</>
              ))}
            </React.Fragment>
          ))}
        </div>

        <motion.h2
          className="text-2xl md:text-5xl font-bold mt-10"
          initial={init}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: {
              duration: 1,
              delay: 0.1,
            },
          }}
        >
          Tools/Frameworks
        </motion.h2>
        <div className="h-8 w-8 md:h-16 md:w-16 ml-1 mt-8 flex flex-row items-center">
          {images3.map((image, index) => (
            <React.Fragment key={index}>
              <motion.img
                src={image.src}
                initial={init}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 1,
                    delay: index * 0.1 + 0.2,
                  },
                }}
              />
              {Array.from({ length: image.spaces }, (_, i) => (
                <>&nbsp;</>
              ))}
            </React.Fragment>
          ))}
        </div>

        {/* Language proficiency section remains unchanged */}

        <motion.h2
          className="text-2xl md:text-5xl font-bold mt-10"
          initial={init}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: {
              duration: 1,
              delay: 0.1,
            },
          }}
        >
          Languages
        </motion.h2>
        <div className=" mt-8 space-y-4">
          {languages.map((lng, index) => (
            <div className="w-64" key={index}>
              <motion.h3
                className="text-sm md:text-xl font-bold text-gray-800"
                initial={{
                  opacity: 0,
                }}
                variants={{
                  visible: {
                    opacity: 1,
                    transition: {
                      duration: 1,
                      delay: 1 + index * 0.2,
                    },
                  },
                }}
              >
                {lng.title}
              </motion.h3>
              <div className="h-2 w-full bg-purple-light rounded-full mt-2">
                <motion.div
                  className="h-full bg-purple-dark rounded-full "
                  style={{ width: `${lng.level}%` }}
                  initial={{
                    scaleX: 0,
                    originX: 0,
                  }}
                  variants={{
                    visible: {
                      scaleX: 1,
                      transition: {
                        duration: 1,
                        delay: 1 + index * 0.2,
                      },
                    },
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </Section>
  );
};

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
