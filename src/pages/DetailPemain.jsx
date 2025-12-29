import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
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
  ArrowLeft,
  User,
  MapPin,
  Ruler,
  Weight,
  Phone,
  Mail,
  Calendar,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Award,
  Target,
} from 'lucide-react';
import { PenilaianCard } from '@/components/penilaian';
import { formatDate, formatDateTime } from '@/utils/formatters';
import { calculatePenilaianAverage, PENILAIAN_CATEGORIES } from '@/utils/calculations';
import { cn } from '@/lib/utils';

const DetailPemain = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, canRate } = useAuth();

  // State
  const [pemain, setPemain] = useState(null);
  const [penilaianList, setPenilaianList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    penilaianId: null,
    penilaiNama: '',
  });
  const [deleting, setDeleting] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch pemain
        const { data: pemainData, error: pemainError } = await supabase
          .from('pemain_dengan_nilai')
          .select('*')
          .eq('id', id)
          .single();

        if (pemainError) throw pemainError;

        if (!pemainData) {
          setError('Pemain tidak ditemukan');
          return;
        }

        setPemain(pemainData);

        // Fetch penilaian
        const { data: penilaianData, error: penilaianError } = await supabase
          .from('penilaian')
          .select('*')
          .eq('pemain_id', id)
          .order('created_at', { ascending: false });

        if (penilaianError) throw penilaianError;

        setPenilaianList(penilaianData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data pemain');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Handle delete penilaian
  const handleDeletePenilaian = (penilaianId, penilaiNama) => {
    setDeleteDialog({ open: true, penilaianId, penilaiNama });
  };

  const confirmDeletePenilaian = async () => {
    if (!deleteDialog.penilaianId) return;

    setDeleting(true);

    try {
      const { error } = await supabase
        .from('penilaian')
        .delete()
        .eq('id', deleteDialog.penilaianId);

      if (error) throw error;

      // Update local state
      setPenilaianList((prev) => prev.filter((p) => p.id !== deleteDialog.penilaianId));

      // Refresh pemain data untuk update nilai rata-rata
      const { data: updatedPemain } = await supabase
        .from('pemain_dengan_nilai')
        .select('*')
        .eq('id', id)
        .single();

      if (updatedPemain) {
        setPemain(updatedPemain);
      }

      toast({
        title: 'Berhasil',
        description: `Penilaian dari ${deleteDialog.penilaiNama} berhasil dihapus`,
      });
    } catch (err) {
      console.error('Error deleting penilaian:', err);
      toast({
        title: 'Error',
        description: 'Gagal menghapus penilaian',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, penilaianId: null, penilaiNama: '' });
    }
  };

  // Calculate overall average
  const calculateOverallAverage = () => {
    if (penilaianList.length === 0) return null;

    const totalAvg = penilaianList.reduce((sum, p) => {
      return sum + parseFloat(calculatePenilaianAverage(p));
    }, 0);

    return totalAvg / penilaianList.length;
  };

  const overallAverage = calculateOverallAverage();
  const isLolos = overallAverage !== null && overallAverage >= 75;

  // Get status config
  const getStatusConfig = (status) => {
    switch (status) {
      case 'LOLOS':
        return {
          label: 'Lolos Seleksi',
          variant: 'default',
          icon: TrendingUp,
          className: 'bg-green-500 hover:bg-green-600',
        };
      case 'TIDAK LOLOS':
        return {
          label: 'Tidak Lolos',
          variant: 'destructive',
          icon: TrendingDown,
          className: '',
        };
      default:
        return {
          label: 'Belum Dinilai',
          variant: 'secondary',
          icon: ClipboardCheck,
          className: '',
        };
    }
  };

  const statusConfig = getStatusConfig(pemain?.status_kelayakan);
  const StatusIcon = statusConfig.icon;

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-64 md:col-span-1" />
          <Skeleton className="h-64 md: col-span-2" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  if (!pemain) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{pemain.nama}</h1>
            <p className="text-muted-foreground">{pemain.posisi}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit Button - Admin Only */}
          {isAdmin && (
            <Button variant="outline" asChild>
              <Link to={`/admin/pemain/${id}/edit`}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit Pemain
              </Link>
            </Button>
          )}

          {/* Add Penilaian Button */}
          {canRate && (
            <Button asChild>
              <Link to={`/dashboard/penilaian/${id}`}>
                <Plus className="w-4 h-4 mr-2" />
                Beri Penilaian
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <Avatar className="w-28 h-28 border-4 border-background shadow-xl mb-4">
                  <AvatarImage src={pemain.foto_url} alt={pemain.nama} />
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary/20 to-primary/5">
                    {pemain.nama?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Name & Position */}
                <h2 className="text-xl font-bold">{pemain.nama}</h2>
                <p className="text-muted-foreground">{pemain.posisi}</p>

                {/* Status Badge */}
                <Badge
                  variant={statusConfig.variant}
                  className={cn('mt-3 gap-1', statusConfig.className)}
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </Badge>

                {/* Score */}
                {pemain.nilai_rata_rata && (
                  <div className="mt-4 p-4 bg-muted rounded-xl w-full">
                    <p className="text-sm text-muted-foreground mb-1">Nilai Rata-rata</p>
                    <p
                      className={cn(
                        'text-4xl font-bold',
                        pemain.nilai_rata_rata >= 75
                          ? 'text-green-600'
                          : pemain.nilai_rata_rata >= 50
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      )}
                    >
                      {parseFloat(pemain.nilai_rata_rata).toFixed(1)}
                    </p>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              {/* Info List */}
              <div className="space-y-4">
                <InfoRow icon={Ruler} label="Tinggi Badan" value={`${pemain.tinggi_badan} cm`} />
                <InfoRow icon={Weight} label="Berat Badan" value={`${pemain.berat_badan} kg`} />
                <InfoRow
                  icon={Calendar}
                  label="Tanggal Lahir"
                  value={formatDate(pemain.tanggal_lahir)}
                />
                {pemain.no_telepon && (
                  <InfoRow icon={Phone} label="No.  Telepon" value={pemain.no_telepon} />
                )}
                {pemain.email && <InfoRow icon={Mail} label="Email" value={pemain.email} />}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          {penilaianList.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Statistik Penilaian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-2xl font-bold">{penilaianList.length}</p>
                    <p className="text-xs text-muted-foreground">Total Penilaian</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p
                      className={cn(
                        'text-2xl font-bold',
                        isLolos ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {overallAverage?.toFixed(1) || '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">Rata-rata</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Penilaian List */}
        <div className="lg: col-span-2 space-y-6">
          {/* Penilaian Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                Riwayat Penilaian
              </h2>
              <p className="text-sm text-muted-foreground">
                {penilaianList.length} penilaian dari berbagai penilai
              </p>
            </div>
          </div>

          {/* Penilaian List */}
          {penilaianList.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ClipboardCheck className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Belum Ada Penilaian</h3>
                <p className="text-muted-foreground mb-4">
                  Pemain ini belum memiliki penilaian dari penilai manapun.
                </p>
                {canRate && (
                  <Button asChild>
                    <Link to={`/dashboard/penilaian/${id}`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Beri Penilaian Pertama
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {penilaianList.map((penilaian, index) => (
                <PenilaianCard
                  key={penilaian.id}
                  penilaian={penilaian}
                  onDelete={canRate ? handleDeletePenilaian : undefined}
                  defaultExpanded={index === 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !deleting && setDeleteDialog({ open, penilaianId: null, penilaiNama: '' })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Penilaian? </AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus penilaian dari <strong>{deleteDialog.penilaiNama}</strong>?
              Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi nilai rata-rata pemain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePenilaian}
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

// Sub-component:  Info Row
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="p-2 bg-muted rounded-lg">
      <Icon className="w-4 h-4 text-muted-foreground" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium truncate">{value}</p>
    </div>
  </div>
);

export default DetailPemain;
