import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Ruler, Target, TrendingUp } from 'lucide-react';
import {
  getKategoriTinggiBadan,
  getRekomendasiPosisi,
  hitungSkorPostur,
} from '@/utils/calculations';
import { cn } from '@/lib/utils';

const InfoTinggiBadan = ({ tinggiBadan, posisi }) => {
  const kategori = getKategoriTinggiBadan(tinggiBadan);
  const rekomendasiPosisi = getRekomendasiPosisi(tinggiBadan);
  const skorPostur = hitungSkorPostur(tinggiBadan, posisi);

  const isPosisiSesuai = rekomendasiPosisi.some((p) =>
    posisi?.toLowerCase().includes(p.toLowerCase().split(' ')[0])
  );

  const getKategoriBadgeVariant = (color) => {
    const variants = {
      red: 'destructive',
      orange: 'warning',
      yellow: 'secondary',
      green: 'success',
      blue: 'default',
    };
    return variants[color] || 'secondary';
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Ruler className="w-4 h-4" />
          Analisis Postur Tubuh
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold">{tinggiBadan}</p>
            <p className="text-xs text-muted-foreground">Tinggi (cm)</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <Badge variant={getKategoriBadgeVariant(kategori.color)} className="mb-1">
              {kategori.kategori}
            </Badge>
            <p className="text-xs text-muted-foreground">Kategori</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className={cn('text-2xl font-bold', getScoreColor(skorPostur))}>{skorPostur}</p>
            <p className="text-xs text-muted-foreground">Skor Postur</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Skor Postur</span>
            <span className={cn('font-medium', getScoreColor(skorPostur))}>{skorPostur}/100</span>
          </div>
          <Progress value={skorPostur} className="h-2" />
        </div>

        {/* Kesesuaian Posisi */}
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Kesesuaian Posisi: </span>
          <Badge variant={isPosisiSesuai ? 'default' : 'secondary'}>
            {isPosisiSesuai ? '✓ Sesuai' : '⚠ Kurang Ideal'}
          </Badge>
        </div>

        {/* Rekomendasi Posisi */}
        {!isPosisiSesuai && rekomendasiPosisi.length > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Posisi yang direkomendasikan:
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {rekomendasiPosisi.slice(0, 3).map((pos, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {pos}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InfoTinggiBadan;
