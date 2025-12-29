import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { PASSING_SCORE } from '@/utils/calculations';

const HasilInfo = () => {
  return (
    <Card className="mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Info className="w-4 h-4" />
          Keterangan Penilaian
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li>Nilai rata-rata dihitung dari 13 kriteria penilaian (range 0-100)</li>
          <li>
            Pemain dengan nilai rata-rata <strong>≥ {PASSING_SCORE}</strong> berhak mengikuti
            seleksi selanjutnya
          </li>
          <li>
            Kriteria: Teknik & Skill (3), Fisik & Postur (3), Taktik & Kognitif (3), Mental & Sikap
            (4)
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default HasilInfo;
