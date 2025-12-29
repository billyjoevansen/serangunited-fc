import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Archive,
  Search,
  Filter,
  Calendar,
  Download,
  Trash2,
  Eye,
  MoreHorizontal,
  TrendingUp,
  Users,
  Award,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  FolderArchive,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/utils/formatters';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

const ArsipPemain = () => {
  const { isAdmin, canRate } = useAuth();
  const { toast } = useToast();

  // State
  const [arsipList, setArsipList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [posisiFilter, setPosisiFilter] = useState('all');
  const [periodeFilter, setPeriodeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Delete state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, arsip: null });
  const [deleting, setDeleting] = useState(false);

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

  // Get unique values for filters
  const posisiOptions = useMemo(() => {
    const unique = [...new Set(arsipList.map((a) => a.posisi))];
    return unique.sort();
  }, [arsipList]);

  const periodeOptions = useMemo(() => {
    const unique = [...new Set(arsipList.map((a) => a.periode_seleksi).filter(Boolean))];
    return unique.sort().reverse();
  }, [arsipList]);

  // Filter data
  const filteredArsip = useMemo(() => {
    return arsipList.filter((arsip) => {
      const matchesSearch =
        arsip.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        arsip.posisi?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPosisi = posisiFilter === 'all' || arsip.posisi === posisiFilter;
      const matchesPeriode = periodeFilter === 'all' || arsip.periode_seleksi === periodeFilter;

      return matchesSearch && matchesPosisi && matchesPeriode;
    });
  }, [arsipList, searchTerm, posisiFilter, periodeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredArsip.length / ITEMS_PER_PAGE);
  const paginatedArsip = filteredArsip.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, posisiFilter, periodeFilter]);

  // Handle delete
  const handleDelete = async () => {
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
        description: 'Data arsip berhasil dihapus',
      });
    } catch (error) {
      console.error('Error deleting arsip:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus data arsip',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, arsip: null });
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
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
    ];

    const rows = filteredArsip.map((arsip) => [
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
      description: `${filteredArsip.length} data berhasil diexport ke CSV`,
    });
  };

  // Stats
  const stats = useMemo(() => {
    const byPosisi = {};
    arsipList.forEach((a) => {
      byPosisi[a.posisi] = (byPosisi[a.posisi] || 0) + 1;
    });

    const avgNilai =
      arsipList.length > 0
        ? arsipList.reduce((sum, a) => sum + parseFloat(a.nilai_rata_rata), 0) / arsipList.length
        : 0;

    return {
      total: arsipList.length,
      avgNilai: avgNilai.toFixed(1),
      byPosisi,
    };
  }, [arsipList]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderArchive className="w-7 h-7" />
            Arsip Pemain
          </h1>
          <p className="text-muted-foreground">Data pemain yang telah lolos seleksi</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV} disabled={filteredArsip.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={fetchArsip} disabled={loading}>
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Arsip</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgNilai}</p>
                <p className="text-xs text-muted-foreground">Rata-rata Nilai</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{posisiOptions.length}</p>
                <p className="text-xs text-muted-foreground">Posisi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{periodeOptions.length}</p>
                <p className="text-xs text-muted-foreground">Periode</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau posisi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={posisiFilter} onValueChange={setPosisiFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Semua Posisi" />
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
                <SelectValue placeholder="Semua Periode" />
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
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredArsip.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderArchive className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Arsip</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Data pemain yang lolos seleksi akan muncul di sini setelah diarsipkan.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pemain</TableHead>
                    <TableHead>Posisi</TableHead>
                    <TableHead>Nilai</TableHead>
                    <TableHead className="hidden md:table-cell">Periode</TableHead>
                    <TableHead className="hidden lg:table-cell">Tanggal Seleksi</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedArsip.map((arsip) => (
                    <TableRow key={arsip.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={arsip.foto_url} />
                            <AvatarFallback>{arsip.nama?.charAt(0)?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{arsip.nama}</p>
                            <p className="text-xs text-muted-foreground">
                              {arsip.tinggi_badan} cm • {arsip.berat_badan} kg
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{arsip.posisi}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500 gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {parseFloat(arsip.nilai_rata_rata).toFixed(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {arsip.periode_seleksi || '-'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                        {formatDate(arsip.tanggal_seleksi)}
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
                            {/* Hanya Admin yang bisa hapus */}
                            {isAdmin && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteDialog({ open: true, arsip })}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus dari Arsip
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredArsip.length)} dari{' '}
                    {filteredArsip.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, arsip: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus dari Arsip? </AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus <strong>{deleteDialog.arsip?.nama}</strong> dari arsip?
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
              {deleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ArsipPemain;
