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
    // Check localStorage for saved session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Verify credentials
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
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email: userData.email,
            password_hash: userData.password, // Will be hashed by trigger
            nama: userData.nama,
            role: 'rekrut', // Default role for registration
            foto_url: userData.foto_url || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Auto login after registration
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return { user: data, error: null };
    } catch (err) {
      console.error('Register error:', err);
      return { user: null, error: err.message };
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

  // Role checking helpers
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
