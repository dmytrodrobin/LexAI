import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { User, AuthContextType } from './authTypes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  refresh: async () => { },
  login: async () => { },
  register: async () => { },
  logout: () => { }
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password }, { withCredentials: true });
    setCurrentUser(response.data);
    return response.data;
  };

  const register = async (email: string, username: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, { email, username, password }, { withCredentials: true });
    return response.data;
  };

  const logout = async () => {
    await axios.post(`${API_BASE_URL}/logout`);
    setCurrentUser(null);
  };

  const refresh = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, { withCredentials: true });
      setCurrentUser(response.data);
    } catch {
      setCurrentUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ currentUser, refresh, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);