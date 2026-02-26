import React, { useState, useEffect, useMemo, useRef } from "react";
import { Pagination } from "react-bootstrap";
import { FadeIn } from "../../FadeIn/FadeIn";
import { apiService } from "../../../services/apiService";
import { generateCertificatePdf } from "../../../utils/certificatePdf";
import "./Certificados.css";

const CERTIFICATES_PER_PAGE = 6;

export function Certificados({ user }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    courseName: "",
    dateFrom: "",
    dateTo: "",
  });
  const certificadosListRef = useRef(null);

  const certificatesFiltered = useMemo(() => {
    let list = [...certificates];
    const name = filters.courseName.trim().toLowerCase();
    if (name) list = list.filter((c) => (c.courseName || c.course?.courseName || "").toLowerCase().includes(name));
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      if (!isNaN(from.getTime())) list = list.filter((c) => c.certificateIssuedAt && new Date(c.certificateIssuedAt) >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      if (!isNaN(to.getTime())) list = list.filter((c) => c.certificateIssuedAt && new Date(c.certificateIssuedAt) <= to);
    }
    return list;
  }, [certificates, filters]);

  const totalPages = Math.max(1, Math.ceil(certificatesFiltered.length / CERTIFICATES_PER_PAGE));
  const start = (currentPage - 1) * CERTIFICATES_PER_PAGE;
  const certificatesPage = certificatesFiltered.slice(start, start + CERTIFICATES_PER_PAGE);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    certificadosListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleFiltersReset = () => {
    setFilters({ courseName: "", dateFrom: "", dateTo: "" });
    setCurrentPage(1);
  };

  useEffect(() => {
    if (!user?.id && !user?._id) {
      setLoading(false);
      return;
    }
    const userId = user.id ?? user._id;
    apiService
      .getUserPurchasedCourses(userId)
      .then((res) => {
        const list = Array.isArray(res?.payload) ? res.payload : [];
        const withCert = list.filter((c) => c.certificate != null && c.certificate !== "");
        setCertificates(withCert);
        setCurrentPage(1);
      })
      .catch(() => setCertificates([]))
      .finally(() => setLoading(false));
  }, [user?.id, user?._id]);

  const [generatingId, setGeneratingId] = useState(null);

  const handleCertificateClick = async (item) => {
    const userId = user?.id ?? user?._id;
    if (!userId || !item.courseId) return;
    setGeneratingId(item.courseId);
    try {
      const res = await apiService.getCourseCertificate(userId, item.courseId);
      if (res?.status === "success" && res?.payload) {
        await generateCertificatePdf(res.payload, item);
      }
    } catch (e) {
      console.error("Error al obtener certificado:", e);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <FadeIn>
      <div className="certificados-root text-white col-12 col-lg-11 d-flex flex-column align-items-between container">
        <div className="col-12">
          <h2 className="mb-3 text-orange">Tus certificados obtenidos:</h2>
          <div className="div-border-color my-4"></div>
        </div>

      <div className="d-flex flex-column gap-4">
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-warning" role="status" />
            <p className="text-white mt-2 mb-0">Cargando tus certificados...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center my-5 d-flex flex-column align-items-center col-11">
            <i className="bi bi-award-fill mb-4 custom-display-1 text-orange"></i>
            <h3>No vemos certificados en tu bitácora.</h3>
            <p className="fst-italic">
              ¡Cuando completes un curso, recibirás tu merecido reconocimiento!
            </p>
          </div>
        ) : (
          <>
            <div className="portafolio-filters col-12 mb-4">
              <h4 className="text-orange"><i className="bi bi-funnel-fill me-2"></i>Filtros:</h4>
              <div className="row g-2 portafolio-modal-filters">
                <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                  <label className="portafolio-modal-filter-label">Nombre del curso</label>
                  <input
                    type="text"
                    className="form-control portafolio-input form-control-sm"
                    name="courseName"
                    value={filters.courseName}
                    onChange={handleFilterChange}
                    placeholder="Buscar por nombre del curso"
                  />
                </div>
                <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                  <label className="portafolio-modal-filter-label">Emitido desde</label>
                  <input
                    type="date"
                    className="form-control portafolio-input form-control-sm"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                  <label className="portafolio-modal-filter-label">Emitido hasta</label>
                  <input
                    type="date"
                    className="form-control portafolio-input form-control-sm"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
              <div className="d-flex flex-wrap align-items-center justify-content-lg-end gap-2 mt-3 flota-filters-actions">
                <button type="button" className="btn btn-outline-orange btn-sm" onClick={handleFiltersReset}>
                  <i className="bi bi-funnel me-1"></i>Limpiar filtros
                </button>
              </div>
            </div>
            <div ref={certificadosListRef}>
            {certificatesFiltered.length === 0 ? (
              <div className="text-center text-white py-5">
                <i className="bi bi-inbox-fill text-orange" style={{ fontSize: "4rem" }}></i>
                <p className="mt-3">No hay certificados que coincidan con los filtros.</p>
              </div>
            ) : (
            <div className="certificados-cards-wrap">
              {certificatesPage.map((item) => (
                <button
                  key={item.courseId || item.certificate}
                  type="button"
                  className="certificados-card"
                  onClick={() => handleCertificateClick(item)}
                  disabled={generatingId === item.courseId}
                >
                  <div className="certificados-card-bg" />
                  <div className="certificados-card-overlay" />
                  <div className="certificados-card-text">
                    {generatingId === item.courseId ? (
                      <>
                        <span className="certificados-card-course-name mb-2">Generando PDF...</span>
                        <span className="spinner-border spinner-border-sm text-warning" role="status" />
                      </>
                    ) : (
                      <>
                        <span className="certificados-card-course-name">
                          {item.courseName || item.course?.courseName || "Curso"}
                        </span>
                        {item.certificateIssuedAt && (
                          <span className="certificados-card-issued">
                            Emitido: {new Date(item.certificateIssuedAt).toLocaleDateString("es-UY", { day: "numeric", month: "long", year: "numeric" })}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
            )}
            </div>
            <div className="d-flex flex-column align-items-center mt-4 mb-4">
              <Pagination className="mb-0">
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1 || totalPages === 0}
                  className="custom-pagination-item"
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || totalPages === 0}
                  className="custom-pagination-item"
                />
                {totalPages > 0 ? (
                  getPageNumbers().map((number) => (
                    <Pagination.Item
                      key={number}
                      active={number === currentPage}
                      onClick={() => handlePageChange(number)}
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
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="custom-pagination-item"
                />
                <Pagination.Last
                  onClick={() => handlePageChange(totalPages || 1)}
                  disabled={currentPage === (totalPages || 1) || totalPages === 0}
                  className="custom-pagination-item"
                />
              </Pagination>
              <div className="text-white mt-2">
                Página {currentPage} de {totalPages || 1} ({certificatesFiltered.length} certificados)
              </div>
            </div>
          </>
        )}
      </div>
      </div>
    </FadeIn>
  );
}