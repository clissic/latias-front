import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Función para inicializar el estado desde localStorage de forma síncrona
function getInitialAuthState() {
    const storedUser = localStorage.getItem("user");
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    
    if (storedUser && storedAccessToken) {
        try {
            return {
                isAuthenticated: true,
                user: JSON.parse(storedUser),
                accessToken: storedAccessToken,
                refreshToken: storedRefreshToken || null
            };
        } catch (error) {
            console.error("Error parsing stored user:", error);
            return {
                isAuthenticated: false,
                user: null,
                accessToken: null,
                refreshToken: null
            };
        }
    }
    
    return {
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null
    };
}

export function AuthProvider({ children }) {
    const initialState = getInitialAuthState();
    const [isAuthenticated, setIsAuthenticated] = useState(initialState.isAuthenticated);
    const [user, setUser] = useState(initialState.user);
    const [accessToken, setAccessToken] = useState(initialState.accessToken);
    const [refreshToken, setRefreshToken] = useState(initialState.refreshToken);

    useEffect(() => {
        // Sincronizar con localStorage en caso de cambios externos
        const storedUser = localStorage.getItem("user");
        const storedAccessToken = localStorage.getItem("accessToken");
        const storedRefreshToken = localStorage.getItem("refreshToken");
        
        if (storedUser && storedAccessToken) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setIsAuthenticated(true);
                setUser(parsedUser);
                setAccessToken(storedAccessToken);
                if (storedRefreshToken) {
                    setRefreshToken(storedRefreshToken);
                }
            } catch (error) {
                console.error("Error parsing stored user:", error);
            }
        } else {
            setIsAuthenticated(false);
            setUser(null);
            setAccessToken(null);
            setRefreshToken(null);
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
        // Leer siempre de localStorage para asegurar que tenemos el token más actualizado
        const token = localStorage.getItem("accessToken") || accessToken;
        if (!token) {
            console.warn("No hay token de acceso disponible");
            return {
                "Content-Type": "application/json",
            };
        }
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
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
            getAuthHeaders: getAuthHeaders,
            forceLogin
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
