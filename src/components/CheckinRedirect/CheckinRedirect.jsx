import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasCategory } from "../../utils/userCategory";

// Componente que redirige usuarios checkin a /checkin
export function CheckinRedirect({ children }) {
  const { isAuthenticated, user } = useAuth();

  // Si el usuario es checkin, redirigir inmediatamente sin renderizar nada
  if (isAuthenticated && hasCategory(user, "checkin")) {
    return <Navigate to="/checkin" replace />;
  }

  return children;
}
