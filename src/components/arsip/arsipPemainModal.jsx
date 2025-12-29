import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Archive, Loader2, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ArsipPemainModal = ({ open, onOpenChange, pemainList = [], onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [periodeSeleksi, setPeriodeSeleksi] = useState(() => {
    const now = new Date();
    const month = now.toLocaleString('id-ID', { month: 'long' });
    const year = now.getFullYear();
    return `${month} ${year}`;
  });
  const [catatan, setCatatan] = useState('');
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Filter hanya pemain yang lolos
  const pemainLolos = pemainList.filter(
    (p) => p.status_kelayakan === 'LOLOS' && parseFloat(p.nilai_rata_rata) >= 75
  );

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === pemainLolos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pemainLolos.map((p) => p.id)));
    }
  };

  const handleSelectOne = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const isAllSelected = pemainLolos.length > 0 && selectedIds.size === pemainLolos.length;

  // Handle arsipkan
  const handleArsipkan = async () => {
    if (selectedIds.size === 0) {
      toast({
        title: 'Error',
        description: 'Pilih minimal 1 pemain untuk diarsipkan',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    setProgress({ current: 0, total: selectedIds.size });

    const selectedPemain = pemainLolos.filter((p) => selectedIds.has(p.id));
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < selectedPemain.length; i++) {
      const pemain = selectedPemain[i];

      try {
        // Buat data arsip
        const arsipData = {
          pemain_id: pemain.id,
          nama: pemain.nama,
          posisi: pemain.posisi,
          tinggi_badan: pemain.tinggi_badan,
          berat_badan: pemain.berat_badan,
          tanggal_lahir: pemain.tanggal_lahir,
          no_telepon: pemain.no_telepon,
          email: pemain.email,
          foto_url: pemain.foto_url,
          nilai_rata_rata: pemain.nilai_rata_rata,
          jumlah_penilaian: pemain.jumlah_penilaian || 0,
          status_kelayakan: 'LOLOS',
          skor_teknik: pemain.skor_teknik || null,
          skor_fisik: pemain.skor_fisik || null,
          skor_taktik: pemain.skor_taktik || null,
          skor_mental: pemain.skor_mental || null,
          tanggal_seleksi: new Date().toISOString().split('T')[0],
          periode_seleksi: periodeSeleksi,
          catatan: catatan || null,
          diarsipkan_oleh: user?.id || null,
          nama_pengarsip: user?.nama || 'Admin',
        };

        const { error } = await supabase.from('arsip_pemain').insert([arsipData]);

        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error('Error archiving pemain:', error);
        failedCount++;
      }

      setProgress({ current: i + 1, total: selectedIds.size });
    }

    setSaving(false);

    if (successCount > 0) {
      toast({
        title: 'Berhasil',
        description: `${successCount} pemain berhasil diarsipkan${
          failedCount > 0 ? `, ${failedCount} gagal` : ''
        }`,
      });

      setSelectedIds(new Set());
      setCatatan('');
      onSuccess?.();
      onOpenChange(false);
    } else {
      toast({
        title: 'Error',
        description: 'Gagal mengarsipkan pemain',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    if (!saving) {
      setSelectedIds(new Set());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5" />
            Arsipkan Pemain Lolos
          </DialogTitle>
          <DialogDescription>Pilih pemain yang lolos seleksi untuk diarsipkan</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-4">
          {/* Periode Input */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periode">Periode Seleksi</Label>
              <Input
                id="periode"
                value={periodeSeleksi}
                onChange={(e) => setPeriodeSeleksi(e.target.value)}
                placeholder="contoh:  Januari 2025"
              />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Arsip</Label>
              <div className="flex items-center gap-2 h-10 px-3 bg-muted rounded-md text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
              </div>
            </div>
          </div>

          {/* Catatan */}
          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan (Opsional)</Label>
            <Textarea
              id="catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tambahkan catatan untuk arsip ini..."
              rows={2}
            />
          </div>

          {/* Selection Info */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                disabled={pemainLolos.length === 0}
              />
              <span className="text-sm font-medium">
                Pilih Semua ({pemainLolos.length} pemain lolos)
              </span>
            </div>
            {selectedIds.size > 0 && <Badge variant="secondary">{selectedIds.size} dipilih</Badge>}
          </div>

          {/* Pemain List */}
          <ScrollArea className="h-[250px] border rounded-lg">
            {pemainLolos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-10 h-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">Tidak ada pemain yang lolos seleksi</p>
              </div>
            ) : (
              <div className="divide-y">
                {pemainLolos.map((pemain) => {
                  const isSelected = selectedIds.has(pemain.id);

                  return (
                    <div
                      key={pemain.id}
                      className={cn(
                        'flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors',
                        isSelected && 'bg-primary/5'
                      )}
                      onClick={() => handleSelectOne(pemain.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelectOne(pemain.id)}
                      />

                      <Avatar className="h-10 w-10">
                        <AvatarImage src={pemain.foto_url} />
                        <AvatarFallback>{pemain.nama?.charAt(0)?.toUpperCase()}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{pemain.nama}</p>
                        <p className="text-xs text-muted-foreground">{pemain.posisi}</p>
                      </div>

                      <Badge className="bg-green-500 gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {parseFloat(pemain.nilai_rata_rata).toFixed(1)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Progress */}
          {saving && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Mengarsipkan pemain...</span>
                <span className="font-mono">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <Progress value={(progress.current / progress.total) * 100} className="h-2" />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Batal
          </Button>
          <Button onClick={handleArsipkan} disabled={saving || selectedIds.size === 0}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Archive className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Mengarsipkan...' : `Arsipkan (${selectedIds.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArsipPemainModal;
