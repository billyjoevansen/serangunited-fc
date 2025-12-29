import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePemainSingle, usePenilaian, usePenilaianForm } from '@/hooks';
import { PageContainer } from '@/components/layout';
import { PenilaianSummary, ScoreCategory } from '@/components/penilaian';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { PENILAIAN_CATEGORIES } from '@/utils/calculations';

function FormPenilaian() {
  const { pemainId } = useParams();
  const navigate = useNavigate();
  const { pemain, loading } = usePemainSingle(pemainId);
  const { createPenilaian } = usePenilaian(pemainId);
  const { penilaian, handleChange, calculateAverage, calculateCategoryAverage } =
    usePenilaianForm();

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!penilaian.penilai_nama.trim()) {
      alert('Nama penilai wajib diisi!');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await createPenilaian(penilaian);

      if (error) throw new Error(error);

      navigate(`/dashboard/pemain/${pemainId}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal menyimpan penilaian: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageContainer loading={true} />;
  }

  if (!pemain) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-xl text-muted-foreground mb-4">Pemain tidak ditemukan</p>
        <Button asChild>
          <Link to="/dashboard">Kembali ke Daftar</Link>
        </Button>
      </div>
    );
  }

  const average = calculateAverage();
  const categoryAverages = {
    teknik: calculateCategoryAverage(PENILAIAN_CATEGORIES.teknik.fields),
    fisik: calculateCategoryAverage(PENILAIAN_CATEGORIES.fisik.fields),
    taktik: calculateCategoryAverage(PENILAIAN_CATEGORIES.taktik.fields),
    mental: calculateCategoryAverage(PENILAIAN_CATEGORIES.mental.fields),
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PenilaianSummary pemain={pemain} average={average} categoryAverages={categoryAverages} />

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="penilai_nama">
                Nama Penilai <span className="text-destructive">*</span>
              </Label>
              <Input
                id="penilai_nama"
                name="penilai_nama"
                required
                value={penilaian.penilai_nama}
                onChange={handleChange}
                placeholder="Masukkan nama penilai"
              />
            </div>
          </CardContent>
        </Card>

        {Object.entries(PENILAIAN_CATEGORIES).map(([key, category], index) => (
          <ScoreCategory
            key={key}
            number={index + 1}
            title={category.title}
            description={category.description}
            icon={category.icon}
            fields={category.fields}
            values={penilaian}
            onChange={handleChange}
            pemainData={pemain}
          />
        ))}

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan Tambahan</Label>
              <Textarea
                id="catatan"
                name="catatan"
                rows={4}
                value={penilaian.catatan}
                onChange={handleChange}
                placeholder="Catatan khusus mengenai pemain (opsional)..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Batal
          </Button>
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {submitting ? 'Menyimpan...' : 'Simpan Penilaian'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default FormPenilaian;
