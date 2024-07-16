import React from 'react';
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';


const info = [
    {
        icon: <FaPhoneAlt />,
        title: "Phone",
        description: "+880 1786 549 126",
    },
    {
        icon: <FaEnvelope />,
        title: "Email",
        description: "sazedulislam9126@gmail.com",
    },
    {
        icon: <FaMapMarkerAlt />,
        title: "Address",
        description: "Mirpur-1, Dhaka, Bangladesh",
    },
]

const Contact = () => {
    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{
                opacity: 1,
                transition: {
                    delay: 2.4,
                    duration: 0.4,
                    ease: "easeIn"
                }
            }}
            className='py-6'
        >
            <div className="container mx-auto">
                <div className='flex flex-col-reverse lg:flex-row gap-[30px]'>
                    {/* form */}
                    <div className='lg:w-[54%]'>
                        <form className='flex flex-col gap-6 p-10 bg-[#27272c] rounded-xl'>
                            <h3 className='text-3xl text-accent'>Let's Create Something Amazing</h3>
                            <p className='text-white/60'>Ready to bring your ideas to life? Get in touch!</p>

                            {/* input */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <Input type="firstname" placeholder="Firstname" />
                                <Input type="lastname" placeholder="Lastname" />
                                <Input type="email" placeholder="Email" />
                                <Input type="phone" placeholder="Phone" />
                            </div>

                            {/* select */}
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a service" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Select a service</SelectLabel>
                                        <SelectItem value="est">Full Stack Web Development</SelectItem>
                                        <SelectItem value="cst">Web Design</SelectItem>
                                        <SelectItem value="mst">Graphic Design</SelectItem>
                                        <SelectItem value="ast">Digital Marketing</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            {/* textarea */}
                            <Textarea
                                className="h-[200px]"
                                placeholder="Type your message here..."
                            />

                            {/* button */}
                            <Button size="md" className="max-w-40">
                                Send message
                            </Button>
                        </form>
                    </div>

                    {/* info */}
                    <div className='flex-1 flex items-center lg:justify-end mb-8 lg:mb-0'>
                        <ul className='flex flex-col gap-10'>
                            {info.map((item, index) => {
                                return (
                                    <li key={index} className='flex items-center gap-4'>
                                        <div className='w-[52px] h-[50px] lg:w-[52px] lg:h-[50px] bg-[#27272c] text-accent rounded-md flex items-center justify-center'>
                                            <div className='text-[28px]'>{item.icon}</div>
                                        </div>
                                        <div className='flex-1 '>
                                            <p className='text-white/60'>{item.title}</p>
                                            <h3 className='text-sm md:text-xl'>{item.description}</h3>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </motion.section>
    );
};

export default Contact;