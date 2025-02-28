import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { FadeIn } from "../FadeIn/FadeIn";
import { General } from "./General/General";
import "./Dashboard.css";

// Componentes de cada sección
/* const General = () => <h1 className="text-white">General</h1>; */
const Cursos = () => <h1 className="text-white">Cursos</h1>;
const Eventos = () => <h1 className="text-white">Eventos</h1>;
const Certificados = () => <h1 className="text-white">Certificados</h1>;
const Ajustes = () => <h1 className="text-white">Ajustes</h1>;
const CerrarSesion = () => <h1 className="text-white">Cerrar Sesión</h1>;

export function Dashboard() {
  const user = {
    firstName: "Joaquín",
    statistics: { timeConnected: 0 },
    settings: { theme: "dark", twoStepVerification: true },
    purchasedCourses: [{ courseId: 1, courseName: "Navegación Costera" }],
  };

  return (
    <div className="container">
      <FadeIn>
        <div className="d-flex gap-4">
          <aside className="text-white dashboard-menu-column col-12 col-md-3">
            <div className="mb-5">
              <p className="text-white mb-1">¡Bienvenido/a,</p>
              <h1>{user.firstName}!</h1>
            </div>
            <ul className="dashboard-menu">
              {[
                { to: "/dashboard/general", icon: "bi-menu-button-wide-fill", label: "General" },
                { to: "/dashboard/cursos", icon: "bi-book-half", label: "Cursos" },
                { to: "/dashboard/eventos", icon: "bi-calendar-event-fill", label: "Eventos" },
                { to: "/dashboard/certificados", icon: "bi-award-fill", label: "Certificados" },
                { to: "/dashboard/ajustes", icon: "bi-gear-fill", label: "Ajustes" },
                { to: "/dashboard/cerrar-sesion", icon: "bi-door-open-fill", label: "Cerrar sesión" },
              ].map(({ to, icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <li className="dashboard-menu-item custom-display-6">
                    <i className={`me-2 bi ${icon}`}></i> {label}
                  </li>
                </NavLink>
              ))}
            </ul>
          </aside>

          {/* Contenido que cambia */}
          <section className="dashboard-content-column col-12 col-md-9">
            <Routes>
              <Route path="general" element={<General user={user} />} />
              <Route path="cursos" element={<Cursos />} />
              <Route path="eventos" element={<Eventos />} />
              <Route path="certificados" element={<Certificados />} />
              <Route path="ajustes" element={<Ajustes />} />
              <Route path="cerrar-sesion" element={<CerrarSesion />} />
              <Route path="*" element={<General />} />
            </Routes>
          </section>
        </div>
      </FadeIn>
    </div>
  );
}
