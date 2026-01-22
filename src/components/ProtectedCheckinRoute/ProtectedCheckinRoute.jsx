import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function ProtectedCheckinRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar que el usuario es de categoría checkin
  if (user?.category !== "checkin") {
    return <Navigate to="/dashboard/general" replace />;
  }

  return children;
}
