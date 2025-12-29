// Daftar posisi pemain
export const POSISI_OPTIONS = [
  'Penjaga Gawang (GK)',
  'Bek Tengah (CB)',
  'Bek Kiri (LB)',
  'Bek Kanan (RB)',
  'Gelandang Bertahan (CDM)',
  'Gelandang Tengah (CM)',
  'Gelandang Serang (CAM)',
  'Sayap Kiri (LW)',
  'Sayap Kanan (RW)',
  'Penyerang Tengah (CF)',
  'Penyerang Kiri (LF)',
  'Penyerang Kanan (RF)',
];

// Range tinggi badan pria Indonesia (dalam cm)
export const TINGGI_BADAN_CONFIG = {
  // Range untuk pemain lapangan (non-kiper)
  pemain: {
    min: 155,
    idealMin: 170,
    idealMax: 185,
    max: 200,
  },
  // Range untuk penjaga gawang (butuh lebih tinggi)
  kiper: {
    min: 165,
    idealMin: 180,
    idealMax: 195,
    max: 205,
  }
};

// Posisi yang dianggap sebagai kiper
export const POSISI_KIPER = [
  'Penjaga Gawang (GK)', 
  'GK', 
  'Goalkeeper', 
  'Kiper'
];

// Posisi yang diuntungkan dengan tinggi badan
export const POSISI_BUTUH_TINGGI = [
  'Penjaga Gawang (GK)',
  'Bek Tengah (CB)',
  'Penyerang Tengah (CF)',
];

// Posisi yang fleksibel
export const POSISI_FLEKSIBEL = [
  'Gelandang Tengah (CM)',
  'Gelandang Serang (CAM)',
  'Sayap Kiri (LW)',
  'Sayap Kanan (RW)',
  'Bek Kiri (LB)',
  'Bek Kanan (RB)',
  'Gelandang Bertahan (CDM)',
  'Penyerang Kiri (LF)',
  'Penyerang Kanan (RF)',
];

/**
 * Mengkonversi tinggi badan ke skor postur (0-100) 
 * @param {number} tinggiBadan
 * @param {string} posisi
 * @returns {number}
 */
export const hitungSkorPostur = (tinggiBadan, posisi = '') => {
  if (!tinggiBadan || tinggiBadan <= 0) return 0;

  // Tentukan apakah kiper atau pemain biasa
  const isKiper = POSISI_KIPER.some(p => 
    posisi.toLowerCase().includes(p.toLowerCase())
  );

  // Tentukan apakah posisi yang butuh tinggi
  const butuhTinggi = POSISI_BUTUH_TINGGI.some(p => 
    posisi.toLowerCase().includes(p.toLowerCase().split(' ')[0])
  );

  // Pilih konfigurasi berdasarkan posisi
  const config = isKiper ?  TINGGI_BADAN_CONFIG. kiper : TINGGI_BADAN_CONFIG.pemain;

  let skor = 0;

  if (tinggiBadan < config.min) {
    const diff = config.min - tinggiBadan;
    skor = Math.max(0, 30 - (diff * 2));
  } else if (tinggiBadan >= config.min && tinggiBadan < config.idealMin) {
    const range = config.idealMin - config.min;
    const position = tinggiBadan - config.min;
    skor = 30 + (position / range) * 40;
  } else if (tinggiBadan >= config.idealMin && tinggiBadan <= config.idealMax) {
    const range = config.idealMax - config.idealMin;
    const midPoint = config.idealMin + (range / 2);
    
    if (tinggiBadan <= midPoint) {
      const position = tinggiBadan - config.idealMin;
      const halfRange = midPoint - config.idealMin;
      skor = 70 + (position / halfRange) * 30;
    } else {
      const position = tinggiBadan - midPoint;
      const halfRange = config. idealMax - midPoint;
      skor = 100 - (position / halfRange) * 15;
    }
  } else if (tinggiBadan > config.idealMax && tinggiBadan <= config.max) {
    const range = config.max - config.idealMax;
    const position = tinggiBadan - config.idealMax;
    skor = 85 - (position / range) * 25;
  } else {
    const diff = tinggiBadan - config.max;
    skor = Math.max(40, 60 - (diff * 2));
  }

  // Bonus/penalti berdasarkan kebutuhan posisi
  if (butuhTinggi && tinggiBadan >= 175) {
    skor = Math.min(100, skor + 5);
  } else if (! butuhTinggi && tinggiBadan >= 165 && tinggiBadan <= 178) {
    skor = Math.min(100, skor + 3);
  }

  return Math. round(Math.max(0, Math.min(100, skor)));
};

