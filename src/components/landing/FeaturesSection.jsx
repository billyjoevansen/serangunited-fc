'use client';

import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { FEATURES, CTA_LINKS } from '@/utils/landingData';

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative bg-neutral-950 text-white py-32 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-950/30 to-transparent" />

      <div className="container mx-auto px-8 md:px-16 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-20 gap-8"
        >
          <div>
            <p className="text-sm font-semibold tracking-[0.3em] uppercase text-emerald-400 mb-4">
              What We Offer
            </p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase leading-none max-w-3xl">
              Features
            </h2>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-gray-400 max-w-md lg:text-right"
          >
            Sistem rekrutmen modern dengan teknologi terdepan untuk menemukan bakat terbaik.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-0 border-t border-white/10">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} isInView={isInView} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <Link
            to={CTA_LINKS.dashboard}
            className="inline-flex items-center gap-2 text-lg font-semibold text-white hover:text-emerald-400 transition-colors group"
          >
            Jelajahi Semua Fitur
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

const FeatureCard = ({ feature, index, isInView }) => {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
      className={`group p-8 lg:p-12 border-b border-white/10 ${
        index % 2 === 0 ? 'md:border-r' : ''
      } hover:bg-white/5 transition-colors duration-500`}
    >
      <div className="flex flex-col h-full">
        {/* Icon & Number */}
        <div className="flex items-start justify-between mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <Icon className="w-8 h-8 text-emerald-400" />
          </div>
          <span className="text-7xl font-black text-white/5 group-hover:text-white/10 transition-colors">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-emerald-400 transition-colors">
          {feature.title}
        </h3>
        <p className="text-gray-400 mb-8 flex-grow leading-relaxed">{feature.description}</p>

        {/* Stat */}
        <div className="pt-6 border-t border-white/10">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-emerald-400">{feature.stat}</span>
            <span className="text-sm uppercase tracking-wider text-gray-500">
              {feature.statLabel}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturesSection;
