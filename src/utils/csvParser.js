// Parse CSV text ke array of objects
export const parseCSV = (csvText) => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(header => 
    header.trim().toLowerCase().replace(/\s+/g, '_')
  );
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]. trim();
    if (!line) continue;
    
    const values = [];
    let current = '';
    let insideQuotes = false;
    
    for (let char of line) {
      if (char === '"') {
        insideQuotes = ! insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current. trim());
    
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }
  
  return data;
};

// Mapping data CSV ke format database
export const mapCSVToDatabase = (csvRow) => {
  return {
    nama: csvRow.nama || csvRow.name || csvRow.nama_lengkap || '',
    tanggal_lahir: csvRow. tanggal_lahir || csvRow. tgl_lahir || csvRow.birthdate || csvRow. dob || null,
    posisi: csvRow. posisi || csvRow.position || '',
    tinggi_badan: parseInt(csvRow.tinggi_badan || csvRow.tinggi || csvRow. height) || null,
    berat_badan: parseInt(csvRow.berat_badan || csvRow. berat || csvRow. weight) || null,
    no_telepon: csvRow. no_telepon || csvRow.telepon || csvRow.phone || csvRow.hp || '',
    email: csvRow.email || '',
  };
};

// Validasi data pemain
export const validatePemainData = (data) => {
  const errors = [];
  
  if (!data.nama) {
    errors.push('Nama wajib diisi');
  }
  if (!data.tanggal_lahir) {
    errors. push('Tanggal lahir wajib diisi');
  }
  if (!data.posisi) {
    errors.push('Posisi wajib diisi');
  }
  
  if (data.tanggal_lahir) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.tanggal_lahir)) {
      errors.push('Format tanggal harus YYYY-MM-DD');
    }
  }
  
  return errors;
};

// Generate CSV template
export const generateCSVTemplate = () => {
  return `nama,tanggal_lahir,posisi,tinggi_badan,berat_badan,no_telepon,email
Contoh Pemain,2000-01-15,Gelandang Tengah (CM),175,70,081234567890,contoh@email.com
Pemain Kedua,1999-05-20,Penyerang (ST),180,75,081234567891,pemain2@email.com`;
};

// Download CSV file
export const downloadCSV = (content, filename) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};