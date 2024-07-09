import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BsArrowDownRight } from "react-icons/bs";



const services = [
    {
        num: "01",
        title: "Full Stack Web Development",
        href: '',
        description: "As a Full Stack Web Developer, I bring your vision to life through comprehensive and innovative web solutions. From the initial concept to the final deployment, I ensure a seamless and engaging user experience. My expertise spans both front-end and back-end development, enabling me to build robust, scalable, and visually appealing websites and applications."

    },
    {
        num: "02",
        title: "Web Design",
        href: '',
        description: "Transform your ideas into visually stunning and highly functional websites with my expert web design services. Whether you're looking to establish an online presence or revamp an existing site, I ensure a seamless, user-centric design tailored to your brand and business goals."
    },
    {
        num: "03",
        title: "Graphic Design",
        href: '',
        description: "Enhance your brand's identity with professional graphic design services that captivate and communicate. From logos to marketing materials, I provide comprehensive graphic design solutions that align with your brand and vision."
    },
    {
        num: "04",
        title: "Digital Marketing",
        href: '',
        description: "Elevate your brand and reach your target audience with comprehensive digital marketing services. From strategy to execution, I provide the expertise and tools needed to achieve your business goals and drive growth."
    },
]

const Services = () => {
    return (
        <section className='min-h-[80vh] flex flex-col justify-center py-12 '>
            <div className='container mx-auto'>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: 1,
                        transition: {
                            delay: 2.4,
                            duration: 0.4,
                            ease: "easeIn"
                        },
                    }}
                    className='grid grid-cols-1 md:grid-cols-2 gap-[60px]'
                >
                    {services.map((service, index) => {
                        return (
                            <div key={index} className='flex flex-1 flex-col justify-center gap-6 group'>
                                {/* top */}
                                <div className='w-full flex justify-between items-center '>

                                    <div className='text-5xl font-extrabold text-outline text-transparent group-hover:text-outline-hover transition-all duration-500'>
                                        {service.num}
                                    </div>

                                    <Link to={service.href} className='w-[50px] h-[50px] rounded-full bg-white group-hover:bg-accent transition-all duration-500 flex justify-center items-center hover:-rotate-45' >
                                        <BsArrowDownRight className='text-primary text-2xl' />
                                    </Link>
                                </div>

                                {/* heading */}
                                <h2 className='text-[36px] font-bold leading-none text-white group-hover:text-accent transition-all duration-500'>{service.title}</h2>
                                <p className='text-white/60 '>{service.description}</p>
                                
                                {/* border */}
                                <div className='border-b border-white/20 w-full'></div>
                            </div>
                        )
                    })}
                </motion.div>

            </div>
        </section>
    );
};

export default Services;