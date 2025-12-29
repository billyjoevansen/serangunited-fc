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
  Users,
  Loader2,
  RefreshCw,
  CheckSquare,
  XSquare,
  AlertTriangle,
  Filter,
  Shield,
  UserCheck,
  UserX,
} from 'lucide-react';
import { formatDateTime } from '@/utils/formatters';
import { cn } from '@/lib/utils';

const AdminUserManagement = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Delete state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null, isBulk: false });
  const [deleting, setDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState({ current: 0, total: 0 });

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset selection when data changes
  useEffect(() => {
    setSelectedIds([]);
    setIsAllSelected(false);
  }, [users]);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Exclude current user from selectable list (can't delete yourself)
  const selectableUsers = filteredUsers.filter((u) => u.id !== currentUser?.id);

  // Handle select single item
  const handleSelectItem = (id) => {
    // Prevent selecting current user
    if (id === currentUser?.id) return;

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
      // Select all except current user
      setSelectedIds(selectableUsers.map((u) => u.id));
      setIsAllSelected(true);
    }
  };

  // Update isAllSelected state
  useEffect(() => {
    if (selectableUsers.length > 0 && selectedIds.length === selectableUsers.length) {
      setIsAllSelected(true);
    } else {
      setIsAllSelected(false);
    }
  }, [selectedIds, selectableUsers]);

  // Clear selection
  const handleClearSelection = () => {
    setSelectedIds([]);
    setIsAllSelected(false);
  };

  // Handle single delete
  const handleDeleteSingle = async () => {
    if (!deleteDialog.user) return;

    setDeleting(true);
    try {
      const { error } = await supabase.from('users').delete().eq('id', deleteDialog.user.id);

      if (error) throw error;

      setUsers((prev) => prev.filter((u) => u.id !== deleteDialog.user.id));
      toast({
        title: 'Berhasil',
        description: `User ${deleteDialog.user.nama} berhasil dihapus`,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus user',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, user: null, isBulk: false });
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
        const { error } = await supabase.from('users').delete().eq('id', selectedIds[i]);

        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error('Error deleting user:', error);
        failedCount++;
      }

      setDeleteProgress({ current: i + 1, total: selectedIds.length });
    }

    // Update local state
    setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
    setSelectedIds([]);
    setIsAllSelected(false);

    toast({
      title: 'Berhasil',
      description: `${successCount} user berhasil dihapus${
        failedCount > 0 ? `, ${failedCount} gagal` : ''
      }`,
    });

    setDeleting(false);
    setDeleteProgress({ current: 0, total: 0 });
    setDeleteDialog({ open: false, user: null, isBulk: false });
  };

  // Open delete confirmation
  const openDeleteConfirm = (user = null, isBulk = false) => {
    setDeleteDialog({ open: true, user, isBulk });
  };

  // Get role badge
  const getRoleBadge = (role) => {
    const config = {
      admin: { variant: 'destructive', label: 'Admin', icon: Shield },
      penilai: { variant: 'default', label: 'Penilai', icon: UserCheck },
      rekrut: { variant: 'secondary', label: 'Rekrut', icon: UserX },
    };
    const { variant, label, icon: Icon } = config[role] || config.rekrut;
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  // Stats
  const stats = {
    total: users.length,
    admin: users.filter((u) => u.role === 'admin').length,
    penilai: users.filter((u) => u.role === 'penilai').length,
    rekrut: users.filter((u) => u.role === 'rekrut').length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Manajemen User
              </CardTitle>
              <CardDescription>Kelola pengguna dan hak akses sistem</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
              <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
              Refresh
            </Button>
          </div>

          {/* Selection Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-primary" />
                <span className="font-medium">{selectedIds.length} user dipilih</span>
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
                  Hapus {selectedIds.length} User
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
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Role</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="penilai">Penilai</SelectItem>
              <SelectItem value="rekrut">Rekrut</SelectItem>
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
                      disabled={selectableUsers.length === 0}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Bergabung</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada user ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = selectedIds.includes(user.id);
                    const isCurrentUser = user.id === currentUser?.id;

                    return (
                      <TableRow
                        key={user.id}
                        className={cn(isSelected && 'bg-primary/5', isCurrentUser && 'bg-muted/50')}
                      >
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSelectItem(user.id)}
                            disabled={isCurrentUser}
                            aria-label={`Select ${user.nama}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={user.foto_url} />
                              <AvatarFallback>{user.nama?.charAt(0)?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {user.nama}
                                {isCurrentUser && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Anda
                                  </Badge>
                                )}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {formatDateTime(user.created_at)}
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
                                <Link to={`/admin/user/${user.id}/edit`}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit User
                                </Link>
                              </DropdownMenuItem>
                              {!isCurrentUser && (
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => openDeleteConfirm(user, false)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Hapus User
                                </DropdownMenuItem>
                              )}
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
              Total: <span className="font-medium text-foreground">{stats.total}</span> user
            </span>
            <span>
              Admin: <span className="font-medium text-red-600">{stats.admin}</span>
            </span>
            <span>
              Penilai: <span className="font-medium text-primary">{stats.penilai}</span>
            </span>
            <span>
              Rekrut: <span className="font-medium text-foreground">{stats.rekrut}</span>
            </span>
          </div>
          {selectedIds.length > 0 && (
            <span className="text-sm text-primary font-medium">{selectedIds.length} dipilih</span>
          )}
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !deleting && setDeleteDialog({ open, user: null, isBulk: false })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {deleteDialog.isBulk ? `Hapus ${selectedIds.length} User? ` : 'Hapus User?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.isBulk ? (
                <>
                  Anda yakin ingin menghapus <strong>{selectedIds.length} user</strong> yang
                  dipilih? Semua data penilaian yang dibuat oleh user-user ini juga akan terhapus.
                  Tindakan ini tidak dapat dibatalkan.
                </>
              ) : (
                <>
                  Anda yakin ingin menghapus user <strong>{deleteDialog.user?.nama}</strong>? Semua
                  data penilaian yang dibuat oleh user ini juga akan terhapus. Tindakan ini tidak
                  dapat dibatalkan.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Progress bar for bulk delete */}
          {deleting && deleteDialog.isBulk && (
            <div className="space-y-2 py-4">
              <div className="flex justify-between text-sm">
                <span>Menghapus user...</span>
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
                  ? `Menghapus ${deleteProgress.current}/${deleteProgress.total}...`
                  : 'Menghapus...'
                : deleteDialog.isBulk
                ? `Hapus ${selectedIds.length} User`
                : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default AdminUserManagement;
