import React, { useState, useEffect } from "react";
import { Table, Pagination } from "react-bootstrap";
import { apiService } from "../../../services/apiService";
import Swal from "sweetalert2";
import "./Gestion.css";

export function GestionPagos() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);
  const limit = 10;

  const [filters, setFilters] = useState({
    paymentId: "",
    courseId: "",
    courseName: "",
    userEmail: "",
    userId: "",
    paymentStatus: "",
    currency: "",
  });
  const [filtersApplied, setFiltersApplied] = useState({});

  useEffect(() => {
    loadPayments();
  }, [page, filtersApplied]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (filtersApplied.paymentId?.trim()) params.paymentId = filtersApplied.paymentId.trim();
      if (filtersApplied.courseId?.trim()) params.courseId = filtersApplied.courseId.trim();
      if (filtersApplied.courseName?.trim()) params.courseName = filtersApplied.courseName.trim();
      if (filtersApplied.userEmail?.trim()) params.userEmail = filtersApplied.userEmail.trim();
      if (filtersApplied.userId?.trim()) params.userId = filtersApplied.userId.trim();
      if (filtersApplied.paymentStatus?.trim()) params.paymentStatus = filtersApplied.paymentStatus.trim();
      if (filtersApplied.currency?.trim()) params.currency = filtersApplied.currency.trim();

      const response = await apiService.getProcessedPayments(params);
      if (response.status === "success" && response.payload) {
        setDocs(response.payload.docs || []);
        setTotalPages(response.payload.totalPages || 0);
        setTotalDocs(response.payload.totalDocs || 0);
      } else {
        setDocs([]);
        setTotalPages(0);
        setTotalDocs(0);
        if (response.msg && response.status === "error") {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.msg,
            confirmButtonText: "Aceptar",
            background: "#082b55",
            color: "#ffffff",
            customClass: { confirmButton: "custom-swal-button" },
          });
        }
      }
    } catch (error) {
      console.error("Error al cargar pagos procesados:", error);
      setDocs([]);
      setTotalPages(0);
      setTotalDocs(0);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los pagos procesados",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFiltersApplied({ ...filters });
    setPage(1);
  };

  const handleCopyPaymentId = async (paymentId) => {
    if (!paymentId) return;
    try {
      await navigator.clipboard.writeText(paymentId);
      Swal.fire({
        icon: "success",
        title: "Copiado",
        text: "ID Pago copiado al portapapeles",
        timer: 1500,
        showConfirmButton: false,
        background: "#082b55",
        color: "#ffffff",
      });
    } catch (error) {
      console.error("Error al copiar:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo copiar el ID Pago",
        background: "#082b55",
        color: "#ffffff",
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      paymentId: "",
      courseId: "",
      courseName: "",
      userEmail: "",
      userId: "",
      paymentStatus: "",
      currency: "",
    });
    setFiltersApplied({});
    setPage(1);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "—" : d.toLocaleString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const formatAmount = (amount, currency) => {
    if (amount == null) return "—";
    const sym = { USD: "$", UYU: "$U", EUR: "€", ARS: "$" }[currency] || currency;
    return `${sym} ${Number(amount).toLocaleString()}`;
  };

  const getStatusBadge = (status) => {
    const map = { approved: "success", pending: "warning", rejected: "danger", cancelled: "secondary", refunded: "info" };
    const c = map[status] || "secondary";
    return <span className={`badge bg-${c}`}>{status || "—"}</span>;
  };

  const handlePageChange = (p) => {
    setPage(p);
  };

  const getPageNumbers = () => {
    const max = 5;
    let start = Math.max(1, page - Math.floor(max / 2));
    let end = Math.min(totalPages, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  };

  return (
    <div className="gestion-pagos-container">
      <h4 className="text-orange mb-3"><i className="bi bi-credit-card-2-front-fill me-2"></i>Pagos procesados</h4>

      <div className="portafolio-filters col-12 mb-4">
        <h4 className="text-orange"><i className="bi bi-funnel-fill me-2"></i>Filtros</h4>
        <div className="row g-2 portafolio-modal-filters">
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 portafolio-modal-filter-item">
            <label className="portafolio-modal-filter-label">ID Pago</label>
            <input type="text" className="form-control portafolio-input form-control-sm" value={filters.paymentId} onChange={(e) => handleFilterChange("paymentId", e.target.value)} placeholder="Mercado Pago ID" />
          </div>
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 portafolio-modal-filter-item">
            <label className="portafolio-modal-filter-label">ID Curso</label>
            <input type="text" className="form-control portafolio-input form-control-sm" value={filters.courseId} onChange={(e) => handleFilterChange("courseId", e.target.value)} />
          </div>
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 portafolio-modal-filter-item">
            <label className="portafolio-modal-filter-label">Nombre curso</label>
            <input type="text" className="form-control portafolio-input form-control-sm" value={filters.courseName} onChange={(e) => handleFilterChange("courseName", e.target.value)} />
          </div>
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 portafolio-modal-filter-item">
            <label className="portafolio-modal-filter-label">Email usuario</label>
            <input type="text" className="form-control portafolio-input form-control-sm" value={filters.userEmail} onChange={(e) => handleFilterChange("userEmail", e.target.value)} />
          </div>
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 portafolio-modal-filter-item">
            <label className="portafolio-modal-filter-label">ID Usuario</label>
            <input type="text" className="form-control portafolio-input form-control-sm" value={filters.userId} onChange={(e) => handleFilterChange("userId", e.target.value)} />
          </div>
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 portafolio-modal-filter-item">
            <label className="portafolio-modal-filter-label">Estado pago</label>
            <select className="form-select portafolio-input form-control-sm" value={filters.paymentStatus} onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}>
              <option value="">Todos</option>
              <option value="approved">Aprobado</option>
              <option value="pending">Pendiente</option>
              <option value="rejected">Rechazado</option>
              <option value="cancelled">Cancelado</option>
              <option value="refunded">Reembolsado</option>
            </select>
          </div>
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 portafolio-modal-filter-item">
            <label className="portafolio-modal-filter-label">Moneda</label>
            <input type="text" className="form-control portafolio-input form-control-sm" value={filters.currency} onChange={(e) => handleFilterChange("currency", e.target.value)} placeholder="USD, UYU..." />
          </div>
        </div>
        <div className="d-flex flex-wrap align-items-center justify-content-lg-end gap-2 mt-3">
          <button type="button" className="btn btn-outline-orange btn-sm" onClick={applyFilters}>
            <i className="bi bi-search me-1"></i>Filtrar
          </button>
          <button type="button" className="btn btn-outline-orange btn-sm" onClick={clearFilters}>
            <i className="bi bi-funnel me-1"></i>Limpiar filtros
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-white py-5">
          <div className="spinner-border text-warning" role="status" />
          <p className="mt-2 mb-0">Cargando pagos...</p>
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center text-white py-5">
          <i className="bi bi-credit-card-2-back-fill text-orange" style={{ fontSize: "4rem" }}></i>
          <p className="mt-3">No hay pagos procesados que coincidan con los filtros.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <Table striped bordered hover variant="dark" className="table-dark">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Curso</th>
                  <th>Usuario</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th title="¿Ya lo tenía comprado?">Comprado</th>
                  <th>Procesado</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((pay) => (
                  <tr key={pay._id || pay.paymentId}>
                    <td>
                      <span className="d-inline-flex align-items-center gap-1">
                        {pay.paymentId ? (
                          <i
                            className="bi bi-clipboard-fill cursor-pointer text-orange"
                            title={pay.paymentId || "—"}
                            onClick={() => handleCopyPaymentId(pay.paymentId)}
                            style={{ cursor: "pointer", fontSize: "1rem" }}
                            role="button"
                            aria-label="Copiar ID Pago"
                          />
                        ) : null}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong>{pay.courseName || "—"}</strong>
                        <br /><small className="text-white-50">{pay.courseId}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        {pay.userFirstName} {pay.userLastName}
                        <br /><small className="text-white-50">{pay.userEmail}</small>
                        {pay.userId?._id ? (
                          <>
                            <br /><small className="text-white-50">{pay.userId._id}</small>
                          </>
                        ) : null}
                      </div>
                    </td>
                    <td>{formatAmount(pay.transactionAmount, pay.currency)}</td>
                    <td>{getStatusBadge(pay.paymentStatus)}</td>
                    <td>{pay.alreadyPurchased ? <span className="badge bg-info">Sí</span> : <span className="badge bg-secondary">No</span>}</td>
                    <td><small>{formatDate(pay.processedAt)}</small></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="d-flex justify-content-center align-items-center mt-4 flex-wrap gap-2">
            <Pagination className="mb-0">
              <Pagination.First onClick={() => handlePageChange(1)} disabled={page === 1 || totalPages === 0} className="custom-pagination-item" />
              <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1 || totalPages === 0} className="custom-pagination-item" />
              {(getPageNumbers().length ? getPageNumbers() : [1]).map((n) => (
                <Pagination.Item key={n} active={n === page} onClick={() => handlePageChange(n)} className="custom-pagination-item">{n}</Pagination.Item>
              ))}
              <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages || totalPages === 0} className="custom-pagination-item" />
              <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={page === totalPages || totalPages === 0} className="custom-pagination-item" />
            </Pagination>
            <span className="text-white ms-2 small">Página {page} de {totalPages || 1} ({totalDocs} registros)</span>
          </div>
        </>
      )}
    </div>
  );
}
