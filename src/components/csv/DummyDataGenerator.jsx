import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dices,
  Download,
  Loader2,
  Upload,
  CheckCircle,
  XCircle,
  Shield,
  Lock,
  Users,
  ClipboardCheck,
  Sparkles,
  TrendingUp,
  Target,
  Minus,
  Plus,
} from 'lucide-react';
import { PENILAIAN_FIELDS } from '@/utils/calculations';
import {
  AVATAR_SERVICE_OPTIONS,
  GENERATOR_DEFAULTS,
  NAMA_PENILAI,
  generatePemainData,
  generatePenilaianData,
  generateFotoUrl,
  randomInt,
  randomElement,
} from '@/utils/dummyData';

const DummyDataGenerator = ({ showAdminOnly = true }) => {
  const { isAdmin } = useAuth();

  // Tab aktif
  const [activeTab, setActiveTab] = useState('pemain');

  // Settings Pemain
  const [jumlahPemain, setJumlahPemain] = useState(GENERATOR_DEFAULTS.jumlahPemain);
  const [avatarService, setAvatarService] = useState('dicebear');

  // Settings Penilaian
  const [jumlahPemainDenganPenilaian, setJumlahPemainDenganPenilaian] = useState(20);
  const [minPenilaian, setMinPenilaian] = useState(1);
  const [maxPenilaian, setMaxPenilaian] = useState(3);
  const [minSkor, setMinSkor] = useState(40);
  const [maxSkor, setMaxSkor] = useState(95);

  // State
  const [generating, setGenerating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, phase: '' });
  const [result, setResult] = useState(null);

  // Reset result saat ganti tab
  const handleTabChange = (value) => {
    setActiveTab(value);
    setResult(null);
  };

  // =============================================
  // TAB 1: GENERATE PEMAIN SAJA (BELUM DINILAI)
  // =============================================

  const generateCSVPemain = () => {
    const header = 'nama,tanggal_lahir,posisi,tinggi_badan,berat_badan,no_telepon,email,foto_url';
    const rows = [header];
    const usedNames = new Set();

    for (let i = 0; i < jumlahPemain; i++) {
      let pemain;
      let attempts = 0;

      do {
        pemain = generatePemainData(i, avatarService);
        attempts++;
      } while (usedNames.has(pemain.nama) && attempts < 100);

      usedNames.add(pemain.nama);

      const row = `${pemain.nama},${pemain.tanggal_lahir},${pemain.posisi},${pemain.tinggi_badan},${pemain.berat_badan},${pemain.no_telepon},${pemain.email},${pemain.foto_url}`;
      rows.push(row);
    }

    return rows.join('\n');
  };

  const handleDownloadCSVPemain = () => {
    setGenerating(true);
    setResult(null);

    setTimeout(() => {
      const csvContent = generateCSVPemain();
      downloadFile(csvContent, `data_pemain_dummy_${jumlahPemain}.csv`, 'text/csv');

      setGenerating(false);
      setResult({
        success: true,
        type: 'pemain',
        message: `Berhasil generate ${jumlahPemain} data pemain ke file CSV`,
      });
    }, 500);
  };

  const handleImportPemainToDatabase = async () => {
    setImporting(true);
    setProgress({ current: 0, total: jumlahPemain, phase: 'Mengimport data pemain...' });
    setResult(null);

    const usedNames = new Set();
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < jumlahPemain; i++) {
      let pemain;
      let attempts = 0;

      do {
        pemain = generatePemainData(i, avatarService);
        attempts++;
      } while (usedNames.has(pemain.nama) && attempts < 100);

      usedNames.add(pemain.nama);

      const { error } = await supabase.from('pemain').insert([pemain]);

      if (error) {
        failedCount++;
      } else {
        successCount++;
      }

      setProgress({
        current: i + 1,
        total: jumlahPemain,
        phase: 'Mengimport data pemain...',
      });
    }

    setImporting(false);
    setResult({
      success: successCount > 0,
      type: 'pemain',
      successCount,
      failedCount,
      message: `Import selesai! ${successCount} pemain berhasil, ${failedCount} gagal. `,
    });
  };

  // =============================================
  // TAB 2: GENERATE PEMAIN + PENILAIAN
  // =============================================

  const handleImportPemainDenganPenilaian = async () => {
    setImporting(true);
    setResult(null);

    const usedNames = new Set();
    const insertedPemainIds = [];
    let pemainSuccess = 0;
    let pemainFailed = 0;
    let penilaianSuccess = 0;
    let penilaianFailed = 0;

    // Fase 1: Insert pemain
    setProgress({
      current: 0,
      total: jumlahPemainDenganPenilaian,
      phase: 'Mengimport data pemain...',
    });

    for (let i = 0; i < jumlahPemainDenganPenilaian; i++) {
      let pemain;
      let attempts = 0;

      do {
        pemain = generatePemainData(i, avatarService);
        attempts++;
      } while (usedNames.has(pemain.nama) && attempts < 100);

      usedNames.add(pemain.nama);

      const { data, error } = await supabase.from('pemain').insert([pemain]).select('id').single();

      if (error) {
        pemainFailed++;
      } else {
        pemainSuccess++;
        insertedPemainIds.push(data.id);
      }

      setProgress({
        current: i + 1,
        total: jumlahPemainDenganPenilaian,
        phase: 'Mengimport data pemain...',
      });
    }

    // Fase 2: Insert penilaian
    if (insertedPemainIds.length > 0) {
      let totalPenilaian = 0;
      const penilaianPerPemainList = insertedPemainIds.map(() =>
        randomInt(minPenilaian, maxPenilaian)
      );
      penilaianPerPemainList.forEach((count) => (totalPenilaian += count));

      setProgress({ current: 0, total: totalPenilaian, phase: 'Mengimport data penilaian...' });

      let penilaianCount = 0;

      for (let i = 0; i < insertedPemainIds.length; i++) {
        const pemainId = insertedPemainIds[i];
        const jumlahPenilaianUntukPemain = penilaianPerPemainList[i];
        const usedPenilai = new Set();

        for (let j = 0; j < jumlahPenilaianUntukPemain; j++) {
          const penilaian = generatePenilaianData(pemainId, PENILAIAN_FIELDS, [minSkor, maxSkor]);

          let attempts = 0;
          while (usedPenilai.has(penilaian.penilai_nama) && attempts < 10) {
            penilaian.penilai_nama = randomElement(NAMA_PENILAI);
            attempts++;
          }
          usedPenilai.add(penilaian.penilai_nama);

          const { error } = await supabase.from('penilaian').insert([penilaian]);

          if (error) {
            penilaianFailed++;
          } else {
            penilaianSuccess++;
          }

          penilaianCount++;
          setProgress({
            current: penilaianCount,
            total: totalPenilaian,
            phase: 'Mengimport data penilaian...',
          });
        }
      }
    }

    setImporting(false);
    setResult({
      success: pemainSuccess > 0,
      type: 'pemain_penilaian',
      pemainSuccess,
      pemainFailed,
      penilaianSuccess,
      penilaianFailed,
      message: `Import selesai!  Pemain:  ${pemainSuccess} berhasil.  Penilaian: ${penilaianSuccess} berhasil. `,
    });
  };

  // =============================================
  // UTILITY FUNCTIONS
  // =============================================

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type: `${type};charset=utf-8;` });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const progressPercent =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  // Estimasi untuk tab penilaian
  const estimasiTotalPenilaian = Math.round(
    jumlahPemainDenganPenilaian * ((minPenilaian + maxPenilaian) / 2)
  );
  const estimasiLolos = Math.round(
    jumlahPemainDenganPenilaian * (maxSkor >= 75 ? (minSkor >= 75 ? 0.9 : 0.5) : 0.1)
  );

  // =============================================
  // RENDER
  // =============================================

  if (showAdminOnly && !isAdmin) {
    return (
      <Card className="border-dashed border-yellow-300 bg-yellow-50 dark:bg-yellow-950">
        <CardContent className="py-8 text-center">
          <Lock className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Akses Terbatas
          </h3>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Fitur ini hanya dapat diakses oleh Administrator
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Dices className="w-5 h-5" />
              Generator Data Dummy
            </CardTitle>
            <CardDescription>Generate data pemain untuk testing sistem rekrutmen</CardDescription>
          </div>
          <Badge variant="destructive" className="gap-1">
            <Shield className="w-3 h-3" />
            Admin Only
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pemain" className="gap-2">
              <Users className="w-4 h-4" />
              Pemain Saja
            </TabsTrigger>
            <TabsTrigger value="penilaian" className="gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Pemain + Penilaian
            </TabsTrigger>
          </TabsList>

          {/* =============================================
              TAB 1: PEMAIN SAJA (BELUM DINILAI)
          ============================================= */}
          <TabsContent value="pemain" className="space-y-6 mt-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-blue-800 dark:text-blue-200">
                    Mode: Pemain Belum Dinilai
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Generate data pemain baru tanpa penilaian
                  </p>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jumlahPemain">Jumlah Pemain</Label>
                <Input
                  id="jumlahPemain"
                  type="number"
                  min="1"
                  max={GENERATOR_DEFAULTS.maxPemain}
                  value={jumlahPemain}
                  onChange={(e) =>
                    setJumlahPemain(
                      Math.min(
                        GENERATOR_DEFAULTS.maxPemain,
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    )
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Maksimal {GENERATOR_DEFAULTS.maxPemain} pemain
                </p>
              </div>

              <div className="space-y-2">
                <Label>Layanan Avatar</Label>
                <Select value={avatarService} onValueChange={setAvatarService}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVATAR_SERVICE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview Avatar */}
            <div className="p-4 bg-muted rounded-xl">
              <Label className="text-xs text-muted-foreground mb-3 block">Preview Avatar</Label>
              <div className="flex items-center gap-3 flex-wrap">
                {[0, 1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={generateFotoUrl(`Preview${i}`, i, avatarService)}
                    alt={`Preview ${i + 1}`}
                    className="w-12 h-12 rounded-full border-2 border-background shadow-sm object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=P${i}&background=random`;
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleDownloadCSVPemain}
                disabled={generating || importing}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download CSV
              </Button>

              <Button
                onClick={handleImportPemainToDatabase}
                disabled={generating || importing}
                className="flex-1 sm:flex-none"
              >
                {importing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Import ke Database
              </Button>
            </div>
          </TabsContent>

          {/* TAB 2: PEMAIN + PENILAIAN (SUDAH DINILAI) */}
          <TabsContent value="penilaian" className="space-y-6 mt-6">
            {/* Header Info */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                    Mode: Pemain Sudah Dinilai
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    Generate data pemain lengkap dengan penilaian
                  </p>
                </div>
              </div>
            </div>

            {/* Settings Grid */}
            <div className="grid gap-6">
              {/* Row 1: Pengaturan Dasar */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jumlah Pemain</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={jumlahPemainDenganPenilaian}
                    onChange={(e) =>
                      setJumlahPemainDenganPenilaian(
                        Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground">Maksimal 100 pemain</p>
                </div>

                <div className="space-y-2">
                  <Label>Layanan Avatar</Label>
                  <Select value={avatarService} onValueChange={setAvatarService}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVATAR_SERVICE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Jumlah Penilaian Per Pemain */}
              <div className="p-4 bg-muted/50 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Jumlah Penilaian per Pemain</Label>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    {minPenilaian} - {maxPenilaian} penilaian
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Min Penilaian */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Minimum</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setMinPenilaian(Math.max(1, minPenilaian - 1))}
                        disabled={minPenilaian <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <div className="flex-1 h-9 flex items-center justify-center bg-background border rounded-md font-mono text-lg font-semibold">
                        {minPenilaian}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setMinPenilaian(Math.min(maxPenilaian, minPenilaian + 1))}
                        disabled={minPenilaian >= maxPenilaian}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Max Penilaian */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Maksimum</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setMaxPenilaian(Math.max(minPenilaian, maxPenilaian - 1))}
                        disabled={maxPenilaian <= minPenilaian}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <div className="flex-1 h-9 flex items-center justify-center bg-background border rounded-md font-mono text-lg font-semibold">
                        {maxPenilaian}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setMaxPenilaian(Math.min(5, maxPenilaian + 1))}
                        disabled={maxPenilaian >= 5}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Range Skor Penilaian */}
              <div className="p-4 bg-muted/50 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Range Skor Penilaian</Label>
                  </div>
                  <Badge
                    variant={
                      minSkor >= 75 ? 'default' : maxSkor >= 75 ? 'secondary' : 'destructive'
                    }
                    className="font-mono"
                  >
                    {minSkor} - {maxSkor} poin
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Min Skor */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Skor Minimum</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setMinSkor(Math.max(0, minSkor - 5))}
                        disabled={minSkor <= 0}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <div
                        className={`flex-1 h-9 flex items-center justify-center border rounded-md font-mono text-lg font-semibold ${
                          minSkor >= 75
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : 'bg-background'
                        }`}
                      >
                        {minSkor}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setMinSkor(Math.min(maxSkor - 5, minSkor + 5))}
                        disabled={minSkor >= maxSkor - 5}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Max Skor */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Skor Maksimum</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setMaxSkor(Math.max(minSkor + 5, maxSkor - 5))}
                        disabled={maxSkor <= minSkor + 5}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <div
                        className={`flex-1 h-9 flex items-center justify-center border rounded-md font-mono text-lg font-semibold ${
                          maxSkor >= 75
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : 'bg-background'
                        }`}
                      >
                        {maxSkor}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setMaxSkor(Math.min(100, maxSkor + 5))}
                        disabled={maxSkor >= 100}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Visual Score Bar */}
                <div className="pt-2">
                  <div className="relative h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-800 rounded-full shadow-md"
                      style={{ left: `${minSkor}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-800 rounded-full shadow-md"
                      style={{ left: `${maxSkor}%` }}
                    />
                    {/* Highlight area */}
                    <div
                      className="absolute top-0 h-full bg-white/30 rounded-full"
                      style={{
                        left: `${minSkor}%`,
                        width: `${maxSkor - minSkor}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>0</span>
                    <span className="text-yellow-600 font-medium">50</span>
                    <span className="text-green-600 font-medium">75 (Lolos)</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              {/* Preview Estimasi */}
              <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Estimasi Data yang Digenerate</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-background rounded-lg p-3 text-center">
                    <Users className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                    <p className="text-2xl font-bold">{jumlahPemainDenganPenilaian}</p>
                    <p className="text-xs text-muted-foreground">Pemain</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <ClipboardCheck className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                    <p className="text-2xl font-bold">~{estimasiTotalPenilaian}</p>
                    <p className="text-xs text-muted-foreground">Penilaian</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-500" />
                    <p className="text-2xl font-bold text-green-600">~{estimasiLolos}</p>
                    <p className="text-xs text-muted-foreground">Est. Lolos</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <Target className="w-5 h-5 mx-auto mb-1 text-red-500" />
                    <p className="text-2xl font-bold text-red-600">
                      ~{jumlahPemainDenganPenilaian - estimasiLolos}
                    </p>
                    <p className="text-xs text-muted-foreground">Est. Tidak Lolos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleImportPemainDenganPenilaian}
              disabled={generating || importing}
              className="w-full h-12 text-base"
              size="lg"
            >
              {importing ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Upload className="w-5 h-5 mr-2" />
              )}
              {importing ? 'Mengimport...' : 'Import Pemain + Penilaian ke Database'}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Progress Bar */}
        {importing && (
          <div className="space-y-3 p-4 bg-muted rounded-xl">
            <div className="flex justify-between text-sm font-medium">
              <span>{progress.phase}</span>
              <span className="font-mono">
                {progress.current} / {progress.total}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">{progressPercent}% selesai</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <Alert variant={result.success ? 'default' : 'destructive'}>
            {result.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <AlertDescription>
              <p className="font-medium">{result.message}</p>
              {result.success && result.type === 'pemain_penilaian' && (
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 px-3 py-1.5 rounded-full">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Pemain: {result.pemainSuccess}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900 px-3 py-1.5 rounded-full">
                    <ClipboardCheck className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Penilaian: {result.penilaianSuccess}</span>
                  </div>
                </div>
              )}
              {result.success && result.type === 'pemain' && (
                <div className="mt-3">
                  <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900 px-3 py-1.5 rounded-full text-sm">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Pemain: {result.successCount} berhasil</span>
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Info Footer */}
        <div className="p-4 bg-muted/30 rounded-xl border text-sm">
          <p className="font-medium mb-2 flex items-center gap-2">
            <Dices className="w-4 h-4" />
            Data yang digenerate:
          </p>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-muted-foreground text-xs">
            <div className="flex items-center gap-1. 5">
              <span className="w-1 h-1 rounded-full bg-primary" />
              Nama lengkap Indonesia
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-primary" />
              Tanggal lahir (1998-2006)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-primary" />
              12 posisi berbeda
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-primary" />
              Tinggi/berat sesuai posisi
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-primary" />
              No. telepon & email
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-primary" />
              Foto profil avatar
            </div>
            {activeTab === 'penilaian' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  13 kriteria penilaian
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  Catatan penilaian
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DummyDataGenerator;
