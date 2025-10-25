import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);

    useEffect(() => {
        // Siempre que haya un usuario en localStorage, aseguramos autenticación
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setIsAuthenticated(true);
            setUser(JSON.parse(storedUser));
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
    }, []);
    
    // Sincronizar isAuthenticated si el usuario cambia y está definido
    useEffect(() => {
        if (user) {
            setIsAuthenticated(true);
        }
    }, [user]);

    const login = (loginData) => {
        const { user: userData, tokens } = loginData.payload;
        
        setIsAuthenticated(true);
        setUser(userData);
        setAccessToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
        
        // Guardar en localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        
        // Limpiar localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    };

    const refreshAccessToken = async () => {
        if (!refreshToken) {
            logout();
            return false;
        }

        try {
            const response = await fetch("/api/users/refresh-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                const newAccessToken = data.payload.accessToken;
                
                setAccessToken(newAccessToken);
                localStorage.setItem("accessToken", newAccessToken);
                
                return true;
            } else {
                logout();
                return false;
            }
        } catch (error) {
            console.error("Error refreshing token:", error);
            logout();
            return false;
        }
    };

    const getAuthHeaders = () => {
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        };
    };

    const forceLogin = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            user, 
            accessToken,
            refreshToken,
            login, 
            logout, 
            refreshAccessToken,
            getAuthHeaders,
            forceLogin
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
