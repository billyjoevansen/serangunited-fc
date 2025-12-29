import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import ImageUploader from '@/components/common/ImageUploader';
import { LoadingSpinner } from '@/components/common';
import { POSISI_OPTIONS } from '@/utils/calculations';

function AdminEditPemain() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    tanggal_lahir: '',
    posisi: '',
    tinggi_badan: '',
    berat_badan: '',
    no_telepon: '',
    email: '',
    foto_url: '',
  });

  useEffect(() => {
    const fetchPemain = async () => {
      const { data, error } = await supabase.from('pemain').select('*').eq('id', id).single();

      if (!error && data) {
        setFormData({
          nama: data.nama || '',
          tanggal_lahir: data.tanggal_lahir || '',
          posisi: data.posisi || '',
          tinggi_badan: data.tinggi_badan || '',
          berat_badan: data.berat_badan || '',
          no_telepon: data.no_telepon || '',
          email: data.email || '',
          foto_url: data.foto_url || '',
        });
      }
      setLoading(false);
    };

    fetchPemain();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, posisi: value }));
  };

  const handleImageUpload = (url) => {
    setFormData((prev) => ({ ...prev, foto_url: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('pemain')
        .update({
          nama: formData.nama,
          tanggal_lahir: formData.tanggal_lahir,
          posisi: formData.posisi,
          tinggi_badan: parseInt(formData.tinggi_badan),
          berat_badan: parseInt(formData.berat_badan),
          no_telepon: formData.no_telepon,
          email: formData.email,
          foto_url: formData.foto_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      navigate('/admin');
    } catch (error) {
      alert('Gagal mengupdate pemain: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-bold">Edit Pemain</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit Data Pemain</CardTitle>
              <CardDescription>Update informasi pemain</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Upload */}
                <div className="flex justify-center">
                  <ImageUploader
                    currentImage={formData.foto_url}
                    onImageUpload={handleImageUpload}
                    folder="pemain"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="nama">Nama Lengkap</Label>
                    <Input
                      id="nama"
                      name="nama"
                      required
                      value={formData.nama}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                    <Input
                      id="tanggal_lahir"
                      name="tanggal_lahir"
                      type="date"
                      required
                      value={formData.tanggal_lahir}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="posisi">Posisi</Label>
                    <Select value={formData.posisi} onValueChange={handleSelectChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Posisi" />
                      </SelectTrigger>
                      <SelectContent>
                        {POSISI_OPTIONS.map((pos) => (
                          <SelectItem key={pos} value={pos}>
                            {pos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tinggi_badan">Tinggi Badan (cm)</Label>
                    <Input
                      id="tinggi_badan"
                      name="tinggi_badan"
                      type="number"
                      required
                      value={formData.tinggi_badan}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="berat_badan">Berat Badan (kg)</Label>
                    <Input
                      id="berat_badan"
                      name="berat_badan"
                      type="number"
                      required
                      value={formData.berat_badan}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="no_telepon">No. Telepon</Label>
                    <Input
                      id="no_telepon"
                      name="no_telepon"
                      value={formData.no_telepon}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/admin')}
                  >
                    Batal
                  </Button>
                  <Button type="submit" className="flex-1" disabled={saving}>
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default AdminEditPemain;
