import React, { useState, useEffect, useRef } from "react";
import { Table, Pagination } from "react-bootstrap";
import Swal from "sweetalert2";
import { FadeIn } from "../../FadeIn/FadeIn";
import { apiService } from "../../../services/apiService";
import { countries, getCountry } from "../../../utils/countries";
import "../Gestion/Gestion.css";
import "./Portafolio.css";

const TwemojiFlag = ({ emoji, className = "", size = "22x22" }) => {
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

const boatImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http") || img.startsWith("/")) return img;
  return `/api${img.startsWith("/") ? "" : "/"}${img}`;
};

/** Devuelve { label, soonExpiry } para la columna Estado. soonExpiry = true si está vigente y vence en menos de 3 meses. */
function getCertificateEstado(cert) {
  const status = cert.status?.toLowerCase();
  if (status === "anulado") return { label: "Anulado", soonExpiry: false };
  const expDate = cert.expirationDate ? new Date(cert.expirationDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!expDate) return { label: "—", soonExpiry: false };
  const exp = new Date(expDate);
  exp.setHours(0, 0, 0, 0);
  if (exp < today || status === "vencido") {
    return { label: "Vencido", soonExpiry: false };
  }
  const threeMonthsFromNow = new Date(today);
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  const expiresWithinThreeMonths = exp <= threeMonthsFromNow;
  return { label: "Vigente", soonExpiry: expiresWithinThreeMonths };
}

const MODAL_PAGE_SIZE = 5;
const BOATS_PER_PAGE = 4;

