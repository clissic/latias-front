import React, { useState, useEffect } from "react";
import { Accordion } from "react-bootstrap";
import { CrearCurso } from "./CrearCurso";
import { BuscarCurso } from "./BuscarCurso";
import { ActualizarCurso } from "./ActualizarCurso";
import { CrearInstructor } from "./CrearInstructor";
import { BuscarInstructor } from "./BuscarInstructor";
import { ActualizarInstructor } from "./ActualizarInstructor";
import { CrearUsuario } from "./CrearUsuario";
import { BuscarUsuario } from "./BuscarUsuario";
import { ActualizarUsuario } from "./ActualizarUsuario";
import { CrearEvento } from "./CrearEvento";
import { BuscarEvento } from "./BuscarEvento";
import { ActualizarEvento } from "./ActualizarEvento";
import { VerLogsCheckin } from "./VerLogsCheckin";
import { apiService } from "../../../services/apiService";
import "./Gestion.css";

export function Gestion({ user }) {
  const [activeAccordionKey, setActiveAccordionKey] = useState(null);
  const [courseToUpdate, setCourseToUpdate] = useState(null);
  const [instructorToUpdate, setInstructorToUpdate] = useState(null);
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [eventToUpdate, setEventToUpdate] = useState(null);
  const [activeSection, setActiveSection] = useState(null); // null = tarjetas, 'courses'/'instructors'/'users'/'events' = sección activa
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Contadores
  const [coursesCount, setCoursesCount] = useState(0);
  const [instructorsCount, setInstructorsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [certificatesCount, setCertificatesCount] = useState(0);
  const [shipsCount, setShipsCount] = useState(0);

  // Cargar contadores al montar el componente
  useEffect(() => {
    const loadCounts = async () => {
      try {
        // Contador de cursos
        const coursesResponse = await apiService.getCourses();
        if (coursesResponse.status === "success" && coursesResponse.payload) {
          setCoursesCount(coursesResponse.payload.length);
        }

        // Contador de instructores
        const instructorsResponse = await apiService.getInstructors();
        if (instructorsResponse.status === "success" && instructorsResponse.payload) {
          setInstructorsCount(instructorsResponse.payload.length);
        }

        // Contador de usuarios
        const usersResponse = await apiService.getAllUsers();
        if (usersResponse.status === "success" && usersResponse.payload) {
          setUsersCount(usersResponse.payload.length);
        }

        // Contador de eventos
        const eventsResponse = await apiService.getAllEvents();
        if (eventsResponse.status === "success" && eventsResponse.payload) {
          setEventsCount(eventsResponse.payload.length);
        }

        // Contador de certificados (placeholder - ajustar cuando haya endpoint)
        setCertificatesCount(0);

        // Contador de buques (placeholder - ajustar cuando haya endpoint)
        setShipsCount(0);
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

  const handleUpdateInstructor = (instructor) => {
    setInstructorToUpdate(instructor);
    setActiveAccordionKey("5"); // Abrir el acordeón de "Actualizar instructor:"
  };

  const handleUpdateUser = (user) => {
    setUserToUpdate(user);
    setActiveAccordionKey("8"); // Abrir el acordeón de "Actualizar usuario:"
  };

  const handleUpdateEvent = (event) => {
    setEventToUpdate(event);
    setActiveAccordionKey("11"); // Abrir el acordeón de "Actualizar evento:"
  };

  const handleCardClick = (section) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSection(section);
      setIsTransitioning(false);
    }, 300); // Tiempo de la animación de fadeOut
  };

  const handleBackClick = () => {
    setActiveSection(null);
    setActiveAccordionKey(null);
  };

  // Renderizar tarjetas (responsive: smartphone 1 col, tablet 2 cols, desktop 3 cols)
  const renderCards = () => (
    <div className={`row g-4 mb-4 gestion-cards-container ${isTransitioning ? 'gestion-cards-fade-out' : ''}`}>
      <div className="col-12 col-md-6 col-lg-4">
        <div 
          className={`gestion-card h-100 ${isTransitioning ? 'gestion-card-fade-out' : ''}`}
          onClick={() => handleCardClick('courses')}
        >
          <div className="gestion-card-content">
            <i className="bi bi-book-half text-orange mb-3" style={{ fontSize: "4rem" }}></i>
            <h4 className="text-white mb-3">Gestión de cursos</h4>
            <div className="d-flex align-items-center justify-content-center gap-2">
              <span className="text-orange" style={{ fontSize: "1rem" }}>Total:</span>
              <span className="text-orange" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{coursesCount}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-6 col-lg-4">
        <div 
          className={`gestion-card h-100 ${isTransitioning ? 'gestion-card-fade-out' : ''}`}
          onClick={() => handleCardClick('instructors')}
        >
          <div className="gestion-card-content">
            <i className="bi bi-person-badge-fill text-orange mb-3" style={{ fontSize: "4rem" }}></i>
            <h4 className="text-white mb-3">Gestión de instructores</h4>
            <div className="d-flex align-items-center justify-content-center gap-2">
              <span className="text-orange" style={{ fontSize: "1rem" }}>Total:</span>
              <span className="text-orange" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{instructorsCount}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-6 col-lg-4">
        <div 
          className={`gestion-card h-100 ${isTransitioning ? 'gestion-card-fade-out' : ''}`}
          onClick={() => handleCardClick('users')}
        >
          <div className="gestion-card-content">
            <i className="bi bi-people-fill text-orange mb-3" style={{ fontSize: "4rem" }}></i>
            <h4 className="text-white mb-3">Gestión de usuarios</h4>
            <div className="d-flex align-items-center justify-content-center gap-2">
              <span className="text-orange" style={{ fontSize: "1rem" }}>Total:</span>
              <span className="text-orange" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{usersCount}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-6 col-lg-4">
        <div 
          className={`gestion-card h-100 ${isTransitioning ? 'gestion-card-fade-out' : ''}`}
          onClick={() => handleCardClick('events')}
        >
          <div className="gestion-card-content">
            <i className="bi bi-calendar-event-fill text-orange mb-3" style={{ fontSize: "4rem" }}></i>
            <h4 className="text-white mb-3">Gestión de eventos</h4>
            <div className="d-flex align-items-center justify-content-center gap-2">
              <span className="text-orange" style={{ fontSize: "1rem" }}>Total:</span>
              <span className="text-orange" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{eventsCount}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-6 col-lg-4">
        <div 
          className={`gestion-card h-100 ${isTransitioning ? 'gestion-card-fade-out' : ''}`}
          onClick={() => handleCardClick('certificates')}
        >
          <div className="gestion-card-content">
            <i className="bi bi-award-fill text-orange mb-3" style={{ fontSize: "4rem" }}></i>
            <h4 className="text-white mb-3">Gestión de certificados</h4>
            <div className="d-flex align-items-center justify-content-center gap-2">
              <span className="text-orange" style={{ fontSize: "1rem" }}>Total:</span>
              <span className="text-orange" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{certificatesCount}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-6 col-lg-4">
        <div 
          className={`gestion-card h-100 ${isTransitioning ? 'gestion-card-fade-out' : ''}`}
          onClick={() => handleCardClick('ships')}
        >
          <div className="gestion-card-content">
            <i className="bi bi-compass-fill text-orange mb-3" style={{ fontSize: "4rem" }}></i>
            <h4 className="text-white mb-3">Gestión de buques</h4>
            <div className="d-flex align-items-center justify-content-center gap-2">
              <span className="text-orange" style={{ fontSize: "1rem" }}>Total:</span>
              <span className="text-orange" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{shipsCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar sección de cursos
  const renderCoursesSection = () => (
    <div className={`gestion-section ${activeSection === 'courses' ? 'gestion-section-active' : ''}`}>
      <h4 className="col-12 text-orange mb-3">Gestión de cursos:</h4>
      <div className="mb-3 d-flex flex-column align-items-center justify-content-center gap-2">
        <i className="bi bi-book-half-fill text-orange" style={{ fontSize: "3rem" }}></i>
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
      <div className="mt-4 d-flex justify-content-center">
        <button 
          className="btn btn-orange-custom"
          onClick={handleBackClick}
        >
          Volver
        </button>
      </div>
    </div>
  );

  // Renderizar sección de instructores
  const renderInstructorsSection = () => (
    <div className={`gestion-section ${activeSection === 'instructors' ? 'gestion-section-active' : ''}`}>
      <h4 className="col-12 text-orange mb-3">Gestión de instructores:</h4>
      <div className="mb-3 d-flex flex-column align-items-center justify-content-center gap-2">
        <i className="bi bi-person-badge-fill text-orange" style={{ fontSize: "3rem" }}></i>
        <div className="d-flex align-items-center gap-3">
          <span className="text-white" style={{ fontSize: "1.2rem" }}>Total de instructores enrolados:</span>
          <span className="text-white" style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{instructorsCount}</span>
        </div>
      </div>
      <Accordion activeKey={activeAccordionKey} onSelect={(e) => setActiveAccordionKey(e)} className="gestion-accordion">
        <Accordion.Item eventKey="3">
          <Accordion.Header>Crear instructor:</Accordion.Header>
          <Accordion.Body>
            <CrearInstructor />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="4">
          <Accordion.Header>Buscar instructor:</Accordion.Header>
          <Accordion.Body>
            <BuscarInstructor onUpdateInstructor={handleUpdateInstructor} />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="5">
          <Accordion.Header>Actualizar instructor:</Accordion.Header>
          <Accordion.Body>
            {instructorToUpdate ? (
              <ActualizarInstructor instructor={instructorToUpdate} />
            ) : (
              <p className="text-white">Busca un instructor y haz click en "Actualizar" para cargar sus datos aquí.</p>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <div className="mt-4 d-flex justify-content-center">
        <button 
          className="btn btn-orange-custom"
          onClick={handleBackClick}
        >
          Volver
        </button>
      </div>
    </div>
  );

  // Renderizar sección de usuarios
  const renderUsersSection = () => (
    <div className={`gestion-section ${activeSection === 'users' ? 'gestion-section-active' : ''}`}>
      <h4 className="col-12 text-orange mb-3">Gestión de usuarios:</h4>
      <div className="mb-3 d-flex flex-column align-items-center justify-content-center gap-2">
        <i className="bi bi-people-fill text-orange" style={{ fontSize: "3rem" }}></i>
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
      <div className="mt-4 d-flex justify-content-center">
        <button 
          className="btn btn-orange-custom"
          onClick={handleBackClick}
        >
          Volver
        </button>
      </div>
    </div>
  );

  // Renderizar sección de eventos
  const renderEventsSection = () => (
    <div className={`gestion-section ${activeSection === 'events' ? 'gestion-section-active' : ''}`}>
      <h4 className="col-12 text-orange mb-3">Gestión de eventos:</h4>
      <div className="mb-3 d-flex flex-column align-items-center justify-content-center gap-2">
        <i className="bi bi-calendar-event-fill text-orange" style={{ fontSize: "3rem" }}></i>
        <div className="d-flex align-items-center gap-3">
          <span className="text-white" style={{ fontSize: "1.2rem" }}>Total de eventos gestionados:</span>
          <span className="text-white" style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{eventsCount}</span>
        </div>
      </div>
      <Accordion activeKey={activeAccordionKey} onSelect={(e) => setActiveAccordionKey(e)} className="gestion-accordion">
        <Accordion.Item eventKey="9">
          <Accordion.Header>Crear evento:</Accordion.Header>
          <Accordion.Body>
            <CrearEvento />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="10">
          <Accordion.Header>Buscar evento:</Accordion.Header>
          <Accordion.Body>
            <BuscarEvento onUpdateEvent={handleUpdateEvent} />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="11">
          <Accordion.Header>Actualizar evento:</Accordion.Header>
          <Accordion.Body>
            {eventToUpdate ? (
              <ActualizarEvento event={eventToUpdate} />
            ) : (
              <p className="text-white">Busca un evento y haz click en "Actualizar" para cargar sus datos aquí.</p>
            )}
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="12">
          <Accordion.Header>Ver logs de check-in:</Accordion.Header>
          <Accordion.Body>
            <VerLogsCheckin />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <div className="mt-4 d-flex justify-content-center">
        <button 
          className="btn btn-orange-custom"
          onClick={handleBackClick}
        >
          Volver
        </button>
      </div>
    </div>
  );

  // Renderizar sección de certificados
  const renderCertificatesSection = () => (
    <div className={`gestion-section ${activeSection === 'certificates' ? 'gestion-section-active' : ''}`}>
      <h4 className="col-12 text-orange mb-3">Gestión de certificados:</h4>
      <div className="mb-3 d-flex flex-column align-items-center justify-content-center gap-2">
        <i className="bi bi-award-fill text-orange" style={{ fontSize: "3rem" }}></i>
        <div className="d-flex align-items-center gap-3">
          <span className="text-white" style={{ fontSize: "1.2rem" }}>Total de certificados emitidos:</span>
          <span className="text-white" style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{certificatesCount}</span>
        </div>
      </div>
      <div className="text-center text-white p-4">
        <p>La gestión de certificados estará disponible próximamente.</p>
      </div>
      <div className="mt-4 d-flex justify-content-center">
        <button 
          className="btn btn-orange-custom"
          onClick={handleBackClick}
        >
          Volver
        </button>
      </div>
    </div>
  );

  // Renderizar sección de buques
  const renderShipsSection = () => (
    <div className={`gestion-section ${activeSection === 'ships' ? 'gestion-section-active' : ''}`}>
      <h4 className="col-12 text-orange mb-3">Gestión de buques:</h4>
      <div className="mb-3 d-flex flex-column align-items-center justify-content-center gap-2">
        <i className="bi bi-compass-fill text-orange" style={{ fontSize: "3rem" }}></i>
        <div className="d-flex align-items-center gap-3">
          <span className="text-white" style={{ fontSize: "1.2rem" }}>Total de buques registrados:</span>
          <span className="text-white" style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{shipsCount}</span>
        </div>
      </div>
      <div className="text-center text-white p-4">
        <p>La gestión de buques estará disponible próximamente.</p>
      </div>
      <div className="mt-4 d-flex justify-content-center">
        <button 
          className="btn btn-orange-custom"
          onClick={handleBackClick}
        >
          Volver
        </button>
      </div>
    </div>
  );

  return (
    <div className="container d-flex flex-column align-items-center text-white col-12 col-lg-11">
      <div className="col-12">
        <h2 className="mb-3 text-orange">Gestión:</h2>
        <div className="div-border-color my-4"></div>
      </div>

      {/* Vista con tarjetas (todas las resoluciones) */}
      <div className="col-12">
        {!activeSection && renderCards()}
        {activeSection === 'courses' && renderCoursesSection()}
        {activeSection === 'instructors' && renderInstructorsSection()}
        {activeSection === 'users' && renderUsersSection()}
        {activeSection === 'events' && renderEventsSection()}
        {activeSection === 'certificates' && renderCertificatesSection()}
        {activeSection === 'ships' && renderShipsSection()}
      </div>
    </div>
  );
}
