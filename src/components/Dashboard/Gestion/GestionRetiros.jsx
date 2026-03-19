import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pagination } from "react-bootstrap";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { apiService } from "../../../services/apiService";

import "./Gestion.css";

const WITHDRAWALS_PAGE_LIMIT = 10;
const PAYOUT_METHOD_OPTIONS = [
  "MERCADO PAGO",
  "BROU",
  "SCOTIABANK",
  "PREX",
  "OCA BLUE",
  "CITI",
  "ITAU",
  "HSBC",
  "BHU",
  "SANTANDER",
  "HERITAGE",
  "BANDES",
  "BBVA",
  "NACION ARGENTINA",
  "MIDINERO",
];

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(amount, currency = "USD") {
  const num = Number(amount);
  if (!Number.isFinite(num)) return "—";
  const cur = currency || "USD";
  return `${cur} ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getStatusBadgeVariant(status) {
  const map = {
    pending: "warning",
    processing: "info",
    completed: "success",
    rejected: "danger",
    expired: "secondary",
  };
  return map[status] || "secondary";
}

function getPayoutSummary(withdrawal) {
  const details = withdrawal?.payoutDetails || {};
  const bank = details.bank || withdrawal?.payoutMethod || "";
  const type = details.type ? String(details.type).replace("FINTECH", "FINTECH / billetera electrónica") : "";
  const number = details.number ? String(details.number) : "";
  return [bank || "—", number ? `Cuenta ${number}` : "", type || ""].filter(Boolean).join(" | ");
}

export function GestionRetiros() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);

  const [filters, setFilters] = useState({
    status: "",
    userEmail: "",
    userId: "",
    payoutMethod: "",
  });
  const [filtersApplied, setFiltersApplied] = useState({});

  const retirosListRef = useRef(null);

  useEffect(() => {
    loadWithdrawals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filtersApplied]);

  // Aplicar filtros "en vivo" mientras se escribe (con debounce para no spamear el backend)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFiltersApplied({ ...filters });
      setPage(1);
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [filters]);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);

      const params = { page, limit: WITHDRAWALS_PAGE_LIMIT };
      if (filtersApplied.status?.trim()) params.status = filtersApplied.status.trim();
      if (filtersApplied.userEmail?.trim()) params.userEmail = filtersApplied.userEmail.trim();
      if (filtersApplied.userId?.trim()) params.userId = filtersApplied.userId.trim();
      if (filtersApplied.payoutMethod?.trim()) params.payoutMethod = filtersApplied.payoutMethod.trim();

      const response = await apiService.getAdminWithdrawals(params);
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
      console.error("Error al cargar withdrawals:", error);
      setDocs([]);
      setTotalPages(0);
      setTotalDocs(0);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los retiros",
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

  const clearFilters = () => {
    setFilters({ status: "", userEmail: "", userId: "", payoutMethod: "" });
    setFiltersApplied({});
    setPage(1);
  };

  const effectiveTotalPages = useMemo(() => Math.max(1, totalPages), [totalPages]);

  const handlePageChange = (p) => {
    const next = Math.max(1, Math.min(p, effectiveTotalPages));
    setPage(next);
    retirosListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const getPageNumbers = () => {
    const max = 5;
    let start = Math.max(1, page - Math.floor(max / 2));
    let end = Math.min(effectiveTotalPages, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  };

  return (
    <div className="gestion-withdrawals-container">
      <h4 className="text-orange mb-3">
        <i className="bi bi-cash-coin me-2" />
        Gestión de retiros
      </h4>

      <div className="portafolio-filters col-12 mb-4">
        <h4 className="text-orange">
          <i className="bi bi-funnel-fill me-2" />
          Filtros:
        </h4>
        <div className="row g-2 portafolio-modal-filters">
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 portafolio-modal-filter-item">
            <label className="portafolio-modal-filter-label">Email usuario</label>
            <input
              type="text"
              className="form-control portafolio-input form-control-sm"
              value={filters.userEmail}
              onChange={(e) => handleFilterChange("userEmail", e.target.value)}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 portafolio-modal-filter-item">
            <label className="portafolio-modal-filter-label">User ID</label>
            <input
              type="text"
              className="form-control portafolio-input form-control-sm"
              value={filters.userId}
              onChange={(e) => handleFilterChange("userId", e.target.value)}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 portafolio-modal-filter-item">
            <label className="portafolio-modal-filter-label">Estado</label>
            <select
              className="form-select portafolio-input form-control-sm"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">Todos</option>
              <option value="pending">pending</option>
              <option value="processing">processing</option>
              <option value="completed">completed</option>
              <option value="rejected">rejected</option>
              <option value="expired">expired</option>
            </select>
          </div>
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 portafolio-modal-filter-item">
            <label className="portafolio-modal-filter-label">Método</label>
            <select
              className="form-select portafolio-input form-control-sm"
              value={filters.payoutMethod}
              onChange={(e) => handleFilterChange("payoutMethod", e.target.value)}
            >
              <option value="">Todos</option>
              {PAYOUT_METHOD_OPTIONS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="d-flex flex-wrap align-items-center justify-content-lg-end gap-2 mt-3 flota-filters-actions">
          <button type="button" className="btn btn-outline-orange btn-sm" onClick={clearFilters}>
            <i className="bi bi-funnel me-1"></i>Limpiar filtros
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-white py-4">
          <div className="spinner-border text-orange" role="status" />
          <p className="mt-2 mb-0">Cargando retiros...</p>
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center text-white p-4">
          <i className="bi bi-inbox-fill text-orange" style={{ fontSize: "4rem" }}></i>
          <p className="mt-3 mb-0">No se encontraron retiros para los filtros seleccionados.</p>
        </div>
      ) : (
        <>
          <div className="withdrawals-cards-container" ref={retirosListRef}>
            {docs.map((w) => {
              const currency = w?.currency || "USD";
              const isResolved = ["completed", "rejected", "expired"].includes(w?.status);
              return (
                <div key={w._id} className="withdrawal-card">
                  <div className="withdrawal-card-header">
                    <span className={`badge bg-${getStatusBadgeVariant(w.status)}`}>
                      {w.status}
                    </span>
                    <span className="text-white-50 small">{formatDate(w.createdAt)}</span>
                  </div>

                  <div className="withdrawal-card-body">
                    <p className="mb-2">
                      <strong>Monto:</strong> {formatMoney(w.amount, currency)}
                    </p>
                    <p className="mb-2">
                      <strong>Usuario:</strong> {w.user?.email || "—"}
                    </p>
                    <p className="mb-2">
                      <strong>Destino:</strong> {getPayoutSummary(w)}
                    </p>
                    <p className="mb-0">
                      <strong>Expira:</strong> {formatDate(w.expiresAt)}
                    </p>
                  </div>

                  <div className="withdrawal-card-footer d-flex gap-2 flex-wrap">
                    {!isResolved && w.processToken ? (
                      <Link
                        to={`/admin/withdrawals/process?token=${encodeURIComponent(w.processToken)}`}
                        className="btn btn-outline-orange btn-sm"
                      >
                        <i className="bi bi-receipt-cutoff me-1" />
                        Procesar
                      </Link>
                    ) : (
                      <button type="button" className="btn btn-outline-secondary btn-sm" disabled>
                        Procesado
                      </button>
                    )}

                    {w.proofUrl ? (
                      <a
                        href={w.proofUrl.startsWith("http") ? w.proofUrl : `/api${w.proofUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-warning btn-sm"
                      >
                        <i className="bi bi-eye me-1" />
                        Comprobante
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <Pagination className="justify-content-center mb-0">
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={page === 1 || totalPages === 0}
                className="custom-pagination-item"
              />
              <Pagination.Prev
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || totalPages === 0}
                className="custom-pagination-item"
              />

              {getPageNumbers().length > 0 ? (
                getPageNumbers().map((num) => (
                  <Pagination.Item
                    key={num}
                    active={num === page}
                    onClick={() => handlePageChange(num)}
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
                onClick={() => handlePageChange(page + 1)}
                disabled={page === effectiveTotalPages || totalPages === 0}
                className="custom-pagination-item"
              />
              <Pagination.Last
                onClick={() => handlePageChange(totalPages || 1)}
                disabled={page === (totalPages || 1) || totalPages === 0}
                className="custom-pagination-item"
              />
            </Pagination>

            <div className="text-white mt-2 text-center">
              Página {page} de {effectiveTotalPages} ({totalDocs} retiros)
            </div>
          </div>
        </>
      )}
    </div>
  );
}

