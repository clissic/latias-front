import React from "react";
import { Accordion } from "react-bootstrap";
import { CrearCurso } from "./CrearCurso";
import "./Gestion.css";

export function Gestion({ user }) {
  if (!user) return null;

  return (
    <div className="container d-flex flex-column align-items-center text-white col-12 col-lg-11">
      <div className="col-12">
        <h2 className="mb-3 text-orange">Gestión:</h2>
        <div className="div-border-color my-4"></div>
      </div>

      <div className="col-12">
        <h4 className="col-12 text-orange mb-3">Gestión de cursos:</h4>
        <Accordion defaultActiveKey="0" className="gestion-accordion">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Crear curso:</Accordion.Header>
            <Accordion.Body>
              <CrearCurso />
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>Buscar curso:</Accordion.Header>
            <Accordion.Body>
              {/* Contenido del buscar curso - se implementará después */}
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2">
            <Accordion.Header>Actualizar curso:</Accordion.Header>
            <Accordion.Body>
              {/* Contenido del actualizar curso - se implementará después */}
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="3">
            <Accordion.Header>Borrar curso:</Accordion.Header>
            <Accordion.Body>
              {/* Contenido del borrar curso - se implementará después */}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}
