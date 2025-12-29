import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  MapPin,
  Ruler,
  Weight,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PemainCard = ({ pemain, variant = 'grid' }) => {
  const {
    id,
    nama,
    posisi,
    tinggi_badan,
    berat_badan,
    foto_url,
    nilai_rata_rata,
    status_kelayakan,
    jumlah_penilaian,
  } = pemain;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'LOLOS':
        return {
          label: 'Lolos',
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
          icon: Minus,
          className: '',
        };
    }
  };

  const statusConfig = getStatusConfig(status_kelayakan);
  const StatusIcon = statusConfig.icon;

  // Grid View (Card)
  if (variant === 'grid') {
    return (
      <Link to={`/dashboard/pemain/${id}`}>
        <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
          {/* Status Bar */}
          <div
            className={cn(
              'h-1 w-full',
              status_kelayakan === 'LOLOS'
                ? 'bg-green-500'
                : status_kelayakan === 'TIDAK LOLOS'
                ? 'bg-red-500'
                : 'bg-gray-300 dark:bg-gray-700'
            )}
          />

          <CardContent className="p-4">
            {/* Avatar & Status */}
            <div className="flex flex-col items-center text-center mb-3">
              <div className="relative mb-3">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-background shadow-md">
                  <AvatarImage src={foto_url} alt={nama} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-lg font-bold">
                    {nama?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Score Badge */}
                {nilai_rata_rata && (
                  <div
                    className={cn(
                      'absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md',
                      nilai_rata_rata >= 75
                        ? 'bg-green-500'
                        : nilai_rata_rata >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    )}
                  >
                    {Math.round(nilai_rata_rata)}
                  </div>
                )}
              </div>

              {/* Name */}
              <h3 className="font-semibold text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors">
                {nama}
              </h3>

              {/* Position */}
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{posisi}</p>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-4 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Ruler className="w-3 h-3" />
                <span>{tinggi_badan} cm</span>
              </div>
              <div className="flex items-center gap-1">
                <Weight className="w-3 h-3" />
                <span>{berat_badan} kg</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge
                variant={statusConfig.variant}
                className={cn('text-xs gap-1', statusConfig.className)}
              >
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </Badge>
            </div>

            {/* Penilaian Count */}
            {jumlah_penilaian > 0 && (
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                {jumlah_penilaian} penilaian
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  }

  // List View (Row)
  return (
    <Link to={`/dashboard/pemain/${id}`}>
      <Card className="group overflow-hidden hover:shadow-md transition-all duration-200">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-background shadow-sm">
                <AvatarImage src={foto_url} alt={nama} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-base font-bold">
                  {nama?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Status Indicator */}
              <div
                className={cn(
                  'absolute -bottom-0. 5 -right-0.5 w-4 h-4 rounded-full border-2 border-background',
                  status_kelayakan === 'LOLOS'
                    ? 'bg-green-500'
                    : status_kelayakan === 'TIDAK LOLOS'
                    ? 'bg-red-500'
                    : 'bg-gray-400'
                )}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                    {nama}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">{posisi}</p>
                </div>

                {/* Score */}
                {nilai_rata_rata && (
                  <div
                    className={cn(
                      'flex-shrink-0 px-2.5 py-1 rounded-lg text-sm font-bold',
                      nilai_rata_rata >= 75
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : nilai_rata_rata >= 50
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    )}
                  >
                    {Math.round(nilai_rata_rata)}
                  </div>
                )}
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-4 mt-1. 5">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Ruler className="w-3 h-3" />
                    {tinggi_badan} cm
                  </span>
                  <span className="flex items-center gap-1">
                    <Weight className="w-3 h-3" />
                    {berat_badan} kg
                  </span>
                  {jumlah_penilaian > 0 && (
                    <span className="hidden sm:inline text-muted-foreground">
                      • {jumlah_penilaian} penilaian
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PemainCard;
