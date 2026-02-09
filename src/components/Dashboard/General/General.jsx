import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Form, Button } from "react-bootstrap";
import { FadeIn } from "../../FadeIn/FadeIn";
import { useAuth } from "../../../context/AuthContext";
import { apiService } from "../../../services/apiService";
import { getCountryFlag, getCountry, getJurisdictions } from "../../../utils/countries";
import "./General.css";

const jurisdictions = getJurisdictions();

// Misma estrategia que en Flota: Twemoji convierte el emoji de bandera en SVG
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

  if (!emoji) return null;
  return <span ref={flagRef} className={className}>{emoji}</span>;
};

export function General({ user }) {
  const navigate = useNavigate();
  const { forceLogin } = useAuth();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [gestors, setGestors] = useState([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("");
  const [showJurisdictionDropdown, setShowJurisdictionDropdown] = useState(false);
  const [selectedGestorId, setSelectedGestorId] = useState("");
  const [showGestorDropdown, setShowGestorDropdown] = useState(false);
  const [loadingGestors, setLoadingGestors] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const gestorDropdownRef = useRef(null);
  const jurisdictionDropdownRef = useRef(null);

  if (!user) return null;

  const hasGestor = !!user.manager?.managerId;
  const managerDisplayName = [user.manager?.firstName, user.manager?.lastName].filter(Boolean).join(" ") || "—";
  const managerCountry = user.manager?.address?.country;
  const managerFlag = getCountryFlag(managerCountry);
  const managerCountryName = getCountry(managerCountry)?.name ?? managerCountry ?? "No definido";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (gestorDropdownRef.current && !gestorDropdownRef.current.contains(e.target)) setShowGestorDropdown(false);
      if (jurisdictionDropdownRef.current && !jurisdictionDropdownRef.current.contains(e.target)) setShowJurisdictionDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showGestorDropdown, showJurisdictionDropdown]);

  const loadGestors = async () => {
    setLoadingGestors(true);
    try {
      const res = await apiService.getGestors();
      if (res.status === "success" && Array.isArray(res.payload)) {
        setGestors(res.payload);
      } else {
        setGestors([]);
      }
    } catch (e) {
      console.error("Error al cargar gestores:", e);
      setGestors([]);
    } finally {
      setLoadingGestors(false);
    }
  };

  const gestorsByJurisdiction = selectedJurisdiction
    ? gestors.filter((g) => {
        const c = getCountry(g.address?.country);
        return c && c.code === selectedJurisdiction;
      })
    : [];

  const handleOpenAssignModal = () => {
    setShowAssignModal(true);
    setSelectedJurisdiction("");
    setSelectedGestorId("");
    setShowJurisdictionDropdown(false);
    setShowGestorDropdown(false);
    loadGestors();
  };

  const handleAssignGestor = async () => {
    if (!selectedGestorId) return;
    setAssigning(true);
    try {
      const jurisdictionName = jurisdictions.find((j) => j.code === selectedJurisdiction)?.name ?? "";
      const res = await apiService.updateMyManager(selectedGestorId, jurisdictionName);
      if (res.status === "success") {
        const profileRes = await apiService.getUserProfile();
        if (profileRes.status === "success" && profileRes.payload?.user) {
          forceLogin(profileRes.payload.user);
        }
        setShowAssignModal(false);
      } else {
        console.error(res.msg || "Error al asignar gestor");
      }
    } catch (e) {
      console.error("Error al asignar gestor:", e);
    } finally {
      setAssigning(false);
    }
  };

  // Asegurar que purchasedCourses sea un array
  const purchasedCourses = Array.isArray(user.purchasedCourses) ? user.purchasedCourses : [];
  const approvedCourses = Array.isArray(user.approvedCourses) ? user.approvedCourses : [];
  const statistics = user.statistics || {};
  const eventsAttended = Array.isArray(statistics.eventsAttended) ? statistics.eventsAttended : [];
  const firstCourse = purchasedCourses[0] || null;

  const progress = firstCourse && Array.isArray(firstCourse.modulesCompleted)
    ? (() => {
        const totalLessons = firstCourse.modulesCompleted.reduce(
          (acc, module) => acc + (module.lessons?.length || 0),
          0
        );
        const completedLessons = firstCourse.modulesCompleted.reduce(
          (acc, module) =>
            acc + (module.lessons?.filter((lesson) => lesson.completed).length || 0),
          0
        );
        return totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;
      })()
    : 0;

  const rankImg = `/ranks/${user.rank?.title?.toLowerCase() || "default"}.webp`;
  const purchasedCount = purchasedCourses.length;
  const approvedCount = approvedCourses.length;

  return (
    <FadeIn>
      <div className="container d-flex justify-content-evenly align-items-between flex-wrap gap-4 col-12 col-lg-11">
        <div className="col-12 col-md-11 col-lg-12">
          <h2 className="mb-3 text-orange">General:</h2>
          <div className="div-border-color my-4"></div>
        </div>

        {/* Panel del Usuario */}
        <div className="text-white col-12 col-sm-11 col-lg-6">
          <h3 className="mb-3 text-orange">Panel del usuario:</h3>
          <div className="d-flex justify-content-between"><p>Nombre:</p><strong>{user.firstName} {user.lastName}</strong></div>
          <div className="d-flex justify-content-between"><p>Email:</p><strong>{user.email}</strong></div>
          <div className="d-flex justify-content-between"><p>N° teléfono:</p><strong>{user.phone || "No definido"}</strong></div>
          <div className="d-flex justify-content-between"><p>Dirección:</p><strong>{user.address?.street || "No definido"} {user.address?.number || ""}, {user.address?.city || "No definido"}</strong></div>
          <div className="d-flex justify-content-between"><p>Estado:</p><strong>{user.status || "Estudiante"}</strong></div>
          <div className="d-flex justify-content-between align-items-center">
            <p className="mb-0">Gestor:</p>
            {hasGestor ? (
              <button
                type="button"
                className="btn btn-sm btn-outline-warning general-btn-gestor-assigned d-flex align-items-center gap-2"
                onClick={() => navigate("/dashboard/general/gestor")}
              >
                {managerFlag && <TwemojiFlag emoji={managerFlag} className="general-gestor-btn-flag" size="20x20" />}
                <span>{managerDisplayName}</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-sm btn-outline-warning general-btn-asignar-gestor"
                onClick={handleOpenAssignModal}
              >
                Asignar gestor
              </button>
            )}
          </div>
        </div>

        {/* Rango */}
        <div className="text-white col-12 col-sm-11 col-lg-5">
          <div className="div-border-color my-4 d-lg-none"></div>
          <h3 className="mb-3 text-orange">Tu rango actual es:</h3>
          <div className="d-flex gap-3">
            <div className="w-50">
              <img className="img-fluid rounded-circle" src={rankImg} alt={user.rank?.title || "Rango"} />
            </div>
            <div>
              <h4><i className="bi bi-trophy-fill"></i> {user.rank?.title || "Grumete"}</h4>
              <h6 className="fst-italic text-justify">{user.rank?.description || "Recién embarcado en la travesía del aprendizaje, aprendiendo lo básico."}</h6>
              <p>
                Tienes <strong>{purchasedCount}</strong> curso/s activo/s y <strong>{approvedCount}</strong> curso/s aprobado/s.
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="text-white col-12">
          <div className="div-border-color my-4"></div>
          <h3 className="mb-3 text-orange">Estadísticas:</h3>
          <div className="container d-flex flex-column flex-lg-row align-items-center justify-content-between">
            <Stat icon="bi-stopwatch-fill" value={((statistics.timeConnected || 0) / 60).toFixed(1)} label="Horas conectado/a" />
            <Stat icon="bi-calendar-event-fill" value={eventsAttended.length} label="Eventos atendidos" />
            <Stat icon="bi-award-fill" value={statistics.certificatesQuantity || 0} label="Certificados obtenidos" />
          </div>
        </div>

        {/* Continúa donde quedaste */}
        <div className="text-white dashboard-item-build-general col-12">
          <h3 className="mb-3 text-orange">¡Continúa donde quedaste!</h3>
          {firstCourse ? (
            <div className="d-flex flex-column flex-lg-row gap-4 px-2 align-items-center justify-content-between container">
              <div className="course-image">
                <img className="img-fluid" src={firstCourse.bannerUrl} alt={firstCourse.courseName} />
              </div>
              <div className="col-12 col-lg-6 text-center text-lg-start">
                <h2>{firstCourse.courseName}</h2>
                <p className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2">
                  <i className="bi bi-bar-chart-fill"></i> Progreso: {progress}%
                </p>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              <Link to={`/course/${firstCourse.courseId}`} className="btn btn-warning col-6 col-lg-2">
                Ir al curso
              </Link>
            </div>
          ) : (
            <p className="text-center">Aún no te has embarcado en ninguna aventura.</p>
          )}
        </div>
      </div>

      {/* Modal Asignar gestor */}
      <Modal
        show={showAssignModal}
        onHide={() => !assigning && setShowAssignModal(false)}
        centered
        className="general-modal-dark"
        contentClassName="general-modal-content"
      >
        <Modal.Header closeButton className="general-modal-header">
          <Modal.Title className="text-orange">Asignar gestor</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-white">
          {loadingGestors ? (
            <div className="text-center py-3">
              <div className="spinner-border text-warning" role="status" />
              <p className="mt-2 mb-0">Cargando gestores...</p>
            </div>
          ) : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Seleccionar jurisdicción</Form.Label>
                <div className="position-relative" ref={jurisdictionDropdownRef}>
                  <div
                    className="form-control general-form-select general-gestor-select-display d-flex align-items-center"
                    onClick={() => setShowJurisdictionDropdown((v) => !v)}
                    style={{ cursor: "pointer" }}
                  >
                    {selectedJurisdiction ? (() => {
                      const jur = jurisdictions.find((j) => j.code === selectedJurisdiction);
                      if (!jur) return "Seleccionar jurisdicción";
                      return (
                        <>
                          <TwemojiFlag emoji={jur.flag} className="general-gestor-dropdown-flag me-2" size="22x22" />
                          <span>{jur.name}</span>
                        </>
                      );
                    })() : "Seleccionar jurisdicción"}
                  </div>
                  {showJurisdictionDropdown && (
                    <div className="general-gestor-dropdown">
                      {jurisdictions.map((jur) => (
                        <div
                          key={jur.code}
                          className="general-gestor-option"
                          onClick={() => {
                            setSelectedJurisdiction(jur.code);
                            setSelectedGestorId("");
                            setShowJurisdictionDropdown(false);
                          }}
                        >
                          <span className="general-gestor-option-flag">
                            <TwemojiFlag emoji={jur.flag} size="22x22" />
                          </span>
                          <span>{jur.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Form.Group>

              {selectedJurisdiction && (
                <Form.Group className="mb-3">
                  <Form.Label>Gestor</Form.Label>
                  {gestorsByJurisdiction.length === 0 ? (
                    <p className="text-muted mb-0">Aún no hay gestores registrados para esta jurisdicción.</p>
                  ) : (
                    <div className="position-relative" ref={gestorDropdownRef}>
                      <div
                        className="form-control general-form-select general-gestor-select-display d-flex align-items-center"
                        onClick={() => setShowGestorDropdown((v) => !v)}
                        style={{ cursor: "pointer" }}
                      >
                        {selectedGestorId ? (() => {
                          const g = gestorsByJurisdiction.find((x) => x.id === selectedGestorId);
                          if (!g) return "Seleccione un gestor";
                          return <span>{g.firstName} {g.lastName}</span>;
                        })() : "Seleccione un gestor"}
                      </div>
                      {showGestorDropdown && (
                        <div className="general-gestor-dropdown">
                          {gestorsByJurisdiction.map((g) => (
                            <div
                              key={g.id}
                              className="general-gestor-option"
                              onClick={() => {
                                setSelectedGestorId(g.id);
                                setShowGestorDropdown(false);
                              }}
                            >
                              <span>{g.firstName} {g.lastName}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Form.Group>
              )}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="general-modal-footer">
          <Button variant="secondary" onClick={() => setShowAssignModal(false)} disabled={assigning}>
            Cancelar
          </Button>
          <Button
            variant="warning"
            onClick={handleAssignGestor}
            disabled={assigning || !selectedJurisdiction || !selectedGestorId || loadingGestors}
          >
            {assigning ? "Asignando..." : "Asignar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </FadeIn>
  );
}

function Stat({ icon, value, label }) {
  let displayValue;
  if (typeof value === "object" && value !== null) {
    displayValue = "0";
  } else if (typeof value === "number") {
    displayValue = String(value);
  } else if (typeof value === "string") {
    displayValue = value;
  } else {
    displayValue = "0";
  }

  return (
    <div className="col-12 col-lg-4 d-flex flex-row flex-lg-column text-center align-items-center justify-content-between">
      <i className={`col-3 col-lg-12 bi ${icon} text-orange custom-display-1`}></i>
      <p className="col-3 col-lg-12 display-4 m-0">{displayValue}</p>
      <p className="col-3 col-lg-12 m-0">{label}</p>
    </div>
  );
}
