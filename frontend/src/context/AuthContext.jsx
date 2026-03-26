import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [tokens, setTokens] = useState(() => {
        const saved = localStorage.getItem('his_tokens');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);
    const tokensRef = useRef(tokens);

    // Axios instance created once
    const apiRef = useRef(axios.create({
        baseURL: 'http://127.0.0.1:8000/api/'
    }));
    const api = apiRef.current;

    // Set up interceptors once
    useEffect(() => {
        const reqInterceptor = api.interceptors.request.use(
            (config) => {
                const currentTokens = tokensRef.current;
                if (currentTokens?.access) {
                    config.headers.Authorization = `Bearer ${currentTokens.access}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const resInterceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const currentTokens = tokensRef.current;
                        const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
                            refresh: currentTokens.refresh
                        });
                        const newTokens = { ...currentTokens, access: response.data.access };
                        setTokens(newTokens);
                        tokensRef.current = newTokens;
                        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                        return axios(originalRequest);
                    } catch (refreshError) {
                        setTokens(null);
                        tokensRef.current = null;
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.request.eject(reqInterceptor);
            api.interceptors.response.eject(resInterceptor);
        };
    }, []); // Only run once

    useEffect(() => {
        tokensRef.current = tokens;
        const fetchUser = async () => {
            if (tokens) {
                localStorage.setItem('his_tokens', JSON.stringify(tokens));
                try {
                    const response = await api.get('users/me/');
                    setUser(response.data);
                } catch (error) {
                    console.error("Failed to fetch user role", error);
                    if (error.response?.status === 401) {
                        setTokens(null);
                        tokensRef.current = null;
                    }
                }
            } else {
                localStorage.removeItem('his_tokens');
                setUser(null);
            }
            setLoading(false);
        };
        fetchUser();
    }, [tokens]);

    const login = async (username, password) => {
        const response = await axios.post('http://127.0.0.1:8000/api/token/', {
            username,
            password
        });
        setTokens(response.data);
        tokensRef.current = response.data;
        return response.data;
    };

    const logout = () => {
        setTokens(null);
        tokensRef.current = null;
    };

    return (
        <AuthContext.Provider value={{ user, tokens, login, logout, api, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
