import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { PASSING_SCORE } from '@/utils/calculations';

const StatusBadge = ({ status, nilai, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2. 5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  if (!nilai || nilai === 0) {
    return (
      <Badge variant="secondary" className={sizeClasses[size]}>
        <Clock className="w-3 h-3 mr-1" />
        Belum Dinilai
      </Badge>
    );
  }

  const isLolos = status === 'LOLOS' || nilai >= PASSING_SCORE;

  if (isLolos) {
    return (
      <Badge className={`bg-green-100 text-green-800 hover:bg-green-200 ${sizeClasses[size]}`}>
        <CheckCircle className="w-3 h-3 mr-1" />
        Lolos Seleksi
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className={sizeClasses[size]}>
      <XCircle className="w-3 h-3 mr-1" />
      Tidak Lolos
    </Badge>
  );
};

export default StatusBadge;
