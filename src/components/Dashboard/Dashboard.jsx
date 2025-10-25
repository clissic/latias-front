import React, { useEffect } from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { FadeIn } from "../FadeIn/FadeIn";
import { General } from "./General/General";
import { Cursos } from "./Cursos/Cursos";
import { Eventos } from "./Eventos/Eventos";
import { Certificados } from "./Certificados/Certificados";
import { CerrarSesion } from "./CerrarSesion/CerrarSesion";
import { Ajustes } from "./Ajustes/Ajustes";
import { ProtectedRoute } from '../../components/ProtectedRoute/ProtectedRoute.jsx'
import { useAuth } from '../../context/AuthContext';
import "./Dashboard.css";

export function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirige a login si no está autenticado
  useEffect(() => {
    if (isAuthenticated === false) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (!user) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error al cargar dashboard</h4>
          <p>No se encontró información del usuario. Intenta volver a iniciar sesión.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <FadeIn>
        <div className="d-flex gap-0 flex-wrap">
          <aside className="text-white dashboard-item-build col-12 col-md-3 h-custom d-flex flex-column justify-content-between mb-5 mb-md-0">
            <div className="mb-0 mb-md-5">
              <p className="text-white mb-1">Bienvenido/a,</p>
              <h3 className="text-orange"><strong>{user.firstName} {user.lastName}</strong></h3>
              <ul className="dashboard-menu mt-5">
                {[
                  {
                    to: "/dashboard/general",
                    icon: "bi-menu-button-wide-fill",
                    label: "General",
                  },
                  {
                    to: "/dashboard/cursos",
                    icon: "bi-book-half",
                    label: "Cursos",
                  },
                  {
                    to: "/dashboard/eventos",
                    icon: "bi-calendar-event-fill",
                    label: "Eventos",
                  },
                  {
                    to: "/dashboard/certificados",
                    icon: "bi-award-fill",
                    label: "Certificados",
                  },
                  {
                    to: "/dashboard/ajustes",
                    icon: "bi-gear-fill",
                    label: "Ajustes",
                  },
                  {
                    to: "/dashboard/cerrar-sesion",
                    icon: "bi-door-open-fill",
                    label: "Cerrar sesión",
                    customClass: "mt-5"
                  },
                ].map(({ to, icon, label, customClass }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <li className={`dashboard-menu-item custom-lg-size ${customClass}`}>
                      <i className={`me-2 bi ${icon}`}></i> <span className="d-inline d-md-none d-lg-inline">{label}</span>
                    </li>
                  </NavLink>
                ))}
              </ul>
            </div>
            <div className="w-100 text-center d-none d-md-block">
              <a href="#goToTop"><img className="img-fluid w-25 bright-filter" src="/latiasImgLogo.png" alt="logo-latias" /></a>
            </div>
          </aside>

          <section className="dashboard-content-column col-12 col-md-9">
            <Routes>
              <Route path="general" element={<General user={user} />} />
              <Route path="cursos" element={<Cursos user={user} />} />
              <Route path="eventos" element={<Eventos />} />
              <Route path="certificados" element={<Certificados user={user} />} />
              <Route path="ajustes" element={<Ajustes user={user} />} />
              <Route path="cerrar-sesion" element={<CerrarSesion />} />
              <Route path="*" element={<General />} />
            </Routes>
          </section>
        </div>
      </FadeIn>
    </div>
  );
}
