import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import PenilaianCard from './PenilaianCard';
import EmptyState from '@/components/common/EmptyState';

const PenilaianList = ({ penilaianList, pemainId, onDelete }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Riwayat Penilaian
          </CardTitle>
          <Badge variant="secondary">{penilaianList.length} penilaian</Badge>
        </div>
      </CardHeader>

      <CardContent>
        {penilaianList.length === 0 ? (
          <EmptyState
            icon="📝"
            title="Belum ada penilaian"
            description="Buat penilaian pertama untuk pemain ini"
            actionLabel="+ Buat Penilaian Pertama"
            actionLink={`/dashboard/penilaian/${pemainId}`}
          />
        ) : (
          <div className="space-y-4">
            {penilaianList.map((p) => (
              <PenilaianCard key={p.id} penilaian={p} onDelete={onDelete} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PenilaianList;
