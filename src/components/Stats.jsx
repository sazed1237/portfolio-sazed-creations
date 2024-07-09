import React from 'react';
import CountUp from 'react-countup';
import { projects } from './Projects';
import { skills } from '../Page/Resume/Resume';


const statsItems = [
    {
        num: 2,
        text: "Years of experience",
    },
    {
        num: projects.length,
        text: "Projects completed",
    },
    {
        num: skills.skillsList.length,
        text: "Technologies mastered",
    },
    {
        num: 600,
        text: "Code commits",
    },
]


const Stats = () => {
    return (
        <section className='pt-4 pb-12 lg:pt-0 '>
            <div className='container mx-auto'>
                <div className='flex flex-wrap gap-6 max-w-[80vw] mx-auto lg:max-w-none'>
                    {
                        statsItems.map((stats, index) => {
                            return (
                                <div key={index} className='flex-1 flex gap-4 items-center justify-center lg:justify-start'>
                                    <CountUp
                                        end={stats.num}
                                        duration={5}
                                        delay={2}
                                        className='text-4xl lg:text-6xl font-extrabold'
                                    />
                                    <p className={`${stats.text.length < 15 ? "max-w-[100px]" : "max-w-[150px]"} leading-snug text-white/80 `}>{stats.text}</p>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </section>
    );
};

export default Stats;