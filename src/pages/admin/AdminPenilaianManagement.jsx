import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ClipboardCheck,
  Loader2,
  RefreshCw,
  User,
  TrendingUp,
  TrendingDown,
  CheckSquare,
  Square,
  X,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import { formatDateTime } from '@/utils/formatters';
import { calculatePenilaianAverage } from '@/utils/calculations';
import { cn } from '@/lib/utils';

const AdminPenilaianManagement = () => {
  const { toast } = useToast();
  const [penilaianList, setPenilaianList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'lolos' | 'tidak_lolos'

  // Selection state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Delete state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    penilaian: null,
    isBulk: false,
  });
  const [deleting, setDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState({ current: 0, total: 0 });

  // Fetch penilaian
  const fetchPenilaian = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('penilaian')
        .select(
          `
          *,
          pemain: pemain_id (
            id,
            nama,
            posisi,
            foto_url
          )
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPenilaianList(data || []);
    } catch (error) {
      console.error('Error fetching penilaian:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data penilaian',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenilaian();
  }, []);

  // Filter penilaian
  const filteredPenilaian = useMemo(() => {
    return penilaianList.filter((p) => {
      // Search filter
      const matchesSearch =
        p.pemain?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.penilai_nama?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const avg = parseFloat(calculatePenilaianAverage(p));
      const isLolos = avg >= 75;

      if (statusFilter === 'lolos' && !isLolos) return false;
      if (statusFilter === 'tidak_lolos' && isLolos) return false;

      return matchesSearch;
    });
  }, [penilaianList, searchTerm, statusFilter]);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === filteredPenilaian.length) {
      // Deselect all
      setSelectedIds(new Set());
    } else {
      // Select all filtered
      setSelectedIds(new Set(filteredPenilaian.map((p) => p.id)));
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

  const handleCancelSelection = () => {
    setSelectedIds(new Set());
    setIsSelectMode(false);
  };

  const isAllSelected =
    filteredPenilaian.length > 0 && selectedIds.size === filteredPenilaian.length;
  const isPartiallySelected = selectedIds.size > 0 && selectedIds.size < filteredPenilaian.length;

  // Delete handlers
  const handleDeleteSingle = (penilaian) => {
    setDeleteDialog({ open: true, penilaian, isBulk: false });
  };

  const handleDeleteBulk = () => {
    setDeleteDialog({ open: true, penilaian: null, isBulk: true });
  };

  const confirmDelete = async () => {
    setDeleting(true);

    try {
      if (deleteDialog.isBulk) {
        // Bulk delete
        const idsToDelete = Array.from(selectedIds);
        setDeleteProgress({ current: 0, total: idsToDelete.length });

        let successCount = 0;
        let failedCount = 0;

        for (let i = 0; i < idsToDelete.length; i++) {
          const { error } = await supabase.from('penilaian').delete().eq('id', idsToDelete[i]);

          if (error) {
            failedCount++;
          } else {
            successCount++;
          }

          setDeleteProgress({ current: i + 1, total: idsToDelete.length });
        }

        // Update local state
        setPenilaianList((prev) => prev.filter((p) => !selectedIds.has(p.id)));
        setSelectedIds(new Set());
        setIsSelectMode(false);

        toast({
          title: 'Berhasil',
          description: `${successCount} penilaian berhasil dihapus${
            failedCount > 0 ? `, ${failedCount} gagal` : ''
          }`,
        });
      } else {
        // Single delete
        const { error } = await supabase
          .from('penilaian')
          .delete()
          .eq('id', deleteDialog.penilaian.id);

        if (error) throw error;

        setPenilaianList((prev) => prev.filter((p) => p.id !== deleteDialog.penilaian.id));

        toast({
          title: 'Berhasil',
          description: 'Penilaian berhasil dihapus',
        });
      }
    } catch (error) {
      console.error('Error deleting penilaian:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus penilaian',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteProgress({ current: 0, total: 0 });
      setDeleteDialog({ open: false, penilaian: null, isBulk: false });
    }
  };

  // Get score badge
  const getScoreBadge = (score) => {
    const avg = parseFloat(score);
    if (avg >= 75) {
      return (
        <Badge variant="default" className="gap-1 bg-green-500">
          <TrendingUp className="w-3 h-3" />
          {avg.toFixed(1)}
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="gap-1">
        <TrendingDown className="w-3 h-3" />
        {avg.toFixed(1)}
      </Badge>
    );
  };

  // Stats
  const stats = useMemo(() => {
    const lolos = penilaianList.filter(
      (p) => parseFloat(calculatePenilaianAverage(p)) >= 75
    ).length;
    return {
      total: penilaianList.length,
      lolos,
      tidakLolos: penilaianList.length - lolos,
    };
  }, [penilaianList]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" />
              Manajemen Penilaian
            </CardTitle>
            <CardDescription>Kelola semua data penilaian pemain</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!isSelectMode ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsSelectMode(true)}>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Pilih
                </Button>
                <Button variant="outline" size="sm" onClick={fetchPenilaian} disabled={loading}>
                  <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
                  Refresh
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleCancelSelection}>
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Selection Bar */}
        {isSelectMode && selectedIds.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <CheckSquare className="w-3 h-3" />
                {selectedIds.size} dipilih
              </Badge>
              <span className="text-sm text-muted-foreground">
                dari {filteredPenilaian.length} penilaian
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                Batal Pilih
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteBulk}>
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus ({selectedIds.size})
              </Button>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama pemain atau penilai..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="lolos">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  Lolos
                </div>
              </SelectItem>
              <SelectItem value="tidak_lolos">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-3 h-3 text-red-500" />
                  Tidak Lolos
                </div>
              </SelectItem>
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
                  {isSelectMode && (
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={isAllSelected}
                        // indeterminate state
                        data-state={
                          isPartiallySelected
                            ? 'indeterminate'
                            : isAllSelected
                            ? 'checked'
                            : 'unchecked'
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                  )}
                  <TableHead>Pemain</TableHead>
                  <TableHead>Penilai</TableHead>
                  <TableHead>Skor</TableHead>
                  <TableHead className="hidden md:table-cell">Tanggal</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPenilaian.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isSelectMode ? 6 : 5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Tidak ada penilaian ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPenilaian.map((penilaian) => {
                    const avg = calculatePenilaianAverage(penilaian);
                    const isSelected = selectedIds.has(penilaian.id);

                    return (
                      <TableRow key={penilaian.id} className={cn(isSelected && 'bg-primary/5')}>
                        {isSelectMode && (
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelectOne(penilaian.id)}
                              aria-label={`Select ${penilaian.pemain?.nama}`}
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={penilaian.pemain?.foto_url} />
                              <AvatarFallback>
                                {penilaian.pemain?.nama?.charAt(0)?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{penilaian.pemain?.nama}</p>
                              <p className="text-xs text-muted-foreground">
                                {penilaian.pemain?.posisi}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{penilaian.penilai_nama}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getScoreBadge(avg)}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {formatDateTime(penilaian.created_at)}
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
                              <DropdownMenuItem asChild>
                                <Link to={`/admin/penilaian/${penilaian.id}/edit`}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit Penilaian
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/dashboard/pemain/${penilaian.pemain?.id}`}>
                                  <User className="w-4 h-4 mr-2" />
                                  Lihat Pemain
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteSingle(penilaian)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus Penilaian
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

        {/* Stats */}
        <div className="flex flex-wrap gap-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Total: <span className="font-medium text-foreground">{stats.total}</span> penilaian
          </div>
          <div className="text-sm text-muted-foreground">
            Lolos: <span className="font-medium text-green-600">{stats.lolos}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Tidak Lolos: <span className="font-medium text-red-600">{stats.tidakLolos}</span>
          </div>
          {searchTerm || statusFilter !== 'all' ? (
            <div className="text-sm text-muted-foreground">
              Ditampilkan:{' '}
              <span className="font-medium text-foreground">{filteredPenilaian.length}</span>
            </div>
          ) : null}
        </div>
      </CardContent>

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !deleting && setDeleteDialog({ open, penilaian: null, isBulk: false })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {deleteDialog.isBulk ? `Hapus ${selectedIds.size} Penilaian? ` : 'Hapus Penilaian? '}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.isBulk ? (
                <>
                  Anda yakin ingin menghapus <strong>{selectedIds.size} penilaian</strong> yang
                  dipilih? Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi nilai rata-rata
                  pemain terkait.
                </>
              ) : (
                <>
                  Anda yakin ingin menghapus penilaian dari{' '}
                  <strong>{deleteDialog.penilaian?.penilai_nama}</strong> untuk pemain{' '}
                  <strong>{deleteDialog.penilaian?.pemain?.nama}</strong>? Tindakan ini tidak dapat
                  dibatalkan.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Progress bar for bulk delete */}
          {deleting && deleteDialog.isBulk && (
            <div className="space-y-2 py-4">
              <div className="flex justify-between text-sm">
                <span>Menghapus penilaian...</span>
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
              onClick={confirmDelete}
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
                  ? `Menghapus ${deleteProgress.current}/${deleteProgress.total}...`
                  : 'Menghapus...'
                : deleteDialog.isBulk
                ? `Hapus ${selectedIds.size} Penilaian`
                : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default AdminPenilaianManagement;