export function Portafolio({ user }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCountry, setFilterCountry] = useState("");
  const [filterFirstName, setFilterFirstName] = useState("");
  const [filterLastName, setFilterLastName] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearchInput, setCountrySearchInput] = useState("");
  const countryDropdownRef = useRef(null);

  const [selectedClient, setSelectedClient] = useState(null);
  const [clientBoats, setClientBoats] = useState([]);
  const [boatsLoading, setBoatsLoading] = useState(false);
  const [boatFilterName, setBoatFilterName] = useState("");
  const [boatFilterRegistro, setBoatFilterRegistro] = useState("");
  const [boatFilterBandera, setBoatFilterBandera] = useState("");
  const [boatFilterPuerto, setBoatFilterPuerto] = useState("");
  const [boatFilterTipo, setBoatFilterTipo] = useState("");
  const [boatFilterDisplacement, setBoatFilterDisplacement] = useState("");
  const [certificatesModal, setCertificatesModal] = useState({ open: false, boatId: null, boatName: "" });
  const [certificatesList, setCertificatesList] = useState([]);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [pendientesModal, setPendientesModal] = useState({ open: false, boatId: null, boatName: "" });
  const [pendientesList, setPendientesList] = useState([]);
  const [pendientesLoading, setPendientesLoading] = useState(false);
  const [pendientesUpdatingId, setPendientesUpdatingId] = useState(null);
  const [historialModal, setHistorialModal] = useState({ open: false, boatId: null, boatName: "" });
  const [historialList, setHistorialList] = useState([]);
  const [historialLoading, setHistorialLoading] = useState(false);
  const [certPage, setCertPage] = useState(1);
  const [pendientesPage, setPendientesPage] = useState(1);
  const [historialPage, setHistorialPage] = useState(1);
  const [certFilterTipo, setCertFilterTipo] = useState("");
  const [certFilterNumero, setCertFilterNumero] = useState("");
  const [certFilterEmisionDesde, setCertFilterEmisionDesde] = useState("");
  const [certFilterEmisionHasta, setCertFilterEmisionHasta] = useState("");
  const [certFilterVencimientoDesde, setCertFilterVencimientoDesde] = useState("");
  const [certFilterVencimientoHasta, setCertFilterVencimientoHasta] = useState("");
  const [certFilterEstado, setCertFilterEstado] = useState("");
  const [pendientesFilterEstado, setPendientesFilterEstado] = useState("");
  const [pendientesFilterTipos, setPendientesFilterTipos] = useState("");
  const [pendientesFilterNotas, setPendientesFilterNotas] = useState("");
  const [pendientesFilterFechaDesde, setPendientesFilterFechaDesde] = useState("");
  const [pendientesFilterFechaHasta, setPendientesFilterFechaHasta] = useState("");
  const [historialFilterEstado, setHistorialFilterEstado] = useState("");
  const [historialFilterTipos, setHistorialFilterTipos] = useState("");
  const [historialFilterNotas, setHistorialFilterNotas] = useState("");
  const [historialFilterMotivo, setHistorialFilterMotivo] = useState("");
  const [historialFilterSolicitadoDesde, setHistorialFilterSolicitadoDesde] = useState("");
  const [historialFilterSolicitadoHasta, setHistorialFilterSolicitadoHasta] = useState("");
  const [historialFilterCierreDesde, setHistorialFilterCierreDesde] = useState("");
  const [historialFilterCierreHasta, setHistorialFilterCierreHasta] = useState("");
  const [boatPage, setBoatPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiService.getGestorClients();
        if (res.status === "success" && Array.isArray(res.payload)) {
          setClients(res.payload);
        } else {
          setClients([]);
        }
      } catch (e) {
        console.error("Error al cargar clientes:", e);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!selectedClient?._id) {
      setClientBoats([]);
      return;
    }
    let cancelled = false;
    setBoatsLoading(true);
    apiService
      .getBoatsByOwner(selectedClient._id)
      .then((res) => {
        if (!cancelled && res.status === "success" && Array.isArray(res.payload)) {
          setClientBoats(res.payload);
        } else if (!cancelled) {
          setClientBoats([]);
        }
      })
      .catch(() => {
        if (!cancelled) setClientBoats([]);
      })
      .finally(() => {
        if (!cancelled) setBoatsLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedClient?._id]);

  const openCertificates = async (boatId, boatName) => {
    setCertificatesModal({ open: true, boatId, boatName });
    setCertificatesList([]);
    setCertificatesLoading(true);
    setCertPage(1);
    setCertFilterTipo(""); setCertFilterNumero(""); setCertFilterEmisionDesde(""); setCertFilterEmisionHasta("");
    setCertFilterVencimientoDesde(""); setCertFilterVencimientoHasta(""); setCertFilterEstado("");
    try {
      const res = await apiService.getCertificatesByBoat(boatId);
      if (res.status === "success" && Array.isArray(res.payload)) {
        setCertificatesList(res.payload);
      } else {
        setCertificatesList([]);
      }
    } catch {
      setCertificatesList([]);
    } finally {
      setCertificatesLoading(false);
    }
  };

  const closeCertificatesModal = () => {
    setCertificatesModal({ open: false, boatId: null, boatName: "" });
    setCertificatesList([]);
  };

  const openPendientes = async (boatId, boatName) => {
    setPendientesModal({ open: true, boatId, boatName });
    setPendientesList([]);
    setPendientesLoading(true);
    setPendientesPage(1);
    setPendientesFilterEstado(""); setPendientesFilterTipos(""); setPendientesFilterNotas("");
    setPendientesFilterFechaDesde(""); setPendientesFilterFechaHasta("");
    try {
      const res = await apiService.getShipRequestsByShip(boatId);
      const all = (res.status === "success" && Array.isArray(res.payload)) ? res.payload : [];
      const pending = all.filter((r) => r.status !== "Completado" && r.status !== "Rechazado");
      setPendientesList(pending);
    } catch {
      setPendientesList([]);
    } finally {
      setPendientesLoading(false);
    }
  };

  const closePendientesModal = () => {
    setPendientesModal({ open: false, boatId: null, boatName: "" });
    setPendientesList([]);
  };

  const refreshPendientesList = async () => {
    if (!pendientesModal.boatId) return;
    try {
      const res = await apiService.getShipRequestsByShip(pendientesModal.boatId);
      const all = (res.status === "success" && Array.isArray(res.payload)) ? res.payload : [];
      const pending = all.filter((r) => r.status !== "Completado" && r.status !== "Rechazado");
      setPendientesList(pending);
    } catch {
      setPendientesList([]);
    }
  };

  const swalStyling = {
    background: "#082b55",
    color: "#ffffff",
    customClass: { confirmButton: "custom-swal-button" },
  };

  const handlePendienteStatus = async (req, newStatus, rejectionReason = null) => {
    setPendientesUpdatingId(req._id);
    try {
      const res = await apiService.updateShipRequestStatus(req._id, newStatus, rejectionReason);
      if (res.status === "success") {
        Swal.fire({
          title: `Estado actualizado a ${newStatus}`,
          icon: "success",
          timer: 2000,
          ...swalStyling,
        });
        await refreshPendientesList();
      } else {
        Swal.fire({
          title: "Error",
          text: res.msg || "No se pudo actualizar el estado",
          icon: "error",
          ...swalStyling,
        });
      }
    } catch (e) {
      Swal.fire({
        title: "Error",
        text: e?.message || "Error de conexión",
        icon: "error",
        ...swalStyling,
      });
    } finally {
      setPendientesUpdatingId(null);
    }
  };

  const handleRechazadoClick = (req) => {
    Swal.fire({
      title: "Motivo del rechazo",
      input: "textarea",
      inputLabel: "Indique el motivo que se enviará al cliente por email",
      inputPlaceholder: "Escriba el motivo...",
      inputAttributes: { "aria-label": "Motivo del rechazo", rows: 4 },
      showCancelButton: true,
      confirmButtonText: "Rechazar y enviar email",
      cancelButtonText: "Cancelar",
      background: "#082b55",
      color: "#ffffff",
      customClass: {
        confirmButton: "custom-swal-button",
        cancelButton: "custom-swal-button",
        popup: "portafolio-swal-popup",
        input: "portafolio-swal-input",
      },
      inputValidator: (value) => {
        if (!value || !String(value).trim()) return "El motivo es obligatorio.";
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        handlePendienteStatus(req, "Rechazado", result.value.trim());
      }
    });
  };

  const openHistorial = async (boatId, boatName) => {
    setHistorialModal({ open: true, boatId, boatName });
    setHistorialList([]);
    setHistorialLoading(true);
    setHistorialPage(1);
    setHistorialFilterEstado(""); setHistorialFilterTipos(""); setHistorialFilterNotas(""); setHistorialFilterMotivo("");
    setHistorialFilterSolicitadoDesde(""); setHistorialFilterSolicitadoHasta("");
    setHistorialFilterCierreDesde(""); setHistorialFilterCierreHasta("");
    try {
      const res = await apiService.getShipRequestsByShip(boatId);
      const all = (res.status === "success" && Array.isArray(res.payload)) ? res.payload : [];
      setHistorialList(all);
    } catch {
      setHistorialList([]);
    } finally {
      setHistorialLoading(false);
    }
  };

  const closeHistorialModal = () => {
    setHistorialModal({ open: false, boatId: null, boatName: "" });
    setHistorialList([]);
  };

  const badgeClassForStatus = (status) => {
    if (status === "Completado") return "bg-success";
    if (status === "Rechazado") return "bg-danger";
    if (status === "En progreso") return "bg-info";
    return "bg-warning text-dark";
  };

  const activeBoats = clientBoats.filter((b) => b.isActive !== false);
  const filteredBoats = activeBoats.filter((b) => {
    const name = (b.name || "").toLowerCase();
    const reg = (b.registrationNumber || "").toLowerCase();
    const country = (b.registrationCountry || "").toLowerCase();
    const port = (b.registrationPort || "").toLowerCase();
    const tipo = (b.boatType || "").toLowerCase();
    const displacementStr = String(b.displacement ?? "").toLowerCase();
    if (boatFilterName.trim() && !name.includes(boatFilterName.trim().toLowerCase())) return false;
    if (boatFilterRegistro.trim() && !reg.includes(boatFilterRegistro.trim().toLowerCase())) return false;
    if (boatFilterBandera.trim() && !country.includes(boatFilterBandera.trim().toLowerCase())) return false;
    if (boatFilterPuerto.trim() && !port.includes(boatFilterPuerto.trim().toLowerCase())) return false;
    if (boatFilterTipo.trim() && !tipo.includes(boatFilterTipo.trim().toLowerCase())) return false;
    if (boatFilterDisplacement.trim() && !displacementStr.includes(boatFilterDisplacement.trim().toLowerCase())) return false;
    return true;
  });

  const totalBoatPages = Math.ceil(filteredBoats.length / BOATS_PER_PAGE);
  const indexOfLastBoat = boatPage * BOATS_PER_PAGE;
  const indexOfFirstBoat = indexOfLastBoat - BOATS_PER_PAGE;
  const currentBoats = filteredBoats.slice(indexOfFirstBoat, indexOfLastBoat);

  const getBoatPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, boatPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalBoatPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    return pageNumbers;
  };

  const handleBoatPageChange = (page) => {
    setBoatPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setBoatPage(1);
  }, [boatFilterName, boatFilterRegistro, boatFilterBandera, boatFilterPuerto, boatFilterTipo, boatFilterDisplacement]);

  useEffect(() => {
    if (selectedClient) setBoatPage(1);
  }, [selectedClient]);

  const filteredClients = clients.filter((c) => {
    if (filterCountry) {
      const clientCountryCode = getCountry(c.address?.country)?.code;
      if (clientCountryCode !== filterCountry) return false;
    }
    if (filterFirstName.trim()) {
      const first = (c.firstName || "").toLowerCase();
      if (!first.includes(filterFirstName.trim().toLowerCase())) return false;
    }
    if (filterLastName.trim()) {
      const last = (c.lastName || "").toLowerCase();
      if (!last.includes(filterLastName.trim().toLowerCase())) return false;
    }
    return true;
  });

  const filteredCountries = countries.filter(
    (co) =>
      co.name.toLowerCase().includes(countrySearchInput.toLowerCase()) ||
      co.code.toLowerCase().includes(countrySearchInput.toLowerCase())
  );

  const selectedCountry = filterCountry ? countries.find((c) => c.code === filterCountry) : null;

  if (!user) return null;

  if (selectedClient) {
    const countryClient = getCountry(selectedClient.address?.country);
    return (
      <FadeIn>
        <div className="container d-flex justify-content-evenly align-items-between flex-wrap col-12 col-lg-11">
          <div className="col-12">
            <h2 className="mb-3 text-orange">Cliente:</h2>
            <div className="div-border-color my-4"></div>
          </div>
          <div className="col-12 d-flex flex-column gap-4">
            <div className="col-12">
              <h4 className="text-orange mb-2">Datos:</h4>
              <div className="text-white row g-2 mb-0 portafolio-detail-row">
                <div className="col-12 col-md-6"><span className="text-white-50">Nombre:</span> {selectedClient.firstName || "—"}</div>
                <div className="col-12 col-md-6"><span className="text-white-50">Apellido:</span> {selectedClient.lastName || "—"}</div>
                <div className="col-12 col-md-6 d-flex align-items-center"><span className="text-white-50">País:</span> {countryClient ? <><TwemojiFlag emoji={countryClient.flag} className="mx-1 portafolio-flag-char align-items-center" size="16x16" />{countryClient.name}</> : (selectedClient.address?.country || "—")}</div>
                <div className="col-12 col-md-6"><span className="text-white-50">Email:</span> {selectedClient.email || "—"}</div>
                <div className="col-12 col-md-6"><span className="text-white-50">Teléfono:</span> {selectedClient.phone || "—"}</div>
              </div>
              <div className="col-12"><div className="div-border-color my-4"></div></div>
            </div>

            <div className="portafolio-filters col-12">
              <h4 className="text-orange"><i className="bi bi-funnel-fill me-2"></i>Filtros:</h4>
              <div className="row g-2 portafolio-modal-filters">
                <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                  <label className="portafolio-modal-filter-label">Nombre</label>
                  <input type="text" className="form-control portafolio-input form-control-sm" value={boatFilterName} onChange={(e) => setBoatFilterName(e.target.value)} />
                </div>
                <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                  <label className="portafolio-modal-filter-label">Registro</label>
                  <input type="text" className="form-control portafolio-input form-control-sm" value={boatFilterRegistro} onChange={(e) => setBoatFilterRegistro(e.target.value)} />
                </div>
                <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                  <label className="portafolio-modal-filter-label">Bandera</label>
                  <input type="text" className="form-control portafolio-input form-control-sm" value={boatFilterBandera} onChange={(e) => setBoatFilterBandera(e.target.value)} />
                </div>
                <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                  <label className="portafolio-modal-filter-label">Puerto</label>
                  <input type="text" className="form-control portafolio-input form-control-sm" value={boatFilterPuerto} onChange={(e) => setBoatFilterPuerto(e.target.value)} />
                </div>
                <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                  <label className="portafolio-modal-filter-label">Tipo</label>
                  <input type="text" className="form-control portafolio-input form-control-sm" value={boatFilterTipo} onChange={(e) => setBoatFilterTipo(e.target.value)} />
                </div>
                <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                  <label className="portafolio-modal-filter-label">Desplazamiento</label>
                  <input type="number" className="form-control portafolio-input form-control-sm" value={boatFilterDisplacement} onChange={(e) => setBoatFilterDisplacement(e.target.value)} min={0} step={1} />
                </div>
              </div>
            </div>

            <div className="col-12">
              <h4 className="text-orange mb-4">Flota:</h4>
              {boatsLoading ? (
                <div className="text-center py-4"><div className="spinner-border text-warning" role="status" /><p className="mt-2 mb-0 small">Cargando barcos...</p></div>
              ) : filteredBoats.length === 0 ? (
                <div className="text-center py-4 text-white-50">No hay barcos activos que coincidan con los filtros.</div>
              ) : (
                <>
                  <div className="row g-3">
                    {currentBoats.map((boat) => (
                      <div key={boat._id} className="col-12 col-lg-6">
                        <div className="boat-card-minimal">
                          <div className="boat-card-image">
                            {boat.image ? (
                              <img src={boatImageUrl(boat.image)} alt={boat.name || ""} />
                            ) : (
                              <div className="d-flex align-items-center justify-content-center w-100 h-100 text-white-50"><i className="bi bi-image" style={{ fontSize: "3rem" }}></i></div>
                            )}
                          </div>
                          <div className="boat-card-content">
                            <h5 className="text-orange mb-2">{boat.name || "—"}</h5>
                            <div className="boat-card-details">
                              <div className="row g-2">
                                <div className="col-6">
                                  <p className="mb-1">
                                    <i className="bi bi-tag-fill me-1 text-orange"></i>
                                    <small><strong>Registro:</strong> {boat.registrationNumber || "—"}</small>
                                  </p>
                                </div>
                                <div className="col-6">
                                  <p className="mb-1">
                                    <i className="bi bi-flag-fill me-1 text-orange"></i>
                                    <small><strong>Bandera:</strong> {boat.registrationCountry ? (getCountry(boat.registrationCountry) ? getCountry(boat.registrationCountry).name : boat.registrationCountry) : "—"}</small>
                                  </p>
                                </div>
                                <div className="col-6">
                                  <p className="mb-1">
                                    <i className="bi bi-geo-alt-fill me-1 text-orange"></i>
                                    <small><strong>Puerto:</strong> {boat.registrationPort || "—"}</small>
                                  </p>
                                </div>
                                <div className="col-6">
                                  <p className="mb-1">
                                    <i className="bi bi-gear-fill me-1 text-orange"></i>
                                    <small><strong>Tipo:</strong> {boat.boatType || "—"}</small>
                                  </p>
                                </div>
                                <div className="col-6">
                                  <p className="mb-1">
                                    <i className="bi bi-speedometer me-1 text-orange"></i>
                                    <small><strong>Desplazamiento:</strong> {boat.displacement != null && boat.displacement !== "" ? `${boat.displacement} Tons.` : "—"}</small>
                                  </p>
                                </div>
                                <div className="col-6">
                                  <p className="mb-1">
                                    <i className="bi bi-geo-alt-fill me-1 text-orange"></i>
                                    <small><strong>Ubicación:</strong> {boat.currentPort || "—"}</small>
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="boat-card-actions mt-3 d-flex flex-column gap-2">
                              <a href="#" className="btn btn-sm btn-warning text-dark text-decoration-none" onClick={(e) => { e.preventDefault(); openCertificates(boat._id, boat.name); }}>
                                <i className="bi bi-award-fill me-2"></i>Certificados
                              </a>
                              <a href="#" className="btn btn-sm btn-outline-warning text-warning text-decoration-none" onClick={(e) => { e.preventDefault(); openPendientes(boat._id, boat.name); }}>
                                <i className="bi bi-clock-history me-2"></i>Pendientes
                              </a>
                              <a href="#" className="btn btn-sm btn-outline-warning text-warning text-decoration-none" onClick={(e) => { e.preventDefault(); openHistorial(boat._id, boat.name); }}>
                                <i className="bi bi-journal-text me-2"></i>Historial
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex flex-column align-items-center mt-4">
                    <Pagination className="mb-0">
                      <Pagination.First
                        onClick={() => handleBoatPageChange(1)}
                        disabled={boatPage === 1 || totalBoatPages === 0}
                        className="custom-pagination-item"
                      />
                      <Pagination.Prev
                        onClick={() => handleBoatPageChange(boatPage - 1)}
                        disabled={boatPage === 1 || totalBoatPages === 0}
                        className="custom-pagination-item"
                      />
                      {totalBoatPages > 0 ? (
                        getBoatPageNumbers().map((number) => (
                          <Pagination.Item
                            key={number}
                            active={number === boatPage}
                            onClick={() => handleBoatPageChange(number)}
                            className="custom-pagination-item"
                          >
                            {number}
                          </Pagination.Item>
                        ))
                      ) : (
                        <Pagination.Item active disabled className="custom-pagination-item">1</Pagination.Item>
                      )}
                      <Pagination.Next
                        onClick={() => handleBoatPageChange(boatPage + 1)}
                        disabled={boatPage === totalBoatPages || totalBoatPages === 0}
                        className="custom-pagination-item"
                      />
                      <Pagination.Last
                        onClick={() => handleBoatPageChange(totalBoatPages || 1)}
                        disabled={boatPage === (totalBoatPages || 1) || totalBoatPages === 0}
                        className="custom-pagination-item"
                      />
                    </Pagination>
                    <div className="text-white mt-2 small">
                      Página {boatPage} de {totalBoatPages || 1} ({filteredBoats.length} barcos)
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {certificatesModal.open && (
            <div className="portafolio-modal-overlay" onClick={closeCertificatesModal}>
              <div className="portafolio-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="d-flex justify-content-between align-items-center mb-3 portafolio-modal-header">
                  <h5 className="text-orange mb-0 portafolio-modal-title">Certificados — {certificatesModal.boatName || "Barco"}</h5>
                  <button type="button" className="btn-close btn-close-white flex-shrink-0" aria-label="Cerrar" onClick={closeCertificatesModal}></button>
                </div>
                {certificatesLoading ? (
                  <div className="text-center py-4"><div className="spinner-border text-warning" role="status" /></div>
                ) : certificatesList.length === 0 ? (
                  <p className="text-white-50 mb-0">No hay certificados registrados para este barco.</p>
                ) : (
                  <>
                    {(() => {
                      const filteredCerts = certificatesList.filter((cert) => {
                        const tipo = (cert.certificateType || "").toLowerCase();
                        const num = (cert.number || "").toLowerCase();
                        if (certFilterTipo.trim() && !tipo.includes(certFilterTipo.trim().toLowerCase())) return false;
                        if (certFilterNumero.trim() && !num.includes(certFilterNumero.trim().toLowerCase())) return false;
                        if (certFilterEmisionDesde) {
                          const d = cert.issueDate ? new Date(cert.issueDate) : null;
                          if (!d || d < new Date(certFilterEmisionDesde + "T00:00:00")) return false;
                        }
                        if (certFilterEmisionHasta) {
                          const d = cert.issueDate ? new Date(cert.issueDate) : null;
                          if (!d || d > new Date(certFilterEmisionHasta + "T23:59:59")) return false;
                        }
                        if (certFilterVencimientoDesde) {
                          const d = cert.expirationDate ? new Date(cert.expirationDate) : null;
                          if (!d || d < new Date(certFilterVencimientoDesde + "T00:00:00")) return false;
                        }
                        if (certFilterVencimientoHasta) {
                          const d = cert.expirationDate ? new Date(cert.expirationDate) : null;
                          if (!d || d > new Date(certFilterVencimientoHasta + "T23:59:59")) return false;
                        }
                        if (certFilterEstado) {
                          const estado = getCertificateEstado(cert).label;
                          if (estado !== certFilterEstado) return false;
                        }
                        return true;
                      });
                      const totalPages = Math.max(1, Math.ceil(filteredCerts.length / MODAL_PAGE_SIZE));
                      const page = Math.min(certPage, totalPages);
                      const paginated = filteredCerts.slice((page - 1) * MODAL_PAGE_SIZE, page * MODAL_PAGE_SIZE);
                      return (
                        <>
                          {filteredCerts.length === 0 && (certFilterTipo || certFilterNumero || certFilterEmisionDesde || certFilterEmisionHasta || certFilterVencimientoDesde || certFilterVencimientoHasta || certFilterEstado) ? (
                            <p className="text-white-50 mb-2 small">Ningún certificado coincide con los filtros.</p>
                          ) : null}
                          <div className="portafolio-modal-filters mb-3">
                            <div className="row g-2">
                              <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                                <label className="portafolio-modal-filter-label">Tipo</label>
                                <input type="text" className="form-control form-control-sm portafolio-input" value={certFilterTipo} onChange={(e) => { setCertFilterTipo(e.target.value); setCertPage(1); }} />
                              </div>
                              <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                                <label className="portafolio-modal-filter-label">Número</label>
                                <input type="text" className="form-control form-control-sm portafolio-input" value={certFilterNumero} onChange={(e) => { setCertFilterNumero(e.target.value); setCertPage(1); }} />
                              </div>
                              <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                                <label className="portafolio-modal-filter-label">Emisión desde</label>
                                <input type="date" className="form-control form-control-sm portafolio-input" value={certFilterEmisionDesde} onChange={(e) => { setCertFilterEmisionDesde(e.target.value); setCertPage(1); }} />
                              </div>
                              <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                                <label className="portafolio-modal-filter-label">Emisión hasta</label>
                                <input type="date" className="form-control form-control-sm portafolio-input" value={certFilterEmisionHasta} onChange={(e) => { setCertFilterEmisionHasta(e.target.value); setCertPage(1); }} />
                              </div>
                              <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                                <label className="portafolio-modal-filter-label">Vencimiento desde</label>
                                <input type="date" className="form-control form-control-sm portafolio-input" value={certFilterVencimientoDesde} onChange={(e) => { setCertFilterVencimientoDesde(e.target.value); setCertPage(1); }} />
                              </div>
                              <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                                <label className="portafolio-modal-filter-label">Vencimiento hasta</label>
                                <input type="date" className="form-control form-control-sm portafolio-input" value={certFilterVencimientoHasta} onChange={(e) => { setCertFilterVencimientoHasta(e.target.value); setCertPage(1); }} />
                              </div>
                              <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                                <label className="portafolio-modal-filter-label">Estado</label>
                                <select className="form-select form-select-sm portafolio-input" value={certFilterEstado} onChange={(e) => { setCertFilterEstado(e.target.value); setCertPage(1); }}>
                                  <option value="">Todos los estados</option>
                                  <option value="Vigente">Vigente</option>
                                  <option value="Vencido">Vencido</option>
                                  <option value="Anulado">Anulado</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="table-responsive portafolio-table-wrap">
                            <Table striped bordered hover variant="dark" className="table-dark table-sm">
                              <thead><tr><th>Tipo</th><th>Número</th><th>Emisión</th><th>Vencimiento</th><th>Estado</th></tr></thead>
                              <tbody>
                                {paginated.map((cert) => {
                                  const estado = getCertificateEstado(cert);
                                  return (
                                    <tr key={cert._id}>
                                      <td>{cert.certificateType || "—"}</td>
                                      <td>{cert.number || "—"}</td>
                                      <td>{cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : "—"}</td>
                                      <td>{cert.expirationDate ? new Date(cert.expirationDate).toLocaleDateString() : "—"}</td>
                                      <td>
                                        <span
                                          className={estado.label === "Vencido" || estado.label === "Anulado" ? "text-danger" : estado.soonExpiry ? "text-warning" : "text-success"}
                                          title={estado.soonExpiry ? "Vence en menos de 3 meses" : undefined}
                                        >
                                          {estado.label}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </Table>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2 portafolio-modal-pagination">
                            <span className="text-white-50 small">Página {page} de {totalPages}</span>
                            <Pagination className="mb-0">
                              <Pagination.Item className="custom-pagination-item" disabled={page <= 1} onClick={(e) => { e.preventDefault(); if (page > 1) setCertPage(page - 1); }} style={{ cursor: page > 1 ? "pointer" : undefined }}>Anterior</Pagination.Item>
                              <Pagination.Item className="custom-pagination-item" disabled={page >= totalPages} onClick={(e) => { e.preventDefault(); if (page < totalPages) setCertPage(page + 1); }} style={{ cursor: page < totalPages ? "pointer" : undefined }}>Siguiente</Pagination.Item>
                            </Pagination>
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          )}

          {pendientesModal.open && (
            <div className="portafolio-modal-overlay" onClick={closePendientesModal}>
              <div className="portafolio-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="d-flex justify-content-between align-items-center mb-3 portafolio-modal-header">
                  <h5 className="text-orange mb-0 portafolio-modal-title">Pendientes — {pendientesModal.boatName || "Barco"}</h5>
                  <button type="button" className="btn-close btn-close-white flex-shrink-0" aria-label="Cerrar" onClick={closePendientesModal}></button>
                </div>
                {pendientesLoading ? (
                  <div className="text-center py-4"><div className="spinner-border text-warning" role="status" /></div>
                ) : pendientesList.length === 0 ? (
                  <p className="text-white-50 mb-0">No hay solicitudes pendientes para este barco.</p>
                ) : (
                  (() => {
                    const filteredPend = pendientesList.filter((req) => {
                      if (pendientesFilterEstado && req.status !== pendientesFilterEstado) return false;
                      const tiposStr = Array.isArray(req.type) ? req.type.join(" ") : (req.type || "");
                      if (pendientesFilterTipos.trim() && !tiposStr.toLowerCase().includes(pendientesFilterTipos.trim().toLowerCase())) return false;
                      if (pendientesFilterNotas.trim() && !(req.notes || "").toLowerCase().includes(pendientesFilterNotas.trim().toLowerCase())) return false;
                      const reqDate = req.requestedAt ? new Date(req.requestedAt) : null;
                      if (pendientesFilterFechaDesde && (!reqDate || reqDate < new Date(pendientesFilterFechaDesde + "T00:00:00"))) return false;
                      if (pendientesFilterFechaHasta && (!reqDate || reqDate > new Date(pendientesFilterFechaHasta + "T23:59:59"))) return false;
                      return true;
                    });
                    const totalPages = Math.max(1, Math.ceil(filteredPend.length / MODAL_PAGE_SIZE));
                    const page = Math.min(pendientesPage, totalPages);
                    const paginated = filteredPend.slice((page - 1) * MODAL_PAGE_SIZE, page * MODAL_PAGE_SIZE);
                    return (
                      <>
                        {filteredPend.length === 0 && (pendientesFilterEstado || pendientesFilterTipos || pendientesFilterNotas || pendientesFilterFechaDesde || pendientesFilterFechaHasta) ? (
                          <p className="text-white-50 mb-2 small">Ninguna solicitud coincide con los filtros.</p>
                        ) : null}
                        <div className="portafolio-modal-filters mb-3">
                          <div className="row g-2">
                            <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                              <label className="portafolio-modal-filter-label">Estado</label>
                              <select className="form-select form-select-sm portafolio-input" value={pendientesFilterEstado} onChange={(e) => { setPendientesFilterEstado(e.target.value); setPendientesPage(1); }}>
                                <option value="">Todos</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="En progreso">En progreso</option>
                              </select>
                            </div>
                            <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                              <label className="portafolio-modal-filter-label">Tipos</label>
                              <input type="text" className="form-control form-control-sm portafolio-input" value={pendientesFilterTipos} onChange={(e) => { setPendientesFilterTipos(e.target.value); setPendientesPage(1); }} />
                            </div>
                            <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                              <label className="portafolio-modal-filter-label">Notas</label>
                              <input type="text" className="form-control form-control-sm portafolio-input" value={pendientesFilterNotas} onChange={(e) => { setPendientesFilterNotas(e.target.value); setPendientesPage(1); }} />
                            </div>
                            <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                              <label className="portafolio-modal-filter-label">Fecha desde</label>
                              <input type="date" className="form-control form-control-sm portafolio-input" value={pendientesFilterFechaDesde} onChange={(e) => { setPendientesFilterFechaDesde(e.target.value); setPendientesPage(1); }} />
                            </div>
                            <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                              <label className="portafolio-modal-filter-label">Fecha hasta</label>
                              <input type="date" className="form-control form-control-sm portafolio-input" value={pendientesFilterFechaHasta} onChange={(e) => { setPendientesFilterFechaHasta(e.target.value); setPendientesPage(1); }} />
                            </div>
                          </div>
                        </div>
                        <div className="table-responsive portafolio-table-wrap">
                          <Table striped bordered hover variant="dark" className="table-dark table-sm">
                            <thead><tr><th>Estado</th><th>Tipos</th><th>Notas</th><th>Fecha</th><th>Acciones</th></tr></thead>
                            <tbody>
                              {paginated.map((req) => (
                                <tr key={req._id}>
                                  <td><span className={`badge ${req.status === "En progreso" ? "bg-info" : "bg-warning text-dark"}`}>{req.status}</span></td>
                                  <td>{Array.isArray(req.type) ? req.type.join(", ") : (req.type || "—")}</td>
                                  <td>{req.notes || "—"}</td>
                                  <td>{req.requestedAt ? new Date(req.requestedAt).toLocaleDateString() : "—"}</td>
                                  <td>
                                    <div className={`portafolio-actions-cell ${pendientesUpdatingId === req._id ? "portafolio-actions-disabled" : ""}`}>
                                      <a href="#" className="action-link" onClick={(e) => { e.preventDefault(); if (pendientesUpdatingId !== req._id) handlePendienteStatus(req, "En progreso"); }} title="En progreso"><i className="bi bi-play-circle-fill me-1"></i>En progreso</a>
                                      <a href="#" className="action-link text-success" onClick={(e) => { e.preventDefault(); if (pendientesUpdatingId !== req._id) handlePendienteStatus(req, "Completado"); }} title="Completado"><i className="bi bi-check-circle-fill me-1"></i>Completado</a>
                                      <a href="#" className="action-link action-link-danger" onClick={(e) => { e.preventDefault(); if (pendientesUpdatingId !== req._id) handleRechazadoClick(req); }} title="Rechazado"><i className="bi bi-x-circle-fill me-1"></i>Rechazado</a>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2 portafolio-modal-pagination">
                          <span className="text-white-50 small">Página {page} de {totalPages}</span>
                          <Pagination className="mb-0">
                            <Pagination.Item className="custom-pagination-item" disabled={page <= 1} onClick={(e) => { e.preventDefault(); if (page > 1) setPendientesPage(page - 1); }} style={{ cursor: page > 1 ? "pointer" : undefined }}>Anterior</Pagination.Item>
                            <Pagination.Item className="custom-pagination-item" disabled={page >= totalPages} onClick={(e) => { e.preventDefault(); if (page < totalPages) setPendientesPage(page + 1); }} style={{ cursor: page < totalPages ? "pointer" : undefined }}>Siguiente</Pagination.Item>
                          </Pagination>
                        </div>
                      </>
                    );
                  })()
                )}
              </div>
            </div>
          )}

          {historialModal.open && (
            <div className="portafolio-modal-overlay" onClick={closeHistorialModal}>
              <div className="portafolio-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="d-flex justify-content-between align-items-center mb-3 portafolio-modal-header">
                  <h5 className="text-orange mb-0 portafolio-modal-title">Historial — {historialModal.boatName || "Barco"}</h5>
                  <button type="button" className="btn-close btn-close-white flex-shrink-0" aria-label="Cerrar" onClick={closeHistorialModal}></button>
                </div>
                {historialLoading ? (
                  <div className="text-center py-4"><div className="spinner-border text-warning" role="status" /></div>
                ) : historialList.length === 0 ? (
                  <p className="text-white-50 mb-0">No hay trabajos registrados para este barco.</p>
                ) : (
                  (() => {
                    const filteredHist = historialList.filter((req) => {
                      if (historialFilterEstado && req.status !== historialFilterEstado) return false;
                      const tiposStr = Array.isArray(req.type) ? req.type.join(" ") : (req.type || "");
                      if (historialFilterTipos.trim() && !tiposStr.toLowerCase().includes(historialFilterTipos.trim().toLowerCase())) return false;
                      if (historialFilterNotas.trim() && !(req.notes || "").toLowerCase().includes(historialFilterNotas.trim().toLowerCase())) return false;
                      if (historialFilterMotivo.trim() && !(req.rejectionReason || "").toLowerCase().includes(historialFilterMotivo.trim().toLowerCase())) return false;
                      const reqDate = req.requestedAt ? new Date(req.requestedAt) : null;
                      if (historialFilterSolicitadoDesde && (!reqDate || reqDate < new Date(historialFilterSolicitadoDesde + "T00:00:00"))) return false;
                      if (historialFilterSolicitadoHasta && (!reqDate || reqDate > new Date(historialFilterSolicitadoHasta + "T23:59:59"))) return false;
                      const closeDate = req.completedAt ? new Date(req.completedAt) : null;
                      if (historialFilterCierreDesde && (!closeDate || closeDate < new Date(historialFilterCierreDesde + "T00:00:00"))) return false;
                      if (historialFilterCierreHasta && (!closeDate || closeDate > new Date(historialFilterCierreHasta + "T23:59:59"))) return false;
                      return true;
                    });
                    const totalPages = Math.max(1, Math.ceil(filteredHist.length / MODAL_PAGE_SIZE));
                    const page = Math.min(historialPage, totalPages);
                    const paginated = filteredHist.slice((page - 1) * MODAL_PAGE_SIZE, page * MODAL_PAGE_SIZE);
                    return (
                      <>
                        {filteredHist.length === 0 && (historialFilterEstado || historialFilterTipos || historialFilterNotas || historialFilterMotivo || historialFilterSolicitadoDesde || historialFilterSolicitadoHasta || historialFilterCierreDesde || historialFilterCierreHasta) ? (
                          <p className="text-white-50 mb-2 small">Ningún trabajo coincide con los filtros.</p>
                        ) : null}
                        <div className="portafolio-modal-filters mb-3">
                          <div className="row g-2">
                            <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                              <label className="portafolio-modal-filter-label">Estado</label>
                              <select className="form-select form-select-sm portafolio-input" value={historialFilterEstado} onChange={(e) => { setHistorialFilterEstado(e.target.value); setHistorialPage(1); }}>
                                <option value="">Todos</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="En progreso">En progreso</option>
                                <option value="Completado">Completado</option>
                                <option value="Rechazado">Rechazado</option>
                              </select>
                            </div>
                            <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                              <label className="portafolio-modal-filter-label">Tipos</label>
                              <input type="text" className="form-control form-control-sm portafolio-input" value={historialFilterTipos} onChange={(e) => { setHistorialFilterTipos(e.target.value); setHistorialPage(1); }} />
                            </div>
                            <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                              <label className="portafolio-modal-filter-label">Notas</label>
                              <input type="text" className="form-control form-control-sm portafolio-input" value={historialFilterNotas} onChange={(e) => { setHistorialFilterNotas(e.target.value); setHistorialPage(1); }} />
                            </div>
                            <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                              <label className="portafolio-modal-filter-label">Motivo rechazo</label>
                              <input type="text" className="form-control form-control-sm portafolio-input" value={historialFilterMotivo} onChange={(e) => { setHistorialFilterMotivo(e.target.value); setHistorialPage(1); }} />
                            </div>
                            <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                              <label className="portafolio-modal-filter-label">Solicitado desde</label>
                              <input type="date" className="form-control form-control-sm portafolio-input" value={historialFilterSolicitadoDesde} onChange={(e) => { setHistorialFilterSolicitadoDesde(e.target.value); setHistorialPage(1); }} />
                            </div>
                            <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                              <label className="portafolio-modal-filter-label">Solicitado hasta</label>
                              <input type="date" className="form-control form-control-sm portafolio-input" value={historialFilterSolicitadoHasta} onChange={(e) => { setHistorialFilterSolicitadoHasta(e.target.value); setHistorialPage(1); }} />
                            </div>
                            <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                              <label className="portafolio-modal-filter-label">Cierre desde</label>
                              <input type="date" className="form-control form-control-sm portafolio-input" value={historialFilterCierreDesde} onChange={(e) => { setHistorialFilterCierreDesde(e.target.value); setHistorialPage(1); }} />
                            </div>
                            <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                              <label className="portafolio-modal-filter-label">Cierre hasta</label>
                              <input type="date" className="form-control form-control-sm portafolio-input" value={historialFilterCierreHasta} onChange={(e) => { setHistorialFilterCierreHasta(e.target.value); setHistorialPage(1); }} />
                            </div>
                          </div>
                        </div>
                        <div className="table-responsive portafolio-table-wrap">
                          <Table striped bordered hover variant="dark" className="table-dark table-sm">
                            <thead><tr><th>Estado</th><th>Tipos</th><th>Notas</th><th>Solicitado</th><th>Cierre</th><th>Motivo</th></tr></thead>
                            <tbody>
                              {paginated.map((req) => (
                                <tr key={req._id}>
                                  <td><span className={`badge ${badgeClassForStatus(req.status)}`}>{req.status}</span></td>
                                  <td>{Array.isArray(req.type) ? req.type.join(", ") : (req.type || "—")}</td>
                                  <td>{req.notes || "—"}</td>
                                  <td>{req.requestedAt ? new Date(req.requestedAt).toLocaleDateString() : "—"}</td>
                                  <td>{req.completedAt ? new Date(req.completedAt).toLocaleDateString() : "—"}</td>
                                  <td>{req.rejectionReason || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2 portafolio-modal-pagination">
                          <span className="text-white-50 small">Página {page} de {totalPages}</span>
                          <Pagination className="mb-0">
                            <Pagination.Item className="custom-pagination-item" disabled={page <= 1} onClick={(e) => { e.preventDefault(); if (page > 1) setHistorialPage(page - 1); }} style={{ cursor: page > 1 ? "pointer" : undefined }}>Anterior</Pagination.Item>
                            <Pagination.Item className="custom-pagination-item" disabled={page >= totalPages} onClick={(e) => { e.preventDefault(); if (page < totalPages) setHistorialPage(page + 1); }} style={{ cursor: page < totalPages ? "pointer" : undefined }}>Siguiente</Pagination.Item>
                          </Pagination>
                        </div>
                      </>
                    );
                  })()
                )}
              </div>
            </div>
          )}

          <div className="col-12 mt-3 mb-3 d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-outline-orange"
              onClick={() => {
                setSelectedClient(null);
                setBoatFilterName("");
                setBoatFilterRegistro("");
                setBoatFilterBandera("");
                setBoatFilterPuerto("");
                setBoatFilterTipo("");
                setBoatFilterDisplacement("");
              }}
            >
              <i className="bi bi-arrow-left-circle-fill me-2"></i>
              Volver
            </button>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <div className="container d-flex flex-column col-12 col-lg-11 text-white portafolio-root">
        <div className="col-12">
          <h2 className="mb-3 text-orange">Portafolio:</h2>
          <div className="div-border-color my-4"></div>
        </div>

        <div className="portafolio-filters col-12">
          <h4 className="text-orange mb-1"><i className="bi bi-funnel-fill me-2"></i>Filtros</h4>
          <div className="row g-3">
            <div className={`col-12 col-md-4 portafolio-country-wrap ${showCountryDropdown ? "portafolio-country-open" : ""}`} ref={countryDropdownRef}>
              <label className="form-label text-white">País</label>
              <div className="position-relative">
                <div
                  className="form-control portafolio-select portafolio-country-trigger d-flex align-items-center"
                  onClick={() => {
                    setShowCountryDropdown((v) => !v);
                    if (!showCountryDropdown) setCountrySearchInput("");
                  }}
                  style={{ cursor: "pointer", minHeight: "38px" }}
                >
                  {selectedCountry ? (
                    <>
                      <TwemojiFlag emoji={selectedCountry.flag} className="me-2" size="22x22" />
                      <span>{selectedCountry.name}</span>
                    </>
                  ) : (
                    <span className="text-white-50">Todos</span>
                  )}
                </div>
                {showCountryDropdown && (
                  <div className="portafolio-country-dropdown">
                    <input
                      type="text"
                      className="form-control portafolio-input portafolio-country-search"
                      placeholder="Buscar país..."
                      value={countrySearchInput}
                      onChange={(e) => setCountrySearchInput(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    <div className="portafolio-country-list">
                      <div
                        className="portafolio-country-option"
                        onClick={() => {
                          setFilterCountry("");
                          setShowCountryDropdown(false);
                        }}
                      >
                        <span className="text-white-50">Todos</span>
                      </div>
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((co) => (
                          <div
                            key={co.code}
                            className="portafolio-country-option"
                            onClick={() => {
                              setFilterCountry(co.code);
                              setShowCountryDropdown(false);
                            }}
                          >
                            <span className="portafolio-country-flag">
                              <TwemojiFlag emoji={co.flag} size="22x22" />
                            </span>
                            <span>{co.name}</span>
                          </div>
                        ))
                      ) : (
                        <div className="portafolio-country-option portafolio-country-no-results">
                          No se encontraron países
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label text-white">Nombre</label>
              <input
                type="text"
                className="form-control portafolio-input"
                placeholder="Filtrar por nombre..."
                value={filterFirstName}
                onChange={(e) => setFilterFirstName(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label text-white">Apellido</label>
              <input
                type="text"
                className="form-control portafolio-input"
                placeholder="Filtrar por apellido..."
                value={filterLastName}
                onChange={(e) => setFilterLastName(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tarjetas de clientes */}
        <h4 className="text-orange my-4"><i className="bi bi-person-vcard-fill me-2"></i>Clientes:</h4>
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-warning" role="status" />
            <p className="mt-2 mb-0">Cargando clientes...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="col-12 text-center py-5">
            <i className="bi bi-people-fill text-orange mb-3" style={{ fontSize: "4rem" }}></i>
            <p className="mb-0">
              {clients.length === 0
                ? "Aún no tienes clientes que te hayan elegido como gestor."
                : "Ningún cliente coincide con los filtros."}
            </p>
          </div>
        ) : (
          <div className="row g-4 mb-4 gestion-cards-container col-12">
            {filteredClients.map((client) => (
              <div key={client._id} className="col-12 col-md-6 col-lg-4">
                <div
                  className="gestion-card h-100 portafolio-client-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedClient(client)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedClient(client); } }}
                >
                  <div className="gestion-card-content">
                    <i className="bi bi-person-badge-fill text-orange mb-3" style={{ fontSize: "3rem" }}></i>
                    <h4 className="text-white mb-2">
                      {[client.firstName, client.lastName].filter(Boolean).join(" ") || "—"}
                    </h4>
                    <p className="text-white-50 small mb-2">{client.email || "—"}</p>
                    <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
                      <span className="text-orange" style={{ fontSize: "1rem" }}>Flota:</span>
                      <span className="text-orange" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                        {client.fleetCount ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FadeIn>
  );
}
