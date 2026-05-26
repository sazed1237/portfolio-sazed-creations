"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BsArrowDownRight } from "react-icons/bs";
import { FaServer, FaReact, FaRobot, FaDatabase, FaRocket, FaCloud } from "react-icons/fa";
import { services } from "../../helpers/servicesData";

const serviceIcons = [
  FaServer,
  FaReact,
  FaRobot,
  FaDatabase,
  FaRocket,
  FaCloud,
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const Services = () => {
  const [catalog, setCatalog] = useState(services);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadServices() {
      try {
        const response = await fetch("/api/services", { cache: "no-store" });
        const payload = await response.json();

        if (response.ok && Array.isArray(payload?.items) && payload.items.length > 0) {
          if (active) {
            setCatalog(payload.items);
          }
        }
      } catch (error) {
        console.warn("Failed to load live services, using fallback catalog:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      active = false;
    };
  }, []);

  const visibleServices = catalog.length > 0 ? catalog : services;

  return (
    <section className="min-h-[90vh] flex flex-col justify-center py-16 lg:py-20 bg-gradient-to-b from-[#06111c] via-[#0a1628] to-[#07101b] relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/3 rounded-full blur-3xl opacity-40 pointer-events-none" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 lg:mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            Services
          </h2>
          <p className="text-accent text-lg">What I specialize in</p>
          <p className="mt-2 max-w-2xl text-sm text-[#bcd3e6]">
            {loading
              ? "Loading the live service catalog..."
              : "Live service packages backed by the same catalog used in the admin dashboard."}
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {visibleServices.map((service, index) => {
            const IconComponent = serviceIcons[index] || FaServer;
            const contactHref = service.href || `/contact?service=${encodeURIComponent(service.title)}`;
            return (
              <motion.article
                key={service.id ?? service.num ?? service.title ?? index}
                variants={cardVariants}
                whileHover={{ y: -8 }}
                className="group relative h-full overflow-hidden rounded-xl bg-gradient-to-br from-[#0f1419] to-[#07101b] border border-white/5 p-8 shadow-lg transition-all duration-300 hover:border-accent/30 hover:shadow-[0_0_30px_rgba(102,224,196,0.1)]"
              >
                {/* Animated Background Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon Header */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="w-14 h-14 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center"
                    >
                      <IconComponent className="text-2xl text-accent" />
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 4, y: -4 }}
                      className="text-accent/60 group-hover:text-accent transition-colors"
                    >
                      <BsArrowDownRight className="text-xl" />
                    </motion.div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg lg:text-xl font-semibold text-white mb-3 leading-snug group-hover:text-accent transition-colors duration-300">
                    {service.title}
                  </h3>

                  <div className="mb-4 flex flex-wrap gap-2 text-xs">
                    {service.tier ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/75">
                        {service.tier}
                      </span>
                    ) : null}
                    {service.price ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/75">
                        {service.price}
                      </span>
                    ) : null}
                    {service.turnaround ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/75">
                        {service.turnaround}
                      </span>
                    ) : null}
                  </div>

                  {/* Description */}
                  <p className="text-sm lg:text-base text-[#bcd3e6] leading-relaxed flex-1 mb-6 group-hover:text-white transition-colors duration-300">
                    {service.description}
                  </p>

                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={contactHref}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-accent to-[#43c6ad] text-[#06111c] font-medium text-sm hover:shadow-lg hover:shadow-accent/30 transition-all duration-300 group-hover:gap-3"
                    >
                      <span>Talk about it</span>
                      <BsArrowDownRight className="text-base group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                  </motion.div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
