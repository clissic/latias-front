import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasCategory } from "../../utils/userCategory";

export function ProtectedAdminRoute({ children }) {
    const { isAuthenticated, user, userLoading } = useAuth();
    const location = useLocation();

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si el usuario aún no cargó desde el backend, no redirigir todavía.
    if (userLoading) {
        return (
            <div className="container mt-5 text-center text-white">
                <div className="spinner-border text-orange" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 mb-0">Cargando perfil...</p>
            </div>
        );
    }

    // Si está autenticado pero no es Administrador, redirigir al dashboard general
    if (!hasCategory(user, "Administrador")) {
        return <Navigate to="/dashboard/general" replace />;
    }

    // Si es Administrador, permitir acceso
    return children;
}
