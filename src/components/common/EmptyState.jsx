import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const EmptyState = ({
  icon = '📭',
  title = 'Tidak ada data',
  description = '',
  actionLabel = '',
  actionLink = '',
  onAction = null,
}) => {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <span className="text-5xl mb-4">{icon}</span>
        <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-4 text-center">{description}</p>
        )}

        {actionLabel &&
          (actionLink || onAction) &&
          (actionLink ? (
            <Button asChild>
              <Link to={actionLink}>{actionLabel}</Link>
            </Button>
          ) : (
            <Button onClick={onAction}>{actionLabel}</Button>
          ))}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
