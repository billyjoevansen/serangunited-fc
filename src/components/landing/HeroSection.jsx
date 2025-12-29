import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowRight,
  Play,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { CLUB_INFO, CTA_LINKS, HERO_BACKGROUNDS } from '@/utils/landingData';

const SLIDESHOW_INTERVAL = 5000; // 5 detik

// KOMPONEN UTAMA
const HeroSection = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Auto slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, SLIDESHOW_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Preload images
  useEffect(() => {
    const preloadImages = () => {
      HERO_BACKGROUNDS.forEach((bg) => {
        const img = new Image();
        img.src = bg.fallback;
      });
      setIsLoaded(true);
    };
    preloadImages();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'penilai':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const currentBackground = HERO_BACKGROUNDS[currentIndex];

  return (
    <section className="relative min-h-screen bg-black text-white overflow-hidden">
      {/*BACKGROUND SLIDESHOW*/}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBackground.id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <img
              src={currentBackground.url}
              alt={currentBackground.alt}
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-black/80 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-white/10" />

        {/* Animated grain/noise overlay for cinematic effect */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')]" />
        </div>
      </div>

      {/* SLIDESHOW INDICATORS*/}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {HERO_BACKGROUNDS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/*NAVBAR*/}
      <nav className="relative z-20 flex items-center justify-between px-8 md:px-16 py-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/"
            className="text-3xl font-black tracking-tighter hover:text-gray-300 transition-colors"
          >
            <div className="mx-auto mb-4 grid h-16 w-fit grid-cols-[auto_24px_auto] items-center gap-4">
              <img
                src="/logo.webp"
                alt={`${CLUB_INFO.name} Logo`}
                className="h-16 w-16 object-contain"
              />

              <span className="flex items-center justify-center text-xl font-semibold">×</span>

              <img src="/KONI.webp" alt="KONI Logo" className="h-40 w-40 object-contain" />
            </div>
          </Link>
        </motion.div>

        {/* Right Side - Auth Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          {isAuthenticated ? (
            <UserDropdown
              user={user}
              isAdmin={isAdmin}
              onLogout={handleLogout}
              getRoleBadgeVariant={getRoleBadgeVariant}
            />
          ) : (
            <AuthButtons />
          )}
        </motion.div>
      </nav>

      {/*MAIN CONTENT*/}
      <div className="relative z-10 flex flex-col justify-center min-h-[calc(100vh-88px)] px-8 md:px-16 pb-32">
        <div className="max-w-4xl">
          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base font-semibold tracking-[0.3em] uppercase text-emerald-400 mb-4"
          >
            Official Recruitment System
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase leading-[0.9] tracking-tight mb-6"
          >
            <span className="block">Serang</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
              United
            </span>
            <span className="block">FC.</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg md:text-xl text-gray-300 max-w-xl mb-10 leading-relaxed"
          >
            {CLUB_INFO.description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap gap-4"
          >
            {isAuthenticated ? <AuthenticatedCTA isAdmin={isAdmin} /> : <GuestCTA />}
          </motion.div>
        </div>
      </div>

      {/*FLOATING ELEMENTS*/}

      {/* Side Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 z-10"
      >
        <div
          className="text-[10px] tracking-[0.5em] uppercase text-gray-500 rotate-180"
          style={{ writingMode: 'vertical-rl' }}
        >
          {CLUB_INFO.name} — {CLUB_INFO.tagline}
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="absolute bottom-8 right-8 md:right-16 z-10 hidden md:flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest text-gray-400">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"
        />
      </motion.div>

      {/* Current Slide Number */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-8 left-8 md:left-16 z-10 hidden md:block"
      >
        <div className="flex items-baseline gap-1 font-mono">
          <span className="text-2xl font-bold text-white">
            {String(currentIndex + 1).padStart(2, '0')}
          </span>
          <span className="text-sm text-gray-500">/</span>
          <span className="text-sm text-gray-500">
            {String(HERO_BACKGROUNDS.length).padStart(2, '0')}
          </span>
        </div>
      </motion.div>
    </section>
  );
};

// SUB-COMPONENTS

// User Dropdown (Logged in)
const UserDropdown = ({ user, isAdmin, onLogout, getRoleBadgeVariant }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className="flex items-center gap-3 hover:bg-white/10 rounded-full pl-2 pr-4 py-2 h-auto"
      >
        <Avatar className="w-9 h-9 border-2 border-white/30">
          <AvatarImage src={user?.foto_url} alt={user?.nama} />
          <AvatarFallback className="bg-white/20 text-white text-sm font-bold">
            {user?.nama?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-semibold text-white leading-tight">{user?.nama}</span>
          <Badge
            variant={getRoleBadgeVariant(user?.role)}
            className="text-[10px] px-1. 5 py-0 h-4 mt-0.5"
          >
            {user?.role?.toUpperCase()}
          </Badge>
        </div>
        <ChevronDown className="w-4 h-4 text-black hidden sm:block" />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      align="end"
      className="w-56 bg-black/95 backdrop-blur-xl border-white/10 text-white"
    >
      <DropdownMenuLabel className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.foto_url} />
            <AvatarFallback className="bg-white/20 text-white">
              {user?.nama?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user?.nama}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator className="bg-white/10" />

      <DropdownMenuItem asChild className="hover:bg-white/10 cursor-pointer">
        <Link to={CTA_LINKS.dashboard} className="flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
      </DropdownMenuItem>

      {isAdmin && (
        <DropdownMenuItem asChild className="hover:bg-white/10 cursor-pointer">
          <Link to="/admin" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Admin Panel</span>
          </Link>
        </DropdownMenuItem>
      )}

      <DropdownMenuSeparator className="bg-white/10" />

      <DropdownMenuItem
        onClick={onLogout}
        className="hover:bg-red-500/20 cursor-pointer text-red-400 focus:text-red-400"
      >
        <LogOut className="w-4 h-4 mr-2" />
        <span>Keluar</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// Auth Buttons (Guest)
const AuthButtons = () => (
  <div className="flex items-center gap-2 sm:gap-4">
    <Link
      to="/login"
      className="flex items-center gap-2 text-sm font-medium hover: text-gray-300 transition-colors px-3 py-2"
    >
      <LogIn className="w-4 h-4" />
      <span className="hidden sm:inline">Masuk</span>
    </Link>
    <div className="hidden md:block w-px h-6 bg-white/20" />

    <Button
      size="sm"
      asChild
      className="bg-white text-black hover:bg-gray-200 rounded-full px-4 sm:px-6 font-semibold"
    >
      <Link to="/register" className="flex items-center gap-2">
        <UserPlus className="w-4 h-4" />
        <span className="hidden sm:inline">Daftar</span>
      </Link>
    </Button>
  </div>
);

// CTA for Authenticated Users
const AuthenticatedCTA = ({ isAdmin }) => (
  <>
    <Button
      size="lg"
      asChild
      className="bg-white text-black hover:bg-gray-200 rounded-full px-8 py-6 text-base font-bold uppercase tracking-wide transition-all hover:scale-105"
    >
      <Link to={CTA_LINKS.dashboard}>
        Ke Dashboard
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    </Button>

    {isAdmin && (
      <Button
        size="lg"
        variant="outline"
        asChild
        className="bg-white text-black hover:bg-gray-200 rounded-full px-8 py-6 text-base font-bold uppercase tracking-wide transition-all hover:scale-105"
      >
        <Link to="/admin">
          <Shield className="mr-2 h-5 w-5" />
          Admin Panel
        </Link>
      </Button>
    )}
  </>
);

// CTA for Guest Users
const GuestCTA = () => (
  <>
    <Button
      size="lg"
      asChild
      className="bg-white text-black hover:bg-white/10 hover:text-white rounded-full px-8 py-6 text-base font-bold uppercase tracking-wide transition-all hover:scale-105"
    >
      <Link to={CTA_LINKS.register}>
        Daftar Sekarang
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    </Button>

    <Button
      size="lg"
      variant="outline"
      asChild
      className="border-white/30 text-black hover:bg-white/10 hover:text-white rounded-full px-8 py-6 text-base font-bold uppercase tracking-wide"
    >
      <Link to={CTA_LINKS.dashboard}>
        <Play className="mr-2 h-5 w-5" />
        Lihat Proses
      </Link>
    </Button>
  </>
);

// Stat Item
const StatItem = ({ value, label, highlight = false }) => (
  <div className="flex flex-col">
    <span
      className={`text-4xl md:text-5xl font-black ${highlight ? 'text-emerald-400' : 'text-white'}`}
    >
      {value}
    </span>
    <span className="text-xs uppercase tracking-widest text-gray-400 mt-1">{label}</span>
  </div>
);

export default HeroSection;
