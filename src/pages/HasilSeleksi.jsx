import { useState } from 'react';
import { usePemain } from '@/hooks';
import { PageContainer } from '@/components/layout';
import { PemainStats } from '@/components/pemain';
import { HasilFilter, HasilTable, HasilInfo } from '@/components/hasil';
import { Trophy } from 'lucide-react';

function HasilSeleksi() {
  const { pemain, loading } = usePemain();
  const [filter, setFilter] = useState('semua');

  // Filter hanya pemain yang sudah dinilai
  const pemainDinilai = pemain.filter((p) => p.jumlah_penilaian > 0);

  // Sort by nilai rata-rata descending
  const sortedPemain = [...pemainDinilai].sort(
    (a, b) => (b.nilai_rata_rata || 0) - (a.nilai_rata_rata || 0)
  );

  const filteredPemain = sortedPemain.filter((p) => {
    if (filter === 'lolos') return p.status_kelayakan === 'LOLOS';
    if (filter === 'tidak-lolos') return p.status_kelayakan === 'TIDAK LOLOS';
    return true;
  });

  return (
    <PageContainer loading={loading}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
          <Trophy className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Hasil Seleksi Pemain</h2>
          <p className="text-muted-foreground text-sm">Peringkat berdasarkan nilai rata-rata</p>
        </div>
      </div>

      <PemainStats pemainList={pemain} />

      <HasilFilter filter={filter} onFilterChange={setFilter} />

      <HasilTable pemainList={filteredPemain} />

      <HasilInfo />
    </PageContainer>
  );
}

export default HasilSeleksi;
