import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Form, Modal } from "react-bootstrap";
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
  const [assigning, setAssigning] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ type: "", notes: "" });
  const [detailModal, setDetailModal] = useState(null);

  const managerId = user?.manager?.managerId || user?.manager?._id;
  const hasGestor = !!managerId;

  useEffect(() => {
    if (!hasGestor) {
      navigate("/dashboard/general", { replace: true });
      return;
    }
    loadRequests();
  }, [user?._id, user?.id, managerId, hasGestor]);

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
    if (filterType && !(r.type || "").toLowerCase().includes(filterType.toLowerCase())) return false;
    return true;
  });

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
    });
    if (!isConfirmed) return;
    setAssigning(true);
    try {
      const res = await apiService.updateMyManager("");
      if (res.status === "success") {
        const profileRes = await apiService.getUserProfile();
        if (profileRes.status === "success" && profileRes.payload?.user) forceLogin(profileRes.payload.user);
        Swal.fire({ title: "Gestor desvinculado", icon: "success", timer: 2000 });
        navigate("/dashboard/general");
      } else {
        Swal.fire({ title: "Error", text: res.msg || "No se pudo desvincular", icon: "error" });
      }
    } catch (e) {
      Swal.fire({ title: "Error", text: e?.message || "Error al desvincular", icon: "error" });
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
            .filter((t) => ["Renovación", "Preparación", "Asesoramiento"].includes(t))
        : [];
      const res = await apiService.updateShipRequest(editModal._id, {
        type: typesArr.length ? typesArr : (Array.isArray(editModal.type) ? editModal.type : [editModal.type]),
        notes: editForm.notes.trim() || null,
      });
      if (res.status === "success") {
        setEditModal(null);
        loadRequests();
        Swal.fire({ title: "Solicitud actualizada", icon: "success", timer: 1500 });
      } else {
        Swal.fire({ title: "Error", text: res.msg || "No se pudo actualizar", icon: "error" });
      }
    } catch (e) {
      Swal.fire({ title: "Error", text: e?.message || "Error al actualizar", icon: "error" });
    }
  };

  const handleEliminar = async (req) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Eliminar esta solicitud?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonText: "Cancelar",
    });
    if (!isConfirmed) return;
    try {
      const res = await apiService.deleteShipRequest(req._id);
      if (res.status === "success") {
        loadRequests();
        Swal.fire({ title: "Solicitud eliminada", icon: "success", timer: 1500 });
      } else {
        Swal.fire({ title: "Error", text: res.msg || "No se pudo eliminar. Solo el administrador puede eliminar solicitudes.", icon: "error" });
      }
    } catch (e) {
      Swal.fire({ title: "Error", text: e?.message || "Error al eliminar", icon: "error" });
    }
  };

  const handleCompletado = async (req) => {
    try {
      const res = await apiService.updateShipRequestStatus(req._id, "Completado");
      if (res.status === "success") {
        loadRequests();
        Swal.fire({ title: "Estado actualizado a Completado", icon: "success", timer: 1500 });
      } else {
        Swal.fire({ title: "Error", text: res.msg || "No se pudo actualizar el estado", icon: "error" });
      }
    } catch (e) {
      Swal.fire({ title: "Error", text: e?.message || "Solo el gestor puede marcar como completado.", icon: "error" });
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
            onClick={() => Swal.fire({ title: "Próximamente", text: "Realizar solicitud especial estará disponible pronto.", icon: "info" })}
          >
            <i className="bi bi-plus-circle-fill me-2"></i>Realizar solicitud especial
          </Button>
        </div>
        <div className="col-12"><div className="div-border-color my-4"></div></div>

        {/* Información del gestor */}
        <div className="gestor-detalle-card col-12">
          <h3><i className="bi bi-person-badge-fill me-2"></i>Datos del gestor</h3>
          <div className="gestor-detalle-info">
            <p><strong>Nombre:</strong> {user.manager?.firstName ?? "—"} {user.manager?.lastName ?? "—"}</p>
            <p className="d-flex align-items-center gap-2">
              <strong>País:</strong>
              {managerFlag && <TwemojiFlag emoji={managerFlag} size="22x22" />}
              <span>{managerCountryName}</span>
            </p>
            <p><strong>Teléfono:</strong> {user.manager?.phone || "No definido"}</p>
            <p><strong>Email:</strong> {user.manager?.email || "No definido"}</p>
          </div>
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
              <Form.Control
                type="text"
                placeholder="Filtrar por tipo"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tabla de solicitudes */}
        <div className="gestor-detalle-table-wrap col-12">
          <h4 className="text-orange mb-3"><i className="bi bi-card-list-fill me-2"></i>Trabajos asignados a tu gestor</h4>
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
            <div className="table-responsive">
              <Table striped bordered hover variant="dark" className="table-dark">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Barco</th>
                    <th>Solicitado</th>
                    <th>Estado</th>
                    <th>Notas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => (
                    <tr key={req._id}>
                      <td>{Array.isArray(req.type) ? req.type.join(", ") : (req.type || "—")}</td>
                      <td>{req.ship?.name ?? req.ship?.registrationNumber ?? "—"}</td>
                      <td>{formatDate(req.requestedAt)}</td>
                      <td>
                        <span className={`badge ${
                          req.status === "Completado" ? "bg-success" :
                          req.status === "Rechazado" ? "bg-danger" :
                          req.status === "En progreso" ? "bg-info" : "bg-warning text-dark"
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td>{(req.notes || "").slice(0, 40)}{(req.notes && req.notes.length > 40) ? "…" : ""}</td>
                      <td>
                        <div className="gestor-detalle-actions">
                          <a href="#" className="action-link" onClick={(e) => { e.preventDefault(); openEdit(req); }} title="Modificar">
                            <i className="bi bi-pencil-fill me-1"></i>Modificar
                          </a>
                          <a href="#" className="action-link action-link-danger" onClick={(e) => { e.preventDefault(); handleEliminar(req); }} title="Eliminar">
                            <i className="bi bi-trash-fill me-1"></i>Eliminar
                          </a>
                          {req.status !== "Completado" && req.status !== "Rechazado" && (
                            <a href="#" className="action-link" onClick={(e) => { e.preventDefault(); handleCompletado(req); }} title="Marcar como completado">
                              <i className="bi bi-check-circle-fill me-1"></i>Completado
                            </a>
                          )}
                          <a href="#" className="action-link" onClick={(e) => { e.preventDefault(); setDetailModal(req); }} title="Ver detalle">
                            <i className="bi bi-person-badge-fill me-1"></i>Gestor
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
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
    </FadeIn>
  );
}
