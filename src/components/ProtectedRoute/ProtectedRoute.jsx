import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasCategory } from "../../utils/userCategory";

export function ProtectedRoute({ children }) {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si el usuario es checkin, redirigir a /checkin (excepto si ya está en /checkin)
    if (hasCategory(user, "checkin") && location.pathname !== "/checkin") {
        return <Navigate to="/checkin" replace />;
    }

    return children;
}