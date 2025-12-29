import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Mail,
  Shield,
  Calendar,
  Trash2,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Camera,
  Upload,
  X,
  ImagePlus,
  Link as LinkIcon,
} from 'lucide-react';
import { formatDateTime } from '@/utils/formatters';
import { cn } from '@/lib/utils';

const ROLE_OPTIONS = [
  {
    value: 'admin',
    label: 'Admin',
    description: 'Akses penuh ke semua fitur',
    color: 'destructive',
  },
  {
    value: 'penilai',
    label: 'Penilai',
    description: 'Dapat menilai dan mengelola pemain',
    color: 'default',
  },
  { value: 'rekrut', label: 'Rekrut', description: 'Hanya dapat melihat data', color: 'secondary' },
];

// Ukuran maksimal file (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const AdminEditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  // State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    role: '',
    foto_url: '',
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Photo upload state
  const [photoMode, setPhotoMode] = useState('url'); // 'url' | 'upload'
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        if (!data) {
          setError('User tidak ditemukan');
          return;
        }

        setUser(data);
        setFormData({
          nama: data.nama || '',
          email: data.email || '',
          role: data.role || 'rekrut',
          foto_url: data.foto_url || '',
        });
        setPhotoPreview(data.foto_url || null);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Gagal memuat data user');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  // Track changes
  useEffect(() => {
    if (user) {
      const changed =
        formData.nama !== user.nama ||
        formData.email !== user.email ||
        formData.role !== user.role ||
        formData.foto_url !== (user.foto_url || '') ||
        photoFile !== null;
      setHasChanges(changed);
    }
  }, [formData, user, photoFile]);

  // Handle input change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle file select
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: 'Format tidak didukung',
        description: 'Gunakan format JPG, PNG, WebP, atau GIF',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File terlalu besar',
        description: 'Ukuran maksimal 2MB',
        variant: 'destructive',
      });
      return;
    }

    setPhotoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle URL change
  const handleUrlChange = (url) => {
    handleChange('foto_url', url);
    setPhotoPreview(url || null);
    setPhotoFile(null);
  };

  // Remove photo
  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    handleChange('foto_url', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload photo to storage
  const uploadPhoto = async () => {
    if (!photoFile) return formData.foto_url;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `user-${id}-${Date.now()}.${fileExt}`;
      const filePath = `users/${fileName}`;

      // Simulate progress (Supabase doesn't have progress callback)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, photoFile, {
          cacheControl: '3600',
          upsert: true,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        // Jika bucket tidak ada, gunakan URL langsung atau base64
        console.warn('Storage upload failed, using fallback:', uploadError);

        // Convert to base64 as fallback
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(photoFile);
        });
      }

      setUploadProgress(100);

      // Get public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading photo:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!formData.nama.trim()) {
      toast({
        title: 'Error',
        description: 'Nama tidak boleh kosong',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      // Upload photo if there's a new file
      let finalFotoUrl = formData.foto_url;
      if (photoFile) {
        finalFotoUrl = await uploadPhoto();
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          nama: formData.nama.trim(),
          email: formData.email.trim(),
          role: formData.role,
          foto_url: finalFotoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update local state
      setUser((prev) => ({
        ...prev,
        nama: formData.nama.trim(),
        email: formData.email.trim(),
        role: formData.role,
        foto_url: finalFotoUrl,
      }));

      setFormData((prev) => ({
        ...prev,
        foto_url: finalFotoUrl,
      }));

      setPhotoFile(null);
      setHasChanges(false);

      toast({
        title: 'Berhasil',
        description: 'Data user berhasil diperbarui',
      });
    } catch (err) {
      console.error('Error updating user:', err);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui data user',
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
      const { error: deleteError } = await supabase.from('users').delete().eq('id', id);

      if (deleteError) throw deleteError;

      toast({
        title: 'Berhasil',
        description: 'User berhasil dihapus',
      });

      navigate('/admin? tab=users');
    } catch (err) {
      console.error('Error deleting user:', err);
      toast({
        title: 'Error',
        description: 'Gagal menghapus user',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Handle reset form
  const handleReset = () => {
    if (user) {
      setFormData({
        nama: user.nama || '',
        email: user.email || '',
        role: user.role || 'rekrut',
        foto_url: user.foto_url || '',
      });
      setPhotoPreview(user.foto_url || null);
      setPhotoFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Get role config
  const getRoleConfig = (role) => {
    return ROLE_OPTIONS.find((r) => r.value === role) || ROLE_OPTIONS[2];
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat data user...</p>
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

  const roleConfig = getRoleConfig(formData.role);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/admin">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-lg font-bold">Edit User</h1>
                <p className="text-xs text-muted-foreground">Perbarui data pengguna</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="outline" className="gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  Belum disimpan
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Photo Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Foto Profil
              </CardTitle>
              <CardDescription>Upload foto atau masukkan URL gambar</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Photo Preview */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                    <AvatarImage src={photoPreview} alt={formData.nama} />
                    <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary/20 to-primary/5">
                      {formData.nama?.charAt(0)?.toUpperCase() || <User className="w-12 h-12" />}
                    </AvatarFallback>
                  </Avatar>

                  {/* Overlay on hover */}
                  <div
                    className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </div>

                  {/* Remove button */}
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* User info */}
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{user?.nama}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mengupload foto... </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Photo Mode Toggle */}
              {/* Photo Mode Toggle - Animated */}
              <div className="relative flex p-1 bg-muted rounded-xl">
                {/* Animated Background */}
                <div
                  className={cn(
                    'absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background rounded-lg shadow-sm transition-all duration-300 ease-out',
                    photoMode === 'upload' ? 'left-1' : 'left-[calc(50%+2px)]'
                  )}
                />

                {/* Buttons */}
                <button
                  type="button"
                  onClick={() => setPhotoMode('upload')}
                  className={cn(
                    'relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 z-10',
                    photoMode === 'upload'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode('url')}
                  className={cn(
                    'relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 z-10',
                    photoMode === 'url'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>URL Gambar</span>
                </button>
              </div>

              {/* Upload / URL Input */}
              {photoMode === 'upload' ? (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                      'hover:border-primary hover:bg-primary/5',
                      photoFile
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                        : 'border-muted-foreground/25'
                    )}
                  >
                    {photoFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <div className="text-left">
                          <p className="font-medium text-sm">{photoFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(photoFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <ImagePlus className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                        <p className="font-medium">Klik untuk upload foto</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          JPG, PNG, WebP atau GIF (maks. 2MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="foto_url">URL Foto</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="foto_url"
                      type="url"
                      value={formData.foto_url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Masukkan URL gambar yang valid (JPG, PNG, WebP, GIF)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Informasi User
              </CardTitle>
              <CardDescription>Perbarui informasi dasar pengguna</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Nama */}
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => handleChange('nama', e.target.value)}
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="email@example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <Separator />

              {/* Role */}
              <div className="space-y-3">
                <Label>Role / Hak Akses</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleChange('role', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <Badge variant={role.color} className="text-xs">
                            {role.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Role Description */}
                <div
                  className={cn(
                    'p-4 rounded-lg border',
                    formData.role === 'admin' &&
                      'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
                    formData.role === 'penilai' &&
                      'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
                    formData.role === 'rekrut' &&
                      'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Shield
                      className={cn(
                        'w-5 h-5 mt-0.5',
                        formData.role === 'admin' && 'text-red-600',
                        formData.role === 'penilai' && 'text-blue-600',
                        formData.role === 'rekrut' && 'text-gray-600'
                      )}
                    />
                    <div>
                      <p className="font-medium">{roleConfig.label}</p>
                      <p className="text-sm text-muted-foreground">{roleConfig.description}</p>

                      {/* Permission list */}
                      <ul className="mt-2 text-xs text-muted-foreground space-y-1">
                        {formData.role === 'admin' && (
                          <>
                            <li className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              Kelola semua user
                            </li>
                            <li className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              Tambah, edit, hapus pemain
                            </li>
                            <li className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              Kelola penilaian
                            </li>
                            <li className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              Akses generator data
                            </li>
                          </>
                        )}
                        {formData.role === 'penilai' && (
                          <>
                            <li className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              Tambah dan edit pemain
                            </li>
                            <li className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              Berikan penilaian
                            </li>
                            <li className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              Lihat hasil seleksi
                            </li>
                          </>
                        )}
                        {formData.role === 'rekrut' && (
                          <>
                            <li className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              Lihat daftar pemain
                            </li>
                            <li className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              Lihat hasil seleksi
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Bergabung</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateTime(user?.created_at)}
                    </p>
                  </div>
                  {user?.updated_at && (
                    <div>
                      <p className="text-muted-foreground">Terakhir diupdate</p>
                      <p className="font-medium flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        {formatDateTime(user?.updated_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || uploading || !hasChanges}
              className="flex-1"
            >
              {saving || uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Menyimpan...' : uploading ? 'Mengupload...' : 'Simpan Perubahan'}
            </Button>

            <Button
              variant="outline"
              onClick={handleReset}
              disabled={saving || uploading || !hasChanges}
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
                    Hapus User
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus User? </AlertDialogTitle>
                    <AlertDialogDescription>
                      Anda yakin ingin menghapus user <strong>{user?.nama}</strong>? Tindakan ini
                      tidak dapat dibatalkan dan semua data user akan dihapus permanen.
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
                      {deleting ? 'Menghapus...' : 'Ya, Hapus User'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <p className="text-xs text-muted-foreground mt-3">
                Menghapus user akan menghapus semua data terkait user ini dari sistem.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminEditUser;
