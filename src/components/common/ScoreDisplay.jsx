import { cn } from '@/lib/utils';
import { PASSING_SCORE } from '@/utils/calculations';

const ScoreDisplay = ({ nilai, size = 'md', showLabel = true }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  const getColorClass = () => {
    if (!nilai || nilai === 0) return 'text-muted-foreground';
    return nilai >= PASSING_SCORE ? 'text-green-600' : 'text-red-500';
  };

  return (
    <div className="text-center">
      <p className={cn('font-bold', sizeClasses[size], getColorClass())}>
        {nilai ? parseFloat(nilai).toFixed(1) : '-'}
      </p>
      {showLabel && <p className="text-xs text-muted-foreground mt-1">Nilai Rata-rata</p>}
    </div>
  );
};

export default ScoreDisplay;
