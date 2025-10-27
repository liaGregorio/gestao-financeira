import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const signUp = async (name, email, password) => {
    const data = await authService.register(name, email, password);
    setUser(data.user);
    return data;
  };

  const signOut = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = async (name, email) => {
    const data = await authService.updateProfile(name, email);
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateUser,
        signed: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
