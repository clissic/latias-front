import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { FadeIn } from "../FadeIn/FadeIn";
import { General } from "./General/General";
import "./Dashboard.css";

// Componentes de cada sección
const Cursos = () => <h1 className="text-white">Cursos</h1>;
const Eventos = () => <h1 className="text-white">Eventos</h1>;
const Certificados = () => <h1 className="text-white">Certificados</h1>;
const Ajustes = () => <h1 className="text-white">Ajustes</h1>;
const CerrarSesion = () => <h1 className="text-white">Cerrar Sesión</h1>;

export function Dashboard() {
  const user = {
    id: 12345,
    firstName: "Joaquín",
    lastName: "Pérez",
    email: "joaquin.perez.coria@gmail.com",
    password: "123456",
    phone: "098511770",
    status: "Estudiante",
    rank: {
      title: "Grumete",
      description: "Recién embarcado en la travesía del aprendizaje, aprendiendo lo básico.",
    },
    address: {
      street: "Asunción 1285",
      city: "Montevideo",
      state: "Montevideo",
      zipCode: "11800",
    },
    preferences: {
      language: "es",
      notifications: true,
    },
    statistics: {
      eventsAttended: 0,
      timeConnected: 0,
    },
    settings: {
      theme: "dark",
      twoStepVerification: true,
    },
    purchasedCourses: [
      {
        courseId: 1,
        courseName: "Navegación Costera - Introducción",
        bannerUrl: "https://wallpapercave.com/wp/wp2485810.jpg",
        dateEnrolled: "2023-09-30",
        status: "Completed",
        dateCompleted: "2023-10-15",
        certificate: {
          credentialNumber: "CERT-12345-67890",
          certificateLink: "https://example.com/certificates/CERT-12345-67890",
        },
        modulesCompleted: [
          {
            moduleId: 1,
            moduleName: "Introducción",
            lessons: [
              {
                lessonId: 1,
                lessonName: "Presentación docente",
                completed: true,
                videoUrl: "",
              },
              {
                lessonId: 2,
                lessonName: "Metodología y objetivos",
                completed: true,
                videoUrl: "",
              },
              {
                lessonId: 3,
                lessonName: "¿Qué aprenderás?",
                completed: true,
                videoUrl: "",
              },
            ],
            progress: 100,
          },
          {
            moduleId: 2,
            moduleName: "Cartas Náuticas",
            lessons: [
              {
                lessonId: 1,
                lessonName: "La carta náutica",
                completed: true,
                videoUrl: "",
              },
              {
                lessonId: 2,
                lessonName: "Simbología",
                completed: true,
                videoUrl: "",
              },
              {
                lessonId: 3,
                lessonName: "Errores comunes al interpretar la carta",
                completed: true,
                videoUrl: "",
              },
            ],
            progress: 100,
          },
        ],
        progress: 36,
        finished: true,
      },
    ],
    finishedCourses: [
        {
            "courseId": 1,
            "courseName": "Navegación Costera - Avanzado",
            "bannerUrl": "https://wallpapercave.com/wp/wp2485810.jpg",
            "dateEnrolled": "2023-10-15",
            "status": "Completed",
            "dateCompleted": "2023-11-01",
            "certificate": {
                "credentialNumber": "CERT-54321-09876",
                "certificateLink": "https://example.com/certificates/CERT-54321-09876"
            }
        }
    ]
  };

  return (
    <div className="container">
      <FadeIn>
        <div className="d-flex gap-0">
          <aside className="text-white dashboard-item-build col-12 col-md-3">
            <div className="mb-5">
              <p className="text-white mb-1">Bienvenido/a,</p>
              <h3 className="text-orange"><strong>{user.firstName} {user.lastName}</strong></h3>
            </div>
            <ul className="dashboard-menu">
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
                },
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
