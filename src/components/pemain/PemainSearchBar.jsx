import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus } from 'lucide-react';

const PemainSearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 className="text-2xl font-bold text-foreground">Daftar Calon Pemain</h2>
      <div className="flex gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari pemain..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link to="/dashboard/tambah-pemain">
            <UserPlus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Registrasi</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default PemainSearchBar;
