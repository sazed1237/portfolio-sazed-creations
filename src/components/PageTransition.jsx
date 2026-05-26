"use client";

import { AnimatePresence } from 'framer-motion';

const PageTransition = ({ children }) => {
    return (
        <AnimatePresence>
            <div>{children}</div>
        </AnimatePresence>
    );
};

export default PageTransition;