/**
 * Kategori tinggi badan
 * @param {number} tinggiBadan
 * @returns {object}
 */
export const getKategoriTinggiBadan = (tinggiBadan) => {
  if (!tinggiBadan) return { kategori:  '-', deskripsi: 'Data tidak tersedia', color: 'gray' };

  if (tinggiBadan < 155) {
    return { 
      kategori:  'Sangat Pendek', 
      deskripsi:  'Di bawah rata-rata pria Indonesia',
      color: 'red'
    };
  } else if (tinggiBadan < 163) {
    return { 
      kategori: 'Pendek', 
      deskripsi:  'Sedikit di bawah rata-rata',
      color: 'orange'
    };
  } else if (tinggiBadan <= 170) {
    return { 
      kategori: 'Rata-rata', 
      deskripsi: 'Sesuai rata-rata pria Indonesia',
      color: 'yellow'
    };
  } else if (tinggiBadan <= 180) {
    return { 
      kategori: 'Tinggi', 
      deskripsi:  'Di atas rata-rata',
      color: 'green'
    };
  } else {
    return { 
      kategori: 'Sangat Tinggi', 
      deskripsi: 'Ideal untuk beberapa posisi',
      color: 'blue'
    };
  }
};

/**
 * Mendapatkan rekomendasi posisi berdasarkan tinggi badan
 * @param {number} tinggiBadan
 * @returns {string[]}
 */
export const getRekomendasiPosisi = (tinggiBadan) => {
  if (!tinggiBadan) return [];

  if (tinggiBadan >= 185) {
    return [
      'Penjaga Gawang (GK)', 
      'Bek Tengah (CB)', 
      'Penyerang Tengah (CF)'
    ];
  } else if (tinggiBadan >= 178) {
    return [
      'Bek Tengah (CB)', 
      'Penyerang Tengah (CF)', 
      'Gelandang Bertahan (CDM)'
    ];
  } else if (tinggiBadan >= 170) {
    return [
      'Gelandang Tengah (CM)', 
      'Bek Kiri (LB)', 
      'Bek Kanan (RB)', 
      'Gelandang Serang (CAM)',
      'Penyerang Kiri (LF)',
      'Penyerang Kanan (RF)'
    ];
  } else if (tinggiBadan >= 165) {
    return [
      'Sayap Kiri (LW)', 
      'Sayap Kanan (RW)', 
      'Gelandang Serang (CAM)',
      'Penyerang Kiri (LF)',
      'Penyerang Kanan (RF)'
    ];
  } else {
    return [
      'Sayap Kiri (LW)', 
      'Sayap Kanan (RW)'
    ];
  }
};

/**
 * Menghitung umur dari tanggal lahir
 * @param {string} birthDate
 * @returns {number}
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return 0;
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today. getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Field penilaian
export const PENILAIAN_FIELDS = [
  'teknik_dasar', 
  'keterampilan_spesifik', 
  'keseimbangan',
  'daya_tahan', 
  'kecepatan_kelincahan', 
  'postur',
  'reading_game', 
  'decision_making', 
  'adaptasi',
  'mentalitas', 
  'disiplin', 
  'team_player', 
  'rekam_jejak'
];

/**
 * Menghitung rata-rata penilaian
 * @param {object} penilaian
 * @returns {string}
 */
