import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Modal, Pagination } from "react-bootstrap";
import { FadeIn } from "../../FadeIn/FadeIn";
import { useAuth } from "../../../context/AuthContext";
import { apiService } from "../../../services/apiService";
import { getCountryFlag, getCountry } from "../../../utils/countries";
import Swal from "sweetalert2";
import "./General.css";
import "./GestorDetalle.css";

const TwemojiFlag = ({ emoji, className = "", size = "22x22" }) => {
  const flagRef = React.useRef(null);
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

const STATUS_OPTIONS = ["", "Pendiente", "En progreso", "Completado", "Rechazado"];
const TYPE_OPTIONS = ["", "Renovación", "Preparación", "Asesoramiento", "Solicitud especial"];

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function GestorDetalle({ user: userProp }) {
  const { user: authUser, forceLogin } = useAuth();
  const user = userProp || authUser;
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterShip, setFilterShip] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ type: "", notes: "" });
  const [detailModal, setDetailModal] = useState(null);
  const [currentRequestPage, setCurrentRequestPage] = useState(1);
  const requestsPerPage = 2;
  const [showSpecialRequestModal, setShowSpecialRequestModal] = useState(false);
  const [fleet, setFleet] = useState([]);
  const [loadingFleet, setLoadingFleet] = useState(false);
  const [specialRequestForm, setSpecialRequestForm] = useState({
    shipId: "",
    body: "",
  });

  const managerId = user?.manager?.managerId || user?.manager?._id;
  const hasGestor = !!managerId;

  useEffect(() => {
    if (!hasGestor) {
      navigate("/dashboard/general", { replace: true });
      return;
    }
    loadRequests();
    loadFleet();
  }, [user?._id, user?.id, managerId, hasGestor]);

  const loadFleet = async () => {
    setLoadingFleet(true);
    try {
      const response = await apiService.getUserFleet();
      if (response.status === "success" && response.payload) {
        setFleet(response.payload);
      } else {
        setFleet([]);
      }
    } catch (err) {
      console.error("Error al cargar flota:", err);
      setFleet([]);
    } finally {
      setLoadingFleet(false);
    }
  };

  const handleOpenSpecialRequestModal = () => {
    setShowSpecialRequestModal(true);
    setSpecialRequestForm({ shipId: "", body: "" });
    loadFleet();
  };

  const handleCloseSpecialRequestModal = () => {
    setShowSpecialRequestModal(false);
    setSpecialRequestForm({ shipId: "", body: "" });
  };

  const handleSpecialRequestSubmit = async () => {
    if (!specialRequestForm.shipId) {
      Swal.fire({
        title: "Error",
        text: "Debes seleccionar un barco",
        icon: "error",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
      return;
    }
    if (!specialRequestForm.body || !specialRequestForm.body.trim()) {
      Swal.fire({
        title: "Error",
        text: "El cuerpo de la solicitud es obligatorio",
        icon: "error",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
      return;
    }

    try {
      const notes = `Solicitud especial: \n\n${specialRequestForm.body.trim()}`;
      const res = await apiService.createShipRequest({
        ship: specialRequestForm.shipId,
        manager: managerId,
        type: ["Solicitud especial"],
        notes: notes,
      });

      if (res.status === "success") {
        Swal.fire({
          title: "Solicitud enviada",
          text: "Tu solicitud especial ha sido enviada a tu gestor",
          icon: "success",
          timer: 2000,
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
        handleCloseSpecialRequestModal();
        loadRequests();
      } else {
        Swal.fire({
          title: "Error",
          text: res.msg || "No se pudo enviar la solicitud",
          icon: "error",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      }
    } catch (e) {
      Swal.fire({
        title: "Error",
        text: e?.message || "Error al enviar la solicitud",
        icon: "error",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    }
  };

  async function loadRequests() {
    const uid = user?._id || user?.id;
    if (!uid) return;
    setLoading(true);
    try {
      const res = await apiService.getShipRequestsByOwner(uid);
      if (res.status === "success" && Array.isArray(res.payload)) {
        const list = res.payload.filter((r) => {
          const mid = r.manager?._id ?? r.manager;
          return String(mid) === String(managerId);
        });
        setRequests(list);
      } else {
        setRequests([]);
      }
    } catch (e) {
      console.error("Error al cargar solicitudes:", e);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredRequests = requests.filter((r) => {
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterType) {
      const requestTypes = Array.isArray(r.type) ? r.type : (r.type ? [r.type] : []);
      if (!requestTypes.some((t) => String(t).trim() === filterType)) return false;
    }
    if (filterShip) {
      const shipId = r.ship?._id || r.ship || "";
      if (String(shipId) !== String(filterShip)) return false;
    }
    return true;
  });

  // Paginación de solicitudes
  useEffect(() => {
    setCurrentRequestPage(1);
  }, [filterStatus, filterType, filterShip, filteredRequests.length]);

  const totalRequestPages = Math.ceil(filteredRequests.length / requestsPerPage);
  const indexOfLastRequest = currentRequestPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  const getRequestPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentRequestPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalRequestPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    return pageNumbers;
  };

  const handleRequestPageChange = (page) => {
    setCurrentRequestPage(page);
  };

  const managerCountryName = getCountry(user?.manager?.address?.country)?.name ?? user?.manager?.address?.country ?? "No definido";
  const managerFlag = getCountryFlag(user?.manager?.address?.country);

  const handleVolver = () => navigate("/dashboard/general");

  const handleDesvincular = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Desvincular gestor?",
      text: "Dejarás de tener asignado a este gestor. Las solicitudes ya realizadas no se eliminan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ffa500",
      cancelButtonText: "Cancelar",
      background: "#082b55",
      color: "#ffffff",
      customClass: {
        confirmButton: "custom-swal-button",
        cancelButton: "custom-swal-button",
      },
    });
    if (!isConfirmed) return;
    setAssigning(true);
    try {
      const res = await apiService.updateMyManager("");
      if (res.status === "success") {
        const profileRes = await apiService.getUserProfile();
        if (profileRes.status === "success" && profileRes.payload?.user) forceLogin(profileRes.payload.user);
        Swal.fire({
          title: "Gestor desvinculado",
          icon: "success",
          timer: 2000,
          background: "#082b55",
          color: "#ffffff",
          customClass: { confirmButton: "custom-swal-button" },
        });
        navigate("/dashboard/general");
      } else {
        Swal.fire({
          title: "Error",
          text: res.msg || "No se pudo desvincular",
          icon: "error",
          background: "#082b55",
          color: "#ffffff",
          customClass: { confirmButton: "custom-swal-button" },
        });
      }
    } catch (e) {
      Swal.fire({
        title: "Error",
        text: e?.message || "Error al desvincular",
        icon: "error",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
    } finally {
      setAssigning(false);
    }
  };

  const openEdit = (req) => {
    setEditModal(req);
    setEditForm({
        type: Array.isArray(req.type) ? req.type.join(", ") : (req.type || ""),
        notes: req.notes || "",
      });
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;
    try {
      const typesArr = editForm.type
        ? editForm.type
            .split(",")
            .map((t) => t.trim())
            .filter((t) => ["Renovación", "Preparación", "Asesoramiento", "Solicitud especial"].includes(t))
        : [];
      const res = await apiService.updateShipRequest(editModal._id, {
        type: typesArr.length ? typesArr : (Array.isArray(editModal.type) ? editModal.type : [editModal.type]),
        notes: editForm.notes.trim() || null,
      });
      if (res.status === "success") {
        setEditModal(null);
        loadRequests();
        Swal.fire({
          title: "Solicitud actualizada",
          icon: "success",
          timer: 1500,
          background: "#082b55",
          color: "#ffffff",
          customClass: { confirmButton: "custom-swal-button" },
        });
      } else {
        Swal.fire({
          title: "Error",
          text: res.msg || "No se pudo actualizar",
          icon: "error",
          background: "#082b55",
          color: "#ffffff",
          customClass: { confirmButton: "custom-swal-button" },
        });
      }
    } catch (e) {
      Swal.fire({
        title: "Error",
        text: e?.message || "Error al actualizar",
        icon: "error",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
    }
  };

  const handleEliminar = async (req) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Eliminar esta solicitud?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonText: "Cancelar",
      background: "#082b55",
      color: "#ffffff",
      customClass: {
        confirmButton: "custom-swal-button",
        cancelButton: "custom-swal-button",
      },
    });
    if (!isConfirmed) return;
    try {
      const res = await apiService.deleteShipRequest(req._id);
      if (res.status === "success") {
        loadRequests();
        Swal.fire({
          title: "Solicitud eliminada",
          icon: "success",
          timer: 1500,
          background: "#082b55",
          color: "#ffffff",
          customClass: { confirmButton: "custom-swal-button" },
        });
      } else {
        Swal.fire({
          title: "Error",
          text: res.msg || "No se pudo eliminar. Solo el administrador puede eliminar solicitudes.",
          icon: "error",
          background: "#082b55",
          color: "#ffffff",
          customClass: { confirmButton: "custom-swal-button" },
        });
      }
    } catch (e) {
      Swal.fire({
        title: "Error",
        text: e?.message || "Error al eliminar",
        icon: "error",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
    }
  };

  const handleCompletado = async (req) => {
    try {
      const res = await apiService.updateShipRequestStatus(req._id, "Completado");
      if (res.status === "success") {
        loadRequests();
        Swal.fire({
          title: "Estado actualizado a Completado",
          icon: "success",
          timer: 1500,
          background: "#082b55",
          color: "#ffffff",
          customClass: { confirmButton: "custom-swal-button" },
        });
      } else {
        Swal.fire({
          title: "Error",
          text: res.msg || "No se pudo actualizar el estado",
          icon: "error",
          background: "#082b55",
          color: "#ffffff",
          customClass: { confirmButton: "custom-swal-button" },
        });
      }
    } catch (e) {
      Swal.fire({
        title: "Error",
        text: e?.message || "Solo el gestor puede marcar como completado.",
        icon: "error",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
    }
  };

  if (!user || !hasGestor) return null;

  return (
    <FadeIn>
      <div className="container d-flex flex-column flex-wrap col-12 col-lg-11 text-white">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <h2 className="mb-0 text-orange">Mi gestor:</h2>
          <Button
            variant="warning"
            className="btn btn-warning"
            onClick={handleOpenSpecialRequestModal}
          >
            <i className="bi bi-plus-circle-fill me-2"></i>Realizar solicitud especial
          </Button>
        </div>
        <div className="col-12"><div className="div-border-color my-4"></div></div>

        {/* Información del gestor */}
        <div className="col-12 d-flex flex-column gap-4">
          <div className="gestor-detalle-card col-12">
            <h4 className="text-orange mb-2">Datos:</h4>
            <div className="text-white row g-2 mb-0 portafolio-detail-row">
              <div className="col-12 col-md-6">
                <span className="text-white-50">Nombre:</span> {user.manager?.firstName ?? "—"}
              </div>
              <div className="col-12 col-md-6">
                <span className="text-white-50">Apellido:</span> {user.manager?.lastName ?? "—"}
              </div>
              <div className="col-12 col-md-6 d-flex align-items-center">
                <span className="text-white-50">País:</span> 
                {managerFlag && <TwemojiFlag emoji={managerFlag} className="mx-1 portafolio-flag-char" size="16x16" />}
                <span>{managerCountryName}</span>
              </div>
              <div className="col-12 col-md-6">
                <span className="text-white-50">Email:</span> {user.manager?.email || "No definido"}
              </div>
              <div className="col-12 col-md-6">
                <span className="text-white-50">Teléfono:</span> {user.manager?.phone || "No definido"}
              </div>
            </div>
            <div className="col-12"><div className="div-border-color my-4"></div></div>
          </div>

          {/* Filtros */}
          <div className="gestor-detalle-filters col-12">
            <h4><i className="bi bi-funnel-fill me-2"></i>Filtros</h4>
            <div className="row g-2">
              <div className="col-12 col-md-4">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-select"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s || "all"} value={s}>{s || "Todos"}</option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-12 col-md-4">
                <Form.Label>Tipo</Form.Label>
                <Form.Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="form-select"
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t || "all"} value={t}>{t || "Todos"}</option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-12 col-md-4">
                <Form.Label>Barco</Form.Label>
                <Form.Select
                  value={filterShip}
                  onChange={(e) => setFilterShip(e.target.value)}
                  className="form-select"
                >
                  <option value="">Todos los barcos</option>
                  {fleet.map((fleetItem) => {
                    const boat = fleetItem.boatId || fleetItem;
                    const boatId = boat?._id || boat || fleetItem._id;
                    const boatName = boat?.name || "Sin nombre";
                    const registrationPort = boat?.registrationPort || "Sin puerto";
                    return (
                      <option key={boatId} value={boatId}>
                        {boatName} ({registrationPort})
                      </option>
                    );
                  })}
                </Form.Select>
              </div>
            </div>
          </div>

          {/* Tarjetas de solicitudes */}
          <div className="col-12">
            <h4 className="text-orange mb-3">Trabajos asignados:</h4>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-warning" role="status" />
                <p className="mt-2 mb-0 text-white">Cargando solicitudes...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="gestor-detalle-empty">
                <i className="bi bi-inbox-fill d-block"></i>
                <p className="mb-0">No hay solicitudes que coincidan con los filtros.</p>
              </div>
            ) : (
              <>
                <div className="flota-certificates-cards">
                  {currentRequests.map((req) => (
                  <div key={req._id} className="flota-certificate-card">
                    <div className="flota-certificate-card-body">
                      <div className="flota-certificate-card-main">
                        <div className="flota-certificate-field">
                          <span className="flota-certificate-label">Tipo</span>
                          <span className="flota-certificate-value">{Array.isArray(req.type) ? req.type.join(", ") : (req.type || "—")}</span>
                        </div>
                        <div className="flota-certificate-field">
                          <span className="flota-certificate-label">Barco</span>
                          <span className="flota-certificate-value">{req.ship?.name ?? req.ship?.registrationNumber ?? "—"}</span>
                        </div>
                        <div className="flota-certificate-field">
                          <span className="flota-certificate-label">Solicitado</span>
                          <span className="flota-certificate-value">{formatDate(req.requestedAt)}</span>
                        </div>
                        <div className="flota-certificate-field">
                          <span className="flota-certificate-label">Estado</span>
                          <span className="flota-certificate-value">
                            <span className={`badge ${
                              req.status === "Completado" ? "bg-success" :
                              req.status === "Rechazado" ? "bg-danger" :
                              req.status === "En progreso" ? "bg-info" : "bg-warning text-dark"
                            }`}>
                              {req.status}
                            </span>
                          </span>
                        </div>
                        {req.notes && (
                          <div className="flota-certificate-field flota-certificate-observations">
                            <span className="flota-certificate-label">Notas</span>
                            <span className="flota-certificate-value">{req.notes}</span>
                          </div>
                        )}
                      </div>
                      <div className="flota-certificate-card-actions">
                        <a href="#" className="action-link" onClick={(e) => { e.preventDefault(); openEdit(req); }} title="Modificar">
                          <i className="bi bi-pencil-fill me-1"></i>
                          Modificar
                        </a>
                        <a href="#" className="action-link" onClick={(e) => { e.preventDefault(); setDetailModal(req); }} title="Ver detalle">
                          <i className="bi bi-person-badge-fill me-1"></i>
                          Gestor
                        </a>
                        {req.status !== "Completado" && req.status !== "Rechazado" && (
                          <a href="#" className="action-link text-success" onClick={(e) => { e.preventDefault(); handleCompletado(req); }} title="Marcar como completado">
                            <i className="bi bi-check-circle-fill me-1"></i>
                            Completado
                          </a>
                        )}
                        <a href="#" className="action-link action-link-danger" onClick={(e) => { e.preventDefault(); handleEliminar(req); }} title="Eliminar">
                          <i className="bi bi-trash-fill me-1"></i>
                          Eliminar
                        </a>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
                {/* Paginación solicitudes (siempre visible) */}
                {!loading && (
                  <div className="d-flex flex-column align-items-center mt-4 flota-certificates-pagination">
                    <Pagination className="mb-0">
                      <Pagination.First
                        onClick={() => handleRequestPageChange(1)}
                        disabled={currentRequestPage === 1 || totalRequestPages === 0}
                        className="custom-pagination-item"
                      />
                      <Pagination.Prev
                        onClick={() => handleRequestPageChange(currentRequestPage - 1)}
                        disabled={currentRequestPage === 1 || totalRequestPages === 0}
                        className="custom-pagination-item"
                      />
                      {totalRequestPages > 0 ? (
                        getRequestPageNumbers().map((number) => (
                          <Pagination.Item
                            key={number}
                            active={number === currentRequestPage}
                            onClick={() => handleRequestPageChange(number)}
                            className="custom-pagination-item"
                          >
                            {number}
                          </Pagination.Item>
                        ))
                      ) : (
                        <Pagination.Item active disabled className="custom-pagination-item">
                          1
                        </Pagination.Item>
                      )}
                      <Pagination.Next
                        onClick={() => handleRequestPageChange(currentRequestPage + 1)}
                        disabled={currentRequestPage === totalRequestPages || totalRequestPages === 0}
                        className="custom-pagination-item"
                      />
                      <Pagination.Last
                        onClick={() => handleRequestPageChange(totalRequestPages || 1)}
                        disabled={currentRequestPage === (totalRequestPages || 1) || totalRequestPages === 0}
                        className="custom-pagination-item"
                      />
                    </Pagination>
                    <div className="text-white mt-2">
                      Página {currentRequestPage} de {totalRequestPages || 1} ({filteredRequests.length} solicitudes)
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Botones inferiores */}
        <div className="gestor-detalle-buttons col-12 d-flex justify-content-end gap-2">
          <Button variant="outline-danger" onClick={handleDesvincular} disabled={assigning}>
            {assigning ? "..." : "Desvincular"}
          </Button>
          <Button variant="outline" className="btn-outline-orange" onClick={handleVolver}>
            <i className="bi bi-arrow-left-circle-fill me-1"></i>Volver
          </Button>
        </div>
      </div>

      {/* Modal Modificar */}
      <Modal show={!!editModal} onHide={() => setEditModal(null)} centered className="general-modal-dark" contentClassName="general-modal-content">
        <Modal.Header closeButton className="general-modal-header">
          <Modal.Title className="text-orange">Modificar solicitud</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-white">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tipo</Form.Label>
              <Form.Control
                value={editForm.type}
                onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))}
                className="flota-form-control"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Notas</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={editForm.notes}
                onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                className="flota-form-control"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="general-modal-footer">
          <Button variant="secondary" onClick={() => setEditModal(null)}>Cancelar</Button>
          <Button variant="warning" onClick={handleSaveEdit}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Ver detalle (Gestor) - muestra datos del gestor asignado a esta solicitud */}
      <Modal show={!!detailModal} onHide={() => setDetailModal(null)} centered className="general-modal-dark" contentClassName="general-modal-content">
        <Modal.Header closeButton className="general-modal-header">
          <Modal.Title className="text-orange">Detalle de la solicitud</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-white">
          {detailModal && (
            <div className="general-gestor-detail">
              <p className="mb-2"><strong>Tipo:</strong> {detailModal.type || "—"}</p>
              <p className="mb-2"><strong>Barco:</strong> {detailModal.ship?.name ?? detailModal.ship?.registrationNumber ?? "—"}</p>
              <p className="mb-2"><strong>Estado:</strong> {detailModal.status}</p>
              <p className="mb-2"><strong>Solicitado:</strong> {formatDate(detailModal.requestedAt)}</p>
              <p className="mb-2"><strong>Notas:</strong> {detailModal.notes || "—"}</p>
              <p className="mb-0"><strong>Gestor asignado:</strong> {detailModal.manager?.firstName ?? "—"} {detailModal.manager?.lastName ?? "—"} ({detailModal.manager?.email ?? "—"})</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="general-modal-footer">
          <Button variant="secondary" onClick={() => setDetailModal(null)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Solicitud Especial */}
      <Modal show={showSpecialRequestModal} onHide={handleCloseSpecialRequestModal} centered className="general-modal-dark" contentClassName="general-modal-content">
        <Modal.Header closeButton className="general-modal-header">
          <Modal.Title className="text-orange">Realizar solicitud especial</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-white">
          <p className="mb-4 text-muted">
            Esta opción es para realizar solicitudes no previstas por la plataforma. Completa el formulario y tu gestor recibirá la solicitud.
          </p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Barco</Form.Label>
              {loadingFleet ? (
                <div className="text-center py-2">
                  <div className="spinner-border spinner-border-sm text-warning" role="status" />
                  <span className="ms-2">Cargando barcos...</span>
                </div>
              ) : (
                <Form.Select
                  value={specialRequestForm.shipId}
                  onChange={(e) => setSpecialRequestForm((f) => ({ ...f, shipId: e.target.value }))}
                  className="flota-form-control"
                  required
                >
                  <option value="">Selecciona un barco</option>
                  {fleet.map((fleetItem) => {
                    const boat = fleetItem.boatId || fleetItem;
                    const boatId = boat?._id || boat || fleetItem._id;
                    const boatName = boat?.name || "Sin nombre";
                    const registrationPort = boat?.registrationPort || "Sin puerto";
                    return (
                      <option key={boatId} value={boatId}>
                        {boatName} ({registrationPort})
                      </option>
                    );
                  })}
                </Form.Select>
              )}
            </Form.Group>
            <Form.Group>
              <Form.Label>Cuerpo</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={specialRequestForm.body}
                onChange={(e) => setSpecialRequestForm((f) => ({ ...f, body: e.target.value }))}
                className="flota-form-control"
                placeholder="Describe tu solicitud en detalle..."
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="general-modal-footer">
          <Button variant="secondary" onClick={handleCloseSpecialRequestModal}>Cancelar</Button>
          <Button variant="warning" onClick={handleSpecialRequestSubmit} disabled={loadingFleet}>
            Enviar
          </Button>
        </Modal.Footer>
      </Modal>
    </FadeIn>
  );
}
