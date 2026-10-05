import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginPayload, RegisterPayload, GoogleLoginPayload, GoogleRegisterPayload, AuthResponse } from '../types/User';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isResident: boolean;
  isStaff: boolean;
  isApprover: boolean;
  isAdmin: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  loginWithGoogle: (payload: GoogleLoginPayload) => Promise<AuthResponse>;
  registerWithGoogle: (payload: GoogleRegisterPayload) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const profile = await authService.getCurrentUser();
          setUser(profile);
          setToken(savedToken);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (payload: LoginPayload) => {
    const authData = await authService.login(payload);
    localStorage.setItem('token', authData.accessToken);
    localStorage.setItem('user', JSON.stringify(authData.user));
    setToken(authData.accessToken);
    setUser(authData.user);
  };

  const register = async (payload: RegisterPayload) => {
    const authData = await authService.register(payload);
    localStorage.setItem('token', authData.accessToken);
    localStorage.setItem('user', JSON.stringify(authData.user));
    setToken(authData.accessToken);
    setUser(authData.user);
  };

  const loginWithGoogle = async (payload: GoogleLoginPayload): Promise<AuthResponse> => {
    const authData = await authService.loginWithGoogle(payload);
    localStorage.setItem('token', authData.accessToken);
    localStorage.setItem('user', JSON.stringify(authData.user));
    setToken(authData.accessToken);
    setUser(authData.user);
    return authData;
  };

  const registerWithGoogle = async (payload: GoogleRegisterPayload): Promise<AuthResponse> => {
    const authData = await authService.registerWithGoogle(payload);
    localStorage.setItem('token', authData.accessToken);
    localStorage.setItem('user', JSON.stringify(authData.user));
    setToken(authData.accessToken);
    setUser(authData.user);
    return authData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    try {
      const profile = await authService.getCurrentUser();
      setUser(profile);
    } catch {
      // Ignored
    }
  };

  const isResident = !!user?.roles?.includes('ROLE_RESIDENT');
  const isStaff = !!user?.roles?.includes('ROLE_STAFF');
  const isApprover = !!user?.roles?.includes('ROLE_APPROVER');
  const isAdmin = !!user?.roles?.includes('ROLE_ADMIN');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        isResident,
        isStaff,
        isApprover,
        isAdmin,
        login,
        register,
        loginWithGoogle,
        registerWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
