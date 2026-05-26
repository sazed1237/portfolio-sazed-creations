"use client";

import Link from 'next/link';
import Nav from './Nav';
import { Button } from './ui/button';
import MobileNav from './MobileNav';


const Header = () => {
    return (
        <header className='py-5 xl:py-5 text-[#e8eef8] sticky top-0 z-50 bg-[#08111d]/82 backdrop-blur-xl border-b border-white/5'>
            <div className='container mx-auto flex  items-center justify-between'>
                {/* logo */}
                <Link href={'/'}>
                    <h1 className='text-2xl md:text-4xl font-semibold tracking-wide'>
                        SazeD
                        {/* Sazed <span className='text-sm text-accent md:text-xl'>Creations</span> */}
                    </h1>
                </Link>


                {/* desktop nav & hire me button */}
                <div className="hidden lg:flex items-center  gap-8">

                    <Nav></Nav>

                    <Button asChild>
                        <Link href={'/contact'}>
                            Hire me
                        </Link>
                    </Button>
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