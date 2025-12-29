import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.rpc('verify_user_login', {
        user_email: email,
        user_password: password,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const userData = data[0];
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { user: userData, error: null };
      } else {
        throw new Error('Email atau password salah');
      }
    } catch (err) {
      console.error('Login error:', err);
      return { user: null, error: err.message };
    }
  };

  const register = async (userData) => {
    try {
      // Panggil RPC function untuk register
      const { data, error } = await supabase.rpc('register_user', {
        p_email: userData.email,
        p_password: userData.password,
        p_nama: userData.nama,
        p_foto_url: userData.foto_url || null,
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw error;
      }

      console.log('Register response:', data);

      if (data) {
        // Data sudah berupa JSON object
        const newUser = typeof data === 'string' ? JSON.parse(data) : data;
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        return { user: newUser, error: null };
      } else {
        throw new Error('Gagal membuat akun');
      }
    } catch (err) {
      console.error('Register error:', err);

      let errorMessage = err.message;
      if (err.message.includes('Email sudah terdaftar')) {
        errorMessage = 'Email sudah terdaftar.  Silakan gunakan email lain. ';
      } else if (err.message.includes('duplicate key')) {
        errorMessage = 'Email sudah terdaftar. Silakan gunakan email lain. ';
      }

      return { user: null, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const isAdmin = user?.role === 'admin';
  const isPenilai = user?.role === 'penilai';
  const isRekrut = user?.role === 'rekrut';
  const canRate = isAdmin || isPenilai;
  const canEdit = isAdmin;
  const canDelete = isAdmin;
  const canViewRatings = isAdmin || isPenilai;

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin,
    isPenilai,
    isRekrut,
    canRate,
    canEdit,
    canDelete,
    canViewRatings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
