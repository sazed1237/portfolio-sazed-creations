"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { CiMenuFries } from 'react-icons/ci';
import { navItems } from '../helpers/navItems';


const MobileNav = () => {
    const pathname = usePathname()

    return (
        <Sheet>
            <SheetTrigger className="flex justify-center items-center">
                <CiMenuFries className='text-2xl text-accent' />
            </SheetTrigger>

            <SheetContent className="flex flex-col bg-[#09111d] text-[#e8eef8] border-white/8">
                {/* logo */}
                <div className='mb-16 mt-20 text-center'>
                    <Link href={'/'}>
                        <h1 className='text-xl font-semibold tracking-wide'>
                            SazeD
                            {/* Sazed <span className='text-sm text-accent '>Creations</span> */}
                        </h1>
                    </Link>
                </div>


                {/* nav */}
                <nav className='flex flex-col justify-center items-center gap-6'>
                    {
                        navItems.map((nav, index) => {
                            return (
                                <Link href={nav.path} key={index} className={`${nav.path === pathname && "text-accent border-b-2 border-accent "} capitalize font-medium text-[#d3ddeb] hover:text-accent transition-all`} >
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