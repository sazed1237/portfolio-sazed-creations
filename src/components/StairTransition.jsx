"use client";

import { AnimatePresence, motion } from 'framer-motion';
import Stairs from './Stairs';

const StairTransition = ({ active = true }) => {
    if (!active) return null;

    return (
        <AnimatePresence mode='wait'>
            <motion.div
                key='global-loader'
                className='fixed inset-0 z-[130] flex h-screen w-screen'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
            >
                <Stairs />
            </motion.div>
        </AnimatePresence>
    );
};

export default StairTransition;