import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { FadeIn } from "../FadeIn/FadeIn";
import { CartaInstructor } from "../CartaInstructor/CartaInstructor";
import { ProgramaCurso } from "../ProgramaCurso/ProgramaCurso";
import { apiService } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import "./CursoDetalle.css";

function instructorImageUrl(img) {
  if (!img) return null;
  if (img.startsWith("http") || img.startsWith("data:")) return img;
  if (img.startsWith("/api")) return img; // ya tiene /api, no duplicar
  return img.startsWith("/") ? `/api${img}` : `/api/${img}`;
}

export function CursoDetalle() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [instructor, setInstructor] = useState(null);
  const [loadingInstructor, setLoadingInstructor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getCourseByCourseId(courseId);
        if (response.status === "success") {
          setCourse(response.payload);
        } else {
          setError(response.msg || "Error al cargar el curso");
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(err.message || "Error al cargar el curso");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // Obtener instructor del curso por _id y mostrarlo en la carta
  useEffect(() => {
    const raw =
      course?.instructor &&
      (typeof course.instructor === "string"
        ? course.instructor
        : course.instructor?._id ?? course.instructor?.id);
    const instructorId = raw != null ? String(raw).trim() : "";

    if (!course || !instructorId) {
      setInstructor(null);
      setLoadingInstructor(false);
      return;
    }

    let cancelled = false;
    setLoadingInstructor(true);
    setInstructor(null);

    const fetchInstructor = async () => {
      try {
        const res = await apiService.getInstructorById(instructorId);
        if (cancelled) return;
        if (res.status === "success" && res.payload) {
          const p = res.payload;
          setInstructor({
            id: p._id ?? p.id,
            firstName: p.firstName ?? "",
            lastName: p.lastName ?? "",
            profession: p.profession ?? "",
            profileImage: instructorImageUrl(p.profileImage) || undefined,
            experience: p.experience ?? undefined,
            socialMedia: p.socialMedia ?? undefined,
          });
        }
      } catch {
        if (!cancelled) setInstructor(null);
      } finally {
        if (!cancelled) setLoadingInstructor(false);
      }
    };

    fetchInstructor();
    return () => {
      cancelled = true;
      setLoadingInstructor(false);
    };
  }, [course]);

  const purchasedCourses = Array.isArray(user?.purchasedCourses) ? user.purchasedCourses : [];
  const hasPurchasedCourse = useMemo(
    () => purchasedCourses.some((c) => String(c?.courseId ?? c?.course?.courseId ?? "") === String(courseId)),
    [purchasedCourses, courseId]
  );

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-orange" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="text-white mt-3">Cargando curso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4 text-center">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error al cargar el curso</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mt-4 text-center">
        <p className="text-white">Curso no encontrado</p>
      </div>
    );
  }

  return (
        <div className="container">
            <FadeIn>
                <div className="img-course-top mb-5" style={{ backgroundImage: `url(${course.bannerUrl})` }}></div>
                <h2 className="text-orange">{(course.courseName || course.name || "").toUpperCase()}</h2>
                <p className="text-white mb-5">{course.shortDescription}</p>
            </FadeIn>
            <FadeIn>
                <div className="row">
                    <div className="col-12 col-lg-4">
                        <h5 className="text-orange mb-4">Detalles del curso:</h5>
                        <div className="d-flex flex-column flex-sm-row flex-lg-column justify-content-between">
                            <div className="d-flex gap-3 align-items-center mb-3">
                                <i className="display-6 text-orange bi bi-calendar-week-fill"></i>
                                <div>
                                    <p className="text-white mb-0">Duración:</p>
                                    <strong className="text-white m-0 custom-display-5">{course.duration} horas</strong>
                                </div>
                            </div>
                            <div className="d-flex gap-3 align-items-center mb-3">
                                <i className="display-6 text-orange bi bi-lightning-fill"></i>
                                <div>
                                    <p className="text-white mb-0">Dificultad:</p>
                                    <strong className="text-white m-0 custom-display-5">{course.difficulty}</strong>
                                </div>
                            </div>
                            <div className="d-flex gap-3 align-items-center mb-3">
                                <i className="display-6 text-orange bi bi-currency-dollar"></i>
                                <div>
                                    <p className="text-white mb-0">Precio:</p>
                                    <strong className="text-white m-0 custom-display-5 text-">${course.price}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-sm-6 col-lg-4">
                        <h5 className="text-orange mb-4">Descripción:</h5>
                        <p className="text-white text-justify">{course.longDescription}</p>
                    </div>
                    <div className="col-12 col-sm-6 col-lg-4">
                        <img className="img-fluid rounded" src={course.shortImage} alt="Img IA Curso" />
                    </div>
                </div>
            </FadeIn>
            <FadeIn>
                <div className="row gap-4 mt-5 justify-content-between">
                    {(course.instructor && (instructor || loadingInstructor)) && (
                        <div className="col-12 col-sm-4 col-lg-3">
                            <h5 className="text-orange mb-4">Instructor:</h5>
                            {loadingInstructor ? (
                                <div className="card cartaInstructor bg-transparent text-white border-secondary">
                                    <div className="card-body d-flex align-items-center justify-content-center py-4">
                                        <div className="spinner-border text-orange" role="status">
                                            <span className="visually-hidden">Cargando instructor...</span>
                                        </div>
                                        <p className="text-white mb-0 ms-2">Cargando instructor...</p>
                                    </div>
                                </div>
                            ) : instructor ? (
                                <CartaInstructor
                                    id={instructor.id}
                                    profileImage={instructor.profileImage}
                                    firstName={instructor.firstName}
                                    lastName={instructor.lastName}
                                    profession={instructor.profession}
                                    experience={instructor.experience}
                                    socialMedia={instructor.socialMedia}
                                />
                            ) : null}
                        </div>
                    )}
                    <div className="col-12 col-sm-7 col-lg-4">
                        <h5 className="text-orange mb-4">Programa:</h5>
                        <div className="text-white">
                            {course.modules && course.modules.length > 0 ? (
                                <ProgramaCurso
                                    courseModules={course.modules}
                                />
                            ) : (
                                <p className="text-white">No hay módulos disponibles</p>
                            )}
                        </div>
                        <div className="d-flex justify-content-center align-items-center">
                            {hasPurchasedCourse ? (
                                <Link to={`/course/${courseId}/learn`} className="btn btn-warning btn-sm mt-3">
                                    Ir al curso
                                </Link>
                            ) : (
                                <Link to={`/course/buy/${courseId}`} className="btn btn-success w-50 mt-3">
                                    Enrolarte ahora
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="col-12 col-lg-4">
                        <div>
                            <h5 className="text-orange mb-4">Modalidad:</h5>
                            <p className="text-white text-justify">El curso se desarrolla con clases pregrabadas, permitiendo flexibilidad en el aprendizaje. A lo largo del programa, los estudiantes completarán pruebas intermedias para evaluar su progreso. Al finalizar, deberán aprobar un examen final. Al completar el 100% del curso, se emitirá un certificado oficial de finalización.</p>
                        </div>
                        <div>
                            <h5 className="text-orange mb-4">Certificación:</h5>
                            <p className="text-white text-justify">Al finalizar el curso habiendo cumplido con todas las exigencias, se hace entrega de un certificado.</p>
                            <img className="img-fluid rounded" src="/Certificado-muestra.webp" alt="cert" />
                        </div>
                    </div>
                </div>
            </FadeIn>
        </div>
  );
}