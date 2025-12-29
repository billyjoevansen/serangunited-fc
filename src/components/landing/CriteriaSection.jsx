'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { CRITERIA_DISPLAY } from '@/utils/landingData';

const CriteriaSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeIndex, setActiveIndex] = useState(0);

  const activeCategory = CRITERIA_DISPLAY[activeIndex];

  return (
    <section ref={ref} className="relative bg-white text-black py-32 overflow-hidden">
      <div className="container mx-auto px-8 md:px-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <p className="text-sm font-semibold tracking-[0.3em] uppercase text-emerald-600 mb-4">
            Evaluation Criteria
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase leading-none">
            13 Kriteria
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
              Penilaian
            </span>
          </h2>
        </motion.div>

        {/* Main Content - Two Column */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left - Category Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {CRITERIA_DISPLAY.map((category, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-full text-left p-6 rounded-2xl transition-all duration-300 group ${
                  activeIndex === index
                    ? 'bg-black text-white'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-black'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold">{category.category}</h3>
                      <p
                        className={`text-sm mt-1 ${
                          activeIndex === index ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {category.items.length} Kriteria
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-6 h-6 transition-transform duration-300 ${
                      activeIndex === index ? 'rotate-90' : 'group-hover:translate-x-1'
                    }`}
                  />
                </div>
              </button>
            ))}
          </motion.div>

          {/* Right - Active Category Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:sticky lg:top-32"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-neutral-100 rounded-3xl p-8 lg:p-12"
              >
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-black flex items-center justify-center">
                    <span className="text-4xl">{activeCategory.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black">{activeCategory.category}</h3>
                    <p className="text-gray-500">{activeCategory.description}</p>
                  </div>
                </div>

                {/* Criteria Items */}
                <div className="space-y-4">
                  {activeCategory.items.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="font-semibold text-lg">{item}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Score Range */}
                <div className="mt-8 pt-8 border-t border-neutral-200">
                  <p className="text-sm text-gray-500 mb-3">Range Skor</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 bg-neutral-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '75%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                      />
                    </div>
                    <span className="text-2xl font-bold">0 - 100</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CriteriaSection;
