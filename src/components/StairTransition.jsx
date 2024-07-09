import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { useLocation } from 'react-router-dom';
import Stairs from './Stairs';

const StairTransition = () => {
    const location = useLocation()

    return (
        <>
            <AnimatePresence mode='wait'>
                <div key={location?.pathname}>

                    <div className='h-screen w-screen fixed top-0 right-0 left-0 pointer-events-none z-40 flex'>
                        <Stairs></Stairs>
                    </div>

                    <motion.div
                        className='h-screen w-screen fixed bg-primary top-0 pointer-events-none'
                        initial={{ opacity: 1 }}
                        animate={{
                            opacity: 0,
                            transition: {
                                delay: 1,
                                duration: 0.4,
                                ease: "easeInOut",
                            },
                        }}
                    />

                </div>
            </AnimatePresence>
        </>
    );
};

export default StairTransition;