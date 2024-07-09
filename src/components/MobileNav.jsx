import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Link, useLocation } from 'react-router-dom';
import { CiMenuFries } from 'react-icons/ci';
import { navItems } from '../helpers/navItems';


const MobileNav = () => {
    const location = useLocation()

    return (
        <Sheet>
            <SheetTrigger className="flex justify-center items-center">
                <CiMenuFries className='text-2xl text-accent' />
            </SheetTrigger>

            <SheetContent className="flex flex-col">
                {/* logo */}
                <div className='mb-16 mt-20 text-center'>
                    <Link to={'/'}>
                        <h1 className='text-xl font-semibold'>
                            Sazed <span className='text-sm text-accent '>Creations's</span>
                        </h1>
                    </Link>
                </div>


                {/* nav */}
                <nav className='flex flex-col justify-center items-center gap-6'>
                    {
                        navItems.map((nav, index) => {
                            return (
                                <Link to={nav.path} key={index} className={`${nav.path === location?.pathname && "text-accent border-b-2 border-accent "} capitalize font-medium hover:text-accent transition-all`} >
                                    {nav.name}
                                </Link>
                            )
                        })
                    }
                </nav>
            </SheetContent>
        </Sheet>
    );
};

export default MobileNav;