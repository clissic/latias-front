import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { FadeIn } from "../FadeIn/FadeIn";
import { General } from "./General/General";
import { Cursos } from "./Cursos/Cursos";
import { Eventos } from "./Eventos/Eventos";
import { Certificados } from "./Certificados/Certificados";
import { CerrarSesion } from "./CerrarSesion/CerrarSesion";
import "./Dashboard.css";

// Componentes de cada sección
const Ajustes = () => <h1 className="text-white">Ajustes</h1>;

export function Dashboard() {
  const user = {
    id: 12345,
    firstName: "Joaquín",
    lastName: "Pérez",
    email: "joaquin.perez.coria@gmail.com",
    ci: "12345678",
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
      eventsAttended: 3,
      timeConnected: 45,
      certificatesQuantity: 2,
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
                completed: false,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 2,
                lessonName: "Metodología y objetivos",
                completed: false,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 3,
                lessonName: "¿Qué aprenderás?",
                completed: false,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
            ],
            completed: false,
          },
          {
            moduleId: 2,
            moduleName: "Cartas Náuticas",
            lessons: [
              {
                lessonId: 1,
                lessonName: "La carta náutica",
                completed: false,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 2,
                lessonName: "Simbología",
                completed: false,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 3,
                lessonName: "Errores comunes al interpretar la carta",
                completed: false,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
            ],
            completed: false,
          },
          {
            moduleId: 3,
            moduleName: "Cartas Náuticas",
            lessons: [
              {
                lessonId: 1,
                lessonName: "La carta náutica",
                completed: false,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 2,
                lessonName: "Simbología",
                completed: false,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 3,
                lessonName: "Errores comunes al interpretar la carta",
                completed: false,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
            ],
            completed: false,
          },
          {
            moduleId: 4,
            moduleName: "Cartas Náuticas",
            lessons: [
              {
                lessonId: 1,
                lessonName: "La carta náutica",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 2,
                lessonName: "Simbología",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 3,
                lessonName: "Errores comunes al interpretar la carta",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
            ],
            completed: true,
          },
          {
            moduleId: 5,
            moduleName: "Cartas Náuticas",
            lessons: [
              {
                lessonId: 1,
                lessonName: "La carta náutica",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 2,
                lessonName: "Simbología",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 3,
                lessonName: "Errores comunes al interpretar la carta",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
            ],
            completed: true,
          },
          {
            moduleId: 6,
            moduleName: "Cartas Náuticas",
            lessons: [
              {
                lessonId: 1,
                lessonName: "La carta náutica",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 2,
                lessonName: "Simbología",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 3,
                lessonName: "Errores comunes al interpretar la carta",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
            ],
            completed: true,
          },
          {
            moduleId: 7,
            moduleName: "Cartas Náuticas",
            lessons: [
              {
                lessonId: 1,
                lessonName: "La carta náutica",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 2,
                lessonName: "Simbología",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 3,
                lessonName: "Errores comunes al interpretar la carta",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
            ],
            completed: true,
          },
          {
            moduleId: 8,
            moduleName: "Cartas Náuticas",
            lessons: [
              {
                lessonId: 1,
                lessonName: "La carta náutica",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 2,
                lessonName: "Simbología",
                completed: false,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 3,
                lessonName: "Errores comunes al interpretar la carta",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
            ],
            completed: true,
          },
          {
            moduleId: 9,
            moduleName: "Cartas Náuticas",
            lessons: [
              {
                lessonId: 1,
                lessonName: "La carta náutica",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 2,
                lessonName: "Simbología",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 3,
                lessonName: "Errores comunes al interpretar la carta",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
            ],
            completed: true,
          },
          {
            moduleId: 10,
            moduleName: "Cartas Náuticas",
            lessons: [
              {
                lessonId: 1,
                lessonName: "La carta náutica",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 2,
                lessonName: "Simbología",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 3,
                lessonName: "Errores comunes al interpretar la carta",
                completed: false,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
            ],
            completed: true,
          }
        ],
        finished: true,
      },
      {
        courseId: 2,
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
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 2,
                lessonName: "Metodología y objetivos",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 3,
                lessonName: "¿Qué aprenderás?",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
            ],
            completed: true,
          },
          {
            moduleId: 2,
            moduleName: "Cartas Náuticas",
            lessons: [
              {
                lessonId: 1,
                lessonName: "La carta náutica",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 2,
                lessonName: "Simbología",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
              {
                lessonId: 3,
                lessonName: "Errores comunes al interpretar la carta",
                completed: true,
                videoUrl: "https://www.youtube.com/watch?v=DcvvWjExea4",
              },
            ],
            completed: true,
          },
        ],
        finished: true,
      }
    ],
    approvedCourses: [
        {
            courseId: 1,
            courseName: "Navegación Costera I",
            difficulty: "Principiante",
            professor: {
              firstName: "Sofía",
              lastName: "López",
              profession: "Instructora de Supervivencia y Marinería"
            },
            bannerUrl: "https://wallpapercave.com/wp/wp2485810.jpg",
            category: "Astronómica",
            duration: "2 semanas",
            dateEnrolled: "2023-10-15",
            status: "Completed",
            dateCompleted: "2023-11-01",
            certificate: {
                credentialNumber: "CERT-54321-09875",
                certificateLink: "https://ekdmmus6foz.exactdn.com/wp-content/plugins/elementor/assets/images/placeholder.png?fit=265,177"
            }
        },
        {
            courseId: 2,
            courseName: "Navegación Costera II",
            difficulty: "Intermedio",
            professor: {
              firstName: "Carlos",
              lastName: "Gutiérrez",
              profession: "Capitán de la Marina Mercante",
            },
            bannerUrl: "https://wallpapercave.com/wp/wp2485810.jpg",
            category: "Marinería",
            duration: "2 semanas",
            dateEnrolled: "2023-10-15",
            status: "Completed",
            dateCompleted: "2023-11-01",
            certificate: {
                credentialNumber: "CERT-54321-09876",
                certificateLink: "https://ekdmmus6foz.exactdn.com/wp-content/plugins/elementor/assets/images/placeholder.png?fit=265,177"
            }
        },
        {
            courseId: 3,
            courseName: "Navegación Costera III",
            difficulty: "Avanzado",
            professor: {
              firstName: "Carlos",
              lastName: "Gutiérrez",
              profession: "Capitán de la Marina Mercante",
            },
            bannerUrl: "https://wallpapercave.com/wp/wp2485810.jpg",
            category: "Costera",
            duration: "2 semanas",
            dateEnrolled: "2023-10-15",
            status: "Completed",
            dateCompleted: "2023-11-01",
            certificate: {
                credentialNumber: "CERT-54321-09877",
                certificateLink: "https://ekdmmus6foz.exactdn.com/wp-content/plugins/elementor/assets/images/placeholder.png?fit=265,177"
            }
        }
    ]
  };
  console.log(user)

  return (
    <div className="container mt-5">
      <FadeIn>
        <div className="d-flex gap-0 flex-wrap">
          <aside className="text-white dashboard-item-build col-12 col-md-3 h-custom d-flex flex-column justify-content-between">
            <div className="mb-5">
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
            <div className="w-100 text-center">
              <a href="#goToTop"><img className="img-fluid w-25 bright-filter" src="../src/assets/latiasImgLogo.png" alt="logo-latias" /></a>
            </div>
          </aside>

          <section className="dashboard-content-column col-12 col-md-9">
            <Routes>
              <Route path="general" element={<General user={user} />} />
              <Route path="cursos" element={<Cursos user={user} />} />
              <Route path="eventos" element={<Eventos />} />
              <Route path="certificados" element={<Certificados user={user} />} />
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