export const calculatePenilaianAverage = (penilaian) => {
  const total = PENILAIAN_FIELDS.reduce((sum, field) => sum + (penilaian[field] || 0), 0);
  return (total / PENILAIAN_FIELDS.length).toFixed(1);
};

/**
 * Rata-rata kategori
 * @param {object} penilaian 
 * @param {string[]} fields
 * @returns {string}
 */
export const calculateCategoryAverage = (penilaian, fields) => {
  const total = fields.reduce((sum, field) => sum + (penilaian[field] || 0), 0);
  return (total / fields. length).toFixed(1);
};

// Kategori penilaian
export const PENILAIAN_CATEGORIES = {
  teknik:  {
    title: 'Teknik & Skill',
    icon:  '⚽',
    color: 'blue',
    description: 'Kemampuan dasar bermain sepakbola',
    fields: ['teknik_dasar', 'keterampilan_spesifik', 'keseimbangan']
  },
  fisik: {
    title: 'Fisik & Postur',
    icon:  '💪',
    color: 'orange',
    description:  'Kondisi fisik dan kebugaran pemain',
    fields: ['daya_tahan', 'kecepatan_kelincahan', 'postur']
  },
  taktik: {
    title: 'Taktik & Kognitif',
    icon: '🧠',
    color: 'purple',
    description:  'Kecerdasan dan pemahaman permainan',
    fields: ['reading_game', 'decision_making', 'adaptasi']
  },
  mental: {
    title: 'Mental & Sikap',
    icon: '🎯',
    color: 'green',
    description: 'Mentalitas dan karakter pemain',
    fields: ['mentalitas', 'disiplin', 'team_player', 'rekam_jejak']
  }
};

// Field labels untuk penilaian
export const FIELD_LABELS = {
  teknik_dasar: {
    label: 'Teknik Dasar',
    description: 'Mengontrol bola, mengumpan, menggiring (dribble), menembak, dan menyundul'
  },
  keterampilan_spesifik: {
    label: 'Keterampilan Spesifik',
    description: 'Tendangan keras, umpan akurat, skill melewati lawan dengan percaya diri'
  },
  keseimbangan: {
    label: 'Keseimbangan',
    description: 'Kemampuan bermain dengan kedua kaki dan variasi teknik'
  },
  daya_tahan:  {
    label:  'Daya Tahan (Stamina)',
    description: 'Kebugaran prima dan kekuatan otot untuk gerakan eksplosif'
  },
  kecepatan_kelincahan: {
    label: 'Kecepatan & Kelincahan',
    description: 'Akselerasi dan kemampuan bergerak cepat di lapangan'
  },
  postur:  {
    label:  'Postur',
    description:  'Proporsi tubuh ideal dan tinggi badan sesuai posisi'
  },
  reading_game: {
    label: 'Reading the Game',
    description: 'Membaca permainan, memahami posisi saat menyerang dan bertahan'
  },
  decision_making: {
    label: 'Decision Making',
    description: 'Membuat keputusan cepat dan tepat di lapangan'
  },
  adaptasi: {
    label: 'Adaptasi',
    description: 'Fleksibilitas dalam memahami sistem taktik tim'
  },
  mentalitas: {
    label: 'Mentalitas',
    description: 'Kuat menghadapi tekanan, percaya diri, tekad tinggi, tidak takut mengambil risiko'
  },
  disiplin: {
    label: 'Disiplin',
    description:  'Tanggung jawab, menghargai waktu, dan komitmen tinggi'
  },
  team_player: {
    label: 'Team Player',
    description:  'Berpikir untuk tim, komunikasi baik, dan semangat kebersamaan'
  },
  rekam_jejak: {
    label: 'Rekam Jejak',
    description: 'Disiplin dan sikap positif di luar lapangan'
  }
};

export const PASSING_SCORE = 75;