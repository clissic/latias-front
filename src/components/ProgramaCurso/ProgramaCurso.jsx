export function ProgramaCurso({ courseModules }) {
    if (!courseModules || !Array.isArray(courseModules) || courseModules.length === 0) {
        return <p className="text-white">No hay módulos disponibles</p>;
    }

    return (
      <ul className="d-flex flex-column gap-3 p-0">
        {courseModules.map((module, index) => (
          <li key={module.moduleId || index} className="d-flex gap-3">
            <p className="m-0 align-content-center">
              <i className="bi bi-book-half text-orange me-3"></i> Unidad{" "}
              {index + 1 < 10 ? `0${index + 1}` : index + 1}:
            </p>
            <strong className="">{module.moduleName || module.name || `Módulo ${index + 1}`}</strong>{" "}
          </li>
        ))}
      </ul>
    );
  }
  
