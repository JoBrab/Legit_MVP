import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, displayName: string, role: User['role']) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Initialize Firebase Auth listener
    // For now, mock implementation
    const mockUser: User = {
      id: '1',
      email: 'demo@legit.be',
      displayName: 'Demo User',
      role: 'Citizen',
      isVerified: false,
      preferredLanguage: 'fr',
      autoTranslate: false,
      createdAt: new Date(),
    };
    
    // Simulate loading
    setTimeout(() => {
      setUser(mockUser);
      setIsLoading(false);
    }, 500);
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: Implement Firebase Auth login
    setIsLoading(true);
    
    // Mock implementation
    const mockUser: User = {
      id: '1',
      email,
      displayName: 'Demo User',
      role: 'Citizen',
      isVerified: false,
      preferredLanguage: 'fr',
      autoTranslate: false,
      createdAt: new Date(),
    };
    
    setTimeout(() => {
      setUser(mockUser);
      setIsLoading(false);
    }, 500);
  };

  const logout = async () => {
    // TODO: Implement Firebase Auth logout
    setUser(null);
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    role: User['role']
  ) => {
    // TODO: Implement Firebase Auth registration + Firestore user document
    setIsLoading(true);
    
    const mockUser: User = {
      id: Date.now().toString(),
      email,
      displayName,
      role,
      isVerified: false,
      preferredLanguage: 'fr',
      autoTranslate: false,
      createdAt: new Date(),
    };
    
    setTimeout(() => {
      setUser(mockUser);
      setIsLoading(false);
    }, 500);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
