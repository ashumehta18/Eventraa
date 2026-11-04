// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ token: null, user: null });

  // ✅ Load auth from localStorage on first mount
  useEffect(() => {
    const stored = localStorage.getItem("eventra_auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAuth(parsed);
        if (parsed.token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
        }
      } catch (err) {
        localStorage.removeItem("eventra_auth");
      }
    }
  }, []);

  // ✅ Login: save to state, localStorage, axios header
  const login = (token, user) => {
    const newAuth = { token, user };
    setAuth(newAuth);
    localStorage.setItem("eventra_auth", JSON.stringify(newAuth));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  // ✅ Logout: clear everything
  const logout = () => {
    setAuth({ token: null, user: null });
    localStorage.removeItem("eventra_auth");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
