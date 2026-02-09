import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasCategory } from "../../utils/userCategory";

export function ProtectedLogin({ children }) {
    const { isAuthenticated, user } = useAuth();
    
    if (isAuthenticated) {
        // Redirigir según la categoría del usuario
        if (hasCategory(user, "checkin")) {
            return <Navigate to="/checkin" replace />;
        } else {
            return <Navigate to="/dashboard/general" replace />;
        }
    }
    
    return children;
}