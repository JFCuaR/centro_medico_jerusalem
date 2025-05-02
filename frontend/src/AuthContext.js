// src/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const API_URL = process.env.REACT_APP_URL_BACKEND || 'http://localhost:3001';

  // Verifica el token al cargar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      try {
        const decoded = jwt_decode(storedToken);

        // Verifica expiración
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setToken(storedToken);
          setUser(decoded);
        }
      } catch (error) {
        console.error('Token inválido:', error);
        logout();
      }
    }
  }, []);

  // Login: guarda token + decodifica + guarda usuario
  const login = (token) => {
    try {
      const decoded = jwt_decode(token);
      localStorage.setItem('token', token);
      setToken(token);
      setUser(decoded);
    } catch (error) {
      console.error('Error al decodificar token durante login:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
