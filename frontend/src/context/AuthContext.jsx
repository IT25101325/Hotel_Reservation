import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    const storedUser = localStorage.getItem('user_info');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user_info');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const { token: jwtToken, ...userInfo } = response.data;

    localStorage.setItem('jwt_token', jwtToken);
    localStorage.setItem('user_info', JSON.stringify(userInfo));

    setToken(jwtToken);
    setUser(userInfo);
    return userInfo;
  };

  const register = async (registerData) => {
    const response = await api.post('/auth/register', registerData);
    const { token: jwtToken, ...userInfo } = response.data;

    localStorage.setItem('jwt_token', jwtToken);
    localStorage.setItem('user_info', JSON.stringify(userInfo));

    setToken(jwtToken);
    setUser(userInfo);
    return userInfo;
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    hasRole: (roleName) => user && user.role === roleName,
    isCustomer: () => user && user.role === 'ROLE_CUSTOMER',
    isSupervisor: () => user && user.role === 'ROLE_RESERVATION_SUPERVISOR',
    isEventCoord: () => user && user.role === 'ROLE_EVENT_COORDINATOR',
    isVenueMgr: () => user && user.role === 'ROLE_VENUE_MANAGER',
    isHR: () => user && user.role === 'ROLE_HR_MANAGER',
    isAdmin: () => user && user.role === 'ROLE_ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
