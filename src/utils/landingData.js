import { 
  UserPlus, 
  ClipboardCheck, 
  BarChart3, 
  Trophy,
} from "lucide-react"

/**
 * Informasi klub
 */
export const CLUB_INFO = {
  name: "Serang United FC",
  shortName: "SU",
  tagline: "Player Recruitment System",
  partner: "KONI Banten",
  description: "Sistem seleksi pemain profesional dengan penilaian komprehensif berbasis data untuk menemukan talenta terbaik.",
  founded: 2020,
  location: "Serang, Banten"
}

/**
 * Link navigasi untuk CTA
 */
export const CTA_LINKS = {
  dashboard: "/dashboard",
  register: "/dashboard/tambah-pemain",
  results: "/dashboard/hasil-seleksi",
  login: "/login"
}

/**
 * Fitur-fitur utama sistem rekrutmen
 */
export const FEATURES = [
  {
    icon: UserPlus,
    title: "Registrasi Pemain",
    description: "Daftarkan calon pemain dengan data lengkap termasuk posisi, tinggi badan, dan informasi kontak.",
    stat: "500+",
    statLabel: "Pemain Terdaftar"
  },
  {
    icon: ClipboardCheck,
    title: "Sistem Penilaian",
    description:  "Nilai pemain berdasarkan 13 kriteria meliputi teknik, fisik, taktik, dan mental.",
    stat: "13",
    statLabel:  "Kriteria Penilaian"
  },
  {
    icon: BarChart3,
    title: "Analisis Postur",
    description:  "Analisis otomatis kesesuaian tinggi badan dengan posisi bermain.",
    stat: "12",
    statLabel: "Posisi Tersedia"
  },
  {
    icon: Trophy,
    title: "Hasil Seleksi",
    description:  "Lihat peringkat dan status kelolosan pemain secara real-time.",
    stat: "75+",
    statLabel: "Skor Minimum"
  }
]

/**
 * Statistik sistem
 */
export const STATS = [
  { value: "500+", label: "Pemain Terdaftar" },
  { value: "13", label: "Kriteria Penilaian" },
  { value: "12", label: "Posisi Pemain" },
  { value: "98%", label: "Akurasi Sistem" }
]

/**
 * Warna kategori
 */
export const CATEGORY_COLORS = {
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30"
  },
  blue: {
    bg: "bg-blue-500/10",
    text:  "text-blue-400",
    border:  "border-blue-500/30"
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border:  "border-purple-500/30"
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border:  "border-orange-500/30"
  }
}

/**
 * Helper function untuk mendapatkan warna kategori
 */
export const getCategoryColors = (color) => {
  return CATEGORY_COLORS[color] || CATEGORY_COLORS. emerald
}

/**
 * Langkah-langkah proses seleksi
 */
export const PROCESS_STEPS = [
  { 
    step:  "01", 
    title: "Registrasi", 
    description: "Daftarkan data pemain lengkap dengan posisi dan ukuran tubuh",
    icon:  UserPlus
  },
  { 
    step: "02", 
    title: "Penilaian", 
    description: "Tim penilai memberikan skor untuk setiap kriteria (0-100)",
    icon: ClipboardCheck
  },
  { 
    step: "03", 
    title: "Analisis", 
    description: "Sistem menganalisis dan menghitung nilai rata-rata",
    icon:  BarChart3
  },
  { 
    step:  "04", 
    title: "Hasil", 
    description: "Lihat hasil seleksi dan peringkat pemain secara otomatis",
    icon: Trophy
  }
]

/**
 * Testimonials
 */
export const TESTIMONIALS = [
  {
    name: "Coach Kluivert",
    role: "Head Coach",
    quote: "Sistem ini sangat membantu dalam mengevaluasi pemain secara objektif dan komprehensif.",
    image: "/coach/kluivert.webp"
  },
  {
    name: "Shin Tae Yong",
    role: "Scout Manager",
    quote:  "Data-driven approach yang memudahkan kami menemukan talenta tersembunyi.",
    image: "/coach/sty.webp"
  },
  {
    name: "Yi Long Ma",
    role: "Technical Director",
    quote: "Proses rekrutmen jadi lebih efisien dan terukur dengan sistem ini.",
    image: "/coach/yilongma.webp"
  }
]

/**
 * Gallery images
 */
export const GALLERY_IMAGES = [
  { url:  "/gallery/trophy1.jpg", alt: "Premier League" },
  { url:  "/gallery/trophy2.jpg", alt: "Ucl" },
  { url:  "/gallery/trophy3.jpg", alt: "World Cup" },
  { url:  "/gallery/trophy4.jpg", alt: "La Liga" }
]

/**
 * Hero background images
 */
export const HERO_BACKGROUNDS = [
  {
    id: 1,
    url: '/images/hero1.webp',
    alt:  'Football Player Action Shot',
    fallback: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80',
  },
  {
    id:  2,
    url: '/images/hero2.webp',
    alt: 'Stadium Atmosphere',
    fallback:  'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9? w=1920&q=80',
  },
  {
    id: 3,
    url: '/images/hero3.webp',
    alt: 'Team Celebration',
    fallback: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1920&q=80',
  },
  {
    id:  4,
    url: '/images/hero4.webp',
    alt: 'Football Training',
    fallback: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1920&q=80',
  },
  {
    id: 5,
    url:  '/images/hero5.webp',
    alt: 'Match Day',
    fallback: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20? w=1920&q=80',
  },
]

/**
 * Slideshow interval (ms)
 */
export const SLIDESHOW_INTERVAL = 5000