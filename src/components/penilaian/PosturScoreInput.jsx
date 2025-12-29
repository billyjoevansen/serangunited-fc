import { useEffect, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Ruler, ChevronDown, Zap, Info } from 'lucide-react';
import {
  hitungSkorPostur,
  getKategoriTinggiBadan,
  getRekomendasiPosisi,
} from '@/utils/calculations';
import { cn } from '@/lib/utils';

const PosturScoreInput = ({ value, onChange, tinggiBadan, posisi, name = 'postur' }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [autoScore, setAutoScore] = useState(null);

  useEffect(() => {
    if (tinggiBadan && posisi) {
      const calculatedScore = hitungSkorPostur(tinggiBadan, posisi);
      setAutoScore(calculatedScore);
    }
  }, [tinggiBadan, posisi]);

  const kategori = getKategoriTinggiBadan(tinggiBadan);
  const rekomendasiPosisi = getRekomendasiPosisi(tinggiBadan);
  const isPosisiSesuai = rekomendasiPosisi.some((p) =>
    posisi?.toLowerCase().includes(p.toLowerCase().split(' ')[0])
  );

  const handleApplyAutoScore = () => {
    if (autoScore !== null) {
      onChange({ target: { name, value: autoScore } });
    }
  };

  const handleSliderChange = (newValue) => {
    onChange({ target: { name, value: newValue[0] } });
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getKategoriColor = (color) => {
    const colors = {
      red: 'destructive',
      orange: 'warning',
      yellow: 'secondary',
      green: 'default',
      blue: 'default',
    };
    return colors[color] || 'secondary';
  };

  return (
    <div className="space-y-3 mb-6">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">Postur</Label>
        <Badge
          variant="outline"
          className={cn('text-lg font-bold px-3 py-1', getScoreColor(value))}
        >
          {value}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        Proporsi tubuh ideal dan tinggi badan sesuai posisi
      </p>

      {/* Info Tinggi Badan & Auto Calculate */}
      {tinggiBadan && (
        <Card className="bg-muted/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-primary" />
                <span className="font-bold text-lg">{tinggiBadan} cm</span>
                <Badge variant={getKategoriColor(kategori.color)}>{kategori.kategori}</Badge>
              </div>

              {autoScore !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rekomendasi:</span>
                  <Badge variant="outline" className={getScoreColor(autoScore)}>
                    {autoScore}
                  </Badge>
                  <Button size="sm" variant="default" onClick={handleApplyAutoScore}>
                    <Zap className="w-3 h-3 mr-1" />
                    Terapkan
                  </Button>
                </div>
              )}
            </div>

            <Collapsible open={showDetail} onOpenChange={setShowDetail}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Info className="w-4 h-4" />
                  {showDetail ? 'Sembunyikan detail' : 'Lihat detail & rekomendasi'}
                  <ChevronDown
                    className={cn('w-4 h-4 transition-transform', showDetail && 'rotate-180')}
                  />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-3 pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Posisi saat ini:</span>
                  <Badge variant={isPosisiSesuai ? 'default' : 'secondary'}>
                    {posisi || 'Belum dipilih'}
                    {isPosisiSesuai ? ' ✓' : ' ⚠'}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Posisi yang direkomendasikan untuk tinggi {tinggiBadan} cm:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {rekomendasiPosisi.map((pos, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {pos}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                  <p className="font-medium">Panduan skor postur:</p>
                  <ul className="list-disc list-inside space-y-0. 5">
                    <li>90-100: Tinggi badan sangat ideal untuk posisi</li>
                    <li>70-89: Tinggi badan baik untuk posisi</li>
                    <li>50-69: Tinggi badan cukup</li>
                    <li>30-49: Tinggi badan kurang ideal</li>
                    <li>0-29: Tinggi badan tidak sesuai</li>
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      )}

      <Slider
        value={[value]}
        onValueChange={handleSliderChange}
        max={100}
        step={1}
        className="w-full"
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </div>
  );
};

export default PosturScoreInput;
