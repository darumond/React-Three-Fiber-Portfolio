import React from 'react';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const Section = (props) => {
    const { children } = props;

    return <section className={`
    h-screen w-screen p-8 max-w-screen-2xl mx-auto
    flex flex-col items-start justify-center
    `}>{children}</section>;
};

export const Interface = () => {
    return (
        <div className="flex flex-col items-center w-screen">
            <AboutSection />
            <SkillsSection />
            <Section>
                <h1>Projects</h1>
            </Section>
            <ContactSection/>
        </div>);
}

const AboutSection = () => {
    return (
        <Section>
            <h1 className="text-6xl font-extrabold leading-snug">
                Hello, I am
                <br />
                <span className="px-1 italic">Luc NGUYEN</span>
            </h1>
            <p className="text-lg text-gray-600 mt-4">
                I am currently a VR Software Engineer at Dassault Systèmes <br /> and a student at EPITA.
            </p>
            <div className='flex flex-row space-x-4'>
                <Button size="large" variant="contained">
                    <Typography>
                        Resume
                    </Typography></Button>
                <Button size="large" variant="contained">
                    <Typography>
                        Contact
                    </Typography></Button>


            </div>
        </Section>
    )
}

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

const SkillsSection = () => {

    return (
        <Section>
            <h2 className="text-5xl font-bold">Programming Languages</h2>
            <div className="h-16 w-16 ml-1 mt-8 flex flex-row items-center">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" className="h-24" />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg" />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" />
                &nbsp;&nbsp;&nbsp;&nbsp;

            </div>


            <div className="text-xl font-bold mt-2 ml-5 flex flex-row">
                <p>C++</p>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <p className='ml-1'>C</p>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <p className='ml-7'>C#</p>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <p className='ml-3  '>HTML5</p>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <p className=''>CSS3</p>

            </div>

            <div className="h-16 w-16 ml-1 mt-8 flex flex-row items-center">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" />

                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" />

            </div>



            <div className="text-xl font-bold mt-2  flex flex-row">
                <p className='ml-2  '>Java</p>
                <p className='ml-7'>Javascript</p>
                <p className='ml-7'>Typescript</p>
                <p className='ml-6'>Python</p>
            </div>

            <h2 className="text-5xl font-bold mt-10">Frameworks/Libraries</h2>
            <div className="h-16 w-16 ml-1 mt-8 flex flex-row items-center">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" />
                &nbsp;&nbsp;
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" />

                &nbsp;&nbsp;&nbsp;
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg" />

                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg" />


            </div>



            <div className="text-xl font-bold mt-2  flex flex-row">
                <p className='ml-1'>React</p>
                <p className='ml-9'>Vue</p>
                <p className='ml-6'>Tailwind</p>
                <p className='ml-5'>ThreeJS</p>
            </div>

            <h2 className="text-5xl font-bold mt-10">Languages</h2>
            <div className='mt-8 space-y-4'>
                {languages.map((lng, index) => (
                    <div className='w-64' key={index}>
                        <h3 className='text-wl font-bold text-gray-800'>{lng.title}</h3>
                        <div className='h-2 w-full bg-gray-200 rounded-full mt-2'>
                            <div className='h-full bg-indigo-500 rounded-full'
                                style={{ width: `${lng.level}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
};

const ContactSection = () => {
    return (
        <Section>
            <h2 className="text-5xl font-bold">Contact me</h2>
            <div className="mt-8 p-8 rounded-md bg-white w-96 max-w-full">
                <form>
                    <label for="name" className="font-medium text-gray-900 block mb-1">
                        Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 p-3"
                    />
                    <label
                        for="email"
                        className="font-medium text-gray-900 block mb-1 mt-8"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 p-3"
                    />
                    <label
                        for="email"
                        className="font-medium text-gray-900 block mb-1 mt-8"
                    >
                        Message
                    </label>
                    <textarea
                        name="message"
                        id="message"
                        className="h-32 block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 p-3"
                    />
                    <button className="bg-indigo-600 text-white py-4 px-8 rounded-lg font-bold text-lg mt-16 ">
                        Submit
                    </button>
                </form>
            </div>
        </Section>
    );
};