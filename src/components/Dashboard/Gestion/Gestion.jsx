import React, { useState, useEffect, useRef, useMemo } from "react";
import { Accordion, Table, Pagination, Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { getCountryFlag, getCountry, countries } from "../../../utils/countries";
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
import { GestionPagos } from "./GestionPagos";
import { apiService } from "../../../services/apiService";
import "./Gestion.css";

// Bandera emoji con Twemoji (misma estrategia que General/Flota)
const TwemojiFlag = ({ emoji, className = "", size = "24x24" }) => {
  const flagRef = useRef(null);
  useEffect(() => {
    if (flagRef.current && emoji && window.twemoji) {
      window.twemoji.parse(flagRef.current, {
        folder: "svg",
        ext: ".svg",
        className: `twemoji-flag ${className}`.trim(),
        size,
      });
    }
  }, [emoji, className, size]);
  if (!emoji) return <span className="text-white-50">—</span>;
  return <span ref={flagRef} className={className}>{emoji}</span>;
};

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
  const [certificatesList, setCertificatesList] = useState([]);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [certFilters, setCertFilters] = useState({
    course: "",
    userName: "",
    userCi: "",
    instructor: "",
    dateFrom: "",
    dateTo: "",
  });
  const [certCurrentPage, setCertCurrentPage] = useState(1);
  const gestionCertListRef = useRef(null);
  const gestionGestorListRef = useRef(null);
  const CERTIFICATES_PER_PAGE = 10;
  const [shipsCount, setShipsCount] = useState(0);
  const [paymentsCount, setPaymentsCount] = useState(0);
  const [managersCount, setManagersCount] = useState(0);
  const [gestoresList, setGestoresList] = useState([]);
  const [loadingGestores, setLoadingGestores] = useState(false);
  const [gestorFilters, setGestorFilters] = useState({
    id: "",
    firstName: "",
    lastName: "",
    ci: "",
    country: "",
    clientCount: "",
  });
  const [gestorCurrentPage, setGestorCurrentPage] = useState(1);
  const [showGestorCountryDropdown, setShowGestorCountryDropdown] = useState(false);
  const [gestorCountrySearch, setGestorCountrySearch] = useState("Todos");
  const gestorCountryDropdownRef = useRef(null);
  const GESTORES_PER_PAGE = 10;
  const [clientsModal, setClientsModal] = useState({ open: false, gestor: null });
  const [clientsModalPage, setClientsModalPage] = useState(1);
  const [clientsFilterNombre, setClientsFilterNombre] = useState("");
  const [clientsFilterEmail, setClientsFilterEmail] = useState("");
  const [clientsFilterCI, setClientsFilterCI] = useState("");

  const CLIENTES_MODAL_PAGE_SIZE = 5;

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
        if (instructorsResponse?.status === "success" && Array.isArray(instructorsResponse.payload)) {
          setInstructorsCount(instructorsResponse.payload.length);
        }

        // Contador de usuarios
        const usersResponse = await apiService.getAllUsers();
        if (usersResponse.status === "success" && usersResponse.payload) {
          const users = usersResponse.payload;
          setUsersCount(users.length);
          const gestores = users.filter((u) => Array.isArray(u.category) && u.category.includes("Gestor"));
          setManagersCount(gestores.length);
        }

        // Contador de eventos
        const eventsResponse = await apiService.getAllEvents();
        if (eventsResponse.status === "success" && eventsResponse.payload) {
          setEventsCount(eventsResponse.payload.length);
        }

        // Contador de certificados de curso (solo Administrador)
        if (user?.category?.includes?.("Administrador")) {
          try {
            const certRes = await apiService.getCourseCertificates();
            if (certRes.status === "success" && Array.isArray(certRes.payload)) {
              setCertificatesCount(certRes.payload.length);
            }
          } catch (_) {
            setCertificatesCount(0);
          }
        }

        // Contador de buques (placeholder - ajustar cuando haya endpoint)
        setShipsCount(0);

        // Contador de pagos procesados (solo si es admin)
        if (user?.category?.includes?.("Administrador")) {
          try {
            const paymentsRes = await apiService.getProcessedPayments({ limit: 1, page: 1 });
            if (paymentsRes.status === "success" && paymentsRes.payload?.totalDocs != null) {
              setPaymentsCount(paymentsRes.payload.totalDocs);
            }
          } catch (_) {}
        }
      } catch (error) {
        console.error("Error al cargar contadores:", error);
      }
    };

    loadCounts();
  }, [user?.id, user?.category]);

  // Refrescar contador de instructores al abrir la sección (para que se actualice tras crear/eliminar)
  useEffect(() => {
    if (activeSection !== "instructors") return;
    const refreshInstructorsCount = async () => {
      try {
        const res = await apiService.getInstructors();
        if (res?.status === "success" && Array.isArray(res.payload)) {
          setInstructorsCount(res.payload.length);
        }
      } catch (err) {
        console.error("Error al refrescar contador de instructores:", err);
      }
    };
    refreshInstructorsCount();
  }, [activeSection]);

  // Cargar lista de gestores al abrir la sección (con cantidad de clientes asignados)
  useEffect(() => {
    if (activeSection !== "managers") return;
    const loadGestores = async () => {
      setLoadingGestores(true);
      try {
        const response = await apiService.getAllUsers();
        if (response.status === "success" && Array.isArray(response.payload)) {
          const allUsers = response.payload;
          const gestores = allUsers
            .filter((u) => Array.isArray(u.category) && u.category.includes("Gestor"))
            .map((g) => {
              const clientList = allUsers.filter(
                (u) => String(u.manager?.managerId || u.manager?._id || "") === String(g._id)
              );
              return { ...g, clientCount: clientList.length, clientList };
            });
          setGestoresList(gestores);
        } else {
          setGestoresList([]);
        }
      } catch (err) {
        console.error("Error al cargar gestores:", err);
        setGestoresList([]);
      } finally {
        setLoadingGestores(false);
      }
    };
    loadGestores();
  }, [activeSection]);

  // Cargar certificados de curso al abrir la sección (solo Administrador)
  useEffect(() => {
    if (activeSection !== "certificates" || !user?.category?.includes?.("Administrador")) return;
    const loadCertificates = async () => {
      setCertificatesLoading(true);
      try {
        const res = await apiService.getCourseCertificates();
        if (res.status === "success" && Array.isArray(res.payload)) {
          setCertificatesList(res.payload);
          setCertificatesCount(res.payload.length);
        } else {
          setCertificatesList([]);
        }
      } catch (err) {
        console.error("Error al cargar certificados:", err);
        setCertificatesList([]);
      } finally {
        setCertificatesLoading(false);
      }
    };
    loadCertificates();
  }, [activeSection, user?.category]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (gestorCountryDropdownRef.current && !gestorCountryDropdownRef.current.contains(e.target)) {
        setShowGestorCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCertFilterChange = (e) => {
    const { name, value } = e.target;
    setCertFilters((prev) => ({ ...prev, [name]: value }));
    setCertCurrentPage(1);
  };

  const handleCertFiltersReset = () => {
    setCertFilters({
      course: "",
      userName: "",
      userCi: "",
      instructor: "",
      dateFrom: "",
      dateTo: "",
    });
    setCertCurrentPage(1);
  };

  const handleCopyGestorId = async (id) => {
    if (!id) return;
    try {
      await navigator.clipboard.writeText(id);
      Swal.fire({
        icon: "success",
        title: "Copiado",
        text: "ID copiado al portapapeles",
        timer: 1500,
        showConfirmButton: false,
        background: "#082b55",
        color: "#ffffff",
      });
    } catch (error) {
      console.error("Error al copiar:", error);
    }
  };

  const openClientsModal = (gestor) => {
    setClientsModal({ open: true, gestor });
    setClientsModalPage(1);
    setClientsFilterNombre("");
    setClientsFilterEmail("");
    setClientsFilterCI("");
  };

  const closeClientsModal = () => {
    setClientsModal({ open: false, gestor: null });
    setClientsModalPage(1);
  };

  const handleCopyClientId = async (id) => {
    if (!id) return;
    try {
      await navigator.clipboard.writeText(id);
      Swal.fire({
        icon: "success",
        title: "Copiado",
        text: "ID copiado al portapapeles",
        timer: 1500,
        showConfirmButton: false,
        background: "#082b55",
        color: "#ffffff",
      });
    } catch (error) {
      console.error("Error al copiar:", error);
    }
  };

  const handleCopyCertificateId = async (id) => {
    if (!id) return;
    try {
      await navigator.clipboard.writeText(id);
      Swal.fire({
        icon: "success",
        title: "Copiado",
        text: "ID del certificado copiado al portapapeles",
        timer: 1500,
        showConfirmButton: false,
        background: "#082b55",
        color: "#ffffff",
      });
    } catch (error) {
      console.error("Error al copiar:", error);
    }
  };

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
            <h4 className="text-white mb-3">Gestión total de cursos</h4>
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
      {user?.category?.includes?.("Administrador") && (
        <div className="col-12 col-md-6 col-lg-4">
          <div 
            className={`gestion-card h-100 ${isTransitioning ? 'gestion-card-fade-out' : ''}`}
            onClick={() => handleCardClick('payments')}
          >
            <div className="gestion-card-content">
              <i className="bi bi-credit-card-2-front-fill text-orange mb-3" style={{ fontSize: "4rem" }}></i>
              <h4 className="text-white mb-3">Gestión de pagos</h4>
              <div className="d-flex align-items-center justify-content-center gap-2">
                <span className="text-orange" style={{ fontSize: "1rem" }}>Total:</span>
                <span className="text-orange" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{paymentsCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {user?.category?.includes?.("Administrador") && (
        <div className="col-12 col-md-6 col-lg-4">
          <div 
            className={`gestion-card h-100 ${isTransitioning ? 'gestion-card-fade-out' : ''}`}
            onClick={() => handleCardClick('managers')}
          >
            <div className="gestion-card-content">
              <i className="bi bi-person-vcard-fill text-orange mb-3" style={{ fontSize: "4rem" }}></i>
              <h4 className="text-white mb-3">Gestión de gestores</h4>
              <div className="d-flex align-items-center justify-content-center gap-2">
                <span className="text-orange" style={{ fontSize: "1rem" }}>Total:</span>
                <span className="text-orange" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{managersCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Renderizar sección de cursos
  const renderCoursesSection = () => (
    <div className={`gestion-section ${activeSection === 'courses' ? 'gestion-section-active' : ''}`}>
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
      <div className="mt-4 d-flex justify-content-end">
        <button 
          className="btn btn-outline-orange"
          onClick={handleBackClick}
        >
          <i className="bi bi-arrow-left-circle-fill me-2"></i>
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
      <div className="mt-4 d-flex justify-content-end">
        <button 
          className="btn btn-outline-orange"
          onClick={handleBackClick}
        >
          <i className="bi bi-arrow-left-circle-fill me-2"></i>
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
      <div className="mt-4 d-flex justify-content-end">
        <button 
          className="btn btn-outline-orange"
          onClick={handleBackClick}
        >
          <i className="bi bi-arrow-left-circle-fill me-2"></i>
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
      <div className="mt-4 d-flex justify-content-end">
        <button 
          className="btn btn-outline-orange"
          onClick={handleBackClick}
        >
          <i className="bi bi-arrow-left-circle-fill me-2"></i>
          Volver
        </button>
      </div>
    </div>
  );

  // Certificados filtrados (course_certificates)
  const certificatesFiltered = useMemo(() => {
    let list = [...certificatesList];
    const c = certFilters.course.trim().toLowerCase();
    const u = certFilters.userName.trim().toLowerCase();
    const ci = certFilters.userCi.trim();
    const i = certFilters.instructor.trim().toLowerCase();
    const df = certFilters.dateFrom.trim();
    const dt = certFilters.dateTo.trim();
    if (c) list = list.filter((x) => (x.course || "").toLowerCase().includes(c));
    if (u) list = list.filter((x) => (x.userName || "").toLowerCase().includes(u));
    if (ci) list = list.filter((x) => (x.userCi != null ? String(x.userCi) : "").includes(ci));
    if (i) list = list.filter((x) => (x.instructor || "").toLowerCase().includes(i));
    if (df) {
      const from = new Date(df);
      if (!isNaN(from.getTime())) list = list.filter((x) => x.issuedAt && new Date(x.issuedAt) >= from);
    }
    if (dt) {
      const to = new Date(dt);
      if (!isNaN(to.getTime())) {
        to.setHours(23, 59, 59, 999);
        list = list.filter((x) => x.issuedAt && new Date(x.issuedAt) <= to);
      }
    }
    return list;
  }, [certificatesList, certFilters]);

  const formatCertDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("es-UY", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const totalCertPages = Math.max(1, Math.ceil(certificatesFiltered.length / CERTIFICATES_PER_PAGE));
  const certEffectivePage = Math.min(certCurrentPage, totalCertPages);
  const certIndexOfFirst = (certEffectivePage - 1) * CERTIFICATES_PER_PAGE;
  const certIndexOfLast = certEffectivePage * CERTIFICATES_PER_PAGE;
  const certificatesPage = certificatesFiltered.slice(certIndexOfFirst, certIndexOfLast);

  const getCertPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let start = Math.max(1, certEffectivePage - Math.floor(maxPagesToShow / 2));
    let end = Math.min(totalCertPages, start + maxPagesToShow - 1);
    if (end - start < maxPagesToShow - 1) start = Math.max(1, end - maxPagesToShow + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const handleCertPageChange = (page) => {
    setCertCurrentPage(Math.max(1, Math.min(page, totalCertPages)));
    gestionCertListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Gestores filtrados y paginación
  const gestoresFiltered = useMemo(() => {
    let list = [...gestoresList];
    const id = gestorFilters.id.trim().toLowerCase();
    const fn = gestorFilters.firstName.trim().toLowerCase();
    const ln = gestorFilters.lastName.trim().toLowerCase();
    const ci = gestorFilters.ci.trim();
    const country = gestorFilters.country.trim().toLowerCase();
    const clientCount = gestorFilters.clientCount.trim();
    if (id) list = list.filter((u) => (u._id ?? "").toString().toLowerCase().includes(id));
    if (fn) list = list.filter((u) => (u.firstName || "").toLowerCase().includes(fn));
    if (ln) list = list.filter((u) => (u.lastName || "").toLowerCase().includes(ln));
    if (ci) list = list.filter((u) => (u.ci ?? "").toString().includes(ci));
    if (country) {
      list = list.filter((u) => {
        const c = getCountry(u.address?.country);
        const code = (c?.code || u.address?.country || "").toUpperCase();
        return code === country.toUpperCase();
      });
    }
    if (clientCount) list = list.filter((u) => String(u.clientCount ?? "").includes(clientCount));
    return list;
  }, [gestoresList, gestorFilters]);

  const totalGestorPages = Math.max(1, Math.ceil(gestoresFiltered.length / GESTORES_PER_PAGE));
  const gestorEffectivePage = Math.min(gestorCurrentPage, totalGestorPages);
  const gestorIndexOfFirst = (gestorEffectivePage - 1) * GESTORES_PER_PAGE;
  const gestorIndexOfLast = gestorEffectivePage * GESTORES_PER_PAGE;
  const gestoresPage = gestoresFiltered.slice(gestorIndexOfFirst, gestorIndexOfLast);

  const getGestorPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let start = Math.max(1, gestorEffectivePage - Math.floor(maxPagesToShow / 2));
    let end = Math.min(totalGestorPages, start + maxPagesToShow - 1);
    if (end - start < maxPagesToShow - 1) start = Math.max(1, end - maxPagesToShow + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const handleGestorFilterChange = (e) => {
    const { name, value } = e.target;
    setGestorFilters((prev) => ({ ...prev, [name]: value }));
    setGestorCurrentPage(1);
  };

  const handleGestorFiltersReset = () => {
    setGestorFilters({
      id: "",
      firstName: "",
      lastName: "",
      ci: "",
      country: "",
      clientCount: "",
    });
    setGestorCurrentPage(1);
    setShowGestorCountryDropdown(false);
    setGestorCountrySearch("Todos");
  };

  const filteredCountriesForGestor = (!gestorCountrySearch.trim() || gestorCountrySearch.trim().toLowerCase() === "todos")
    ? countries
    : countries.filter(
        (co) =>
          co.name.toLowerCase().includes(gestorCountrySearch.toLowerCase()) ||
          co.code.toLowerCase().includes(gestorCountrySearch.toLowerCase())
      );

  const handleGestorCountrySelect = (co) => {
    setGestorFilters((prev) => ({ ...prev, country: co.code }));
    setGestorCountrySearch(`${co.flag} ${co.name} (${co.code})`);
    setShowGestorCountryDropdown(false);
  };

  const handleGestorCountrySelectTodos = () => {
    setGestorFilters((prev) => ({ ...prev, country: "" }));
    setGestorCountrySearch("Todos");
    setShowGestorCountryDropdown(false);
  };

  const handleGestorCountrySearch = (e) => {
    const value = e.target.value;
    setGestorCountrySearch(value);
    setShowGestorCountryDropdown(true);
    if (!value.trim()) setGestorFilters((prev) => ({ ...prev, country: "" }));
  };

  const handleGestorPageChange = (page) => {
    setGestorCurrentPage(Math.max(1, Math.min(page, totalGestorPages)));
    gestionGestorListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Renderizar sección de certificados
  const renderCertificatesSection = () => (
    <div className={`gestion-section ${activeSection === "certificates" ? "gestion-section-active" : ""}`}>
      <h4 className="col-12 text-orange mb-3">Gestión de certificados:</h4>
      <div className="mb-3 d-flex flex-column align-items-center justify-content-center gap-2">
        <i className="bi bi-award-fill text-orange" style={{ fontSize: "3rem" }} />
        <div className="d-flex align-items-center gap-3">
          <span className="text-white" style={{ fontSize: "1.2rem" }}>Total de certificados emitidos:</span>
          <span className="text-white" style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{certificatesCount}</span>
        </div>
      </div>

      <div className="portafolio-filters col-12 mb-4">
        <h4 className="text-orange"><i className="bi bi-funnel-fill me-2"></i>Filtros:</h4>
        <div className="row g-2 portafolio-modal-filters">
          <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
            <label className="portafolio-modal-filter-label">Curso</label>
            <input
              type="text"
              className="form-control portafolio-input form-control-sm"
              name="course"
              value={certFilters.course}
              onChange={handleCertFilterChange}
            />
          </div>
          <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
            <label className="portafolio-modal-filter-label">Alumno</label>
            <input
              type="text"
              className="form-control portafolio-input form-control-sm"
              name="userName"
              value={certFilters.userName}
              onChange={handleCertFilterChange}
            />
          </div>
          <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
            <label className="portafolio-modal-filter-label">CI del alumno</label>
            <input
              type="text"
              className="form-control portafolio-input form-control-sm"
              name="userCi"
              value={certFilters.userCi}
              onChange={handleCertFilterChange}
            />
          </div>
          <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
            <label className="portafolio-modal-filter-label">Instructor</label>
            <input
              type="text"
              className="form-control portafolio-input form-control-sm"
              name="instructor"
              value={certFilters.instructor}
              onChange={handleCertFilterChange}
            />
          </div>
          <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
            <label className="portafolio-modal-filter-label">Fecha desde</label>
            <input
              type="date"
              className="form-control portafolio-input form-control-sm"
              name="dateFrom"
              value={certFilters.dateFrom}
              onChange={handleCertFilterChange}
            />
          </div>
          <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
            <label className="portafolio-modal-filter-label">Fecha hasta</label>
            <input
              type="date"
              className="form-control portafolio-input form-control-sm"
              name="dateTo"
              value={certFilters.dateTo}
              onChange={handleCertFilterChange}
            />
          </div>
        </div>
        <div className="d-flex flex-wrap align-items-center justify-content-lg-end gap-2 mt-3 flota-filters-actions">
          <button type="button" className="btn btn-outline-orange btn-sm" onClick={handleCertFiltersReset}>
            <i className="bi bi-funnel me-1"></i>Limpiar filtros
          </button>
        </div>
      </div>

      {certificatesLoading ? (
        <div className="text-center text-white py-4">
          <div className="spinner-border text-orange" role="status" />
          <p className="mt-2 mb-0">Cargando certificados...</p>
        </div>
      ) : (
        <>
          <div ref={gestionCertListRef}>
      {certificatesFiltered.length === 0 ? (
        <div className="text-center text-white p-4">
          <p className="mb-0">{certificatesList.length === 0 ? "No hay certificados emitidos." : "No hay resultados con los filtros aplicados."}</p>
        </div>
      ) : (
          <div className="table-responsive">
            <Table striped bordered hover variant="dark" className="table-dark">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Curso</th>
                  <th>Alumno</th>
                  <th>CI</th>
                  <th>Instructor</th>
                  <th>Duración (h)</th>
                  <th>Prueba final %</th>
                  <th>Nota final %</th>
                  <th>Emitido</th>
                </tr>
              </thead>
              <tbody>
                {certificatesPage.map((cert) => (
                  <tr key={cert._id}>
                    <td>
                      <i
                        className="bi bi-clipboard-fill cursor-pointer text-orange"
                        title={cert._id}
                        onClick={() => handleCopyCertificateId(cert._id)}
                        style={{ cursor: "pointer", fontSize: "1rem" }}
                        role="button"
                        aria-label="Copiar ID"
                      />
                    </td>
                    <td>{cert.course || "—"}</td>
                    <td>{cert.userName || "—"}</td>
                    <td>{cert.userCi != null && cert.userCi !== "" ? String(cert.userCi) : "—"}</td>
                    <td>{cert.instructor || "—"}</td>
                    <td>{cert.duration != null ? cert.duration : "—"}</td>
                    <td>{cert.resultFinalTest != null ? cert.resultFinalTest : "—"}</td>
                    <td>{cert.finalResult != null ? cert.finalResult : "—"}</td>
                    <td>{formatCertDate(cert.issuedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
      )}
          </div>

          <div className="d-flex flex-column align-items-center mt-4 mb-4">
            <Pagination className="mb-0">
              <Pagination.First
                onClick={() => handleCertPageChange(1)}
                disabled={certEffectivePage === 1 || totalCertPages === 0}
                className="custom-pagination-item"
              />
              <Pagination.Prev
                onClick={() => handleCertPageChange(certEffectivePage - 1)}
                disabled={certEffectivePage === 1 || totalCertPages === 0}
                className="custom-pagination-item"
              />
              {totalCertPages > 0 ? (
                getCertPageNumbers().map((num) => (
                  <Pagination.Item
                    key={num}
                    active={num === certEffectivePage}
                    onClick={() => handleCertPageChange(num)}
                    className="custom-pagination-item"
                  >
                    {num}
                  </Pagination.Item>
                ))
              ) : (
                <Pagination.Item active disabled className="custom-pagination-item">
                  1
                </Pagination.Item>
              )}
              <Pagination.Next
                onClick={() => handleCertPageChange(certEffectivePage + 1)}
                disabled={certEffectivePage === totalCertPages || totalCertPages === 0}
                className="custom-pagination-item"
              />
              <Pagination.Last
                onClick={() => handleCertPageChange(totalCertPages || 1)}
                disabled={certEffectivePage === (totalCertPages || 1) || totalCertPages === 0}
                className="custom-pagination-item"
              />
            </Pagination>
            <div className="text-white mt-2">
              Página {certEffectivePage} de {totalCertPages || 1} ({certificatesFiltered.length} certificados)
            </div>
          </div>
        </>
      )}

      <div className="mt-4 d-flex justify-content-end">
        <button type="button" className="btn btn-outline-orange" onClick={handleBackClick}>
          <i className="bi bi-arrow-left-circle-fill me-2" />
          Volver
        </button>
      </div>
    </div>
  );

  // Renderizar sección de pagos (solo Administrador)
  const renderPaymentsSection = () => (
    <div className={`gestion-section ${activeSection === 'payments' ? 'gestion-section-active' : ''}`}>
      <GestionPagos />
      <div className="mt-4 d-flex justify-content-end">
        <button className="btn btn-outline-orange" onClick={handleBackClick}>
          <i className="bi bi-arrow-left-circle-fill me-2"></i>
          Volver
        </button>
      </div>
    </div>
  );

  // Renderizar sección de gestores (usuarios con "Gestor" en category)
  const renderManagersSection = () => (
    <div className={`gestion-section ${activeSection === 'managers' ? 'gestion-section-active' : ''}`}>
      <h4 className="col-12 text-orange mb-3">Gestión de gestores:</h4>
      <div className="mb-3 d-flex flex-column align-items-center justify-content-center gap-2">
        <i className="bi bi-person-vcard-fill text-orange" style={{ fontSize: "3rem" }}></i>
        <div className="d-flex align-items-center gap-3">
          <span className="text-white" style={{ fontSize: "1.2rem" }}>Usuarios con categoría Gestor:</span>
          <span className="text-white" style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{managersCount}</span>
        </div>
      </div>
      {loadingGestores ? (
        <div className="text-center text-white py-4">
          <div className="spinner-border text-orange" role="status" />
          <p className="mt-2 mb-0">Cargando gestores...</p>
        </div>
      ) : gestoresList.length === 0 ? (
        <div className="text-center text-white p-4">
          <p className="mb-0">No hay usuarios con categoría Gestor.</p>
        </div>
      ) : (
        <>
          <div className="portafolio-filters col-12 mb-4">
            <h4 className="text-orange"><i className="bi bi-funnel-fill me-2"></i>Filtros:</h4>
            <div className="row g-2 portafolio-modal-filters">
              <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                <label className="portafolio-modal-filter-label">ID</label>
                <input
                  type="text"
                  className="form-control portafolio-input form-control-sm"
                  name="id"
                  value={gestorFilters.id}
                  onChange={handleGestorFilterChange}
                />
              </div>
              <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                <label className="portafolio-modal-filter-label">Nombre</label>
                <input
                  type="text"
                  className="form-control portafolio-input form-control-sm"
                  name="firstName"
                  value={gestorFilters.firstName}
                  onChange={handleGestorFilterChange}
                />
              </div>
              <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                <label className="portafolio-modal-filter-label">Apellido</label>
                <input
                  type="text"
                  className="form-control portafolio-input form-control-sm"
                  name="lastName"
                  value={gestorFilters.lastName}
                  onChange={handleGestorFilterChange}
                />
              </div>
              <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                <label className="portafolio-modal-filter-label">CI</label>
                <input
                  type="text"
                  className="form-control portafolio-input form-control-sm"
                  name="ci"
                  value={gestorFilters.ci}
                  onChange={handleGestorFilterChange}
                />
              </div>
              <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item" ref={gestorCountryDropdownRef}>
                <label className="portafolio-modal-filter-label">País</label>
                <div className="position-relative flota-filter-bandera-wrap gestion-pais-filter-wrap">
                  {gestorFilters.country && gestorCountrySearch && gestorCountrySearch !== "Todos" && !showGestorCountryDropdown ? (
                    <div
                      className="form-control portafolio-input form-control-sm country-input-display"
                      style={{ minHeight: "31px", cursor: "pointer" }}
                      onClick={() => {
                        setGestorCountrySearch("");
                        setShowGestorCountryDropdown(true);
                      }}
                    >
                      <TwemojiFlag emoji={gestorCountrySearch} />
                    </div>
                  ) : (
                    <input
                      type="text"
                      className="form-control portafolio-input form-control-sm"
                      value={gestorCountrySearch}
                      onChange={handleGestorCountrySearch}
                      onFocus={() => setShowGestorCountryDropdown(true)}
                      placeholder="Buscar país..."
                    />
                  )}
                  {showGestorCountryDropdown && (
                    <div className="country-dropdown">
                      <div className="country-option" onClick={handleGestorCountrySelectTodos}>
                        <span className="country-name text-white-50">Todos</span>
                      </div>
                      {filteredCountriesForGestor.length > 0 ? (
                        filteredCountriesForGestor.map((co) => (
                          <div
                            key={co.code}
                            className="country-option"
                            onClick={() => handleGestorCountrySelect(co)}
                          >
                            <span className="country-flag">
                              <TwemojiFlag emoji={co.flag} size="22x22" />
                            </span>
                            <span className="country-name">{co.name}</span>
                            <span className="country-code">{co.code}</span>
                          </div>
                        ))
                      ) : (
                        <div className="country-option no-results">
                          No se encontraron países
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                <label className="portafolio-modal-filter-label">N° Clientes</label>
                <input
                  type="number"
                  min={0}
                  className="form-control portafolio-input form-control-sm"
                  name="clientCount"
                  value={gestorFilters.clientCount}
                  onChange={handleGestorFilterChange}
                />
              </div>
            </div>
            <div className="d-flex flex-wrap align-items-center justify-content-lg-end gap-2 mt-3 flota-filters-actions">
              <button type="button" className="btn btn-outline-orange btn-sm" onClick={handleGestorFiltersReset}>
                <i className="bi bi-funnel me-1"></i>Limpiar filtros
              </button>
            </div>
          </div>

          <div ref={gestionGestorListRef}>
          {gestoresFiltered.length === 0 ? (
            <div className="text-center text-white p-4">
              <p className="mb-0">No hay resultados con los filtros aplicados.</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table striped bordered hover variant="dark" className="table-dark">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Email</th>
                      <th>CI</th>
                      <th>País</th>
                      <th>Clientes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gestoresPage.map((u) => {
                      const countryName = u.address?.country;
                      const countryFlag = getCountryFlag(countryName);
                      const countryObj = getCountry(countryName);
                      return (
                        <tr key={u._id}>
                          <td>
                            <i
                              className="bi bi-clipboard-fill cursor-pointer text-orange"
                              title="Copiar ID"
                              onClick={() => handleCopyGestorId(u._id)}
                              style={{ cursor: "pointer", fontSize: "1.2rem" }}
                              role="button"
                              aria-label="Copiar ID"
                            />
                          </td>
                          <td>{u.firstName || "—"}</td>
                          <td>{u.lastName || "—"}</td>
                          <td>{u.email || "—"}</td>
                          <td>{u.ci || "—"}</td>
                          <td>
                            {countryFlag ? (
                              <span title={countryObj?.name ?? countryName} className="gestion-gestor-flag-wrap d-flex align-items-center">
                                <TwemojiFlag emoji={countryFlag} size="16x16" className="gestion-gestor-flag align-middle" />
                                {countryObj?.name ? (
                                  <span className="ms-1">{countryObj.name}</span>
                                ) : (
                                  <span className="ms-1 text-white-50">{countryName || "—"}</span>
                                )}
                              </span>
                            ) : (
                              <span className="text-white-50">{countryName || "—"}</span>
                            )}
                          </td>
                          <td>
                            <span className="d-inline-flex align-items-center gap-1">
                              {u.clientCount ?? 0}
                              <i
                                className="bi bi-person-lines-fill text-orange cursor-pointer"
                                title="Ver listado de clientes"
                                onClick={() => openClientsModal(u)}
                                style={{ cursor: "pointer", fontSize: "1.1rem" }}
                                role="button"
                                aria-label="Ver clientes"
                              />
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              <div className="d-flex flex-column align-items-center mt-4 mb-4">
                <Pagination className="mb-0">
                  <Pagination.First
                    onClick={() => handleGestorPageChange(1)}
                    disabled={gestorEffectivePage === 1 || totalGestorPages === 0}
                    className="custom-pagination-item"
                  />
                  <Pagination.Prev
                    onClick={() => handleGestorPageChange(gestorEffectivePage - 1)}
                    disabled={gestorEffectivePage === 1 || totalGestorPages === 0}
                    className="custom-pagination-item"
                  />
                  {totalGestorPages > 0 ? (
                    getGestorPageNumbers().map((num) => (
                      <Pagination.Item
                        key={num}
                        active={num === gestorEffectivePage}
                        onClick={() => handleGestorPageChange(num)}
                        className="custom-pagination-item"
                      >
                        {num}
                      </Pagination.Item>
                    ))
                  ) : (
                    <Pagination.Item active disabled className="custom-pagination-item">
                      1
                    </Pagination.Item>
                  )}
                  <Pagination.Next
                    onClick={() => handleGestorPageChange(gestorEffectivePage + 1)}
                    disabled={gestorEffectivePage === totalGestorPages || totalGestorPages === 0}
                    className="custom-pagination-item"
                  />
                  <Pagination.Last
                    onClick={() => handleGestorPageChange(totalGestorPages || 1)}
                    disabled={gestorEffectivePage === (totalGestorPages || 1) || totalGestorPages === 0}
                    className="custom-pagination-item"
                  />
                </Pagination>
                <div className="text-white mt-2">
                  Página {gestorEffectivePage} de {totalGestorPages || 1} ({gestoresFiltered.length} gestores)
                </div>
              </div>
            </>
          )}
          </div>
        </>
      )}
      <div className="mt-4 d-flex justify-content-end">
        <button 
          className="btn btn-outline-orange"
          onClick={handleBackClick}
        >
          <i className="bi bi-arrow-left-circle-fill me-2"></i>
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
      <div className="mt-4 d-flex justify-content-end">
        <button 
          className="btn btn-outline-orange"
          onClick={handleBackClick}
        >
          <i className="bi bi-arrow-left-circle-fill me-2"></i>
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
        {activeSection === 'payments' && renderPaymentsSection()}
        {activeSection === 'managers' && renderManagersSection()}
      </div>

      {/* Modal listado de clientes del gestor (estilo Historial/Pendientes Portafolio) */}
      {clientsModal.open && clientsModal.gestor && (
        <div className="portafolio-modal-overlay" onClick={closeClientsModal}>
          <div className="portafolio-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3 portafolio-modal-header">
              <h5 className="text-orange mb-0 portafolio-modal-title">
                Clientes — {clientsModal.gestor.firstName || ""} {clientsModal.gestor.lastName || ""}
              </h5>
              <button type="button" className="btn-close btn-close-white flex-shrink-0" aria-label="Cerrar" onClick={closeClientsModal} />
            </div>
            {(() => {
              const list = clientsModal.gestor.clientList || [];
              const filtered = list.filter((c) => {
                const nombreStr = [c.firstName, c.lastName].filter(Boolean).join(" ").toLowerCase();
                if (clientsFilterNombre.trim() && !nombreStr.includes(clientsFilterNombre.trim().toLowerCase())) return false;
                if (clientsFilterEmail.trim() && !(c.email || "").toLowerCase().includes(clientsFilterEmail.trim().toLowerCase())) return false;
                if (clientsFilterCI.trim() && !(c.ci || "").toLowerCase().includes(clientsFilterCI.trim().toLowerCase())) return false;
                return true;
              });
              const totalPages = Math.max(1, Math.ceil(filtered.length / CLIENTES_MODAL_PAGE_SIZE));
              const page = Math.min(clientsModalPage, totalPages);
              const paginated = filtered.slice((page - 1) * CLIENTES_MODAL_PAGE_SIZE, page * CLIENTES_MODAL_PAGE_SIZE);
              const hasFilters = !!(clientsFilterNombre.trim() || clientsFilterEmail.trim() || clientsFilterCI.trim());
              return (
                <>
                  {list.length === 0 ? (
                    <p className="text-white-50 mb-0">Este gestor no tiene clientes asignados.</p>
                  ) : (
                    <>
                      {filtered.length === 0 && hasFilters ? (
                        <p className="text-white-50 mb-2 small">Ningún cliente coincide con los filtros.</p>
                      ) : null}
                      <div className="portafolio-modal-filters mb-3">
                        <div className="row g-2">
                          <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                            <label className="portafolio-modal-filter-label">Nombre</label>
                            <input type="text" className="form-control form-control-sm portafolio-input" value={clientsFilterNombre} onChange={(e) => { setClientsFilterNombre(e.target.value); setClientsModalPage(1); }} placeholder="Nombre o apellido" />
                          </div>
                          <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                            <label className="portafolio-modal-filter-label">Email</label>
                            <input type="text" className="form-control form-control-sm portafolio-input" value={clientsFilterEmail} onChange={(e) => { setClientsFilterEmail(e.target.value); setClientsModalPage(1); }} placeholder="Email" />
                          </div>
                          <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                            <label className="portafolio-modal-filter-label">CI</label>
                            <input type="text" className="form-control form-control-sm portafolio-input" value={clientsFilterCI} onChange={(e) => { setClientsFilterCI(e.target.value); setClientsModalPage(1); }} placeholder="Cédula" />
                          </div>
                        </div>
                        <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 mt-3">
                          <button type="button" className="btn btn-outline-orange btn-sm" onClick={() => { setClientsFilterNombre(""); setClientsFilterEmail(""); setClientsFilterCI(""); setClientsModalPage(1); }}>
                            <i className="bi bi-funnel me-1" /> Limpiar filtros
                          </button>
                        </div>
                      </div>
                      <div className="table-responsive portafolio-table-wrap">
                        <Table striped bordered hover variant="dark" className="table-dark table-sm">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Nombre</th>
                              <th>Apellido</th>
                              <th>Email</th>
                              <th>CI</th>
                              <th>País</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginated.map((c) => {
                              const cCountry = c.address?.country;
                              const cFlag = getCountryFlag(cCountry);
                              const cCountryObj = getCountry(cCountry);
                              return (
                                <tr key={c._id}>
                                  <td>
                                    <i className="bi bi-clipboard-fill cursor-pointer text-orange" title={c._id} onClick={() => handleCopyClientId(c._id)} style={{ cursor: "pointer", fontSize: "1rem" }} role="button" aria-label="Copiar ID" />
                                  </td>
                                  <td>{c.firstName || "—"}</td>
                                  <td>{c.lastName || "—"}</td>
                                  <td>{c.email || "—"}</td>
                                  <td>{c.ci || "—"}</td>
                                  <td>
                                    {cFlag ? (
                                      <span className="gestion-gestor-flag-wrap d-inline-flex align-items-center">
                                        <TwemojiFlag emoji={cFlag} size="16x16" className="gestion-gestor-flag align-middle" />
                                        <span className="ms-1">{cCountryObj?.name ?? cCountry ?? "—"}</span>
                                      </span>
                                    ) : (
                                      <span className="text-white-50">{cCountry || "—"}</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2 portafolio-modal-pagination">
                        <span className="text-white-50 small">Página {page} de {totalPages} ({filtered.length} clientes)</span>
                        <Pagination className="mb-0">
                          <Pagination.Item className="custom-pagination-item" disabled={page <= 1} onClick={(e) => { e.preventDefault(); if (page > 1) setClientsModalPage(page - 1); }} style={{ cursor: page > 1 ? "pointer" : undefined }}>Anterior</Pagination.Item>
                          <Pagination.Item className="custom-pagination-item" disabled={page >= totalPages} onClick={(e) => { e.preventDefault(); if (page < totalPages) setClientsModalPage(page + 1); }} style={{ cursor: page < totalPages ? "pointer" : undefined }}>Siguiente</Pagination.Item>
                        </Pagination>
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
