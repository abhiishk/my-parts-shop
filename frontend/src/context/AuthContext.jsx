import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ps_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem("ps_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const data = await api.login(credentials);
    localStorage.setItem("ps_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await api.register(payload);
    localStorage.setItem("ps_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("ps_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
