import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Form, Button } from "react-bootstrap";
import { FadeIn } from "../../FadeIn/FadeIn";
import { useAuth } from "../../../context/AuthContext";
import { apiService } from "../../../services/apiService";
import { getCountryFlag, getCountry, getJurisdictions } from "../../../utils/countries";
import { getRankByApprovedCourses } from "../../../utils/ranks";
import "./General.css";

const jurisdictions = getJurisdictions();
const PARTIAL_AVG_MIN = 60;
const FINAL_TEST_MIN = 70;

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
  const statistics = user.statistics || {};
  const eventsAttended = Array.isArray(statistics.eventsAttended) ? statistics.eventsAttended : [];

  // Para "Continúa donde quedaste": último curso al que se accedió (lastAccessedAt) o, si no existe, el último asignado/inscrito (dateEnrolled más reciente)
  const continueCourse = (() => {
    if (purchasedCourses.length === 0) return null;
    const withDates = purchasedCourses
      .map((c) => ({
        course: c,
        lastAccessed: c.lastAccessedAt ? new Date(c.lastAccessedAt).getTime() : null,
        dateEnrolled: c.dateEnrolled ? new Date(c.dateEnrolled).getTime() : 0,
      }))
      .filter((x) => x.dateEnrolled > 0 || x.lastAccessed != null);
    if (withDates.length === 0) return purchasedCourses[0] || null;
    withDates.sort((a, b) => {
      const aVal = a.lastAccessed ?? a.dateEnrolled;
      const bVal = b.lastAccessed ?? b.dateEnrolled;
      return bVal - aVal;
    });
    return withDates[0].course;
  })();

  const getCourseProgress = (course) => {
    const modules = Array.isArray(course?.modulesCompleted) ? course.modulesCompleted : [];
    const totalLessons = modules.reduce(
      (acc, module) => acc + (module.lessons?.length || 0),
      0
    );
    const completedLessons = modules.reduce(
      (acc, module) =>
        acc + (module.lessons?.filter((lesson) => lesson.completed).length || 0),
      0
    );
    const totalItems = totalLessons + 1;
    const completedItems = completedLessons + (course?.finalTestLastScore != null ? 1 : 0);
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const progress = continueCourse ? getCourseProgress(continueCourse) : 0;

  /** True solo si el curso está aprobado (100% progreso + promedio parciales >= 60% y prueba final >= 70%). */
  const isCourseApproved = (course) => {
    if (getCourseProgress(course) < 100) return false;
    const modules = Array.isArray(course?.modulesCompleted) ? course.modulesCompleted : [];
    const partialModules = modules.filter((m) => String(m?.moduleId) !== "final");
    const scoresOnly = partialModules
      .map((m) => m?.lastTestScore ?? null)
      .filter((s) => s != null && typeof s === "number");
    const avgPartial =
      scoresOnly.length > 0
        ? Math.round((scoresOnly.reduce((a, b) => a + b, 0) / scoresOnly.length) * 10) / 10
        : null;
    const finalScore = course?.finalTestLastScore ?? null;
    return (
      avgPartial != null &&
      finalScore != null &&
      avgPartial >= PARTIAL_AVG_MIN &&
      finalScore >= FINAL_TEST_MIN
    );
  };

  const approvedCount = purchasedCourses.filter(isCourseApproved).length;
  const currentRank = getRankByApprovedCourses(approvedCount);
  const purchasedCount = purchasedCourses.filter((c) => getCourseProgress(c) < 100).length;

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
          <div className="d-flex justify-content-between"><p>Estado:</p><strong className="text-end">{Array.isArray(user.category) && user.category.length > 0 ? user.category.join(", ") : "Estudiante"}</strong></div>
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
              <img className="img-fluid rounded-circle" src={currentRank.imagePath} alt={currentRank.title} />
            </div>
            <div>
              <h4><i className="bi bi-trophy-fill"></i> {currentRank.title}</h4>
              <h6 className="fst-italic text-justify">{currentRank.description}</h6>
              <p>
                Tienes <strong>{purchasedCount}</strong> cursos activos y <strong>{approvedCount}</strong> cursos aprobados.
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
            <Stat icon="bi-award-fill" value={statistics.certificatesQuantity ?? 0} label="Certificados obtenidos" />
          </div>
          <div className="div-border-color my-4"></div>
        </div>

        {/* Continúa donde quedaste: último curso accedido o último asignado/inscrito */}
        <div className="text-white dashboard-item-build-general col-12">
          <h3 className="mb-3 text-orange">¡Continúa donde quedaste!</h3>
          {continueCourse ? (
            <div className="d-flex flex-column flex-lg-row gap-4 px-2 align-items-center justify-content-between container">
              <div className="course-image">
                <img className="img-fluid" src={continueCourse.bannerUrl} alt={continueCourse.courseName} />
              </div>
              <div className="col-12 col-lg-6 text-center text-lg-start">
                <h2>{continueCourse.courseName}</h2>
                <p className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2">
                  <i className="bi bi-bar-chart-fill"></i> Progreso: {progress}%
                </p>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              <Link to={`/course/${continueCourse.courseId}/learn`} className="btn btn-warning col-6 col-lg-2">
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
