import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminHeader = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Serang United FC</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Halo, <span className="font-medium text-foreground">{user?.nama}</span>
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
