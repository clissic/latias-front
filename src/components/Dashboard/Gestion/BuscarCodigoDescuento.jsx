import React, { useState, useRef } from "react";
import { Form, Button, Table, Pagination } from "react-bootstrap";
import { apiService } from "../../../services/apiService";
import Swal from "sweetalert2";
import "./BuscarCurso.css";

export function BuscarCodigoDescuento({ onUpdateCode }) {
  const [filters, setFilters] = useState({ code: "", description: "" });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const itemsPerPage = 5;
  const tableHeaderRef = useRef(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(false);
    try {
      const response = await apiService.getAllDiscountCodes();
      if (response.status === "success" && Array.isArray(response.payload)) {
        let list = response.payload;
        if (filters.code.trim()) {
          const c = filters.code.trim().toLowerCase();
          list = list.filter((x) => (x.code || "").toLowerCase().includes(c));
        }
        if (filters.description.trim()) {
          const d = filters.description.trim().toLowerCase();
          list = list.filter((x) => (x.description || "").toLowerCase().includes(d));
        }
        setResults(list);
        setSearched(true);
        setCurrentPage(1);
        if (list.length === 0) {
          Swal.fire({
            icon: "info",
            title: "Sin resultados",
            text: "No se encontraron códigos con los filtros seleccionados",
            confirmButtonText: "Aceptar",
            background: "#082b55",
            color: "#ffffff",
            customClass: { confirmButton: "custom-swal-button" },
          });
        }
      } else {
        setResults([]);
        setSearched(true);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los códigos de descuento",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({ code: "", description: "" });
    setResults([]);
    setSearched(false);
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(results.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentResults = results.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    tableHeaderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCopyId = async (id) => {
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
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateClick = (row) => {
    if (onUpdateCode) onUpdateCode(row);
  };

  const handleDeleteClick = (row) => {
    setCodeToDelete(row);
    setConfirmText("");
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (confirmText.trim().toLowerCase() !== "eliminar") {
      Swal.fire({
        icon: "warning",
        title: "Confirmación",
        text: "Debes escribir 'eliminar' para confirmar",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
      return;
    }
    if (!codeToDelete?._id) return;
    try {
      const res = await apiService.deleteDiscountCode(codeToDelete._id);
      if (res.status === "success") {
        setResults((prev) => prev.filter((x) => x._id !== codeToDelete._id));
        setShowDeleteModal(false);
        setCodeToDelete(null);
        setConfirmText("");
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "El código de descuento fue eliminado.",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: { confirmButton: "custom-swal-button" },
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.msg || "No se pudo eliminar",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: { confirmButton: "custom-swal-button" },
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.message || "Error al eliminar",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
    }
  };

  return (
    <div className="buscar-curso-container">
      <div className="filters-section mb-4">
        <h5 className="text-orange mb-3">Filtros de búsqueda:</h5>
        <Form>
          <div className="row g-3">
            <Form.Group className="col-12 col-md-6">
              <Form.Label className="text-white">Código:</Form.Label>
              <Form.Control
                type="text"
                name="code"
                value={filters.code}
                onChange={handleFilterChange}
                placeholder="Buscar por código"
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>
            <Form.Group className="col-12 col-md-6">
              <Form.Label className="text-white">Descripción:</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={filters.description}
                onChange={handleFilterChange}
                placeholder="Buscar por descripción"
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>
          </div>
          <div className="d-flex gap-2 mt-3">
            <Button
              variant="warning"
              onClick={handleSearch}
              disabled={loading}
              className="flex-grow-1"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Buscando...
                </>
              ) : (
                <>
                  <i className="bi bi-search me-2"></i>
                  Buscar
                </>
              )}
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              <i className="bi bi-funnel me-2"></i>
              Limpiar filtros
            </Button>
          </div>
        </Form>
      </div>

      {searched && results.length > 0 && (
        <div className="results-section">
          <h5 className="text-orange mb-3" ref={tableHeaderRef}>
            Resultados ({results.length}):
          </h5>
          <div className="table-responsive">
            <Table striped bordered hover variant="dark" className="table-dark">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Código</th>
                  <th>Descuento</th>
                  <th>Usos</th>
                  <th>Estado</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentResults.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <i
                        className="bi bi-clipboard-fill cursor-pointer"
                        onClick={() => handleCopyId(row._id)}
                        title="Copiar ID"
                        style={{ fontSize: "1.2rem", color: "#ffa500" }}
                      ></i>
                    </td>
                    <td>{row.code}</td>
                    <td>{row.percentage}%</td>
                    <td>{(Array.isArray(row.usedBy) ? row.usedBy.length : 0)} / {row.quantity ?? "—"}</td>
                    <td>
                      <span className={`badge ${row.isActive !== false ? "bg-success" : "bg-secondary"}`}>
                        {row.isActive !== false ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>{row.description || "—"}</td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <span
                          className="action-link"
                          onClick={() => handleUpdateClick(row)}
                        >
                          <i className="bi bi-pencil-fill me-1"></i>
                          Modificar
                        </span>
                        <span
                          className="action-link action-link-danger"
                          onClick={() => handleDeleteClick(row)}
                        >
                          <i className="bi bi-trash-fill me-1"></i>
                          Eliminar
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {totalPages > 1 && (
            <Pagination className="mt-3 justify-content-center">
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Pagination.Item
                  key={p}
                  active={p === currentPage}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              />
            </Pagination>
          )}
        </div>
      )}

      {showDeleteModal && codeToDelete && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">Eliminar código de descuento</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => { setShowDeleteModal(false); setCodeToDelete(null); }} aria-label="Cerrar"></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de eliminar el código <strong>{codeToDelete.code}</strong>?</p>
                <p className="text-warning">Escribe <strong>eliminar</strong> para confirmar:</p>
                <Form.Control
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="bg-dark text-white border-secondary"
                  placeholder="eliminar"
                />
              </div>
              <div className="modal-footer border-secondary">
                <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setCodeToDelete(null); }}>
                  Cancelar
                </Button>
                <Button variant="danger" onClick={handleConfirmDelete} disabled={confirmText.trim().toLowerCase() !== "eliminar"}>
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
