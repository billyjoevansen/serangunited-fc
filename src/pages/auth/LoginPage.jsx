import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react';
import { CLUB_INFO } from '@/utils/landingData';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { user, error } = await login(formData.email, formData.password);

    if (error) {
      setError(error);
      setLoading(false);
    } else {
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 grid h-16 w-fit grid-cols-[auto_24px_auto] items-center gap-4">
            <img
              src="/logo.webp"
              alt={`${CLUB_INFO.name} Logo`}
              className="ml-7 h-12 w-12 object-contain"
            />

            <span className="flex items-center justify-center text-xl font-semibold">×</span>

            <img src="/KONI.webp" alt="KONI Logo" className="h-20 w-20 object-contain" />
          </div>
          <CardTitle className="text-2xl">Masuk</CardTitle>
          <CardDescription>Masuk ke sistem rekrutmen {CLUB_INFO.name}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="email@contoh.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Belum punya akun?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Daftar disini
              </Link>
            </div>

            <div className="text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:underline">
                ← Kembali ke Beranda
              </Link>
            </div>
          </form>

          {/* Demo Accounts Info */}
          {/* <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-2">Demo Akun: </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Admin: admin@serangunited.com / admin123</p>
              <p>Penilai: penilai@serangunited.com / penilai123</p>
              <p>Rekrut: rekrut@serangunited.com / rekrut123</p>
            </div>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
