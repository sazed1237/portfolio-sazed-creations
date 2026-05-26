"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import profileImageFile from "@/assets/Sazedul Islam.jpg";
import {
  FaCss3,
  FaHtml5,
  FaJs,
  FaNodeJs,
  FaPhp,
  FaReact,
  FaWordpress,
} from "react-icons/fa";
import {
  SiAmazonaws,
  SiDocker,
  SiExpress,
  SiFirebase,
  SiGithub,
  SiGo,
  SiMongodb,
  SiMysql,
  SiNestjs,
  SiNextdotjs,
  SiPostgresql,
  SiPrisma,
  SiRedis,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

const resumePdf = "/Sazedul%20Islam%20Backend%20Engineer.pdf";

const about = {
  title: "About Me",
  description: `
I’m a Backend Software Engineer with over 2 years of professional experience building scalable, secure, and high-performance web applications using Node.js, TypeScript, and NestJS. I specialize in designing clean, maintainable backend architectures, developing robust RESTful APIs, and working with microservices-based systems that scale in real-world production environments.

My technical expertise includes working with PostgreSQL, MongoDB, and Redis, implementing JWT and OAuth-based authentication, and building real-time features using WebSockets and Socket.IO. I’ve also worked extensively with background job processing, subscription-based systems, and third-party integrations such as Stripe and OpenAI APIs.

I have hands-on experience deploying and operating backend systems using AWS (S3, EC2/VPS), Docker, Linux, and basic CI/CD workflows, with a strong focus on performance, security, and developer-friendly API design. While backend development is my core strength, I’m comfortable collaborating across the stack and have working experience with React and Next.js to support smooth frontend-backend integration.

I enjoy solving complex problems, writing clean and well-documented code, and working in Agile, collaborative environments. I’m always eager to learn, improve system reliability, and contribute to products that deliver real value to users and teams.
  `,
  info: [
    { fieldName: "Name", fieldValue: "Sazedul Islam" },
    { fieldName: "Phone", fieldValue: "+880 1786 549 126" },
    { fieldName: "Experience", fieldValue: "2+ Years" },
    { fieldName: "Location", fieldValue: "Dhaka, Bangladesh" },
    { fieldName: "Email", fieldValue: "sazedulislam9126@gmail.com" },
    { fieldName: "Freelance", fieldValue: "Available" },
    { fieldName: "Languages", fieldValue: "English, Bengali, Hindi" },
  ],
};

const experience = {
  title: "Experience",
  description:
    "I have professional experience across both technical and client-facing roles. My background includes building scalable backend systems, collaborating with cross-functional teams, and managing key client accounts. This combination has strengthened my communication skills, business understanding, and ability to deliver technical solutions aligned with real-world requirements.",
  items: [
    {
      company: "Softvence Delta - Betopia Group",
      position: "Jr. Backend Developer",
      duration: "03/2025 - Present",
    },
    {
      company: "Softvence Delta - Betopia Group",
      position: "Key Account Manager",
      duration: "09/2024 - 03/2025",
    },
    {
      company: "HelpestBD Ltd",
      position: "Full Stack Developer",
      duration: "07/2023 - 09/2024",
    },
    {
      company: "Ideal Institute of Science & Technology (IIST)",
      position: "Jr. Instructor – Web Development",
      duration: "03/2023 - 02/2024",
    },
    {
      company: "Engineers Computing & Computers (ECC) Ltd",
      position: "Web Developer Intern",
      duration: "09/2022 - 03/2023",
    },
  ],
};

const education = {
  title: "Education",
  description:
    "I have built a strong academic and practical foundation in computer science and software development through formal education and professional training.",
  items: [
    {
      institution: "Southeast University",
      degree: "BSc in Computer Science & Engineering",
      duration: "03/2023 - Present",
    },
    {
      institution: "Dhaka Polytechnic Institute",
      degree: "Diploma in Engineering – Computer Technology",
      duration: "01/2017 - 02/2023",
    },
    {
      institution: "Programming Hero",
      degree: "Web Development (Next Level & Level 1)",
      duration: "Completed",
    },
    {
      institution: "NTVQF",
      degree: "Web Development Level – 4",
      duration: "Completed",
    },
  ],
};

export const skills = {
  title: "Skills",
  description:
    "I work primarily as a backend-focused engineer with strong full-stack collaboration experience.",
  skillsList: [
    { icon: <FaJs />, name: "JavaScript (ES6+)" },
    { icon: <SiTypescript />, name: "TypeScript" },
    { icon: <FaNodeJs />, name: "Node.js" },
    { icon: <SiNestjs />, name: "NestJS" },
    { icon: <SiExpress />, name: "Express.js" },
    { icon: <SiGo />, name: "Go" },
    { icon: <SiPostgresql />, name: "PostgreSQL" },
    { icon: <SiMongodb />, name: "MongoDB" },
    { icon: <SiMysql />, name: "MySQL" },
    { icon: <SiRedis />, name: "Redis" },
    { icon: <SiPrisma />, name: "Prisma" },
    { icon: <FaReact />, name: "React.js" },
    { icon: <SiNextdotjs />, name: "Next.js" },
    { icon: <SiDocker />, name: "Docker" },
    { icon: <SiAmazonaws />, name: "AWS" },
    { icon: <SiGithub />, name: "Git & GitHub" },
    { icon: <SiFirebase />, name: "Firebase" },
    { icon: <SiTailwindcss />, name: "Tailwind CSS" },
    { icon: <FaHtml5 />, name: "HTML5" },
    { icon: <FaCss3 />, name: "CSS3" },
    { icon: <FaPhp />, name: "PHP" },
    { icon: <FaWordpress />, name: "WordPress" },
  ],
};

const sectionVariants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const listContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const Resume = () => {
  const [showAboutFullDescription, setShowAboutFullDescription] =
    useState(false);
  const aboutParagraphs = about.description
    .trim()
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);

  const quickFacts = about.info.slice(0, 5);
  const featuredSkills = skills.skillsList.slice(0, 10);
  const visibleAboutParagraphs = showAboutFullDescription
    ? aboutParagraphs
    : aboutParagraphs.slice(0, 1);

  return (
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { delay: 0.15, duration: 0.5, ease: "easeOut" },
        }}
        className="container mx-auto"
      >
        <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
          <aside className="lg:sticky lg:top-24 space-y-6">
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-[#0c1826]/80 border border-white/10 overflow-hidden shadow-[0_16px_45px_rgba(2,6,23,0.45)] backdrop-blur-sm"
            >
              <div className="relative h-[360px] w-full bg-[#08131e]">
                <Image
                  src={profileImageFile}
                  alt="Sazedul Islam"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-accent/90">
                    Resume
                  </p>
                  <h1 className="text-3xl font-bold mt-2">Sazedul Islam</h1>
                  <p className="text-white/65 mt-2">
                    Backend Software Engineer
                  </p>
                </div>

                <p className="text-white/70 leading-relaxed">
                  Backend-focused engineer building secure APIs, real-time
                  systems, and scalable application architecture.
                </p>

                <div className="flex flex-col gap-3">
                  <a
                    href={resumePdf}
                    download
                    className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-3 text-primary font-semibold transition-opacity hover:opacity-90"
                  >
                    Download PDF
                  </a>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Contact Me
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl bg-[#0c1826]/80 border border-white/10 p-6 shadow-[0_16px_45px_rgba(2,6,23,0.45)] backdrop-blur-sm space-y-5"
            >
              <h2 className="text-xl font-semibold">Quick Facts</h2>
              <ul className="space-y-3">
                {quickFacts.map((item) => (
                  <li
                    key={item.fieldName}
                    className="flex items-start justify-between gap-4 text-sm"
                  >
                    <span className="text-white/55">{item.fieldName}</span>
                    <span className="text-right text-white/90 font-medium">
                      {item.fieldValue}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl bg-[#0c1826]/80 border border-white/10 p-6 shadow-[0_16px_45px_rgba(2,6,23,0.45)] backdrop-blur-sm space-y-5"
            >
              <h2 className="text-xl font-semibold">Top Skills</h2>
              <div className="flex flex-wrap gap-2">
                {featuredSkills.map((skill) => (
                  <span
                    key={skill.name}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </motion.div>
          </aside>

          <div className="space-y-8">
            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="rounded-3xl bg-[#0c1826]/80 border border-white/10 p-6 md:p-8 shadow-[0_16px_45px_rgba(2,6,23,0.45)] backdrop-blur-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-accent/90">
                    Professional Profile
                  </p>
                  <h2 className="mt-2 text-4xl font-bold">About Me</h2>
                </div>
                {/* <p className="max-w-xl text-white/60">
                  A concise summary of experience, technical direction, and the value I bring to teams and products.
                </p> */}
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="space-y-4 text-white/75 leading-relaxed">
                  {visibleAboutParagraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}

                  {aboutParagraphs.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowAboutFullDescription((current) => !current)
                      }
                      className="text-accent text-sm font-semibold hover:underline"
                    >
                      {showAboutFullDescription ? "Read less" : "Read more"}
                    </button>
                  )}
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                  <h3 className="text-lg font-semibold mb-4">Core Focus</h3>
                  <ul className="space-y-3 text-white/75">
                    <li>• Backend architecture and API development</li>
                    <li>• Authentication, authorization, and security</li>
                    <li>• Database design, optimization, and scaling</li>
                    <li>• Real-time and background processing systems</li>
                  </ul>
                </div>
              </div>
            </motion.section>

            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="rounded-3xl bg-[#0c1826]/80 border border-white/10 p-6 md:p-8 shadow-[0_16px_45px_rgba(2,6,23,0.45)] backdrop-blur-sm"
            >
              <div className="flex items-end justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-accent/90">
                    Career
                  </p>
                  <h2 className="mt-2 text-3xl font-bold">Experience</h2>
                </div>
              </div>

              <motion.div
                variants={listContainerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                className="space-y-5"
              >
                {experience.items.map((item) => (
                  <motion.article
                    key={`${item.position}-${item.duration}`}
                    variants={listItemVariants}
                    whileHover={{
                      y: -4,
                      borderColor: "rgba(102,224,196,0.35)",
                    }}
                    className="relative rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-accent text-sm font-medium">
                          {item.duration}
                        </p>
                        <h3 className="mt-1 text-xl font-semibold text-white">
                          {item.position}
                        </h3>
                      </div>
                      <div className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                        {item.company}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </motion.section>

            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="rounded-3xl bg-[#0c1826]/80 border border-white/10 p-6 md:p-8 shadow-[0_16px_45px_rgba(2,6,23,0.45)] backdrop-blur-sm"
            >
              <p className="text-sm uppercase tracking-[0.28em] text-accent/90">
                Academic Path
              </p>
              <h2 className="mt-2 text-3xl font-bold">Education</h2>

              <motion.div
                variants={listContainerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                className="mt-6 grid gap-5 md:grid-cols-2"
              >
                {education.items.map((item) => (
                  <motion.article
                    key={`${item.degree}-${item.duration}`}
                    variants={listItemVariants}
                    whileHover={{
                      y: -4,
                      borderColor: "rgba(102,224,196,0.35)",
                    }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.24)]"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-accent text-sm font-medium">
                        {item.duration}
                      </p>
                      <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                        Education
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {item.degree}
                    </h3>
                    <p className="mt-3 text-white/70 leading-relaxed">
                      {item.institution}
                    </p>
                  </motion.article>
                ))}
              </motion.div>
            </motion.section>

            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="rounded-3xl bg-[#0c1826]/80 border border-white/10 p-6 md:p-8 shadow-[0_16px_45px_rgba(2,6,23,0.45)] backdrop-blur-sm"
            >
              <p className="text-sm uppercase tracking-[0.28em] text-accent/90">
                Technical Toolkit
              </p>
              <h2 className="mt-2 text-3xl font-bold">Skills</h2>
              <p className="mt-3 max-w-2xl text-white/60">
                A practical set of technologies used across backend, full-stack
                integration, deployment, and product delivery.
              </p>

              <motion.div
                variants={listContainerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
              >
                {skills.skillsList.map((skill) => (
                  <motion.div
                    key={skill.name}
                    variants={listItemVariants}
                    whileHover={{
                      y: -4,
                      scale: 1.02,
                      borderColor: "rgba(102,224,196,0.35)",
                    }}
                    className="rounded-2xl border border-white/10 bg-[#08131e]/85 p-4 text-center transition-transform hover:-translate-y-0.5"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-2xl text-accent">
                      {skill.icon}
                    </div>
                    <p className="mt-3 text-sm font-medium text-white/80">
                      {skill.name}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Resume;
