import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
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

    const location = useLocation()
    // console.log(location?.pathname)

    return (
        <nav className='lg:flex  gap-8'>
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
    );
};

export default Nav;