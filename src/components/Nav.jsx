"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from '../helpers/navItems';

// const navItems = [
//     {
//         name: "Home",
//         path: '/'
//     },
//     {
//         name: "Services",
//         path: '/services'
//     },
//     {
//         name: "Resume",
//         path: '/resume'
//     },
//     {
//         name: "Work",
//         path: '/work'
//     },
//     {
//         name: "Contact",
//         path: '/contact'
//     },
// ]

const Nav = () => {

    const pathname = usePathname()

    return (
        <nav className='lg:flex  gap-8'>
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
    );
};

export default Nav;