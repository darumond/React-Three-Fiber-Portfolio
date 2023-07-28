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
            <Section>
                <h1>Contacts</h1>
            </Section>
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
                I am currently a VR Software Engineer at Dassault Systèmes <br /> and EPITA Student
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

const skills = [
    {
        title: "Threejs / React Three Fiber",
        level: 80,
    },
    {
        title: "React / React Native",
        level: 90,
    },
    {
        title: "Nodejs",
        level: 90,
    },
    {
        title: "Typescript",
        level: 60,
    },
    {
        title: "3D Modeling",
        level: 40,
    },
];
const languages = [
    {
        title: "🇫🇷 French",
        level: 100,
    },
    {
        title: "🇺🇸 English",
        level: 85,
    },
];

const SkillsSection = () => {
    return (
        <Section>
            <h2 className="text-5xl font-bold">Skills</h2>
            <h2 className="text-5xl font-bold mt-10">Languages</h2>
            <div className='mt-8 space-y-4'>
                {languages.map((lng,index)=>(
                    <div className='w-64' key={index}>
                         <h3 className='text-wl font-bold text-gray-800'>{lng.title}</h3>
                         <div className='h-2 w-full bg-gray-200 rounded-full mt-2'>
                            <div className='h-full bg-indigo-500 rounded-full'
                            style={{width: `${lng.level}%`}}/>
                         </div>
                    </div>
                ))}
            </div>
        </Section>
    );
};