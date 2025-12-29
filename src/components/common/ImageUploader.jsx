import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ImageUploader = ({
  currentImage,
  onImageUpload,
  folder = 'avatars',
  size = 'lg',
  className = '',
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB');
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result);
      reader.readAsDataURL(file);

      // Generate unique filename
      const fileExt = file.name.split('. ').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from('avatars').upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      onImageUpload(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Gagal mengupload gambar');
      setPreview(currentImage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar className={cn(sizeClasses[size], 'border-4 border-muted')}>
        <AvatarImage src={preview} alt="Preview" />
        <AvatarFallback className="bg-primary/10">
          <Camera className="w-8 h-8 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      {/* Upload Button */}
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 shadow-lg"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
      </Button>

      {/* Remove Button */}
      {preview && !uploading && (
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="absolute -top-2 -right-2 rounded-full w-6 h-6"
          onClick={handleRemoveImage}
        >
          <X className="w-3 h-3" />
        </Button>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ImageUploader;
