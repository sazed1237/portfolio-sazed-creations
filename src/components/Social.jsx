import React from 'react';

import { FaGithub, FaLinkedinIn, FaYoutube, FaTwitter, FaFacebook } from 'react-icons/fa'
import { Link } from 'react-router-dom';


const socialItems = [
    {
        icon: <FaGithub />,
        path: "https://github.com/sazed1237?tab=repositories"
    },
    {
        icon: <FaLinkedinIn />,
        path: "https://www.linkedin.com/in/sazed1237?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
    },
    {
        icon: <FaFacebook />,
        path: "https://www.facebook.com/sazed9126?mibextid=ZbWKwL"
    },
    {
        icon: <FaTwitter />,
        path: "https://x.com/SazedCreations?s=09"
    },
]

const Social = ({ containerStyles, iconStyles }) => {
    return (
        <div className={containerStyles}>
            {
                socialItems.map((social, index) => {
                    return (
                        <Link target='_blank' key={index} to={social.path} className={iconStyles}>{social.icon}</Link>
                    )
                })
            }
        </div>
    );
};

export default Social;