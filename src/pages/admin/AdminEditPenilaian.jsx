import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Calendar,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Target,
  Zap,
  Brain,
  Heart,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Award,
} from 'lucide-react';
import { formatDateTime } from '@/utils/formatters';
import { PENILAIAN_CATEGORIES, PENILAIAN_FIELDS } from '@/utils/calculations';
import { cn } from '@/lib/utils';

// Konfigurasi kategori dengan icon dan warna
const CATEGORY_CONFIG = {
  teknik: {
    icon: Target,
    title: 'Teknik',
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900',
    sliderTrack: 'bg-blue-200',
    sliderRange: 'bg-blue-500',
  },
  fisik: {
    icon: Zap,
    title: 'Fisik',
    gradient: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50 dark:bg-orange-950/50',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-100 dark:bg-orange-900',
    sliderTrack: 'bg-orange-200',
    sliderRange: 'bg-orange-500',
  },
  taktik: {
    icon: Brain,
    title: 'Taktik',
    gradient: 'from-purple-500 to-violet-500',
    bg: 'bg-purple-50 dark:bg-purple-950/50',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-100 dark:bg-purple-900',
    sliderTrack: 'bg-purple-200',
    sliderRange: 'bg-purple-500',
  },
  mental: {
    icon: Heart,
    title: 'Mental',
    gradient: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900',
    sliderTrack: 'bg-emerald-200',
    sliderRange: 'bg-emerald-500',
  },
};

// Label untuk setiap field
const FIELD_LABELS = {
  teknik_dasar: 'Teknik Dasar',
  keterampilan_spesifik: 'Keterampilan Spesifik',
  keseimbangan: 'Keseimbangan',
  daya_tahan: 'Daya Tahan',
  kecepatan_kelincahan: 'Kecepatan & Kelincahan',
  postur: 'Postur Tubuh',
  reading_game: 'Reading the Game',
  decision_making: 'Decision Making',
  adaptasi: 'Adaptasi Taktik',
  mentalitas: 'Mentalitas',
  disiplin: 'Disiplin',
  team_player: 'Team Player',
  rekam_jejak: 'Rekam Jejak',
};

