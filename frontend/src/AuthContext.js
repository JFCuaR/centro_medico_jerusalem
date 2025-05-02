// src/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // ✅ IMPORT CORRECTO

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Se ejecuta una vez al cargar para verificar si el token es válido
  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken); // ✅ DECODIFICAR TOKEN

        // Verifica si el token expiró
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setToken(storedToken);
          setUser(decoded); // ✅ Guarda todos los datos del token (nombre, rol, etc.)
        }
      } catch (error) {
        console.error('Token inválido:', error);
        logout();
      }
    }
  }, []);

  // Guarda token y usuario en login
  const login = (token) => {
    try {
      const decoded = jwtDecode(token);
      localStorage.setItem('token', token);
      setToken(token);
      setUser(decoded); // ✅ Accede a nombre, rol, id, etc.
    } catch (error) {
      console.error('Error al decodificar token en login:', error);
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
