import React from "react";
import { CartaCurso } from "../CartaCurso/CartaCurso";

export function GrillaCursos({ courses }) {
  return (
    <div className="col-12 col-md-9 mx-auto">
      <div className="row g-4">
        {courses.map((course) => (
          <div key={course.id} className="col-12 col-sm-6 col-md-6 col-lg-4 h-100 p-2">
            <CartaCurso
              id={course.id}
              name={course.name}
              price={course.price}
              category={course.category}
              image={course.image}
              shortDescription={course.shortDescription}
              duration={course.duration}
              difficulty={course.difficulty}
            />
          </div>
        ))}
      </div>
    </div>
  );
}