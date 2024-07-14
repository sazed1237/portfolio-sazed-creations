import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import { projects } from '../../components/Projects';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { BsArrowUpRight, BsGithub } from "react-icons/bs";
import WorkSliderBtns from '../../components/WorkSliderBtns';



const Work = () => {

    const [project, setProject] = useState(projects[0])


    const handleSlideChange = (swiper) => {
        // get current slide index
        const currentIndex = swiper.activeIndex;
        // update project state based on current slide index
        setProject(projects[currentIndex]);
    }

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{
                opacity: 1,
                transition: { delay: 2.4, duration: 0.4, ease: "easeIn" }
            }}
            className='min-h-[80vh] flex flex-col justify-center py-12'
        >
            <div className='container mx-auto'>
                <div className='flex flex-col-reverse lg:flex-row lg:gap-[30px]'>

                    {/* details */}
                    <div className='w-full lg:w-[50%] lg:h-[460px] flex lg:justify-between'>

                        <div className='flex flex-col gap-[30px] h-[50%]'>

                            {/* outline num */}
                            <div className='text-8xl leading-none font-extrabold text-transparent text-outline'>
                                {project.num}
                            </div>

                            {/* project category */}
                            <h2 className='text-[42px] font-bold leading-none text-white group-hover:text-accent transition-all duration-500 capitalize'>{project.category} project</h2>
                            <p className='text-white/60  '>{project.description}</p>

                            {/* stack */}
                            <ul className='grid grid-cols-1 md:flex gap-4'>
                                {
                                    project.stack.map((item, index) => {
                                        return (
                                            <li key={index} className='text-lg text-accent'>
                                                {item.name}
                                                {/* remove the last comma */}
                                                {index !== project.stack.length - 1 && ","}
                                            </li>
                                        )
                                    })
                                }
                            </ul>

                            {/* border */}
                            <div className='border border-white/20'></div>

                            {/* button */}
                            <div className='flex items-center gap-4'>
                                {/* live project button */}
                                <Link to={project.live}>
                                    <TooltipProvider delayDuration={100}>
                                        <Tooltip>
                                            <TooltipTrigger className='w-[60px] h-[60px] rounded-full bg-white/5 flex justify-center items-center group'>
                                                {/* icon */}
                                                <BsArrowUpRight className='text-white text-3xl group-hover:text-accent' />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Live Project</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Link>

                                {/* Github project button */}
                                <Link to={project.github}>
                                    <TooltipProvider delayDuration={100}>
                                        <Tooltip>
                                            <TooltipTrigger className='w-[60px] h-[60px] rounded-full bg-white/5 flex justify-center items-center group'>
                                                {/* icon */}
                                                <BsGithub className='text-white text-3xl group-hover:text-accent' />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Github Repository</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Link>
                            </div>
                        </div>

                    </div>


                    {/* thumbnail */}
                    <div className='w-full lg:w-[50%] h-full '>
                        <Swiper
                            spaceBetween={30}
                            slidesPerView={1}
                            className='mb-12 lg:h-[520px]'
                            onSlideChange={handleSlideChange}
                        >
                            {
                                projects.map((project, index) => {
                                    return (
                                        <SwiperSlide key={index} className='w-full h-full'>
                                            <div className='h-[460px] lg:h-[520px] relative group flex items-center justify-center bg-pink-50/80'>

                                                {/* overlay */}
                                                <div className='absolute top-0 bottom-0 w-full h-full bg-black/20 z-10'></div>

                                                {/* thumbnail */}
                                                <div className='relative w-full h-full'>
                                                    <img
                                                        src={project?.thumb}
                                                        className='object-cover'
                                                        alt=""
                                                    />
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    )
                                })
                            }
                            {/* slider buttons */}
                            <WorkSliderBtns
                                containerStyles='flex gap-2 absolute right-0 bottom-[calc(50%_-_22px)] lg:bottom-0 z-20 w-full justify-between lg:w-max lg:justify-none'
                                btnStyles='bg-accent hover:bg-accent-hover text-primary text-[22px] w-[40px] h-[40px] flex justify-center items-center transition-all'
                            />
                        </Swiper>
                    </div>
                </div>
            </div>
        </motion.section>
    );
};

export default Work;