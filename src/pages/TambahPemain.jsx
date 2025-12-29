import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePemain } from '@/hooks';
import { PemainForm } from '@/components/pemain';
import { UserPlus } from 'lucide-react';

function TambahPemain() {
  const navigate = useNavigate();
  const { createPemain } = usePemain();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    tanggal_lahir: '',
    posisi: '',
    tinggi_badan: '',
    berat_badan: '',
    no_telepon: '',
    email: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await createPemain({
        ...formData,
        tinggi_badan: parseInt(formData.tinggi_badan),
        berat_badan: parseInt(formData.berat_badan),
      });

      if (error) throw new Error(error);

      navigate('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal mendaftarkan pemain:  ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Registrasi Calon Pemain</h2>
          <p className="text-muted-foreground text-sm">Isi data pemain baru</p>
        </div>
      </div>

      <PemainForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/dashboard')}
        loading={loading}
      />
    </div>
  );
}

export default TambahPemain;
