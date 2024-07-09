import { icons } from 'lucide-react';
import React, { useState } from 'react';
import { FaCss3, FaFigma, FaHtml5, FaJs, FaLaravel, FaNodeJs, FaPhp, FaReact, FaWordpress } from 'react-icons/fa'
import { SiExpress, SiFirebase, SiGithub, SiMongodb, SiNextdotjs, SiPython, SiTailwindcss } from 'react-icons/si'
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';



// about data
const about = {
    title: "About Me",
    description: "I am a dedicated Full Stack Developer with a strong background in web development, education, and continuous learning. My journey in the tech industry has equipped me with a robust set of skills and experiences that I am excited to bring to new challenges and opportunities.",
    info: [
        {
            fieldName: "Name",
            fieldValue: "Sazedul Islam"
        },
        {
            fieldName: "Phone",
            fieldValue: "+880 1786 549 126"
        },
        {
            fieldName: "Experience",
            fieldValue: "2+ Years"
        },
        {
            fieldName: "Nationality",
            fieldValue: "Bangladesh"
        },
        {
            fieldName: "Email",
            fieldValue: "sazedulislam@gmail.com"
        },
        {
            fieldName: "Freelance",
            fieldValue: "Available"
        },
        {
            fieldName: "Language",
            fieldValue: "English, Bengali, Hindi"
        },

    ]

}

// Experience data
const experience = {
    icon: '',
    title: "My Experience",
    description: "With a robust background in web development, I have accumulated extensive experience working in various roles and organizations. As a Full Stack Developer at Helpest BD, I design, develop, and maintain web applications, collaborating with cross-functional teams to deliver high-quality software solutions. My tenure as a Junior Instructor at the Ideal Institute of Science & Technology allowed me to impart knowledge and mentor students in web development, covering both theoretical and practical aspects. Additionally, my internship at ECC - Engineer's Computing & Computers Ltd provided hands-on experience in web development, where I assisted in developing and maintaining websites and internal tools. My diverse experience has honed my skills in full stack development, team collaboration, and instructional delivery, making me a well-rounded professional in the field of web development.",
    items: [
        {
            company: "Helpest BD",
            position: "Full Stack Developer",
            duration: "07/2023 - Present"
        },
        {
            company: "Ideal Institute of Science & Technology",
            position: "Junior Instructor (Web Development)",
            duration: "09/2022 - 07/2023"
        },
        {
            company: "ECC - Engineer's Computing & Computers Ltd",
            position: "Web Developer Intern",
            duration: "06/2022 - 09/2023"
        },

    ]
}

// Education data
const education = {
    icon: '',
    title: "My Education",
    description: "I have pursued diverse educational paths to build a strong foundation in computer science and web development:",
    items: [
        {
            institution: "Southeast University",
            degree: "BSc in Computer Science Engineering",
            duration: "Present"
        },
        {
            institution: "Programming Hero",
            degree: "Full Stack Web Development",
            duration: "6 Months"
        },
        {
            institution: "Dhaka Polytechnic Institute",
            degree: "Computer Technology",
            duration: "4 years"
        },
        {
            institution: "NTVQF Skills Course",
            degree: "Web Development Level - 4",
            duration: "2023"
        },
        {
            institution: "ECC - Engineer's Computing & Computers Ltd",
            degree: "CertiFied Web Developer",
            duration: "2023"
        },
        {
            institution: "Online Course",
            degree: "Python Programming",
            duration: "4 Months"
        },

    ]
}

// skills data
export const skills = {
    title: "My Skills",
    description: "I possess a diverse range of skills in web development and programming, including:",
    skillsList: [
        {
            icon: <FaHtml5 />,
            name: "html 5",
        },
        {
            icon: <FaCss3 />,
            name: "css 5",
        },
        {
            icon: <FaJs />,
            name: "javaScript",
        },
        {
            icon: <FaReact />,
            name: "react.js",
        },
        {
            icon: <SiNextdotjs />,
            name: "Next.js",
        },
        {
            icon: <SiTailwindcss />,
            name: "tailwind css",
        },
        {
            icon: <FaNodeJs />,
            name: "node.js",
        },
        {
            icon: <SiExpress />,
            name: "express.js",
        },
        {
            icon: <FaLaravel />,
            name: "Laravel",
        },
        {
            icon: <FaPhp />,
            name: "php",
        },
        {
            icon: <SiPython />,
            name: "python",
        },
        {
            icon: <FaWordpress />,
            name: "Wordpress",
        },
        {
            icon: <SiMongodb />,
            name: "mongoDB",
        },
        {
            icon: <SiFirebase />,
            name: "Firebase",
        },
        {
            icon: <SiGithub />,
            name: "github",
        },
        {
            icon: <FaFigma />,
            name: "figma",
        },
    ]
}


