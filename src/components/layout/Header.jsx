import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Users, UserPlus, Trophy, Home, LogOut, Shield, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, canRate } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/dashboard', label: 'Daftar Pemain', icon: Users },
    { path: '/dashboard/tambah-pemain', label: 'Registrasi', icon: UserPlus, show: canRate },
    { path: '/dashboard/hasil-seleksi', label: 'Hasil Seleksi', icon: Trophy },
  ].filter((link) => link.show !== false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'penilai':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const NavItems = ({ mobile = false }) => (
    <>
      {navLinks.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.path}
            to={link.path}
            onClick={() => mobile && setMobileMenuOpen(false)}
            className={cn(
              'flex items-center gap-2 transition-colors',
              mobile ? 'py-3 px-4 rounded-lg hover:bg-accent' : 'hover:text-primary',
              isActive(link.path)
                ? mobile
                  ? 'bg-accent font-semibold'
                  : 'text-primary font-semibold'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="w-4 h-4" />
            {link.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center space-x-3">
              <img src="/logo.webp" alt="logo" className="w-10 h-10 object-contain" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground">Serang United FC</h1>
                <p className="text-xs text-muted-foreground">Sistem Rekrutmen Pemain</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavItems />
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.foto_url} />
                      <AvatarFallback>{user.nama?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium">{user.nama}</p>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{user.nama}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link to="/" className="cursor-pointer">
                      <Home className="w-4 h-4 mr-2" />
                      Home
                    </Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Masuk</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Daftar</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col mt-8 space-y-1">
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-3 px-4 rounded-lg hover: bg-accent text-muted-foreground"
                  >
                    <Home className="w-4 h-4" />
                    Home
                  </Link>
                  <div className="border-t my-2" />
                  <NavItems mobile />

                  {isAdmin && (
                    <>
                      <div className="border-t my-2" />
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 py-3 px-4 rounded-lg hover:bg-accent text-muted-foreground"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
