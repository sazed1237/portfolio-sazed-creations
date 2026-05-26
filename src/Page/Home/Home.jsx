"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from "../../components/ui/button";
import { FiDownload } from "react-icons/fi";
import Social from "../../components/Social";
import Photo from "../../components/Photo";
import Stats from "../../components/Stats";
import { motion } from 'framer-motion';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatDate(value) {
  if (!value) return 'recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const Home = () => {
  return (
    <section className="h-full">
      <div className="container mx-auto h-full">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between lg:pt-16 lg:pb-20">
          {/* text */}
          <motion.div className="text-center lg:text-left" variants={container} initial="hidden" animate="show">
            <motion.span variants={item} className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm tracking-[0.25em] text-accent uppercase shadow-[0_0_0_1px_rgba(102,224,196,0.08)]">
              Backend Software Engineer
            </motion.span>

            <motion.h1 variants={item} className="h2 mt-7 mb-7">
              Sazedul Islam
            </motion.h1>

            <motion.p variants={item} className="max-w-[620px] text-lg leading-relaxed mb-8 text-[#c6d2e2] mx-auto lg:mx-0">
              I build secure, scalable backend systems and clean full-stack integrations using
              <span className="font-semibold text-[#f2f7fd]"> Node.js, NestJS, TypeScript</span>,
              and modern cloud-native tooling. My focus is on APIs, real-time features, database design,
              and production-ready engineering.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap justify-center lg:justify-start gap-3 mb-12">
              {['REST APIs','Microservices','PostgreSQL','AWS & Docker'].map((t, i) => (
                <motion.span key={i} variants={item} className="rounded-full border border-white/6 bg-[#07101b] px-4 py-2 text-sm text-[#bcd3e6] backdrop-blur-sm">
                  {t}
                </motion.span>
              ))}
            </motion.div>

            {/* button */}
            <motion.div variants={item} className="flex flex-col lg:flex-row items-center gap-6">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button asChild size="lg" className="uppercase flex items-center gap-2 bg-gradient-to-br from-[#66e0c4] to-[#43c6ad] text-[#06111c] neon-pulse">
                  <Link href="/contact">
                    <span>Hire Me</span>
                  </Link>
                </Button>
              </motion.div>

              <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href="/Sazedul Islam Backend Engineer.pdf" download>
                <Button
                  variant="outline"
                  size="lg"
                  className="uppercase flex items-center gap-3 border-accent"
                >
                  <span>Download Resume</span>
                  <FiDownload className="text-xl text-accent" />
                </Button>
              </motion.a>

              <motion.div variants={item} className="mb-8 lg:mb-0">
                <Social
                  containerStyles="flex gap-6"
                  iconStyles="w-9 h-9 border border-accent rounded-full flex justify-center items-center text-accent text-base hover:bg-accent hover:text-[#06111c] hover:transition-all duration-500"
                ></Social>
              </motion.div>
            </motion.div>
            </motion.div>

          {/* photo */}
          <div className="mb-8 lg:mb-0 w-full flex justify-center lg:justify-end">
            <div className="w-[200px] sm:w-[260px] lg:w-[420px]">
              <Photo />
            </div>
          </div>
        </div>

        {/* stats */}
        <div>
          <Stats></Stats>
        </div>

        {/* services */}
        {/* <Services></Services> */}
      </div>
    </section>
  );
};

export function HomeBlog({ initialPosts = [] }) {
  const latestPosts = Array.isArray(initialPosts) ? initialPosts.slice(0, 3) : [];

  return (
    <section className="my-14 lg:mt-20">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Latest Writing</p>
            <h2 className="mt-2 text-3xl font-semibold text-white md:text-4xl">Recent blog posts and project notes</h2>
            <p className="mt-3 text-sm leading-7 text-[#c6d2e2] md:text-base">
              Short updates, tutorials, and deeper technical notes from the work I build and publish.
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-accent transition hover:bg-white/10"
          >
            <span>View all posts</span>
            <span>→</span>
          </Link>
        </div>

        {latestPosts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#0b1725]/80 p-6 text-sm text-[#c6d2e2] backdrop-blur-sm">
            No blog posts have been published yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {latestPosts.map((post) => {
              const tags = Array.isArray(post.tags) ? post.tags : [];
              const preview = stripHtml(post.excerpt || post.body).slice(0, 140) || 'Read the full post for more details.';

              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug || slugify(post.title)}`}
                  className="group overflow-hidden rounded-[28px] border border-white/10 bg-[#0c1826]/80 shadow-[0_14px_40px_rgba(2,6,23,0.45)] backdrop-blur-sm transition hover:-translate-y-1 hover:border-accent/25"
                >
                  <div className="relative h-52 overflow-hidden bg-slate-900">
                    {post.thumb ? (
                      <Image
                        src={post.thumb}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-xs uppercase tracking-[0.24em] text-white/35">
                        No Cover Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08131e]/85 via-transparent to-transparent" />
                    {post.featured ? (
                      <span className="absolute left-4 top-4 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                        Featured
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex items-center justify-between gap-3 text-xs text-white/45">
                      <span>{formatDate(post.updatedAt || post.createdAt)}</span>
                      <span>{tags.length} tag{tags.length === 1 ? '' : 's'}</span>
                    </div>

                    <h3 className="line-clamp-2 text-2xl font-semibold tracking-tight text-white">{post.title}</h3>
                    <p className="line-clamp-3 text-sm leading-7 text-white/65">{preview}</p>

                    {tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Home;
