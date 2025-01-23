import React, { useEffect, useState } from "react";
import { CartaCurso } from "../CartaCurso/CartaCurso";

export function GrillaCursos() {
  const [courses, setCourses] = React.useState([]);

  useEffect(() => {
    // Aca se va a hacer el fetch a la API para obtener los cursos
    fetch(
      "https://raw.githubusercontent.com/clissic/latias-back/refs/heads/master/cursos.json"
    ) // Cambia esto por tu URL real
      .then((response) => response.json())
      .then((data) => setCourses(data))
      .catch((error) => console.error("Error fetching courses:", error));
    }, []);

  return (
    <div className="container mt-4">
      <div className="row g-4">
        {courses.map((course) => (
          <div key={course.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <CartaCurso
              id={course.id}
              name={course.name}
              price={course.price}
              category={course.category}
              image={course.image}
              shortDescription={course.shortDescription}
              duration={course.duration}
              difficulty= {course.difficulty}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
