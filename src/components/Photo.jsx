"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import sazedul_image from '../assets/Sazedul Islam.png';

const Photo = () => {
    return (
        <div className='w-full h-full relative flex justify-center items-center'>
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }}
                    whileHover={{ rotate: 0, y: -10, scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                    className='cursor-pointer select-none floaty'
                >
                {/* Polaroid paper wrapper */}
                <div className='relative transform rotate-3 hover:rotate-0 transition-transform duration-500'>
                    <div className='bg-white/3 rounded-[10px] p-3 shadow-[0_30px_60px_rgba(2,8,20,0.35)]'>
                        <div className='bg-white rounded-[6px] p-2'>
                            <div className='w-[160px] h-[160px] sm:w-[220px] sm:h-[220px] lg:w-[350px] lg:h-[350px] overflow-hidden rounded-sm bg-[#07101b]'>
                                <Image src={sazedul_image} priority fill alt='Sazedul Islam — Backend Developer' className='object-cover' />
                                <div className='pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/20 mix-blend-overlay' />
                            </div>
                        </div>
                        {/* white polaroid foot */}
                        <div className='mt-2 bg-white rounded-b-[6px] pt-1 pb-3 px-3 text-center'>
                            <div className='text-sm text-[#08111d] font-semibold'>Sazedul Islam</div>
                        </div>
                    </div>

                    {/* accent corner */}
                    <div className='absolute -top-4 -right-4 w-10 h-10 rounded-sm border-2 border-accent/90 bg-accent/10 shadow-[0_6px_30px_rgba(66,200,170,0.12)]' />
                </div>
            </motion.div>
        </div>
    );
};

export default Photo;