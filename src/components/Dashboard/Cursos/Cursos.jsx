import React from "react";
import { Link } from "react-router-dom";
import "./Cursos.css";

export function Cursos({ user }) {
  const cursos = Array.isArray(user.purchasedCourses) ? user.purchasedCourses : [];

  const calculateProgress = (course) => {
    const modules = Array.isArray(course.modulesCompleted) ? course.modulesCompleted : [];

    const totalLessons = modules.reduce(
      (acc, module) => acc + (Array.isArray(module.lessons) ? module.lessons.length : 0),
      0
    );

    const completedLessons = modules.reduce((acc, module) => {
      if (!Array.isArray(module.lessons)) return acc;
      return acc + module.lessons.filter((lesson) => lesson.completed).length;
    }, 0);

    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  return (
    <div className="text-white col-12 col-lg-11 d-flex flex-column align-items-between container">
      <div className="col-12">
        <h2 className="mb-3 text-orange">Cursos en progreso:</h2>
        <div className="div-border-color my-4"></div>
      </div>

      <div className="col-12 d-flex flex-column gap-4">
        {cursos.length === 0 ? (
          <div className="text-center my-5 d-flex flex-column align-items-center col-11">
            <i className="bi bi-binoculars-fill mb-4 custom-display-1 text-orange"></i>
            <h3>
              Tu travesía aún no comienza... No vemos cursos en tu bitácora.
            </h3>
            <p className="fst-italic">
              ¡Estamos a la espera de que te embarques en una nueva aventura!
            </p>
          </div>
        ) : (
          cursos.map((curso) => {
            const progress = calculateProgress(curso);
            const modules = Array.isArray(curso.modulesCompleted) ? curso.modulesCompleted : [];

            return (
              <div
                key={curso.courseId}
                className="dashboard-item-build-cursos container d-flex flex-column gap-4 align-items-center"
              >
                <div className="d-flex flex-column flex-lg-row gap-4 align-items-center justify-content-between w-100">
                  <div className="course-image m-auto">
                    <img
                      className="img-fluid"
                      src={curso.bannerUrl}
                      alt={curso.courseName}
                    />
                  </div>

                  <div className="col-12 col-lg-6 text-center text-lg-start">
                    <h2 className="text-orange">{curso.courseName}</h2>
                    <p className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2 m-0">
                      <i className="bi bi-bar-chart-fill"></i> Progreso: {progress}%
                    </p>
                    <p className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2">
                      <i className="bi bi-calendar-event-fill"></i> Fecha de inscripción: {curso.dateEnrolled}
                    </p>
                  </div>

                  <Link
                    to={`/course/${curso.courseId}`}
                    className="btn btn-warning col-6 col-lg-2 mb-2"
                  >
                    Ir al curso
                  </Link>
                </div>

                <div className="w-100 text-center">
                  <p className="fw-bold mb-4">Módulos:</p>
                  <div className="modules-progress d-flex flex-wrap justify-content-center">
                    {modules.map((modulo) => {
                      const lessons = Array.isArray(modulo.lessons) ? modulo.lessons : [];
                      const allLessonsCompleted = lessons.every((lesson) => lesson.completed);

                      return (
                        <div key={modulo.moduleId} className="module-container">
                          <div className="lesson-dots-container">
                            {lessons.map((leccion) => (
                              <div
                                key={leccion.lessonId}
                                className={`lesson-dot ${leccion.completed ? "completed" : ""}`}
                                title={leccion.lessonName}
                              ></div>
                            ))}
                          </div>

                          <div
                            className={`module-dot ${allLessonsCompleted ? "completed" : ""}`}
                            title={modulo.moduleName}
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
