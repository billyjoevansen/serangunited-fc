import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
  CheckSquare,
  XSquare,
  AlertTriangle,
  Filter,
  FolderArchive,
  Eye,
  Download,
  TrendingUp,
  Calendar,
  User,
  FileText,
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/utils/formatters';
import { cn } from '@/lib/utils';

const AdminArsipManagement = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [arsipList, setArsipList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [posisiFilter, setPosisiFilter] = useState('all');
  const [periodeFilter, setPeriodeFilter] = useState('all');

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Delete state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, arsip: null, isBulk: false });
  const [deleting, setDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState({ current: 0, total: 0 });

  // Edit state
  const [editDialog, setEditDialog] = useState({ open: false, arsip: null });
  const [editData, setEditData] = useState({
    periode_seleksi: '',
    catatan: '',
    status_kelayakan: '',
  });
  const [saving, setSaving] = useState(false);

  // Fetch arsip
  const fetchArsip = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('arsip_pemain')
        .select('*')
        .order('tanggal_diarsipkan', { ascending: false });

      if (error) throw error;
      setArsipList(data || []);
    } catch (error) {
      console.error('Error fetching arsip:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data arsip',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArsip();
  }, []);

  // Reset selection when data changes
  useEffect(() => {
    setSelectedIds([]);
    setIsAllSelected(false);
  }, [arsipList]);

  // Get unique values for filters
  const posisiOptions = [...new Set(arsipList.map((a) => a.posisi))].sort();
  const periodeOptions = [...new Set(arsipList.map((a) => a.periode_seleksi).filter(Boolean))]
    .sort()
    .reverse();

  // Filter arsip
  const filteredArsip = arsipList.filter((arsip) => {
    const matchesSearch =
      arsip.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arsip.posisi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arsip.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPosisi = posisiFilter === 'all' || arsip.posisi === posisiFilter;
    const matchesPeriode = periodeFilter === 'all' || arsip.periode_seleksi === periodeFilter;

    return matchesSearch && matchesPosisi && matchesPeriode;
  });

  // Handle select single item
  const handleSelectItem = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
      setIsAllSelected(false);
    } else {
      setSelectedIds(filteredArsip.map((a) => a.id));
      setIsAllSelected(true);
    }
  };

  // Update isAllSelected state
  useEffect(() => {
    if (filteredArsip.length > 0 && selectedIds.length === filteredArsip.length) {
      setIsAllSelected(true);
    } else {
      setIsAllSelected(false);
    }
  }, [selectedIds, filteredArsip]);

  // Clear selection
  const handleClearSelection = () => {
    setSelectedIds([]);
    setIsAllSelected(false);
  };

  // Handle single delete
  const handleDeleteSingle = async () => {
    if (!deleteDialog.arsip) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('arsip_pemain')
        .delete()
        .eq('id', deleteDialog.arsip.id);

      if (error) throw error;

      setArsipList((prev) => prev.filter((a) => a.id !== deleteDialog.arsip.id));
      toast({
        title: 'Berhasil',
        description: `Arsip ${deleteDialog.arsip.nama} berhasil dihapus`,
      });
    } catch (error) {
      console.error('Error deleting arsip:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus arsip',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, arsip: null, isBulk: false });
    }
  };

  // Handle bulk delete
  const handleDeleteBulk = async () => {
    if (selectedIds.length === 0) return;

    setDeleting(true);
    setDeleteProgress({ current: 0, total: selectedIds.length });

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < selectedIds.length; i++) {
      try {
        const { error } = await supabase.from('arsip_pemain').delete().eq('id', selectedIds[i]);

        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error('Error deleting arsip:', error);
        failedCount++;
      }

      setDeleteProgress({ current: i + 1, total: selectedIds.length });
    }

    setArsipList((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
    setSelectedIds([]);
    setIsAllSelected(false);

    toast({
      title: 'Berhasil',
      description: `${successCount} arsip berhasil dihapus${
        failedCount > 0 ? `, ${failedCount} gagal` : ''
      }`,
    });

    setDeleting(false);
    setDeleteProgress({ current: 0, total: 0 });
    setDeleteDialog({ open: false, arsip: null, isBulk: false });
  };

  // Open delete confirmation
  const openDeleteConfirm = (arsip = null, isBulk = false) => {
    setDeleteDialog({ open: true, arsip, isBulk });
  };

  // Open edit dialog
  const openEditDialog = (arsip) => {
    setEditData({
      periode_seleksi: arsip.periode_seleksi || '',
      catatan: arsip.catatan || '',
      status_kelayakan: arsip.status_kelayakan || 'LOLOS',
    });
    setEditDialog({ open: true, arsip });
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editDialog.arsip) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('arsip_pemain')
        .update({
          periode_seleksi: editData.periode_seleksi,
          catatan: editData.catatan,
          status_kelayakan: editData.status_kelayakan,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editDialog.arsip.id);

      if (error) throw error;

      // Update local state
      setArsipList((prev) =>
        prev.map((a) =>
          a.id === editDialog.arsip.id
            ? { ...a, ...editData, updated_at: new Date().toISOString() }
            : a
        )
      );

      toast({
        title: 'Berhasil',
        description: `Arsip ${editDialog.arsip.nama} berhasil diperbarui`,
      });

      setEditDialog({ open: false, arsip: null });
    } catch (error) {
      console.error('Error updating arsip:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui arsip',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const dataToExport =
      selectedIds.length > 0 ? arsipList.filter((a) => selectedIds.includes(a.id)) : filteredArsip;

    const headers = [
      'Nama',
      'Posisi',
      'Tinggi (cm)',
      'Berat (kg)',
      'Nilai Rata-rata',
      'Status',
      'Tanggal Seleksi',
      'Periode',
      'No Telepon',
      'Email',
      'Catatan',
      'Diarsipkan Oleh',
      'Tanggal Diarsipkan',
    ];

    const rows = dataToExport.map((arsip) => [
      arsip.nama,
      arsip.posisi,
      arsip.tinggi_badan,
      arsip.berat_badan,
      arsip.nilai_rata_rata,
      arsip.status_kelayakan,
      arsip.tanggal_seleksi,
      arsip.periode_seleksi || '',
      arsip.no_telepon || '',
      arsip.email || '',
      arsip.catatan || '',
      arsip.nama_pengarsip || '',
      arsip.tanggal_diarsipkan,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `arsip_pemain_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Berhasil',
      description: `${dataToExport.length} data berhasil diexport ke CSV`,
    });
  };

  // Stats
  const stats = {
    total: arsipList.length,
    byPosisi: posisiOptions.length,
    byPeriode: periodeOptions.length,
    avgNilai:
      arsipList.length > 0
        ? (
            arsipList.reduce((sum, a) => sum + parseFloat(a.nilai_rata_rata || 0), 0) /
            arsipList.length
          ).toFixed(1)
        : 0,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderArchive className="w-5 h-5" />
                Manajemen Arsip
              </CardTitle>
              <CardDescription>Kelola data arsip pemain yang lolos seleksi</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchArsip} disabled={loading}>
                <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={filteredArsip.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export {selectedIds.length > 0 ? `(${selectedIds.length})` : 'CSV'}
              </Button>
            </div>
          </div>

          {/* Selection Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-primary" />
                <span className="font-medium">{selectedIds.length} arsip dipilih</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleClearSelection}>
                  <XSquare className="w-4 h-4 mr-2" />
                  Batal Pilih
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openDeleteConfirm(null, true)}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Hapus {selectedIds.length} Arsip
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, posisi, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={posisiFilter} onValueChange={setPosisiFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Posisi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Posisi</SelectItem>
              {posisiOptions.map((posisi) => (
                <SelectItem key={posisi} value={posisi}>
                  {posisi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={periodeFilter} onValueChange={setPeriodeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Periode</SelectItem>
              {periodeOptions.map((periode) => (
                <SelectItem key={periode} value={periode}>
                  {periode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      disabled={filteredArsip.length === 0}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Pemain</TableHead>
                  <TableHead>Posisi</TableHead>
                  <TableHead className="text-center">Nilai</TableHead>
                  <TableHead className="hidden md:table-cell">Periode</TableHead>
                  <TableHead className="hidden lg:table-cell">Diarsipkan</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArsip.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <FolderArchive className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      Tidak ada data arsip ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredArsip.map((arsip) => {
                    const isSelected = selectedIds.includes(arsip.id);

                    return (
                      <TableRow key={arsip.id} className={cn(isSelected && 'bg-primary/5')}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSelectItem(arsip.id)}
                            aria-label={`Select ${arsip.nama}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={arsip.foto_url} />
                              <AvatarFallback>
                                {arsip.nama?.charAt(0)?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{arsip.nama}</p>
                              <p className="text-xs text-muted-foreground">{arsip.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{arsip.posisi}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-500 gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {parseFloat(arsip.nilai_rata_rata).toFixed(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {arsip.periode_seleksi || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-sm text-muted-foreground">
                            <p>{formatDate(arsip.tanggal_diarsipkan)}</p>
                            <p className="text-xs flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {arsip.nama_pengarsip || 'Admin'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {arsip.pemain_id && (
                                <DropdownMenuItem asChild>
                                  <Link to={`/dashboard/pemain/${arsip.pemain_id}`}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Lihat Pemain
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => openEditDialog(arsip)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit Arsip
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => openDeleteConfirm(arsip, false)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus Arsip
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Footer Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>
              Total: <span className="font-medium text-foreground">{stats.total}</span> arsip
            </span>
            <span>
              Posisi: <span className="font-medium text-foreground">{stats.byPosisi}</span>
            </span>
            <span>
              Periode: <span className="font-medium text-foreground">{stats.byPeriode}</span>
            </span>
            <span>
              Rata-rata Nilai: <span className="font-medium text-green-600">{stats.avgNilai}</span>
            </span>
          </div>
          {selectedIds.length > 0 && (
            <span className="text-sm text-primary font-medium">{selectedIds.length} dipilih</span>
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) => !saving && setEditDialog({ open, arsip: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Edit Arsip
            </DialogTitle>
            <DialogDescription>Edit data arsip untuk {editDialog.arsip?.nama}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Info Pemain (Read-only) */}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={editDialog.arsip?.foto_url} />
                <AvatarFallback>{editDialog.arsip?.nama?.charAt(0)?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{editDialog.arsip?.nama}</p>
                <p className="text-sm text-muted-foreground">
                  {editDialog.arsip?.posisi} • Nilai:{' '}
                  {parseFloat(editDialog.arsip?.nilai_rata_rata || 0).toFixed(1)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="periode_seleksi">Periode Seleksi</Label>
              <Input
                id="periode_seleksi"
                placeholder="contoh:  Januari 2025"
                value={editData.periode_seleksi}
                onChange={(e) => setEditData({ ...editData, periode_seleksi: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status_kelayakan">Status</Label>
              <Select
                value={editData.status_kelayakan}
                onValueChange={(value) => setEditData({ ...editData, status_kelayakan: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOLOS">LOLOS</SelectItem>
                  <SelectItem value="CADANGAN">CADANGAN</SelectItem>
                  <SelectItem value="TIDAK LOLOS">TIDAK LOLOS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan</Label>
              <Textarea
                id="catatan"
                placeholder="Tambahkan catatan..."
                value={editData.catatan}
                onChange={(e) => setEditData({ ...editData, catatan: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ open: false, arsip: null })}
              disabled={saving}
            >
              Batal
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !deleting && setDeleteDialog({ open, arsip: null, isBulk: false })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {deleteDialog.isBulk ? `Hapus ${selectedIds.length} Arsip? ` : 'Hapus Arsip? '}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.isBulk ? (
                <>
                  Anda yakin ingin menghapus <strong>{selectedIds.length} arsip</strong> yang
                  dipilih? Tindakan ini tidak dapat dibatalkan.
                </>
              ) : (
                <>
                  Anda yakin ingin menghapus arsip <strong>{deleteDialog.arsip?.nama}</strong>?
                  Tindakan ini tidak dapat dibatalkan.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Progress bar for bulk delete */}
          {deleting && deleteDialog.isBulk && (
            <div className="space-y-2 py-4">
              <div className="flex justify-between text-sm">
                <span>Menghapus arsip... </span>
                <span className="font-mono">
                  {deleteProgress.current} / {deleteProgress.total}
                </span>
              </div>
              <Progress
                value={(deleteProgress.current / deleteProgress.total) * 100}
                className="h-2"
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteDialog.isBulk ? handleDeleteBulk : handleDeleteSingle}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {deleting
                ? deleteDialog.isBulk
                  ? `Menghapus ${deleteProgress.current}/${deleteProgress.total}... `
                  : 'Menghapus...'
                : deleteDialog.isBulk
                ? `Hapus ${selectedIds.length} Arsip`
                : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default AdminArsipManagement;
