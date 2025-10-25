import "./LogInForm.css";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiService } from "../../services/apiService";
import Swal from "sweetalert2";

export function LogInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const data = await apiService.login(email, password);
      
      if (data.status === "success") {
        // Usar el nuevo método login del contexto
        login(data);

        Swal.fire({
          icon: "success",
          title: "Sesión iniciada",
          text: "¡Bienvenido a bordo de nuevo!",
          timer: 2000,
          showConfirmButton: false,
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        }).then(() => {
          navigate("/dashboard/general");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.msg || "Credenciales incorrectas.",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al iniciar sesión.",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
      console.error("Error en la solicitud:", error);
    }
  }

  return (
    <div className="login-form-container">
      <i className="bi bi-person-circle display-1 text-orange text-center"></i>
      <form>
        <div className="input-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            className="form-control"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresa tu correo"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            className="form-control"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu contraseña"
            required
          />
        </div>
        <button
          onClick={handleSubmit}
          type="submit"
          className="btn btn-primary"
        >
          INGRESAR
        </button>
      </form>
      <div>
        <Link to="/signup" className="signUn">
          <p>Crear cuenta nueva</p>
        </Link>
        <Link to="/recuperarPass" className="signUn">
          <p>Olvidé mi contraseña</p>
        </Link>
      </div>
    </div>
  );
}

    // Aca se va a manejar el envío del formulario, como enviar los datos al servidor
    /* const user = {
      id: 12345,
      firstName: "Joaquín",
      lastName: "Pérez",
      email: email,
      ci: "12345678",
      password: password,
      phone: "098511770",
      birth: "1995-09-30",
      status: "Estudiante",
      rank: {
        title: "Grumete",
        description:
          "Recién embarcado en la travesía del aprendizaje, aprendiendo lo básico.",
      },
      address: {
        street: "Asunción 1285",
        city: "Montevideo",
        state: "Montevideo",
        zipCode: "11800",
        number: "1285",
        country: "Uruguay",
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
            certificateLink:
              "https://example.com/certificates/CERT-12345-67890",
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
            },
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
            certificateLink:
              "https://example.com/certificates/CERT-12345-67890",
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
        },
      ],
      approvedCourses: [
        {
          courseId: 1,
          courseName: "Navegación Costera I",
          difficulty: "Principiante",
          professor: {
            firstName: "Sofía",
            lastName: "López",
            profession: "Instructora de Supervivencia y Marinería",
          },
          bannerUrl: "https://wallpapercave.com/wp/wp2485810.jpg",
          category: "Astronómica",
          duration: "2 semanas",
          dateEnrolled: "2023-10-15",
          status: "Completed",
          dateCompleted: "2023-11-01",
          certificate: {
            credentialNumber: "CERT-54321-09875",
            certificateLink:
              "https://ekdmmus6foz.exactdn.com/wp-content/plugins/elementor/assets/images/placeholder.png?fit=265,177",
          },
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
            certificateLink:
              "https://ekdmmus6foz.exactdn.com/wp-content/plugins/elementor/assets/images/placeholder.png?fit=265,177",
          },
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
            certificateLink:
              "https://ekdmmus6foz.exactdn.com/wp-content/plugins/elementor/assets/images/placeholder.png?fit=265,177",
          },
        },
      ],
    }; 
    login(user);*/