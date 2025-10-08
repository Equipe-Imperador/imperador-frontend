// AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User { 
  id: string; 
  email: string; 
  role: 'integrante' | 'juiz'; // Tipando as possíveis roles
}

interface AuthContextType {
  user: User | null;
  role: 'integrante' | 'juiz' | null; // Role exposta separadamente
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const decodedUser = jwtDecode<User>(token); // role vem do token
        setUser(decodedUser);
        localStorage.setItem('authToken', token);
      } catch {
        setUser(null);
        localStorage.removeItem('authToken');
      }
    } else {
      setUser(null);
      localStorage.removeItem('authToken');
    }
  }, [token]);

  const login = (newToken: string) => setToken(newToken);
  const logout = () => setToken(null);

  const isAuthenticated = !!token;
  const role = user?.role ?? null;

  return (
    <AuthContext.Provider value={{ user, role, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
