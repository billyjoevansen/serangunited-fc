'use client';

import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CTA_LINKS, CLUB_INFO } from '@/utils/landingData';

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative bg-black text-white py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-black/90 to-black/80 z-10" />
        <img
          src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1920&q=80"
          alt="Football Stadium"
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden z-10">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-emerald-500/20 blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-green-500/20 blur-[100px]"
        />
      </div>

      <div className="container mx-auto px-8 md:px-16 relative z-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-8"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium">Bergabung Sekarang</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-none mb-8"
          >
            <span className="block">Siap Menjadi</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400">
              Bagian Tim?
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Tunjukkan kemampuanmu dan jadilah bagian dari
            <span className="text-white font-semibold"> {CLUB_INFO.name}</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              asChild
              className="bg-white text-black hover:bg-gray-100 rounded-full px-10 py-7 text-lg font-bold uppercase tracking-wide transition-all hover:scale-105 group"
            >
              <Link to={CTA_LINKS.register}>
                Daftar Sekarang
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              asChild
              className="bg-white text-black hover:bg-gray-100 rounded-full px-10 py-7 text-lg font-bold uppercase tracking-wide transition-all hover:scale-105 group"
            >
              <Link to={CTA_LINKS.dashboard}>Lihat Dashboard</Link>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 pt-16 border-t border-white/10"
          >
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-gray-500">
              <TrustIndicator label="Sistem Aktif 24/7" />
              <TrustIndicator label="Data Terenkripsi" />
              <TrustIndicator label="Penilaian Objektif" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const TrustIndicator = ({ label }) => (
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
    <span className="text-sm uppercase tracking-wider">{label}</span>
  </div>
);

export default CTASection;
