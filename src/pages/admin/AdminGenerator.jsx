import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dices } from 'lucide-react';
import { DummyDataGenerator } from '@/components/csv';

const AdminGenerator = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Info */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary rounded-lg">
              <Dices className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Data Generator</h2>
              <p className="text-muted-foreground">
                Generate data dummy untuk testing sistem rekrutmen. Pilih mode sesuai kebutuhan
                testing Anda.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generator Component */}
      <DummyDataGenerator showAdminOnly={false} />

      {/* Tips */}
      <GeneratorTips />
    </div>
  );
};

// Sub-component: Tips
const GeneratorTips = () => {
  const tips = [
    {
      title: 'Pemain Saja',
      description: 'Gunakan untuk testing proses penilaian. Data pemain akan muncul tanpa nilai.',
    },
    {
      title: 'Pemain + Penilaian',
      description:
        'Gunakan untuk testing hasil seleksi. Data akan langsung memiliki nilai dan status lolos/tidak lolos.',
    },
    {
      title: 'Range Skor',
      description: 'Atur range untuk mengontrol distribusi lolos/tidak lolos.  Skor ≥75 = Lolos.',
    },
    {
      title: 'Avatar',
      description:
        'Pilih layanan avatar sesuai preferensi. DiceBear memberikan variasi ilustrasi terbaik.',
    },
  ];

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base">💡 Tips Penggunaan</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>
                <strong>{tip.title}:</strong>{' '}
                <span className="text-muted-foreground">{tip.description}</span>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default AdminGenerator;
