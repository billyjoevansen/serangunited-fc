import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TESTIMONIALS } from '@/utils/landingData';

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <section
      ref={ref}
      className="relative bg-neutral-950 text-white py-24 md:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-emerald-950/20 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 md:px-16 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-20"
        >
          <p className="text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-emerald-400 mb-4">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase leading-tight">
            Apa Kata{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
              Mereka
            </span>
          </h2>
        </motion.div>

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Quote Icon */}
            <div className="absolute -top-6 -left-4 md:-left-8 z-10">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-emerald-500 flex items-center justify-center">
                <Quote className="w-6 h-6 md:w-8 md:h-8 text-black" />
              </div>
            </div>

            {/* Card */}
            <div className="bg-neutral-900 rounded-3xl p-8 md:p-12 border border-white/10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Quote */}
                  <p className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed text-gray-300 mb-8">
                    "{current.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-neutral-800">
                      <img
                        src={current.image}
                        alt={current.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${current.name}&background=10b981&color=fff`;
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="text-lg md:text-xl font-bold text-white">{current.name}</h4>
                      <p className="text-emerald-400 text-sm md:text-base">{current.role}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/10">
                {/* Dots */}
                <div className="flex items-center gap-2">
                  {TESTIMONIALS.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentIndex
                          ? 'w-8 h-2 bg-emerald-500'
                          : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>

                {/* Arrows */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevTestimonial}
                    className="rounded-full bg-black border-white/20 hover:bg-white hover:border-white/30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextTestimonial}
                    className="rounded-full bg-black border-white/20 hover:bg-white hover:border-white/30"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
