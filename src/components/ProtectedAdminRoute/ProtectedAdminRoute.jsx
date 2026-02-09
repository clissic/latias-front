import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasCategory } from "../../utils/userCategory";

export function ProtectedAdminRoute({ children }) {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si está autenticado pero no es Administrador, redirigir al dashboard general
    if (!hasCategory(user, "Administrador")) {
        return <Navigate to="/dashboard/general" replace />;
    }

    // Si es Administrador, permitir acceso
    return children;
}
