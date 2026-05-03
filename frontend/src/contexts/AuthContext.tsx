import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { User } from '../utils/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('orderup_token');
    const savedUser = localStorage.getItem('orderup_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('orderup_token', data.token);
    localStorage.setItem('orderup_user', JSON.stringify(data.user));
  };

  const register = async (formData: any) => {
    const { data } = await api.post('/auth/register', formData);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('orderup_token', data.token);
    localStorage.setItem('orderup_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('orderup_token');
    localStorage.removeItem('orderup_user');
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    localStorage.setItem('orderup_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
