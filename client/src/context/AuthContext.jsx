import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axiosInstance.post('/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  };

  const signup = async (name, email, password) => {
    const { data } = await axiosInstance.post('/auth/signup', { name, email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  };

  const googleLogin = async (credential) => {
    const { data } = await axiosInstance.post('/auth/google', { credential });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

