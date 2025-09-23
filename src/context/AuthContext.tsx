import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

// Define o formato do usuário que extraímos do token
interface User {
  id: string;
  email: string;
  role: string;
}

// Define o que nosso contexto vai fornecer
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Cria o contexto com um valor padrão
const AuthContext = createContext<AuthContextType | null>(null);

// Cria o "Provedor" do contexto. É um componente que vai "envelopar" nossa aplicação
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));

  useEffect(() => {
    // Este efeito roda quando o app carrega
    if (token) {
      try {
        const decodedUser = jwtDecode<User>(token);
        setUser(decodedUser);
      } catch (error) {
        // Se o token for inválido, limpa o localStorage
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      }
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do nosso contexto em outros componentes
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};