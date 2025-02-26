import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FadeIn } from "../FadeIn/FadeIn";
import { CartaInstructor } from "../CartaInstructor/CartaInstructor";
import { ProgramaCurso } from "../ProgramaCurso/ProgramaCurso";
import "./CursoDetalle.css";

export function CursoDetalle() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [instructor, setInstructor] = useState(null);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/clissic/latias-back/refs/heads/master/cursos.json")
      .then((res) => res.json())
      .then((data) => {
        const foundCourse = data.find(course => course.id === Number(id));
        setCourse(foundCourse || null);
      })
      .catch((error) => console.error("Error fetching courses:", error));
  }, [id]);

  useEffect(() => {
    if (!course) return;
    
    fetch("https://raw.githubusercontent.com/clissic/latias-back/refs/heads/master/profesores.json")
      .then((res) => res.json())
      .then((data) => {
        const foundInstructor = data.find(instructor => instructor.courses?.includes(Number(id)));
        setInstructor(foundInstructor || null);
      })
      .catch((error) => console.error("Error fetching instructors:", error));
  }, [course, id]);
  
  if (!course) return <p>Cargando...</p>;

  return (
        <div className="container">
            <FadeIn>
                <div className="img-course-top mb-5" style={{ backgroundImage: `url(${course.image})` }}></div>
                <h2 className="text-orange">{course.name.toUpperCase()}</h2>
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
                                    <strong className="text-white m-0 custom-display-5">{course.duration}</strong>
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
                <div className="row gap-4 mt-5">
                    {instructor && (
                        <div className="col-12 col-sm-4 col-lg-3">
                            <h5 className="text-orange mb-4">Instructor:</h5>
                            <CartaInstructor 
                                id={instructor.id}
                                profileImage={instructor.profileImage}
                                firstName={instructor.firstName}
                                lastName={instructor.lastName}
                                profession={instructor.profession}
                                experience={instructor.experience}
                                socialMedia={instructor.socialMedia}
                            />
                        </div>
                    )}
                    <div className="col-12 col-sm-7 col-lg-4">
                        <h5 className="text-orange mb-4">Programa:</h5>
                        <div className="text-white">
                            <ProgramaCurso
                                courseModules={course.modules}
                            />
                        </div>
                        <div className="d-flex justify-content-center align-items-center">
                            <Link to={`/course/buy/${id}`} className="btn btn-success w-50 mt-3">
                                <strong>Enrolarte ahora</strong>
                            </Link>
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
                            <img className="img-fluid rounded" src="../../src/assets/Certificado-muestra.webp" alt="cert" />
                        </div>
                    </div>
                </div>
            </FadeIn>
        </div>
  );
}