const AdminEditPenilaian = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [penilaian, setPenilaian] = useState(null);
  const [pemain, setPemain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    penilai_nama: '',
    catatan: '',
    ...PENILAIAN_FIELDS.reduce((acc, field) => ({ ...acc, [field]: 50 }), {}),
  });
  const [originalData, setOriginalData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch penilaian data
  useEffect(() => {
    const fetchPenilaian = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch penilaian dengan data pemain
        const { data, error: fetchError } = await supabase
          .from('penilaian')
          .select(
            `
            *,
            pemain: pemain_id (
              id,
              nama,
              posisi,
              foto_url,
              tinggi_badan,
              berat_badan
            )
          `
          )
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        if (!data) {
          setError('Penilaian tidak ditemukan');
          return;
        }

        setPenilaian(data);
        setPemain(data.pemain);

        const initialFormData = {
          penilai_nama: data.penilai_nama || '',
          catatan: data.catatan || '',
          ...PENILAIAN_FIELDS.reduce(
            (acc, field) => ({
              ...acc,
              [field]: data[field] || 0,
            }),
            {}
          ),
        };

        setFormData(initialFormData);
        setOriginalData(initialFormData);
      } catch (err) {
        console.error('Error fetching penilaian:', err);
        setError('Gagal memuat data penilaian');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPenilaian();
    }
  }, [id]);

  // Track changes
  useEffect(() => {
    if (originalData) {
      const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasChanges(changed);
    }
  }, [formData, originalData]);

  // Handle input change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle slider change
  const handleSliderChange = (field, values) => {
    handleChange(field, values[0]);
  };

  // Calculate current average
  const calculateAverage = () => {
    const values = PENILAIAN_FIELDS.map((field) => formData[field] || 0);
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  };

  // Calculate category average
  const calculateCategoryAverage = (fields) => {
    const values = fields.map((field) => formData[field] || 0);
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Get score bg color
  const getScoreBg = (score) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Handle save
  const handleSave = async () => {
    if (!formData.penilai_nama.trim()) {
      toast({
        title: 'Error',
        description: 'Nama penilai tidak boleh kosong',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        penilai_nama: formData.penilai_nama.trim(),
        catatan: formData.catatan.trim(),
        updated_at: new Date().toISOString(),
        ...PENILAIAN_FIELDS.reduce(
          (acc, field) => ({
            ...acc,
            [field]: formData[field],
          }),
          {}
        ),
      };

      const { error: updateError } = await supabase
        .from('penilaian')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      setOriginalData(formData);
      setHasChanges(false);

      toast({
        title: 'Berhasil',
        description: 'Data penilaian berhasil diperbarui',
      });
    } catch (err) {
      console.error('Error updating penilaian:', err);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui data penilaian',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setDeleting(true);

    try {
      const { error: deleteError } = await supabase.from('penilaian').delete().eq('id', id);

      if (deleteError) throw deleteError;

      toast({
        title: 'Berhasil',
        description: 'Penilaian berhasil dihapus',
      });

      // Navigate back to pemain detail or admin
      if (pemain?.id) {
        navigate(`/dashboard/pemain/${pemain.id}`);
      } else {
        navigate('/admin? tab=penilaian');
      }
    } catch (err) {
      console.error('Error deleting penilaian:', err);
      toast({
        title: 'Error',
        description: 'Gagal menghapus penilaian',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Handle reset form
  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
    }
  };

  const currentAverage = calculateAverage();
  const isLolos = currentAverage >= 75;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat data penilaian...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="max-w-lg mx-auto">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Button variant="outline" asChild>
              <Link to="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Admin
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to={pemain?.id ? `/dashboard/pemain/${pemain.id}` : '/admin'}>
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-lg font-bold">Edit Penilaian</h1>
                <p className="text-xs text-muted-foreground">Perbarui skor penilaian</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasChanges && (
                <Badge variant="outline" className="gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  Belum disimpan
                </Badge>
              )}

              {/* Live Score Badge */}
              <Badge
                variant={isLolos ? 'default' : 'destructive'}
                className="gap-1 text-base px-3 py-1"
              >
                {isLolos ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {currentAverage.toFixed(1)}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Pemain Info Card */}
          {pemain && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                    <AvatarImage src={pemain.foto_url} alt={pemain.nama} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/20 to-primary/5">
                      {pemain.nama?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-center sm:text-left flex-1">
                    <h2 className="text-xl font-bold">{pemain.nama}</h2>
                    <p className="text-muted-foreground">{pemain.posisi}</p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2 text-sm text-muted-foreground">
                      <span>{pemain.tinggi_badan} cm</span>
                      <span>•</span>
                      <span>{pemain.berat_badan} kg</span>
                    </div>
                  </div>

                  <Link to={`/dashboard/pemain/${pemain.id}`}>
                    <Button variant="outline" size="sm">
                      Lihat Profil
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Penilai Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Informasi Penilai
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="penilai_nama">Nama Penilai</Label>
                  <Input
                    id="penilai_nama"
                    value={formData.penilai_nama}
                    onChange={(e) => handleChange('penilai_nama', e.target.value)}
                    placeholder="Masukkan nama penilai"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Penilaian</Label>
                  <div className="flex items-center gap-2 h-10 px-3 bg-muted rounded-md text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDateTime(penilaian?.created_at)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Summary Card */}
          <Card
            className={cn(
              'border-2',
              isLolos
                ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20'
                : 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'
            )}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-16 h-16 rounded-full flex items-center justify-center',
                      isLolos ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                    )}
                  >
                    <Award className={cn('w-8 h-8', isLolos ? 'text-green-600' : 'text-red-600')} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Skor Rata-rata</p>
                    <p className={cn('text-4xl font-bold', getScoreColor(currentAverage))}>
                      {currentAverage.toFixed(1)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={isLolos ? 'default' : 'destructive'}
                    className="text-lg px-4 py-2"
                  >
                    {isLolos ? 'LOLOS' : 'TIDAK LOLOS'}
                  </Badge>
                </div>
              </div>

              {/* Category Summary */}
              <div className="grid grid-cols-4 gap-3 mt-6">
                {Object.entries(PENILAIAN_CATEGORIES).map(([key, category]) => {
                  const config = CATEGORY_CONFIG[key];
                  const Icon = config.icon;
                  const catAvg = calculateCategoryAverage(category.fields);

                  return (
                    <div
                      key={key}
                      className={cn('flex flex-col items-center p-3 rounded-lg', config.bg)}
                    >
                      <div className={cn('p-2 rounded-full mb-1', config.iconBg)}>
                        <Icon className={cn('w-4 h-4', config.text)} />
                      </div>
                      <span className={cn('text-xl font-bold', getScoreColor(catAvg))}>
                        {catAvg.toFixed(0)}
                      </span>
                      <span className="text-[10px] text-muted-foreground text-center">
                        {config.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Scoring Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(PENILAIAN_CATEGORIES).map(([key, category]) => {
              const config = CATEGORY_CONFIG[key];
              const Icon = config.icon;
              const catAvg = calculateCategoryAverage(category.fields);

              return (
                <Card key={key} className={cn('overflow-hidden', config.border)}>
                  {/* Category Header */}
                  <div className={cn('h-1. 5 w-full bg-gradient-to-r', config.gradient)} />

                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn('p-2.5 rounded-xl', config.iconBg)}>
                          <Icon className={cn('w-5 h-5', config.text)} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{config.title}</CardTitle>
                          <CardDescription>{category.fields.length} kriteria</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn('text-2xl font-bold', getScoreColor(catAvg))}>
                          {catAvg.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    {category.fields.map((field) => {
                      const value = formData[field] || 0;

                      return (
                        <div key={field} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm">{FIELD_LABELS[field]}</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={value}
                                onChange={(e) =>
                                  handleChange(
                                    field,
                                    Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                                  )
                                }
                                className={cn(
                                  'w-16 h-8 text-center text-sm font-bold',
                                  getScoreColor(value)
                                )}
                              />
                            </div>
                          </div>

                          <div className="relative pt-1">
                            <Slider
                              value={[value]}
                              onValueChange={(values) => handleSliderChange(field, values)}
                              min={0}
                              max={100}
                              step={1}
                              className="w-full"
                            />

                            {/* Color indicator under slider */}
                            <div className="flex justify-between mt-1. 5 text-[10px] text-muted-foreground">
                              <span>0</span>
                              <span className="text-yellow-600">50</span>
                              <span className="text-green-600">75</span>
                              <span>100</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Catatan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Catatan Penilaian
              </CardTitle>
              <CardDescription>Tambahkan catatan atau komentar untuk penilaian ini</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.catatan}
                onChange={(e) => handleChange('catatan', e.target.value)}
                placeholder="Tulis catatan tentang pemain ini..."
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex-1"
              size="lg"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Menyimpan.. .' : 'Simpan Perubahan'}
            </Button>

            <Button
              variant="outline"
              onClick={handleReset}
              disabled={saving || !hasChanges}
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Zona Berbahaya
              </CardTitle>
              <CardDescription>Tindakan di bawah ini tidak dapat dibatalkan</CardDescription>
            </CardHeader>

            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus Penilaian
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Penilaian? </AlertDialogTitle>
                    <AlertDialogDescription>
                      Anda yakin ingin menghapus penilaian ini dari <strong>{pemain?.nama}</strong>?
                      Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleting}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {deleting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      {deleting ? 'Menghapus.. .' : 'Ya, Hapus'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <p className="text-xs text-muted-foreground mt-3">
                Menghapus penilaian akan mempengaruhi perhitungan rata-rata pemain.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminEditPenilaian;
