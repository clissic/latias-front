import React from "react";
import { Link } from "react-router-dom";

export function General(user) {
  const course = user.user.purchasedCourses[0]; // Tomamos el primer curso
  const progress = course.progress; // Porcentaje de progreso
  const radius = 45; // Radio del círculo
  const circumference = 2 * Math.PI * radius; // Circunferencia
  const offset = circumference - (progress / 100) * circumference; // Offset dinámico
  const rankImg = `../src/assets/ranks/${user.user.rank.title}.webp`;

  const ranksImgs = {
    grumete: "../src/assets/ranks/grumete.webp",
    marinero: "../src/assets/ranks/marinero.webp",
    cabo: "../src/assets/ranks/cabo.webp",
    contramaestre: "../src/assets/ranks/contramaestre.webp",
    teniente: "../src/assets/ranks/teniente.webp",
    capitan: "../src/assets/ranks/capitan.webp",
    almirante: "../src/assets/ranks/almirante.webp",
  };

  return (
    <div className="d-flex justify-content-evenly flex-wrap">
      <div className="text-white col-12 col-md-5 mb-4">
        <h3 className="mb-3 text-orange">Panel del usuario:</h3>
        <div className="d-flex justify-content-between">
          <p className="mb-1">Nombre:</p>
          <strong>
            {user.user.firstName} {user.user.lastName}
          </strong>
        </div>
        <div className="d-flex justify-content-between">
          <p className="mb-1">Email:</p>
          <strong>{user.user.email}</strong>
        </div>
        <div className="d-flex justify-content-between">
          <p className="mb-1">N° teléfono:</p>
          <strong>{user.user.phone}</strong>
        </div>
        <div className="d-flex justify-content-between">
          <p className="mb-1">Dirección:</p>
          <strong>
            {user.user.address.street}, {user.user.address.city}
          </strong>
        </div>
        <div className="d-flex justify-content-between">
          <p className="mb-1">Estado:</p>
          <strong>{user.user.status}</strong>
        </div>
      </div>

      <div className="text-white col-12 col-md-5">
        <h3 className="mb-3 text-orange">Tu rango actual es:</h3>
        <div className="d-flex gap-3">
          <div className=" w-50">
            <img
              className="img-fluid rounded-circle"
              src={rankImg}
              alt={user.user.rank}
            />
          </div>
          <div>
            <h4>
              <i className="bi bi-trophy-fill"></i> {user.user.rank.title}
            </h4>
            <h6>
              <i>{user.user.rank.description}</i>
            </h6>
            <p>
              Tienes <strong>{user.user.purchasedCourses.length}</strong>{" "}
              curso/s activo/s y{" "}
              <strong>{user.user.finishedCourses.length}</strong> curso/s
              aprobado/s.
            </p>
          </div>
        </div>
      </div>

      <div className="text-white dashboard-item-build-general col-11">
        <h3 className="mb-3 text-orange">¡Continúa donde quedaste!</h3>
        <div className="d-flex gap-4 mt-3 px-2 align-items-center justify-content-between">
          <div
            style={{ position: "relative", width: "150px", height: "150px" }}
          >
            <svg width="150" height="150">
              {/* Círculo de fondo */}
              <circle
                cx="75"
                cy="75"
                r={radius}
                stroke="#000000"
                strokeWidth="10"
                fill="none"
              ></circle>
              {/* Círculo de progreso */}
              <circle
                cx="75"
                cy="75"
                r={radius}
                stroke="#4CAF50"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 75 75)" // Rotación para que inicie desde arriba
              ></circle>
            </svg>
            {/* Imagen del curso en el centro */}
            <img
              className="img-fluid"
              src={course.bannerUrl}
              alt={course.courseName}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
          <div>
            <h2>{course.courseName}</h2>
            <p>
              <i className="bi bi-bar-chart-fill"></i> Progreso: {progress}%
            </p>
          </div>
          <Link
            to={`/course/${course.courseId}`}
            className="btn btn-warning w-25"
          >
            Ir al curso
          </Link>
        </div>
      </div>

      <div className="text-white dashboard-item-build-general col-11">
        <h3 className="mb-3 text-orange">Estadísticas:</h3>
      </div>
    </div>
  );
}
