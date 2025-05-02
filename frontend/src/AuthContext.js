// src/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || '');

    useEffect(() => {
        if (token) {
            axios.get('http://localhost:3001/profile', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(res => {
                setUser(res.data.user); // ← Guarda objeto user
            })
            .catch(() => {
                setUser(null);
                setToken('');
                localStorage.removeItem('token');
            });
        }
    }, [token]);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        setToken(token);
        setUser(userData); // ← Guarda el usuario completo
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
