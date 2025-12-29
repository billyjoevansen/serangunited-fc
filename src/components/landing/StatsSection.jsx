import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { STATS } from '@/utils/landingData';

const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative bg-black text-white py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 100px,
              rgba(255,255,255,0.1) 100px,
              rgba(255,255,255,0.1) 101px
            )`,
          }}
        />
      </div>

      <div className="container mx-auto px-8 md:px-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <p className="text-sm font-semibold tracking-[0.3em] uppercase text-gray-500 mb-4">
            Our Numbers
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase leading-none">
            Data
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
              Statistik
            </span>
          </h2>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x divide-white/10">
          {STATS.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="lg:px-12 first:lg:pl-0 last:lg:pr-0"
            >
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter">
                    {stat.value}
                  </span>
                  {stat.suffix && (
                    <span className="text-3xl md:text-4xl font-bold text-emerald-400">
                      {stat.suffix}
                    </span>
                  )}
                </div>
                <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mt-2">
                  {stat.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Decorative Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent origin-center"
      />
    </section>
  );
};

export default StatsSection;
