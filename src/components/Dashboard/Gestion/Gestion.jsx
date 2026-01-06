import React, { useState } from "react";
import { Accordion } from "react-bootstrap";
import { CrearCurso } from "./CrearCurso";
import { BuscarCurso } from "./BuscarCurso";
import { ActualizarCurso } from "./ActualizarCurso";
import "./Gestion.css";

export function Gestion({ user }) {
  const [activeAccordionKey, setActiveAccordionKey] = useState(null);
  const [courseToUpdate, setCourseToUpdate] = useState(null);

  if (!user) return null;

  const handleUpdateCourse = (course) => {
    setCourseToUpdate(course);
    setActiveAccordionKey("2"); // Abrir el acordeón de "Actualizar curso:"
  };

  return (
    <div className="container d-flex flex-column align-items-center text-white col-12 col-lg-11">
      <div className="col-12">
        <h2 className="mb-3 text-orange">Gestión:</h2>
        <div className="div-border-color my-4"></div>
      </div>

      <div className="col-12">
        <h4 className="col-12 text-orange mb-3">Gestión de cursos:</h4>
        <Accordion activeKey={activeAccordionKey} onSelect={(e) => setActiveAccordionKey(e)} className="gestion-accordion">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Crear curso:</Accordion.Header>
            <Accordion.Body>
              <CrearCurso />
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>Buscar curso:</Accordion.Header>
            <Accordion.Body>
              <BuscarCurso onUpdateCourse={handleUpdateCourse} />
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2">
            <Accordion.Header>Actualizar curso:</Accordion.Header>
            <Accordion.Body>
              {courseToUpdate ? (
                <ActualizarCurso course={courseToUpdate} />
              ) : (
                <p className="text-white">Busca un curso y haz click en "Actualizar" para cargar sus datos aquí.</p>
              )}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}
