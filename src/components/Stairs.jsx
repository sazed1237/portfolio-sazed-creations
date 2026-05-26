"use client";

import { motion } from 'framer-motion';

const Stairs = () => {
    return (
        <motion.div
            className='relative flex h-full w-full items-center justify-center overflow-hidden bg-[#06111c] px-4 py-6'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className='absolute inset-0 bg-[radial-gradient(circle,_rgba(102,224,196,0.10)_0%,_transparent_55%)]' />

            <div className='relative z-10 flex flex-col items-center gap-5'>
                <div className='relative flex h-20 w-20 items-center justify-center'>
                    <motion.span
                        className='absolute inset-0 rounded-full border border-accent/25'
                        animate={{ scale: [1, 1.25, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.span
                        className='absolute inset-2 rounded-full border border-white/10'
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.span
                        className='h-3 w-3 rounded-full bg-accent shadow-[0_0_18px_rgba(102,224,196,0.8)]'
                        animate={{ scale: [1, 1.35, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>

                <motion.p
                    className='text-base font-medium tracking-[0.28em] text-white/65 uppercase'
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                    Loading
                </motion.p>
            </div>
        </motion.div>
    );
};

export default Stairs;