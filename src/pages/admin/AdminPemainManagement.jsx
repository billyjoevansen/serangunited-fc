import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Search,
  Loader2,
  Eye,
  Pencil,
  Trash2,
  UserPlus,
  MoreHorizontal,
  CheckSquare,
  XSquare,
  AlertTriangle,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/common';
import { PASSING_SCORE } from '@/utils/calculations';
import { cn } from '@/lib/utils';

function AdminPemainManagement() {
  const [pemain, setPemain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Delete state
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    pemain: null,
    isBulk: false,
  });

  const fetchPemain = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pemain_dengan_nilai')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setPemain(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPemain();
  }, []);

  // Reset selection when data changes
  useEffect(() => {
    setSelectedIds([]);
    setIsAllSelected(false);
  }, [pemain]);

  const filteredPemain = pemain.filter(
    (p) =>
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.posisi.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      setSelectedIds(filteredPemain.map((p) => p.id));
      setIsAllSelected(true);
    }
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedIds([]);
    setIsAllSelected(false);
  };

  // Delete single pemain
  const handleDeleteSingle = async () => {
    if (!confirmDelete.pemain) return;

    setDeleting(true);
    try {
      const { error } = await supabase.from('pemain').delete().eq('id', confirmDelete.pemain.id);

      if (error) throw error;

      setConfirmDelete({ open: false, pemain: null, isBulk: false });
      fetchPemain();
    } catch (error) {
      alert('Gagal menghapus pemain:  ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  // Delete bulk pemain
  const handleDeleteBulk = async () => {
    if (selectedIds.length === 0) return;

    setDeleting(true);
    try {
      const { error } = await supabase.from('pemain').delete().in('id', selectedIds);

      if (error) throw error;

      setConfirmDelete({ open: false, pemain: null, isBulk: false });
      setSelectedIds([]);
      setIsAllSelected(false);
      fetchPemain();
    } catch (error) {
      alert('Gagal menghapus pemain:  ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  // Open bulk delete confirmation
  const openBulkDeleteConfirm = () => {
    setConfirmDelete({
      open: true,
      pemain: null,
      isBulk: true,
    });
  };

  // Open single delete confirmation
  const openSingleDeleteConfirm = (p) => {
    setConfirmDelete({
      open: true,
      pemain: p,
      isBulk: false,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>Manajemen Pemain</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Total: {pemain.length} pemain</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari pemain..."
                  className="pl-9 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button asChild>
                <Link to="/dashboard/tambah-pemain">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Tambah Pemain
                </Link>
              </Button>
            </div>
          </div>

          {/* Selection Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-primary" />
                <span className="font-medium">{selectedIds.length} pemain dipilih</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleClearSelection}>
                  <XSquare className="w-4 h-4 mr-2" />
                  Batal Pilih
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={openBulkDeleteConfirm}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Hapus {selectedIds.length} Pemain
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredPemain.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Tidak ada data pemain</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Pemain</TableHead>
                  <TableHead>Posisi</TableHead>
                  <TableHead className="text-center">Tinggi</TableHead>
                  <TableHead className="text-center">Berat</TableHead>
                  <TableHead className="text-center">Nilai</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPemain.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <TableRow key={p.id} className={cn(isSelected && 'bg-primary/5')}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleSelectItem(p.id)}
                          aria-label={`Select ${p.nama}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={p.foto_url} />
                            <AvatarFallback>{p.nama?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{p.nama}</p>
                            <p className="text-xs text-muted-foreground">{p.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{p.posisi}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{p.tinggi_badan} cm</TableCell>
                      <TableCell className="text-center">{p.berat_badan} kg</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={cn(
                            'font-bold',
                            p.nilai_rata_rata >= PASSING_SCORE
                              ? 'text-green-600'
                              : p.nilai_rata_rata > 0
                              ? 'text-red-500'
                              : 'text-muted-foreground'
                          )}
                        >
                          {p.nilai_rata_rata > 0 ? p.nilai_rata_rata.toFixed(1) : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            p.status_kelayakan === 'LOLOS'
                              ? 'default'
                              : p.status_kelayakan === 'TIDAK LOLOS'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {p.status_kelayakan}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
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
                              <Link to={`/dashboard/pemain/${p.id}`} className="cursor-pointer">
                                <Eye className="w-4 h-4 mr-2" />
                                Lihat Detail
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/pemain/${p.id}/edit`} className="cursor-pointer">
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive cursor-pointer"
                              onClick={() => openSingleDeleteConfirm(p)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Selected Count Footer */}
        {filteredPemain.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm text-muted-foreground">
            <span>
              Menampilkan {filteredPemain.length} dari {pemain.length} pemain
            </span>
            {selectedIds.length > 0 && (
              <span className="text-primary font-medium">{selectedIds.length} dipilih</span>
            )}
          </div>
        )}
      </CardContent>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.open}
        title={confirmDelete.isBulk ? 'Hapus Banyak Pemain' : 'Hapus Pemain'}
        message={
          confirmDelete.isBulk
            ? `Apakah Anda yakin ingin menghapus ${selectedIds.length} pemain yang dipilih?  Semua data penilaian terkait juga akan terhapus.  Tindakan ini tidak dapat dibatalkan.`
            : `Apakah Anda yakin ingin menghapus pemain "${confirmDelete.pemain?.nama}"? Semua data penilaian juga akan terhapus. `
        }
        confirmLabel={confirmDelete.isBulk ? `Hapus ${selectedIds.length} Pemain` : 'Hapus'}
        onConfirm={confirmDelete.isBulk ? handleDeleteBulk : handleDeleteSingle}
        onCancel={() => setConfirmDelete({ open: false, pemain: null, isBulk: false })}
      />
    </Card>
  );
}

export default AdminPemainManagement;
