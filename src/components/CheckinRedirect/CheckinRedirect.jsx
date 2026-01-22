import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Componente que redirige usuarios checkin a /checkin
export function CheckinRedirect({ children }) {
  const { isAuthenticated, user } = useAuth();

  // Si el usuario es checkin, redirigir inmediatamente sin renderizar nada
  if (isAuthenticated && user?.category === "checkin") {
    return <Navigate to="/checkin" replace />;
  }

  return children;
}
