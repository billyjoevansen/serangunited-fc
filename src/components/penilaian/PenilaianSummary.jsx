import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Ruler, Weight } from 'lucide-react';
import { InfoTinggiBadan } from '@/components/pemain';
import StatusBadge from '@/components/common/StatusBadge';
import { PENILAIAN_CATEGORIES, PASSING_SCORE } from '@/utils/calculations';
import { cn } from '@/lib/utils';

const PenilaianSummary = ({ pemain, average, categoryAverages }) => {
  const [showPosturInfo, setShowPosturInfo] = useState(false);
  const avgNum = parseFloat(average);

  return (
    <Card className="mb-6 sticky top-20 z-10 border-2 border-primary/20 shadow-lg">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Info Pemain */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2">
              <AvatarImage src={pemain.foto_url} />
              <AvatarFallback className="text-2xl">⚽</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{pemain.nama}</h2>
              <Badge variant="secondary">{pemain.posisi}</Badge>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Ruler className="w-3 h-3" />
                  {pemain.tinggi_badan} cm
                </span>
                <span className="flex items-center gap-1">
                  <Weight className="w-3 h-3" />
                  {pemain.berat_badan} kg
                </span>
              </div>
            </div>
          </div>

          {/* Nilai Rata-rata */}
          <div className="text-center">
            <div
              className={cn(
                'text-5xl font-bold',
                avgNum >= PASSING_SCORE ? 'text-green-600' : 'text-red-500'
              )}
            >
              {average}
            </div>
            <p className="text-sm text-muted-foreground">Rata-rata Sementara</p>
            <StatusBadge status={avgNum >= PASSING_SCORE ? 'LOLOS' : ''} nilai={avgNum} size="sm" />
          </div>
        </div>

        {/* Info Tinggi Badan - Collapsible */}
        <Collapsible open={showPosturInfo} onOpenChange={setShowPosturInfo} className="mt-4">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full gap-2">
              <Ruler className="w-4 h-4" />
              {showPosturInfo ? 'Sembunyikan analisis postur' : 'Lihat analisis postur'}
              <ChevronDown
                className={cn('w-4 h-4 transition-transform', showPosturInfo && 'rotate-180')}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <InfoTinggiBadan tinggiBadan={pemain.tinggi_badan} posisi={pemain.posisi} />
          </CollapsibleContent>
        </Collapsible>

        {/* Ringkasan per kategori */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t">
          {Object.entries(PENILAIAN_CATEGORIES).map(([key, category]) => (
            <div key={key} className="text-center p-2 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">
                {category.icon} {category.title.split(' ')[0]}
              </p>
              <p className="font-bold text-primary">{categoryAverages[key]}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PenilaianSummary;
