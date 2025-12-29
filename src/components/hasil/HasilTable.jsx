import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Trophy } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { PASSING_SCORE } from '@/utils/calculations';
import { cn } from '@/lib/utils';

const HasilTable = ({ pemainList }) => {
  if (pemainList.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Tidak ada data
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Nama Pemain</TableHead>
              <TableHead className="hidden sm:table-cell">Posisi</TableHead>
              <TableHead className="text-center">Penilaian</TableHead>
              <TableHead className="text-center">Nilai</TableHead>
              <TableHead className="text-center hidden sm:table-cell">Status</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pemainList.map((p, index) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                      index < 3
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {index < 3 && <Trophy className="w-3 h-3 mr-0.5" />}
                    {index + 1}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{p.nama}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {p.posisi}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{p.jumlah_penilaian}x</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={cn(
                      'text-xl font-bold',
                      p.nilai_rata_rata >= PASSING_SCORE ? 'text-green-600' : 'text-red-500'
                    )}
                  >
                    {p.nilai_rata_rata.toFixed(1)}
                  </span>
                </TableCell>
                <TableCell className="text-center hidden sm:table-cell">
                  <StatusBadge status={p.status_kelayakan} nilai={p.nilai_rata_rata} size="sm" />
                </TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/dashboard/pemain/${p.id}`}>
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default HasilTable;
