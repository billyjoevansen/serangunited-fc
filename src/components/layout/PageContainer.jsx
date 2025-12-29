import LoadingSpinner from '@/components/common/LoadingSpinner';
import { cn } from '@/lib/utils';

const PageContainer = ({ children, loading = false, className = '' }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <div className={cn('animate-in fade-in-50 duration-300', className)}>{children}</div>;
};

export default PageContainer;
