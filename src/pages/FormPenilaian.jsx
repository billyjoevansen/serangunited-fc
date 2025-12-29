import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePemainSingle, usePenilaian, usePenilaianForm } from '@/hooks';
import { PageContainer } from '@/components/layout';
import { PenilaianSummary, ScoreCategory } from '@/components/penilaian';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  ArrowLeft,
  Save,
  Loader2,
  Mail,
  User,
  CheckCircle,
  XCircle,
  Shield,
} from 'lucide-react';
import { PENILAIAN_CATEGORIES } from '@/utils/calculations';
import { cn } from '@/lib/utils';

function FormPenilaian() {
  const { pemainId } = useParams();
  const navigate = useNavigate();
  const { pemain, loading } = usePemainSingle(pemainId);
  const { createPenilaian, validatePenilaiEmail } = usePenilaian(pemainId);
  const {
    penilaian,
    handleChange,
    calculateAverage,
    calculateCategoryAverage,
    setPenilaiFromUser,
  } = usePenilaianForm();

  const [submitting, setSubmitting] = useState(false);
  const [validatingEmail, setValidatingEmail] = useState(false);
  const [emailValidation, setEmailValidation] = useState({
    checked: false,
    valid: false,
    error: null,
    user: null,
  });

  // Validasi email saat user selesai mengetik
  const handleEmailBlur = async () => {
    const email = penilaian.penilai_email?.trim();

    if (!email) {
      setEmailValidation({ checked: false, valid: false, error: null, user: null });
      return;
    }

    setValidatingEmail(true);
    const result = await validatePenilaiEmail(email);

    setEmailValidation({
      checked: true,
      valid: result.valid,
      error: result.error,
      user: result.user,
    });

    // Jika valid, auto-fill nama penilai
    if (result.valid && result.user) {
      setPenilaiFromUser(result.user);
    }

    setValidatingEmail(false);
  };

  // Reset validasi saat email berubah
  const handleEmailChange = (e) => {
    handleChange(e);
    setEmailValidation({ checked: false, valid: false, error: null, user: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi email penilai
    if (!emailValidation.valid) {
      alert('Email penilai harus terdaftar sebagai penilai atau admin! ');
      return;
    }

    if (!penilaian.penilai_nama.trim()) {
      alert('Nama penilai wajib diisi! ');
      return;
    }

    setSubmitting(true);

    try {
      const penilaianData = {
        ...penilaian,
        penilai_email: penilaian.penilai_email.toLowerCase().trim(),
      };

      const { error } = await createPenilaian(penilaianData);

      if (error) throw new Error(error);

      navigate(`/dashboard/pemain/${pemainId}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal menyimpan penilaian:  ' + error.message);
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
        {/* Card Identitas Penilai */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Identitas Penilai</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Email Penilai */}
              <div className="space-y-2">
                <Label htmlFor="penilai_email">
                  Email Penilai <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="penilai_email"
                    name="penilai_email"
                    type="email"
                    required
                    value={penilaian.penilai_email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    placeholder="Masukkan email penilai"
                    className={cn(
                      'pl-10 pr-10',
                      emailValidation.checked &&
                        emailValidation.valid &&
                        'border-green-500 focus-visible:ring-green-500',
                      emailValidation.checked &&
                        !emailValidation.valid &&
                        'border-red-500 focus-visible:ring-red-500'
                    )}
                  />
                  {/* Validation Icon */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {validatingEmail && (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                    {!validatingEmail && emailValidation.checked && emailValidation.valid && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {!validatingEmail && emailValidation.checked && !emailValidation.valid && (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                {/* Validation Message */}
                {emailValidation.checked && !emailValidation.valid && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {emailValidation.error}
                  </p>
                )}
                {emailValidation.checked && emailValidation.valid && emailValidation.user && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-300 bg-green-50"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {emailValidation.user.role === 'admin' ? 'Admin' : 'Penilai'} Terverifikasi
                    </Badge>
                  </div>
                )}
              </div>

              {/* Nama Penilai */}
              <div className="space-y-2">
                <Label htmlFor="penilai_nama">
                  Nama Penilai <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="penilai_nama"
                    name="penilai_nama"
                    required
                    value={penilaian.penilai_nama}
                    onChange={handleChange}
                    placeholder="Nama akan terisi otomatis"
                    className="pl-10"
                    readOnly={emailValidation.valid}
                  />
                </div>
                {emailValidation.valid && (
                  <p className="text-xs text-muted-foreground">
                    Nama terisi otomatis dari data penilai terdaftar
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kategori Penilaian */}
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

        {/* Catatan */}
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

        {/* Tombol Submit */}
        <div className="flex gap-4">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Batal
          </Button>
          <Button type="submit" className="flex-1" disabled={submitting || !emailValidation.valid}>
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
