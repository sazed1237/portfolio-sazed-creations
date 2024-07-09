import { animate, motion } from 'framer-motion';
import React from 'react';



// variants
const stairAnimation = {
    initial: {
        top: "0%",
    },
    animate: {
        top: "100%",
    },
    exit: {
        top: ["100%", "0%"],
    },
}


// calculate the reverse index for staggred delay
const reverseIndex = (index) => {
    const totalSteps = 10; //number of steps
    return totalSteps - index - 1;
}



const Stairs = () => {
    return (
        <>
            {/* render 10 motion divs, each representing a step of the stairs */}
            {[...Array(10)].map((_, index) => {
                return (

                    <motion.div
                        key={index}
                        variants={stairAnimation}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{
                            duration: 0.4,
                            ease: 'easeInOut',
                            delay: reverseIndex(index) * 0.1,
                        }}
                        className='h-full w-full bg-green-200 relative'
                    />
                );
            })}

        </>
    );
};

export default Stairs;