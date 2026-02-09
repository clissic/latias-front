import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasCategory } from "../../utils/userCategory";

export function ProtectedGestorRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasCategory(user, "Gestor")) {
    return <Navigate to="/dashboard/general" replace />;
  }

  return children;
}
