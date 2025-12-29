import { useState } from 'react';
import PemainCard from './PemainCard';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Users, LayoutGrid, List, SlidersHorizontal, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const PemainList = ({
  pemainList,
  emptyMessage = 'Belum ada pemain terdaftar',
  showViewToggle = true,
  showSort = true,
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'name' | 'position'

  // Sorting logic
  const sortedPemain = [...pemainList].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'name':
        return a.nama.localeCompare(b.nama);
      case 'position':
        return a.posisi.localeCompare(b.posisi);
      default:
        return 0;
    }
  });

  const sortOptions = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'oldest', label: 'Terlama' },
    { value: 'name', label: 'Nama (A-Z)' },
    { value: 'position', label: 'Posisi' },
  ];

  if (pemainList.length === 0) {
    return (
      <EmptyState
        icon="⚽"
        title={emptyMessage}
        description="Tambahkan pemain baru atau import dari file CSV"
        actionLabel="+ Registrasi Pemain"
        actionLink="/dashboard/tambah-pemain"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        {/* Left:  Count Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{pemainList.length}</span>
            <span className="text-sm text-muted-foreground">Pemain</span>
          </div>

          {/* Status Summary */}
          <div className="hidden sm:flex items-center gap-2">
            <StatusBadge
              count={pemainList.filter((p) => p.status_kelayakan === 'LOLOS').length}
              label="Lolos"
              variant="success"
            />
            <StatusBadge
              count={pemainList.filter((p) => p.status_kelayakan === 'TIDAK LOLOS').length}
              label="Tidak Lolos"
              variant="destructive"
            />
            <StatusBadge
              count={
                pemainList.filter(
                  (p) => !p.status_kelayakan || p.status_kelayakan === 'BELUM DINILAI'
                ).length
              }
              label="Belum Dinilai"
              variant="secondary"
            />
          </div>
        </div>

        {/* Right: View Toggle & Sort */}
        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          {showSort && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {sortOptions.find((o) => o.value === sortBy)?.label}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Urutkan</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={cn(sortBy === option.value && 'bg-muted')}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* View Toggle */}
          {showViewToggle && (
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Status Summary */}
      <div className="flex sm:hidden items-center gap-2 overflow-x-auto pb-2">
        <StatusBadge
          count={pemainList.filter((p) => p.status_kelayakan === 'LOLOS').length}
          label="Lolos"
          variant="success"
        />
        <StatusBadge
          count={pemainList.filter((p) => p.status_kelayakan === 'TIDAK LOLOS').length}
          label="Tidak Lolos"
          variant="destructive"
        />
        <StatusBadge
          count={
            pemainList.filter((p) => !p.status_kelayakan || p.status_kelayakan === 'BELUM DINILAI')
              .length
          }
          label="Belum Dinilai"
          variant="secondary"
        />
      </div>

      {/* Pemain Grid/List */}
      <div
        className={cn(
          'transition-all duration-300',
          viewMode === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'
            : 'flex flex-col gap-3'
        )}
      >
        {sortedPemain.map((pemain, index) => (
          <div
            key={pemain.id}
            className="animate-in fade-in-0 slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'both' }}
          >
            <PemainCard pemain={pemain} variant={viewMode} />
          </div>
        ))}
      </div>

      {/* Pagination atau Load More bisa ditambahkan di sini */}
    </div>
  );
};

// Sub-component:  Status Badge
const StatusBadge = ({ count, label, variant }) => {
  if (count === 0) return null;

  const variantStyles = {
    success: 'p-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    destructive: 'p-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    secondary: 'p-2 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap',
        variantStyles[variant]
      )}
    >
      <span className="font-bold">{count}</span>
      <span>{label}</span>
    </div>
  );
};

export default PemainList;
