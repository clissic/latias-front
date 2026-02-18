import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiService } from "../services/apiService";

const AuthContext = createContext();

const STORAGE_ACCESS_TOKEN = "accessToken";
const STORAGE_REFRESH_TOKEN = "refreshToken";

/** Normaliza el usuario del backend (id) para compatibilidad con código que usa _id */
function normalizeUser(payloadUser) {
  if (!payloadUser) return null;
  return {
    ...payloadUser,
    _id: payloadUser._id ?? payloadUser.id,
    id: payloadUser.id ?? payloadUser._id,
  };
}

function getStoredToken() {
  return typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_ACCESS_TOKEN) : null;
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getStoredToken()));
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => getStoredToken());
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem(STORAGE_REFRESH_TOKEN));
  const [userLoading, setUserLoading] = useState(() => Boolean(getStoredToken()));

  const clearTokens = useCallback(() => {
    localStorage.removeItem(STORAGE_ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_REFRESH_TOKEN);
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  /** Obtiene el usuario actual desde el backend (GET /auth/me). Actualiza solo el estado en memoria. */
  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem(STORAGE_ACCESS_TOKEN);
    if (!token) {
      setUserLoading(false);
      return;
    }
    try {
      const res = await apiService.getAuthMe();
      if (res.status === "success" && res.payload?.user) {
        setUser(normalizeUser(res.payload.user));
        setIsAuthenticated(true);
      } else {
        clearTokens();
      }
    } catch (e) {
      if (e?.message?.includes("401") || e?.status === 401) {
        clearTokens();
      }
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setUserLoading(false);
    }
  }, [clearTokens]);

  // Al montar: si hay token, hidratar estado y obtener usuario desde el backend (única fuente de verdad)
  useEffect(() => {
    localStorage.removeItem("user"); // Limpieza: ya no usamos user en localStorage
    const token = localStorage.getItem(STORAGE_ACCESS_TOKEN);
    const storedRefresh = localStorage.getItem(STORAGE_REFRESH_TOKEN);
    if (!token) {
      setUserLoading(false);
      return;
    }
    setAccessToken(token);
    setRefreshToken(storedRefresh);
    setIsAuthenticated(true);
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = (loginData) => {
    const { user: userData, tokens } = loginData.payload;
    if (!tokens?.accessToken) return;

    localStorage.setItem(STORAGE_ACCESS_TOKEN, tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem(STORAGE_REFRESH_TOKEN, tokens.refreshToken);
    }
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken ?? null);
    setUser(normalizeUser(userData));
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearTokens();
  };

  const refreshAccessToken = async () => {
    const stored = localStorage.getItem(STORAGE_REFRESH_TOKEN);
    if (!stored) {
      clearTokens();
      return false;
    }
    try {
      const response = await fetch("/api/users/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: stored }),
      });
      if (!response.ok) {
        clearTokens();
        return false;
      }
      const data = await response.json();
      const newAccessToken = data.payload?.accessToken;
      if (newAccessToken) {
        localStorage.setItem(STORAGE_ACCESS_TOKEN, newAccessToken);
        setAccessToken(newAccessToken);
        return true;
      }
      clearTokens();
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      clearTokens();
      return false;
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem(STORAGE_ACCESS_TOKEN) || accessToken;
    if (!token) {
      return { "Content-Type": "application/json" };
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  /** Actualiza el estado del usuario con el objeto pasado (ej. tras compra o progreso). No toca localStorage. */
  const setUserFromPayload = (userData) => {
    setUser(normalizeUser(userData));
  };

  /** Vuelve a pedir el usuario al backend y actualiza el estado. Usar tras compra, progreso, etc. */
  const refreshUser = useCallback(async () => {
    await fetchCurrentUser();
  }, [fetchCurrentUser]);

  /** Compatibilidad: mismo efecto que setUserFromPayload (actualizar user en memoria). */
  const forceLogin = (userData) => {
    setUser(normalizeUser(userData));
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        userLoading,
        accessToken,
        refreshToken,
        login,
        logout,
        refreshAccessToken,
        getAuthHeaders,
        forceLogin,
        refreshUser,
        setUserFromPayload,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
