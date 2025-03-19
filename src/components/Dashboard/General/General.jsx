import React from "react";
import { Link } from "react-router-dom";
import "./General.css";

export function General({ user }) {
  const course = user.purchasedCourses[0]; // Tomamos el primer curso

  let progress = 0;

  if (user.purchasedCourses.length > 0) {
    const course = user.purchasedCourses[0]; // Tomamos el primer curso
  
    const totalLessons = course.modulesCompleted.reduce(
      (acc, module) => acc + module.lessons.length,
      0
    );
    const completedLessons = course.modulesCompleted.reduce(
      (acc, module) =>
        acc + module.lessons.filter((lesson) => lesson.completed).length,
      0
    );
    progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  }

  const rankImg = `/ranks/${user.rank.title.toLowerCase()}.webp`;

  return (
    <div className="container d-flex justify-content-evenly align-items-between flex-wrap gap-4 col-12 col-lg-11">
      <div className="col-12 col-md-11 col-lg-12">
        <h2 className="mb-3 text-orange">General:</h2>
        <div className="div-border-color my-4"></div>
      </div>
      <div className="text-white col-12 col-sm-11 col-lg-6">
        <h3 className="mb-3 text-orange">Panel del usuario:</h3>
        <div className="d-flex justify-content-between">
          <p className="mb-1">Nombre:</p>
          <strong>
            {user.firstName} {user.lastName}
          </strong>
        </div>
        <div className="d-flex justify-content-between">
          <p className="mb-1">Email:</p>
          <strong>{user.email}</strong>
        </div>
        <div className="d-flex justify-content-between">
          <p className="mb-1">N° teléfono:</p>
          <strong>{user.phone}</strong>
        </div>
        <div className="d-flex justify-content-between">
          <p className="mb-1">Dirección:</p>
          <strong>
            {user.address.street}, {user.address.city}
          </strong>
        </div>
        <div className="d-flex justify-content-between">
          <p className="mb-1">Estado:</p>
          <strong>{user.status}</strong>
        </div>
      </div>

      <div className="text-white col-12 col-sm-11 col-lg-5">
        <div className="div-border-color my-4 d-lg-none"></div>
        <h3 className="mb-3 text-orange">Tu rango actual es:</h3>
        <div className="d-flex gap-3">
          <div className=" w-50">
            <img
              className="img-fluid rounded-circle"
              src={rankImg}
              alt={user.rank.title}
            />
          </div>
          <div>
            <h4>
              <i className="bi bi-trophy-fill"></i> {user.rank.title}
            </h4>
            <h6 className="fst-italic text-justify">{user.rank.description}</h6>
            <p className="">
              Tienes <strong>{user.purchasedCourses.length}</strong> curso/s
              activo/s y <strong>{user.approvedCourses.length}</strong> curso/s
              aprobado/s.
            </p>
          </div>
        </div>
      </div>


      <div className="text-white col-12">
        <div className="div-border-color my-4"></div>
        <h3 className="mb-3 text-orange">Estadísticas:</h3>
        <div className="container d-flex flex-column flex-lg-row align-items-center justify-content-between">
          <div className="col-12 col-lg-4 d-flex flex-row flex-lg-column text-center align-items-center justify-content-between">
            <i className="col-3 col-lg-12 bi bi-stopwatch-fill text-orange custom-display-1"></i>
            <p className="col-3 col-lg-12 display-4 m-0">{user.statistics.timeConnected}</p>
            <p className="col-3 col-lg-12 m-0">Horas conectado/a</p>
          </div>
          <div className="col-12 col-lg-4 d-flex flex-row flex-lg-column text-center align-items-center justify-content-between">
            <i className="col-3 col-lg-12 bi bi-calendar-event-fill text-orange custom-display-1"></i>
            <p className="col-3 col-lg-12 display-4 m-0">{user.statistics.eventsAttended}</p>
            <p className="col-3 col-lg-12 m-0">Eventos atendidos</p>
          </div>
          <div className="col-12 col-lg-4 d-flex flex-row flex-lg-column text-center align-items-center justify-content-between">
            <i className="col-3 col-lg-12 bi bi-award-fill text-orange custom-display-1"></i>
            <p className="col-3 col-lg-12 display-4 m-0">{user.statistics.certificatesQuantity}</p>
            <p className="col-3 col-lg-12 m-0">Certificados obtenidos</p>
          </div>
        </div>
      </div>

      <div className="text-white dashboard-item-build-general col-12">
        <h3 className="mb-3 text-orange">¡Continúa donde quedaste!</h3>
        {user.purchasedCourses.length > 0 ? (
          <div className="d-flex flex-column flex-lg-row gap-4 px-2 align-items-center justify-content-between container">
            <div className="course-image">
              <img
                className="img-fluid"
                src={course.bannerUrl}
                alt={course.courseName}
              />
            </div>
            <div className="col-12 col-lg-6 text-center text-lg-start">
              <h2>{course.courseName}</h2>
              <p className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2">
                <i className="bi bi-bar-chart-fill"></i> Progreso: {progress}%
              </p>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <Link
              to={`/course/${course.courseId}`}
              className="btn btn-warning col-6 col-lg-2"
            >
              Ir al curso
            </Link>
          </div>
        ) : (
          <p className="text-center">Aún no te has embarcado en ninguna aventura.</p>
        )}
      </div>
    </div>
  );
}
