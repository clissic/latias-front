import React, { useState, useEffect } from "react";
import { Accordion } from "react-bootstrap";
import { CrearCurso } from "./CrearCurso";
import { BuscarCurso } from "./BuscarCurso";
import { ActualizarCurso } from "./ActualizarCurso";
import { CrearProfesor } from "./CrearProfesor";
import { BuscarProfesor } from "./BuscarProfesor";
import { ActualizarProfesor } from "./ActualizarProfesor";
import { CrearUsuario } from "./CrearUsuario";
import { BuscarUsuario } from "./BuscarUsuario";
import { ActualizarUsuario } from "./ActualizarUsuario";
import { apiService } from "../../../services/apiService";
import "./Gestion.css";

export function Gestion({ user }) {
  const [activeAccordionKey, setActiveAccordionKey] = useState(null);
  const [courseToUpdate, setCourseToUpdate] = useState(null);
  const [professorToUpdate, setProfessorToUpdate] = useState(null);
  const [userToUpdate, setUserToUpdate] = useState(null);
  
  // Contadores
  const [coursesCount, setCoursesCount] = useState(0);
  const [professorsCount, setProfessorsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);

  // Cargar contadores al montar el componente
  useEffect(() => {
    const loadCounts = async () => {
      try {
        // Contador de cursos
        const coursesResponse = await apiService.getCourses();
        if (coursesResponse.status === "success" && coursesResponse.payload) {
          setCoursesCount(coursesResponse.payload.length);
        }

        // Contador de profesores
        const professorsResponse = await apiService.getProfessors();
        if (professorsResponse.status === "success" && professorsResponse.payload) {
          setProfessorsCount(professorsResponse.payload.length);
        }

        // Contador de usuarios
        const usersResponse = await apiService.getAllUsers();
        if (usersResponse.status === "success" && usersResponse.payload) {
          setUsersCount(usersResponse.payload.length);
        }
      } catch (error) {
        console.error("Error al cargar contadores:", error);
      }
    };

    loadCounts();
  }, []);

  if (!user) return null;

  const handleUpdateCourse = (course) => {
    setCourseToUpdate(course);
    setActiveAccordionKey("2"); // Abrir el acordeón de "Actualizar curso:"
  };

  const handleUpdateProfessor = (professor) => {
    setProfessorToUpdate(professor);
    setActiveAccordionKey("5"); // Abrir el acordeón de "Actualizar profesor:"
  };

  const handleUpdateUser = (user) => {
    setUserToUpdate(user);
    setActiveAccordionKey("8"); // Abrir el acordeón de "Actualizar usuario:"
  };

  return (
    <div className="container d-flex flex-column align-items-center text-white col-12 col-lg-11">
      <div className="col-12">
        <h2 className="mb-3 text-orange">Gestión:</h2>
        <div className="div-border-color my-4"></div>
      </div>

      <div className="col-12">
        <h4 className="col-12 text-orange mb-3">Gestión de cursos:</h4>
        <div className="mb-3 d-flex flex-column align-items-center justify-content-center gap-2">
          <i className="bi bi-book-half text-orange" style={{ fontSize: "3rem" }}></i>
          <div className="d-flex align-items-center gap-3">
            <span className="text-white" style={{ fontSize: "1.2rem" }}>Total de cursos disponibles:</span>
            <span className="text-white" style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{coursesCount}</span>
          </div>
        </div>
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

      <div className="col-12 mt-5">
        <h4 className="col-12 text-orange mb-3">Gestión de profesores:</h4>
        <div className="mb-3 d-flex flex-column align-items-center justify-content-center gap-2">
          <i className="bi bi-person-badge text-orange" style={{ fontSize: "3rem" }}></i>
          <div className="d-flex align-items-center gap-3">
            <span className="text-white" style={{ fontSize: "1.2rem" }}>Total de profesores enrolados:</span>
            <span className="text-white" style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{professorsCount}</span>
          </div>
        </div>
        <Accordion activeKey={activeAccordionKey} onSelect={(e) => setActiveAccordionKey(e)} className="gestion-accordion">
          <Accordion.Item eventKey="3">
            <Accordion.Header>Crear profesor:</Accordion.Header>
            <Accordion.Body>
              <CrearProfesor />
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="4">
            <Accordion.Header>Buscar profesor:</Accordion.Header>
            <Accordion.Body>
              <BuscarProfesor onUpdateProfessor={handleUpdateProfessor} />
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="5">
            <Accordion.Header>Actualizar profesor:</Accordion.Header>
            <Accordion.Body>
              {professorToUpdate ? (
                <ActualizarProfesor professor={professorToUpdate} />
              ) : (
                <p className="text-white">Busca un profesor y haz click en "Actualizar" para cargar sus datos aquí.</p>
              )}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>

      <div className="col-12 mt-5">
        <h4 className="col-12 text-orange mb-3">Gestión de usuarios:</h4>
        <div className="mb-3 d-flex flex-column align-items-center justify-content-center gap-2">
          <i className="bi bi-people text-orange" style={{ fontSize: "3rem" }}></i>
          <div className="d-flex align-items-center gap-3">
            <span className="text-white" style={{ fontSize: "1.2rem" }}>Total de usuarios registrados:</span>
            <span className="text-white" style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{usersCount}</span>
          </div>
        </div>
        <Accordion activeKey={activeAccordionKey} onSelect={(e) => setActiveAccordionKey(e)} className="gestion-accordion">
          <Accordion.Item eventKey="6">
            <Accordion.Header>Crear usuario:</Accordion.Header>
            <Accordion.Body>
              <CrearUsuario />
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="7">
            <Accordion.Header>Buscar usuario:</Accordion.Header>
            <Accordion.Body>
              <BuscarUsuario onUpdateUser={handleUpdateUser} />
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="8">
            <Accordion.Header>Actualizar usuario:</Accordion.Header>
            <Accordion.Body>
              {userToUpdate ? (
                <ActualizarUsuario user={userToUpdate} />
              ) : (
                <p className="text-white">Busca un usuario y haz click en "Actualizar" para cargar sus datos aquí.</p>
              )}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}
