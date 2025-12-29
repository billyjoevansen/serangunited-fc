import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PenLine, Trash2, Loader2 } from 'lucide-react';

const PemainActions = ({
  pemainId,
  onDelete,
  deleting = false,
  showBack = true,
  showPenilaian = true,
  showDelete = true,
}) => {
  return (
    <div className="flex flex-wrap gap-3 my-6">
      {showBack && (
        <Button variant="outline" asChild className="flex-1 sm:flex-none">
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Link>
        </Button>
      )}

      {showPenilaian && (
        <Button asChild className="flex-1 sm:flex-none">
          <Link to={`/dashboard/penilaian/${pemainId}`}>
            <PenLine className="w-4 h-4 mr-2" />
            Tambah Penilaian
          </Link>
        </Button>
      )}

      {showDelete && (
        <Button
          variant="destructive"
          onClick={onDelete}
          disabled={deleting}
          className="flex-1 sm:flex-none"
        >
          {deleting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 mr-2" />
          )}
          {deleting ? 'Menghapus...' : 'Hapus Pemain'}
        </Button>
      )}
    </div>
  );
};

export default PemainActions;
