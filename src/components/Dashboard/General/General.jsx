import React from "react";
import { Link } from "react-router-dom";
import "./General.css";

export function General({ user }) {
  if (!user || !Array.isArray(user.purchasedCourses)) return null;

  const firstCourse = user.purchasedCourses[0] || null;

  const progress = firstCourse && Array.isArray(firstCourse.modulesCompleted)
    ? (() => {
        const totalLessons = firstCourse.modulesCompleted.reduce(
          (acc, module) => acc + (module.lessons?.length || 0),
          0
        );
        const completedLessons = firstCourse.modulesCompleted.reduce(
          (acc, module) =>
            acc + (module.lessons?.filter((lesson) => lesson.completed).length || 0),
          0
        );
        return totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;
      })()
    : 0;

  const rankImg = `/ranks/${user.rank?.title?.toLowerCase() || "default"}.webp`;
  const purchasedCount = Array.isArray(user.purchasedCourses) ? user.purchasedCourses.length : 0;
  const approvedCount = Array.isArray(user.approvedCourses) ? user.approvedCourses.length : 0;

  return (
    <div className="container d-flex justify-content-evenly align-items-between flex-wrap gap-4 col-12 col-lg-11">
      <div className="col-12 col-md-11 col-lg-12">
        <h2 className="mb-3 text-orange">General:</h2>
        <div className="div-border-color my-4"></div>
      </div>

      {/* Panel del Usuario */}
      <div className="text-white col-12 col-sm-11 col-lg-6">
        <h3 className="mb-3 text-orange">Panel del usuario:</h3>
        <div className="d-flex justify-content-between"><p>Nombre:</p><strong>{user.firstName} {user.lastName}</strong></div>
        <div className="d-flex justify-content-between"><p>Email:</p><strong>{user.email}</strong></div>
        <div className="d-flex justify-content-between"><p>N° teléfono:</p><strong>{user.phone}</strong></div>
        <div className="d-flex justify-content-between"><p>Dirección:</p><strong>{user.address.street}, {user.address.city}</strong></div>
        <div className="d-flex justify-content-between"><p>Estado:</p><strong>{user.status}</strong></div>
      </div>

      {/* Rango */}
      <div className="text-white col-12 col-sm-11 col-lg-5">
        <div className="div-border-color my-4 d-lg-none"></div>
        <h3 className="mb-3 text-orange">Tu rango actual es:</h3>
        <div className="d-flex gap-3">
          <div className="w-50">
            <img className="img-fluid rounded-circle" src={rankImg} alt={user.rank.title} />
          </div>
          <div>
            <h4><i className="bi bi-trophy-fill"></i> {user.rank.title}</h4>
            <h6 className="fst-italic text-justify">{user.rank.description}</h6>
            <p>
              Tienes <strong>{purchasedCount}</strong> curso/s activo/s y <strong>{approvedCount}</strong> curso/s aprobado/s.
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="text-white col-12">
        <div className="div-border-color my-4"></div>
        <h3 className="mb-3 text-orange">Estadísticas:</h3>
        <div className="container d-flex flex-column flex-lg-row align-items-center justify-content-between">
          <Stat icon="bi-stopwatch-fill" value={user.statistics.timeConnected} label="Horas conectado/a" />
          <Stat icon="bi-calendar-event-fill" value={user.statistics.eventsAttended} label="Eventos atendidos" />
          <Stat icon="bi-award-fill" value={user.statistics.certificatesQuantity} label="Certificados obtenidos" />
        </div>
      </div>

      {/* Continúa donde quedaste */}
      <div className="text-white dashboard-item-build-general col-12">
        <h3 className="mb-3 text-orange">¡Continúa donde quedaste!</h3>
        {firstCourse ? (
          <div className="d-flex flex-column flex-lg-row gap-4 px-2 align-items-center justify-content-between container">
            <div className="course-image">
              <img className="img-fluid" src={firstCourse.bannerUrl} alt={firstCourse.courseName} />
            </div>
            <div className="col-12 col-lg-6 text-center text-lg-start">
              <h2>{firstCourse.courseName}</h2>
              <p className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2">
                <i className="bi bi-bar-chart-fill"></i> Progreso: {progress}%
              </p>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
            <Link to={`/course/${firstCourse.courseId}`} className="btn btn-warning col-6 col-lg-2">
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

// Componente auxiliar para evitar repetición de estadísticas
function Stat({ icon, value, label }) {
  return (
    <div className="col-12 col-lg-4 d-flex flex-row flex-lg-column text-center align-items-center justify-content-between">
      <i className={`col-3 col-lg-12 bi ${icon} text-orange custom-display-1`}></i>
      <p className="col-3 col-lg-12 display-4 m-0">{value}</p>
      <p className="col-3 col-lg-12 m-0">{label}</p>
    </div>
  );
}
