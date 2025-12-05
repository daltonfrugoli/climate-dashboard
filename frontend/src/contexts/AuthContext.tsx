import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api';
import { User, LoginResponse } from '@/types';

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Validar token ao inicializar
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      // Se não tem token, não tem o que validar
      if (!storedToken || !storedUser) {
        setLoading(false);
        return;
      }

      try {
        // Validar token no backend
        const response = await api.get('/auth/validate', {
          headers: { 
            Authorization: `Bearer ${storedToken}` 
          },
        });

        // Token válido - atualizar state com dados do backend
        const validatedUser = response.data.user;
        
        setToken(storedToken);
        setUser(validatedUser);

        console.log('✅ Token validado com sucesso');
      } catch (error: any) {
        console.warn('⚠️  Token inválido ou expirado, fazendo logout silencioso...');
        
        // Token inválido - limpar tudo SILENCIOSAMENTE
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        
        // NÃO redirecionar, apenas limpar
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []); // ← Array vazio garante que roda APENAS uma vez

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      const { access_token, user: userData } = response.data;

      // Salvar no localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Atualizar estado
      setToken(access_token);
      setUser(userData);

      console.log('✅ Login realizado com sucesso');
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      throw new Error(
        error.response?.data?.message || 'Erro ao fazer login'
      );
    }
  };

  const logout = () => {
    // Limpar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Limpar estado
    setToken(null);
    setUser(null);

    console.log('👋 Logout realizado');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};