import React from 'react';
import { Button } from '../../components/ui/button';
import { FiDownload } from 'react-icons/fi';
import Social from '../../components/Social';
import Photo from '../../components/Photo';
import Stats from '../../components/Stats';
import Services from '../Services/Services';

const Home = () => {
    return (
        <section className='h-full'>
            <div className='container mx-auto h-full'>

                <div className='flex flex-col-reverse lg:flex-row items-center justify-between lg:pt-8 lg:pb-20'>

                    {/* text */}
                    <div className='text-center lg:text-left'>
                        <span className='text-xl'>Software Developer</span>

                        <h1 className='h1 mb-6'>
                            Hello, I'm <br /> <span className='text-accent'>Sazedul Islam</span>
                        </h1>
                        <p className='max-w-[500px] leading-snug mb-9 text-white/80'>I'm a Full Stack developer with 2 years of experience in building web applications. I have a strong foundation in JavaScript, and I specialize in utilizing the MERN (MongoDB, Express.js, React.js, Node.js) stack to develop robust and scalable web solutions.</p>


                        {/* button */}
                        <div className='flex flex-col lg:flex-row items-center gap-8'>
                            <a href="/Sazedul Islam Resume.pdf" download >
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="uppercase flex items-center gap-2"
                                >
                                    <span>Download CV</span>
                                    <FiDownload className='text-xl' />
                                </Button>
                            </a>

                            <div className='mb-8 lg:mb-0'>
                                <Social containerStyles="flex gap-6" iconStyles="w-9 h-9 border border-accent rounded-full flex justify-center items-center text-accent text-base hover:bg-accent hover:text-primary hover:transition-all duration-500" ></Social>
                            </div>
                        </div>

                    </div>


                    {/* photo */}
                    <div className='mb-8 lg:mb-0'>
                        <Photo></Photo>

                    </div>
                </div>


                {/* stats */}
                <div>
                    <Stats></Stats>
                </div>

                {/* services */}
                {/* <Services></Services> */}
            </div>
        </section>
    );
};

export default Home;