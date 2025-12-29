import { Card, CardContent } from '@/components/ui/card';
import { Users, CheckCircle, XCircle } from 'lucide-react';
import { PASSING_SCORE } from '@/utils/calculations';

const PemainStats = ({ pemainList }) => {
  const pemainDinilai = pemainList.filter((p) => p.jumlah_penilaian > 0);

  const stats = {
    total: pemainDinilai.length,
    lolos: pemainDinilai.filter((p) => p.status_kelayakan === 'LOLOS').length,
    tidakLolos: pemainDinilai.filter((p) => p.status_kelayakan === 'TIDAK LOLOS').length,
  };

  const statItems = [
    {
      label: 'Total Dinilai',
      value: stats.total,
      icon: Users,
      className: 'bg-card',
    },
    {
      label: `Lolos (≥${PASSING_SCORE})`,
      value: stats.lolos,
      icon: CheckCircle,
      className: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
    },
    {
      label: `Tidak Lolos (<${PASSING_SCORE})`,
      value: stats.tidakLolos,
      icon: XCircle,
      className: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4 mb-6">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className={item.className}>
            <CardContent className="p-6 text-center">
              <Icon
                className={`w-8 h-8 mx-auto mb-2 ${
                  index === 1
                    ? 'text-green-600'
                    : index === 2
                    ? 'text-red-600'
                    : 'text-muted-foreground'
                }`}
              />
              <p
                className={`text-4xl font-bold ${
                  index === 1 ? 'text-green-600' : index === 2 ? 'text-red-600' : 'text-foreground'
                }`}
              >
                {item.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PemainStats;
