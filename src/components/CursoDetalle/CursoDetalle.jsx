import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FadeIn } from "../FadeIn/FadeIn";
import "./CursoDetalle.css";

export function CursoDetalle() {
  const { id } = useParams(); // Obtener ID desde la URL
  const [course, setCourse] = useState(null);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/clissic/latias-back/refs/heads/master/cursos.json") // Trae todos los cursos
      .then((res) => res.json())
      .then((data) => {
        const foundCourse = data.find(course => course.id === Number(id)); // Filtrar por ID
        setCourse(foundCourse || null);
      })
      .catch((error) => console.error("Error fetching courses:", error));
  }, [id]);

  if (!course) return <p>Cargando...</p>;

  return (
    <FadeIn>
        <div className="container">
            <div className="img-course-top mb-5" style={{ backgroundImage: `url(${course.image})` }}></div>
            <h2 className="text-orange">{course.name.toUpperCase()}</h2>
            <p className="text-white">{course.shortDescription}</p>
            <div className="row">
                <div className="col-12 col-md-6">
                    <h5 className="text-orange">Detalles del curso:</h5>
                    <div>
                        <i className="display-6 text-orange bi bi-calendar-week-fill"></i>
                        <p className="text-white">Duración: {course.duration}</p>
                    </div>
                    <div>
                        <i className="display-6 text-orange bi bi-lightning-fill"></i>  
                        <p className="text-white">Dificultad: {course.difficulty}</p>
                    </div>
                    <div>
                        <i class="display-6 text-orange bi bi-currency-dollar"></i>
                        <p className="text-white">Precio: ${course.price}</p>
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <h5 className="text-orange">Descripción:</h5>
                    <p className="text-white">{course.longDescription}</p>
                </div>
            </div>
        </div>
    </FadeIn>
  );
}