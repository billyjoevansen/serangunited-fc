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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
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
  Trophy,
  Search,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  Filter,
  Eye,
  Download,
  Archive,
  FolderArchive,
} from 'lucide-react';
import { ArsipPemainModal } from '@/components/arsip';
import { cn } from '@/lib/utils';

const HasilSeleksi = () => {
  const { isAdmin, canRate } = useAuth(); // canRate = admin atau penilai
  const { toast } = useToast();

  // State
  const [pemainList, setPemainList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [posisiFilter, setPosisiFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('semua');

  // Arsip modal
  const [arsipModalOpen, setArsipModalOpen] = useState(false);

  // Fetch data
  const fetchPemain = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pemain_dengan_nilai')
        .select('*')
        .order('nilai_rata_rata', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setPemainList(data || []);
    } catch (error) {
      console.error('Error fetching pemain:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPemain();
  }, []);

  // Filter data
  const filteredPemain = useMemo(() => {
    return pemainList.filter((pemain) => {
      const matchesSearch = pemain.nama?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosisi = posisiFilter === 'all' || pemain.posisi === posisiFilter;

      let matchesTab = true;
      if (activeTab === 'lolos') {
        matchesTab = pemain.status_kelayakan === 'LOLOS';
      } else if (activeTab === 'tidak_lolos') {
        matchesTab = pemain.status_kelayakan === 'TIDAK LOLOS';
      } else if (activeTab === 'belum_dinilai') {
        matchesTab = !pemain.status_kelayakan || pemain.status_kelayakan === 'BELUM DINILAI';
      }

      return matchesSearch && matchesPosisi && matchesTab;
    });
  }, [pemainList, searchTerm, posisiFilter, activeTab]);

  // Stats
  const stats = useMemo(() => {
    const lolos = pemainList.filter((p) => p.status_kelayakan === 'LOLOS').length;
    const tidakLolos = pemainList.filter((p) => p.status_kelayakan === 'TIDAK LOLOS').length;
    const belumDinilai = pemainList.filter(
      (p) => !p.status_kelayakan || p.status_kelayakan === 'BELUM DINILAI'
    ).length;

    return { total: pemainList.length, lolos, tidakLolos, belumDinilai };
  }, [pemainList]);

  // Posisi options
  const posisiOptions = useMemo(() => {
    return [...new Set(pemainList.map((p) => p.posisi))].sort();
  }, [pemainList]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Rank', 'Nama', 'Posisi', 'Nilai', 'Status', 'Jumlah Penilaian'];
    const rows = filteredPemain.map((p, i) => [
      i + 1,
      p.nama,
      p.posisi,
      p.nilai_rata_rata || '-',
      p.status_kelayakan || 'BELUM DINILAI',
      p.jumlah_penilaian || 0,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hasil_seleksi_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'Berhasil',
      description: 'Data berhasil diexport',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-500" />
            Hasil Seleksi
          </h1>
          <p className="text-muted-foreground">Peringkat dan status kelolosan pemain</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tombol Arsip - Untuk Admin & Penilai */}
          {canRate && (
            <>
              <Button variant="outline" asChild>
                <Link to="/dashboard/arsip">
                  <FolderArchive className="w-4 h-4 mr-2" />
                  Lihat Arsip
                </Link>
              </Button>
              <Button
                variant="default"
                onClick={() => setArsipModalOpen(true)}
                disabled={stats.lolos === 0}
              >
                <Archive className="w-4 h-4 mr-2" />
                Arsipkan Lolos ({stats.lolos})
              </Button>
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </>
          )}
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
                <p className="text-xs text-muted-foreground">Total Pemain</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.lolos}</p>
                <p className="text-xs text-muted-foreground">Lolos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.tidakLolos}</p>
                <p className="text-xs text-muted-foreground">Tidak Lolos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Award className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.belumDinilai}</p>
                <p className="text-xs text-muted-foreground">Belum Dinilai</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Filters */}
      <Card>
        <CardHeader className="pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="semua">Semua</TabsTrigger>
              <TabsTrigger value="lolos" className="text-green-600">
                Lolos
              </TabsTrigger>
              <TabsTrigger value="tidak_lolos" className="text-red-600">
                Tidak Lolos
              </TabsTrigger>
              <TabsTrigger value="belum_dinilai">Belum Dinilai</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama pemain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={posisiFilter} onValueChange={setPosisiFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
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
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Rank</TableHead>
                    <TableHead>Pemain</TableHead>
                    <TableHead>Posisi</TableHead>
                    <TableHead>Nilai</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPemain.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Tidak ada data ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPemain.map((pemain, index) => (
                      <TableRow key={pemain.id}>
                        <TableCell>
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                              index === 0 && 'bg-yellow-100 text-yellow-700',
                              index === 1 && 'bg-gray-100 text-gray-700',
                              index === 2 && 'bg-orange-100 text-orange-700',
                              index > 2 && 'bg-muted text-muted-foreground'
                            )}
                          >
                            {index + 1}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={pemain.foto_url} />
                              <AvatarFallback>
                                {pemain.nama?.charAt(0)?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{pemain.nama}</p>
                              <p className="text-xs text-muted-foreground">
                                {pemain.jumlah_penilaian || 0} penilaian
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{pemain.posisi}</Badge>
                        </TableCell>
                        <TableCell>
                          {pemain.nilai_rata_rata ? (
                            <span
                              className={cn(
                                'text-lg font-bold',
                                pemain.nilai_rata_rata >= 75
                                  ? 'text-green-600'
                                  : pemain.nilai_rata_rata >= 50
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                              )}
                            >
                              {parseFloat(pemain.nilai_rata_rata).toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {pemain.status_kelayakan === 'LOLOS' ? (
                            <Badge className="bg-green-500 gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Lolos
                            </Badge>
                          ) : pemain.status_kelayakan === 'TIDAK LOLOS' ? (
                            <Badge variant="destructive" className="gap-1">
                              <TrendingDown className="w-3 h-3" />
                              Tidak Lolos
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Belum Dinilai</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/dashboard/pemain/${pemain.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Arsip Modal - Hanya Admin */}
      {isAdmin && (
        <ArsipPemainModal
          open={arsipModalOpen}
          onOpenChange={setArsipModalOpen}
          pemainList={pemainList}
          onSuccess={fetchPemain}
        />
      )}
    </div>
  );
};

export default HasilSeleksi;
