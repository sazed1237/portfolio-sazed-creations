import React from 'react';
import Home from '../Home';
import Services from '../../Services/Services';
import Resume from '../../Resume/Resume';
import Work from '../../Work/Work';
import Contact from '../../Contact/Contact';

const MainHome = () => {
    return (
        <div>
            <Home></Home>
            <div className='bg-[#242429] py-9'>
                <h2 className='text-4xl font-bold text-center my-11 '>My <span className='text-accent'>Services</span></h2>
                <Services></Services>
            </div>
            <Resume></Resume>

            <div className='bg-[#242429] py-6'>
                <h2 className='text-4xl font-bold text-center my-11 '>My <span className='text-accent'>Work</span></h2>
                <Work></Work>
            </div>

            <div className='py-12'>
                <Contact></Contact>
            </div>


        </div>
    );
};

export default MainHome;