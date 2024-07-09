import React from 'react';
import { Link } from 'react-router-dom';
import Nav from './Nav';
import { Button } from './ui/button';
import MobileNav from './MobileNav';


const Header = () => {
    return (
        <header className='py-8 xl:py-12 text-white'>
            <div className='container mx-auto flex  items-center justify-between'>
                {/* logo */}
                <Link to={'/'}>
                    <h1 className='text-2xl md:text-4xl font-semibold'>
                        Sazed <span className='text-sm text-accent md:text-xl'>Creations's</span>
                    </h1>
                </Link>


                {/* desktop nav & hire me button */}
                <div className="hidden lg:flex items-center  gap-8">

                    <Nav></Nav>

                    <Link to={'contact'}>
                        <Button>Hire me</Button>
                    </Link>
                </div>


                {/* mobile nav  */}
                <div className='lg:hidden'>
                    <MobileNav></MobileNav>
                </div>

            </div>
        </header>
    );
};

export default Header;