const Resume = () => {

    const [showFullDescription, setShowFullDescription] = useState(false);
    // read more button toggle
    const toggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    }

    return (
        <section>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{
                    opacity: 1,
                    transition: {
                        delay: 2.4,
                        duration: 0.4,
                        ease: 'easeIn'
                    },
                }}
                className='min-h-[80vh] flex items-center justify-center py-12'
            >
                <div className='container mx-auto'>
                    <Tabs defaultValue='experience' className='flex flex-col lg:flex-row gap-[60px]'>

                        <TabsList className="flex flex-col w-full max-w-[380px] mx-auto lg:mx-0 gap-6">
                            <TabsTrigger value="experience" >Experience</TabsTrigger>
                            <TabsTrigger value="education" >Education</TabsTrigger>
                            <TabsTrigger value="skills" >Skills</TabsTrigger>
                            <TabsTrigger value="about" >About me</TabsTrigger>
                        </TabsList>

                        {/* content */}
                        <div className='min-h-[70vh w-full]'>

                            {/* experience */}
                            <TabsContent value="experience" className="w-full">
                                <div className='flex flex-col gap-[30px] text-center lg:text-left'>
                                    <h3 className='text-4xl font-bold'>{experience.title}</h3>
                                    <p className='max-w-[600px] text-white/60 mx-auto lg:mx-0 '>
                                        {!showFullDescription ? experience.description.slice(0, 300) + "..." : experience.description}
                                        <button onClick={toggleDescription} className='text-accent hover:underline focus:outline-none'>{showFullDescription ? "Read less" : "Read more"}</button>
                                    </p>

                                    <ScrollArea className="h-[400px]">
                                        <ul className='grid grid-cols-1 lg:grid-cols-2 gap-[30px]'>
                                            {experience.items.map((item, index) => {
                                                return (
                                                    <li key={index} className='bg-[#232329] h-[184px] py-6 px-10 rounded-xl flex flex-col justify-center items-center lg:items-start gap-1'>

                                                        <span className='text-accent'>{item.duration}</span>
                                                        <h3 className='text-xl max-w-[360px] min-h-[60px] text-center lg:text-left'>{item.position}</h3>
                                                        <div className='flex items-center gap-3'>
                                                            {/* dot */}
                                                            <span className='h-[6px] w-[6px] rounded-full bg-accent'></span>
                                                            <p className='text-white/60 leading-snug'>{item.company}</p>
                                                        </div>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </ScrollArea>
                                </div>
                            </TabsContent>

                            {/* education */}
                            <TabsContent value="education" className="w-full">
                                <div className='flex flex-col gap-[30px] text-center lg:text-left'>
                                    <h3 className='text-4xl font-bold'>{education.title}</h3>
                                    <p className='max-w-[600px] text-white/60 mx-auto lg:mx-0 '>
                                        {!showFullDescription ? education.description.slice(0, 300) + "..." : education.description}
                                        <button onClick={toggleDescription} className='text-accent hover:underline focus:outline-none'>{showFullDescription ? "Read less" : "Read more"}</button>
                                    </p>

                                    <ScrollArea className="h-[400px]">
                                        <ul className='grid grid-cols-1 lg:grid-cols-2 gap-[30px]'>
                                            {education.items.map((item, index) => {
                                                return (
                                                    <li key={index} className='bg-[#232329] h-[184px] py-6 px-10 rounded-xl flex flex-col justify-center items-center lg:items-start gap-1'>

                                                        <span className='text-accent'>{item.duration}</span>
                                                        <h3 className='text-xl max-w-[360px] min-h-[60px] text-center lg:text-left'>{item.degree}</h3>
                                                        <div className='flex items-center gap-3'>
                                                            {/* dot */}
                                                            <span className='h-[6px] w-[6px] rounded-full bg-accent'></span>
                                                            <p className='text-white/60 leading-snug'>{item.institution}</p>
                                                        </div>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </ScrollArea>
                                </div>
                            </TabsContent>

                            {/* skills */}
                            <TabsContent value="skills" className="w-full h-full">
                                <div className='flex flex-col  gap-[30px] text-center lg:text-left'>

                                    <h3 className='text-4xl font-bold'>{skills.title}</h3>
                                    <p className='max-w-[600px] text-white/60 mx-auto lg:mx-0 '>
                                        {!showFullDescription ? skills.description.slice(0, 300) + "..." : skills.description}
                                        <button onClick={toggleDescription} className='text-accent hover:underline focus:outline-none'>{showFullDescription ? "Read less" : "Read more"}</button>
                                    </p>


                                    <ul className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:gap-[38px] gap-4'>
                                        {skills.skillsList.map((skill, index) => {
                                            return (
                                                <li key={index}>
                                                    <TooltipProvider delayDuration={100}>
                                                        <Tooltip>
                                                            <TooltipTrigger className='w-full h-[150px] bg-[#232329] rounded-xl flex justify-center items-center group '>
                                                                <div className='text-6xl group-hover:text-accent transition-all duration-300'>{skill.icon}</div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className='capitalize'>{skill.name}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            </TabsContent>

                            {/* about */}
                            <TabsContent value="about" className="w-full">
                                <div className='flex flex-col  gap-[30px] text-center lg:text-left'>

                                    <h3 className='text-4xl font-bold'>{about.title}</h3>
                                    <p className='max-w-[600px] text-white/60 mx-auto lg:mx-0 '>
                                        {!showFullDescription ? about.description.slice(0, 300) + "..." : about.description}
                                        <button onClick={toggleDescription} className='text-accent hover:underline focus:outline-none'>{showFullDescription ? "Read less" : "Read more"}</button>
                                    </p>


                                    <ul className='grid grid-cols-1 lg:grid-cols-2 gap-y-6 max-w-[630px mx-auto lg:mx-0]'>
                                        {about.info.map((item, index) => {
                                            return (
                                                <li key={index} className='w-full flex items-center justify-center lg:justify-start gap-4'>
                                                    <span className='text-white/60 '>{item.fieldName} :</span>
                                                    <span className='text-xl'>{item.fieldValue}</span>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            </TabsContent>

                        </div>
                    </Tabs>
                </div>
            </motion.div>
        </section>
    );
};

export default Resume;