import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const HasilFilter = ({ filter, onFilterChange }) => {
  const filterButtons = [
    { key: 'semua', label: 'Semua', icon: Users },
    { key: 'lolos', label: 'Lolos', icon: CheckCircle },
    { key: 'tidak-lolos', label: 'Tidak Lolos', icon: XCircle },
  ];

  return (
    <div className="flex gap-2 mb-6">
      {filterButtons.map((btn) => {
        const Icon = btn.icon;
        const isActive = filter === btn.key;

        return (
          <Button
            key={btn.key}
            variant={isActive ? 'default' : 'outline'}
            onClick={() => onFilterChange(btn.key)}
            className={cn(
              isActive && btn.key === 'lolos' && 'bg-green-600 hover:bg-green-700',
              isActive && btn.key === 'tidak-lolos' && 'bg-red-600 hover:bg-red-700'
            )}
          >
            <Icon className="w-4 h-4 mr-2" />
            {btn.label}
          </Button>
        );
      })}
    </div>
  );
};

export default HasilFilter;
