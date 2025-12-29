import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Header, Footer } from '@/components/layout';
import { ErrorBoundary } from '@/components/common';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';

// Public Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import UnauthorizedPage from '@/pages/auth/UnauthorizedPage';

// Dashboard Pages
import DaftarPemain from '@/pages/DaftarPemain';
import TambahPemain from '@/pages/TambahPemain';
import DetailPemain from '@/pages/DetailPemain';
import FormPenilaian from '@/pages/FormPenilaian';
import HasilSeleksi from '@/pages/HasilSeleksi';
import ArsipPemain from '@/pages/ArsipPemain';

// Admin Pages
import { AdminDashboard, AdminEditPemain, AdminEditUser, AdminEditPenilaian } from '@/pages/admin';

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* ==================== */}
            {/* Public Routes */}
            {/* ==================== */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* ==================== */}
            {/* Dashboard Routes */}
            {/* ==================== */}

            {/* Daftar Pemain - Semua Role */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DaftarPemain />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Tambah Pemain - Admin & Penilai */}
            <Route
              path="/dashboard/tambah-pemain"
              element={
                <ProtectedRoute allowedRoles={['admin', 'penilai']}>
                  <DashboardLayout>
                    <TambahPemain />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Detail Pemain - Semua Role */}
            <Route
              path="/dashboard/pemain/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DetailPemain />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Form Penilaian - Admin & Penilai */}
            <Route
              path="/dashboard/penilaian/:pemainId"
              element={
                <ProtectedRoute allowedRoles={['admin', 'penilai']}>
                  <DashboardLayout>
                    <FormPenilaian />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Edit Penilaian - Admin & Penilai */}
            <Route
              path="/dashboard/penilaian/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin', 'penilai']}>
                  <DashboardLayout>
                    <AdminEditPenilaian />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Hasil Seleksi - Semua Role */}
            <Route
              path="/dashboard/hasil-seleksi"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <HasilSeleksi />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Arsip Pemain - Admin & Penilai */}
            <Route
              path="/dashboard/arsip"
              element={
                <ProtectedRoute allowedRoles={['admin', 'penilai']}>
                  <DashboardLayout>
                    <ArsipPemain />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* ==================== */}
            {/* Admin Routes */}
            {/* ==================== */}

            {/* Admin Dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Edit Pemain */}
            <Route
              path="/admin/pemain/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminEditPemain />
                </ProtectedRoute>
              }
            />

            {/* Admin Edit User */}
            <Route
              path="/admin/user/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminEditUser />
                </ProtectedRoute>
              }
            />

            {/* Admin Edit Penilaian */}
            <Route
              path="/admin/penilaian/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminEditPenilaian />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
