'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { PROCESS_STEPS } from '@/utils/landingData';

const ProcessSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative bg-black text-white py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-emerald-500/10 to-transparent blur-3xl" />

      <div className="container mx-auto px-8 md:px-16 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-sm font-semibold tracking-[0.3em] uppercase text-emerald-400 mb-4">
            How It Works
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase leading-none">
            Proses
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
              {' '}
              Seleksi
            </span>
          </h2>
        </motion.div>

        {/* Process Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent hidden lg:block" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {PROCESS_STEPS.map((step, index) => (
              <ProcessCard
                key={index}
                step={step}
                index={index}
                isInView={isInView}
                isLast={index === PROCESS_STEPS.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-24 text-center"
        >
          <p className="text-2xl md:text-3xl font-light italic text-gray-400 max-w-3xl mx-auto">
            "Jika Anda berlatih dengan buruk, Anda bermain dengan buruk. Jika Anda bekerja seperti
            binatang buas dalam latihan, Anda bermain dengan cara yang sama"
            <p className="text-white font-semibold">- Pep Guardiola</p>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

const ProcessCard = ({ step, index, isInView, isLast }) => {
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
      className="relative group"
    >
      {/* Card */}
      <div className="relative bg-neutral-900 rounded-3xl p-8 h-full border border-white/10 hover:border-emerald-500/50 transition-colors duration-500">
        {/* Step Number */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-6xl font-black text-white/10 group-hover:text-emerald-500/30 transition-colors">
            {step.step}
          </span>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:scale-110 transition-all duration-500">
            <Icon className="w-7 h-7 text-emerald-400 group-hover:text-black transition-colors" />
          </div>
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold mb-3 group-hover: text-emerald-400 transition-colors">
          {step.title}
        </h3>
        <p className="text-gray-400 leading-relaxed">{step.description}</p>

        {/* Decorative Corner */}
        <div className="absolute bottom-0 right-0 w-24 h-24 overflow-hidden rounded-br-3xl">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-emerald-500/10 to-transparent transform translate-x-8 translate-y-8 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-500" />
        </div>
      </div>

      {/* Arrow (not on last item) */}
      {!isLast && (
        <div className="hidden lg:flex absolute top-1/2 -right-6 w-12 h-12 items-center justify-center z-10">
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-emerald-500 text-2xl"
          >
            →
          </motion.span>
        </div>
      )}
    </motion.div>
  );
};

export default ProcessSection;
