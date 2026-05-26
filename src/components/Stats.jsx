"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { projects } from '../data/projectsData.js';
import { skills } from '../Page/Resume/Resume';

const CardTile = ({ value, label }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.45 }}
      className='bg-surface/50 border border-white/6 rounded-lg p-5 flex flex-col gap-3'
    >
      <div className='flex items-center justify-between'>
        <div>
          <div className='text-3xl lg:text-4xl font-extrabold text-accent'>
            <CountUp end={value} duration={1.8} separator="," />
          </div>
          <div className='text-sm text-[#bcd3e6] mt-1'>{label}</div>
        </div>
      </div>
      
    </motion.div>
  );
};

const Stats = () => {
  const [commitCount, setCommitCount] = useState(0);
  const [isCommitCountAvailable, setIsCommitCountAvailable] = useState(false);

  useEffect(() => {
    const cacheKey = 'github_stats';
    const cacheTtlMs = 1000 * 60 * 60 * 6;

    const readCache = () => {
      try {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.ts) return null;
        if (Date.now() - parsed.ts > cacheTtlMs) return null;
        return parsed;
      } catch {
        return null;
      }
    };

    const writeCache = (data) => {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ ...data, ts: Date.now() }));
      } catch {
        // ignore
      }
    };

    const fetchCommitContributions = async () => {
      const cached = readCache();
      if (cached?.commitCount != null && cached?.isCommitCountAvailable != null) {
        setCommitCount(cached.commitCount);
        setIsCommitCountAvailable(cached.isCommitCountAvailable);
        return;
      }
      try {
        const res = await fetch('/api/github-stats', { cache: 'no-store' });
        const data = await res.json();
        const total = data?.commitCount ?? 0;
        setCommitCount(total);
        setIsCommitCountAvailable(Boolean(data?.isCommitCountAvailable));
        writeCache({ commitCount: total, isCommitCountAvailable: Boolean(data?.isCommitCountAvailable) });
      } catch {
        setCommitCount(0);
        setIsCommitCountAvailable(false);
        writeCache({ commitCount: 0, isCommitCountAvailable: false });
      }
    };

    fetchCommitContributions();
  }, []);

  const items = [
    { value: 2, label: 'Years of experience' },
    { value: projects.items.length, label: 'Projects completed' },
    { value: skills.skillsList.length, label: 'Technologies mastered' },
    ...(isCommitCountAvailable ? [{ value: commitCount, label: 'Commits (last year)' }] : []),
  ];

  return (
    <section className='pt-6 pb-10 lg:pt-8'>
      <div className='container mx-auto'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto'>
          {items.map((it, idx) => (
            <CardTile key={idx} value={it.value} label={it.label} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
