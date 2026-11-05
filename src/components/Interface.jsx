
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
        <span className="inline-block whitespace-nowrap">
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">l</span>
          <span className="text-[#EA4335]">e</span>
        </span>.
      </motion.p>
    </Section>
  );
};

const PianoSection = () => (
  <section className="piano-section" aria-labelledby="piano-title">
    <div className="piano-heading">
      <p className="piano-eyebrow">02 / The interlude</p>
      <h2 id="piano-title">Between the notes.</h2>
      <p className="piano-description">Run right. Let the story unfold.</p>
    </div>
    <PianoControls />
    <span className="piano-section-number" aria-hidden="true">02 / PLAY</span>
  </section>
);

