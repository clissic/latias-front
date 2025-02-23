export function ProgramaCurso({ courseModules }) {
    return (
      <ul className="d-flex flex-column gap-3">
        {courseModules.map((module, index) => (
          <li key={index} className="d-flex gap-3">
            <p className="m-0 align-content-center">
              <i className="bi bi-book-half text-orange me-3"></i> Unidad{" "}
              {index + 1 < 10 ? `0${index + 1}` : index + 1}:
            </p>
            <strong className="custom-display-6">{module.name}</strong>{" "}
          </li>
        ))}
      </ul>
    );
  }
  
