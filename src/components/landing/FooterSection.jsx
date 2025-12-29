'use client';

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
} from 'lucide-react';
import { CLUB_INFO, CTA_LINKS } from '@/utils/landingData';

const FooterSection = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    menu: [
      { label: 'Dashboard', href: CTA_LINKS.dashboard },
      { label: 'Registrasi', href: CTA_LINKS.register },
      { label: 'Hasil Seleksi', href: CTA_LINKS.results },
      { label: 'Login', href: '/login' },
    ],
    support: [
      { label: 'Panduan', href: '#' },
      { label: 'FAQ', href: '#' },
      { label: 'Kontak', href: '#' },
      { label: 'Kebijakan Privasi', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Youtube, href: '#', label: 'Youtube' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-8 md:px-16 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <span className="text-4xl font-black tracking-tighter">{CLUB_INFO.shortName}</span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">{CLUB_INFO.description}</p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-emerald-500 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Menu Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 mb-6">
              Menu
            </h4>
            <ul className="space-y-4">
              {footerLinks.menu.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                    <ArrowUpRight className="w-4 h-4 opacity-0-translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 mb-6">
              Support
            </h4>
            <ul className="space-y-4">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                    <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 mb-6">
              Kontak
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:info@serangunited.com"
                  className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>info@serangunited.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+6281234567890"
                  className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>+62 812 3456 7890</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-gray-400">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>{CLUB_INFO.location}, Indonesia</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-8 md:px-16 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-gray-500">
              © {currentYear} {CLUB_INFO.name}. All rights reserved.
            </p>

            {/* Partner Badge */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Bekerjasama dengan</span>
              <span className="text-white font-semibold">{CLUB_INFO.partner}</span>
            </div>

            {/* Back to Top */}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
            >
              <span>Kembali ke Atas</span>
              <ArrowUpRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Large Brand Text (Decorative) */}
      <div className="border-t border-white/5 overflow-hidden">
        <div className="container mx-auto px-8 md:px-16 py-8">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(4)].map((_, i) => (
              <span
                key={i}
                className="text-[8rem] md:text-[12rem] font-black uppercase text-white/[0.02] mx-8"
              >
                {CLUB_INFO.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
