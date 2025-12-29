import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { PASSING_SCORE } from '@/utils/calculations';

const ScoreLegend = () => {
  const legends = [
    { color: 'bg-green-500', range: '75-100', label: 'Sangat Baik' },
    { color: 'bg-yellow-500', range: '50-74', label: 'Cukup' },
    { color: 'bg-red-500', range: '0-49', label: 'Perlu Peningkatan' },
  ];

  return (
    <Card className="mt-6 bg-muted/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="w-4 h-4" />
          Keterangan Nilai
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-3">
          {legends.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-sm text-muted-foreground">
                {item.range}: {item.label}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          * Pemain dengan nilai rata-rata ≥ {PASSING_SCORE} berhak mengikuti seleksi selanjutnya
        </p>
      </CardContent>
    </Card>
  );
};

export default ScoreLegend;
