import { Card, CardContent } from '@/components/ui/card';
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
import { Loader2, Save, X } from 'lucide-react';
import ImageUploader from '@/components/common/ImageUploader';
import { POSISI_OPTIONS } from '@/utils/calculations';

const PemainForm = ({ formData, onChange, onSubmit, onCancel, loading = false }) => {
  const handleSelectChange = (value) => {
    onChange({ target: { name: 'posisi', value } });
  };

  const handleImageUpload = (url) => {
    onChange({ target: { name: 'foto_url', value: url } });
  };

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardContent className="p-6">
          {/* Photo Upload */}
          <div className="flex justify-center mb-6">
            <ImageUploader
              currentImage={formData.foto_url}
              onImageUpload={handleImageUpload}
              folder="pemain"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="nama">
                Nama Lengkap <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nama"
                name="nama"
                required
                value={formData.nama}
                onChange={onChange}
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal_lahir">
                Tanggal Lahir <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tanggal_lahir"
                name="tanggal_lahir"
                type="date"
                required
                value={formData.tanggal_lahir}
                onChange={onChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="posisi">
                Posisi <span className="text-destructive">*</span>
              </Label>
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
              <Label htmlFor="tinggi_badan">
                Tinggi Badan (cm) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tinggi_badan"
                name="tinggi_badan"
                type="number"
                required
                min="140"
                max="220"
                value={formData.tinggi_badan}
                onChange={onChange}
                placeholder="175"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="berat_badan">
                Berat Badan (kg) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="berat_badan"
                name="berat_badan"
                type="number"
                required
                min="40"
                max="120"
                value={formData.berat_badan}
                onChange={onChange}
                placeholder="70"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="no_telepon">No. Telepon</Label>
              <Input
                id="no_telepon"
                name="no_telepon"
                type="tel"
                value={formData.no_telepon}
                onChange={onChange}
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={onChange}
                placeholder="email@contoh.com"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Menyimpan...' : 'Daftarkan Pemain'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default PemainForm;
