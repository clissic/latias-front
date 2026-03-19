import { useMemo, useState, useEffect } from "react";
import { Button, Form, Modal, OverlayTrigger, Popover } from "react-bootstrap";
import { Link } from "react-router-dom";
import { apiService } from "../../../services/apiService";
import Swal from "sweetalert2";
import { SolicitarModificacionCurso } from "./SolicitarModificacionCurso";
import "./GestionarMisCursos.css";

export function GestionarMisCursos({ user, onBack }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [instructor, setInstructor] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [resolvedBankAccount, setResolvedBankAccount] = useState(user?.bankAccount || {});
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showWithdrawalConfirmModal, setShowWithdrawalConfirmModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const MIN_WITHDRAWAL_USD = 50;
  const [filterName, setFilterName] = useState("");
  const [filterCourseId, setFilterCourseId] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCurrency, setFilterCurrency] = useState("");
  const [filterPriceMin, setFilterPriceMin] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");

  useEffect(() => {
    const loadMyCourses = async () => {
      setLoading(true);
      try {
        const instructorResponse = await apiService.getInstructorByCi(user.ci);
        if (instructorResponse.status === "success" && instructorResponse.payload) {
          const instructorData = instructorResponse.payload;
          setInstructor(instructorData);
          // Cargar wallet del usuario (instructor)
          const userId = user?.id ?? user?._id;
          if (userId) {
            try {
              const walletResponse = await apiService.getWallet(userId);
              if (walletResponse.status === "success" && walletResponse.payload) {
                setWallet(walletResponse.payload);
              }
            } catch (walletError) {
              console.error("Error al cargar wallet del instructor:", walletError);
            }
          }
          const courseIds = instructorData.courses || [];
          if (courseIds.length === 0) {
            setCourses([]);
            setLoading(false);
            return;
          }
          const allCoursesResponse = await apiService.getCourses();
          if (allCoursesResponse.status === "success" && allCoursesResponse.payload) {
            const allCourses = allCoursesResponse.payload;
            const myCourses = allCourses.filter((course) => {
              const courseIdToCompare = course.courseId ? String(course.courseId) : null;
              return courseIdToCompare && courseIds.some((id) => String(id) === courseIdToCompare);
            });
            setCourses(myCourses);
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "No se pudieron cargar los cursos",
              confirmButtonText: "Aceptar",
              background: "#082b55",
              color: "#ffffff",
              customClass: { confirmButton: "custom-swal-button" },
            });
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se encontró información del instructor",
            confirmButtonText: "Aceptar",
            background: "#082b55",
            color: "#ffffff",
            customClass: { confirmButton: "custom-swal-button" },
          });
        }
      } catch (error) {
        console.error("Error al cargar cursos asignados:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al cargar los cursos asignados",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: { confirmButton: "custom-swal-button" },
        });
      } finally {
        setLoading(false);
      }
    };
    loadMyCourses();
  }, [user.ci]);

  useEffect(() => {
    setResolvedBankAccount(user?.bankAccount || {});
  }, [user]);

  const handleViewMetrics = (course) => {
    Swal.fire({
      icon: "info",
      title: "Métricas",
      text: `Métricas del curso "${course.courseName}" - Próximamente`,
      confirmButtonText: "Aceptar",
      background: "#082b55",
      color: "#ffffff",
      customClass: { confirmButton: "custom-swal-button" },
    });
  };

  const handleModifyCourse = (course) => {
    setSelectedCourse(course);
  };

  const handleBackToTable = () => {
    setSelectedCourse(null);
  };

  const formatPrice = (price, currency) => {
    return `$ ${price.toLocaleString()}.00 ${currency} `;
  };

  const filteredCourses = courses.filter((course) => {
    if (filterName && !(course.courseName || "").toLowerCase().includes(filterName.toLowerCase())) return false;
    if (filterCourseId && !String(course.courseId || "").toLowerCase().includes(filterCourseId.toLowerCase())) return false;
    if (filterDifficulty && (course.difficulty || "") !== filterDifficulty) return false;
    if (filterCategory && !(course.category || "").toLowerCase().includes(filterCategory.toLowerCase())) return false;
    if (filterCurrency.trim() && !(course.currency || "").toUpperCase().includes(filterCurrency.trim().toUpperCase())) return false;
    const price = course.price != null && course.price !== "" ? Number(course.price) : null;
    if (filterPriceMin.trim() !== "") {
      const min = Number(filterPriceMin);
      if (!Number.isFinite(min) || price == null || price < min) return false;
    }
    if (filterPriceMax.trim() !== "") {
      const max = Number(filterPriceMax);
      if (!Number.isFinite(max) || price == null || price > max) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setFilterName("");
    setFilterCourseId("");
    setFilterDifficulty("");
    setFilterCategory("");
    setFilterCurrency("");
    setFilterPriceMin("");
    setFilterPriceMax("");
  };

  const availableBalance = Number(wallet?.balance) || 0;
  const bankAccount = resolvedBankAccount || {};
  const hasBankAccount =
    Boolean(bankAccount?.bank) &&
    Boolean(bankAccount?.type) &&
    bankAccount?.number !== undefined &&
    bankAccount?.number !== null &&
    String(bankAccount.number).trim() !== "";

  const formattedWithdrawalAmount = useMemo(() => {
    const amount = Number(withdrawalAmount) || 0;
    return `${wallet?.currency || "USD"} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [withdrawalAmount, wallet?.currency]);

  const formatBankAccountType = (type) => {
    if (!type) return "No definido";
    return type === "FINTECH" ? "FINTECH / billetera electrónica" : type;
  };

  const withdrawalAmountError = useMemo(() => {
    if (withdrawalAmount === "") return "";
    const amount = Number(withdrawalAmount);
    if (!Number.isFinite(amount)) return "Ingresa un monto válido.";
    if (amount < MIN_WITHDRAWAL_USD) return `El monto mínimo para retirar es USD ${MIN_WITHDRAWAL_USD}.`;
    if (amount > availableBalance) return "El monto no puede superar el balance disponible.";
    return "";
  }, [withdrawalAmount, availableBalance]);

  const handleOpenWithdrawalModal = async () => {
    if (!hasBankAccount) {
      // Re-fetch para evitar inconsistencias en el estado del front:
      // el token + backend es la fuente de verdad.
      try {
        const meRes = await apiService.getAuthMe();
        const nextBankAccount = meRes?.payload?.user?.bankAccount || {};
        setResolvedBankAccount(nextBankAccount);

        const nextHasBankAccount =
          Boolean(nextBankAccount?.bank) &&
          Boolean(nextBankAccount?.type) &&
          nextBankAccount?.number !== undefined &&
          nextBankAccount?.number !== null &&
          String(nextBankAccount.number).trim() !== "";

        if (nextHasBankAccount) {
          setWithdrawalAmount("");
          setShowWithdrawalConfirmModal(false);
          setShowWithdrawalModal(true);
          return;
        }
      } catch (e) {
        // Si falla el re-fetch, seguimos con el mensaje original.
      }

      Swal.fire({
        icon: "warning",
        title: "Cuenta bancaria requerida",
        text: "Debe ingresar los datos de su cuenta bancaria o billetera electrónica de preferencia para poder solicitar el retiro del dinero. Para ello deberá dirigirse al apartado de Ajustes en el menú de Mi Latias.",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
      return;
    }

    setWithdrawalAmount("");
    setShowWithdrawalConfirmModal(false);
    setShowWithdrawalModal(true);
  };

  const handleCloseWithdrawalModal = () => {
    setShowWithdrawalModal(false);
    setShowWithdrawalConfirmModal(false);
    setWithdrawalAmount("");
  };

  const handleOpenWithdrawalConfirm = () => {
    if (withdrawalAmountError || withdrawalAmount === "") return;
    setShowWithdrawalConfirmModal(true);
  };

  const handleConfirmWithdrawal = async () => {
    if (submittingWithdrawal || withdrawalAmountError || withdrawalAmount === "") return;

    try {
      setSubmittingWithdrawal(true);
      const response = await apiService.createWithdrawal(Number(withdrawalAmount));

      if (response?.status !== "success") {
        throw new Error(response?.msg || "No se pudo registrar la solicitud de retiro.");
      }

      if (response?.payload?.wallet) {
        setWallet(response.payload.wallet);
      }

      setShowWithdrawalConfirmModal(false);
      setShowWithdrawalModal(false);
      setWithdrawalAmount("");

      Swal.fire({
        icon: "success",
        title: "Retiro solicitado",
        text: "La solicitud fue registrada correctamente. El saldo quedó bloqueado hasta que un administrador la procese o expire.",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo solicitar el retiro",
        text: error?.message || "Ocurrió un error al registrar la solicitud.",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  const renderWalletPopover = (message) => (
    <Popover id="wallet-popover" className="wallet-popover">
      <Popover.Body>{message}</Popover.Body>
    </Popover>
  );

  if (loading) {
    return (
      <div className="text-center text-white py-5">
        <div className="spinner-border text-orange" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando cursos asignados...</p>
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <SolicitarModificacionCurso
        course={selectedCourse}
        instructor={instructor}
        onBack={handleBackToTable}
      />
    );
  }

  return (
    <div className="gestionar-mis-cursos-container">

      {instructor && (
        <div className="d-flex flex-row flex-wrap justify-content-between mb-4">
          <div className="camarote-instructor-summary mb-4 col-12 col-sm-12 col-xl-6">
            <div className="camarote-instructor-header">
              <h4 className="text-orange mb-3">Datos personales:</h4>
            </div>
            <div className="camarote-instructor-info">
                {instructor.profileImage && (
                  <div className="camarote-instructor-avatar-wrapper">
                    <img
                      src={
                        instructor.profileImage.startsWith("/api")
                          ? instructor.profileImage
                          : instructor.profileImage.startsWith("/")
                          ? `/api${instructor.profileImage}`
                          : instructor.profileImage
                      }
                      alt={`${instructor.firstName} ${instructor.lastName}`}
                      className="camarote-instructor-avatar"
                    />
                  </div>
                )}
                <div className="camarote-instructor-main">
                  <h4 className="text-orange my-2">
                    {instructor.firstName} {instructor.lastName}
                  </h4>
                  <p className="mb-1 text-white-50 d-flex justify-content-between">
                    <strong className="text-white-50">Profesión:</strong>{" "}
                    <span className="text-white">{instructor.profession || "—"}</span>
                  </p>
                  <p className="mb-1 text-white-50 d-flex justify-content-between">
                    <strong className="text-white-50">CI:</strong>{" "}
                    <span className="text-white">{instructor.ci ?? "—"}</span>
                  </p>
                  <p className="mb-1 text-white-50 d-flex justify-content-between">
                    <strong className="text-white-50">Email:</strong>{" "}
                    <span className="text-white">
                      {instructor.contact?.email || "—"}
                    </span>
                  </p>
                  <p className="mb-0 text-white-50 d-flex justify-content-between">
                    <strong className="text-white-50">Teléfono:</strong>{" "}
                    <span className="text-white">
                      {instructor.contact?.phone || "—"}
                    </span>
                  </p>
                </div>
              </div>
          </div>
          <div className="col-12 col-sm-12 col-xl-5">
            <div className="camarote-instructor-layout d-flex justify-content-between flex-wrap">
              
              <div
                className="camarote-instructor-wallet-panel w-100"
                onClick={handleOpenWithdrawalModal}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOpenWithdrawalModal();
                  }
                }}
              >
                <div className="camarote-instructor-main ms-0 wallet-hover-area">
                  <div className="d-flex justify-content-between align-items-center">
                    <h4 className="text-orange my-2">Balance:</h4>
                    <sup className="text-secondary fst-italic my-0 wallet-hover-hint">
                      ¡Haz click para solicitar retiro de fondos!
                    </sup>
                  </div>
                  {wallet ? (
                    <>
                      <p className="mb-1 text-white-50 d-flex justify-content-between align-items-center">
                        <OverlayTrigger
                          placement="top"
                          overlay={renderWalletPopover("Balance disponible para retirar")}
                        >
                          <strong className="text-white-50">Disponible:</strong>
                        </OverlayTrigger>{" "}
                        <span className="amount text-money">
                          {wallet.currency || "USD"}{" "}
                          {(Number(wallet.balance) || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </p>
                      <div className="div-border-color my-1"></div>
                      <div className="d-flex flex-row justify-content-around">
                        <div className="d-flex flex-column gap-1">
                          <p className="mb-1 text-white-50 d-flex justify-content-between flex-column">
                            <OverlayTrigger
                              placement="top"
                              overlay={renderWalletPopover("Pendiente por liberar al instructor")}
                            >
                              <strong className="text-white-50">Pendiente:</strong>
                            </OverlayTrigger>{" "}
                            <span className="text-white">
                              {wallet.currency || "USD"}{" "}
                              {(Number(wallet.pendingBalance) || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </p>
                          <p className="mb-1 text-white-50 d-flex justify-content-between flex-column">
                            <OverlayTrigger
                              placement="top"
                              overlay={renderWalletPopover("Fondos reservados por solicitudes de retiro pendientes")}
                            >
                              <strong className="text-white-50">Bloqueado:</strong>
                            </OverlayTrigger>{" "}
                            <span className="text-white">
                              {wallet.currency || "USD"}{" "}
                              {(Number(wallet.lockedBalance) || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </p>
                        </div>
                        <div className="d-flex flex-column gap-1">
                          <p className="mb-1 text-white-50 d-flex justify-content-between flex-column">
                            <OverlayTrigger
                              placement="top"
                              overlay={renderWalletPopover("Total generado por el instructor")}
                            >
                              <strong className="text-white-50">Generado:</strong>
                            </OverlayTrigger>{" "}
                            <span className="text-white">
                              {wallet.currency || "USD"}{" "}
                              {(Number(wallet.totalEarnings) || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </p>
                          <p className="mb-1 text-white-50 d-flex justify-content-between flex-column">
                            <OverlayTrigger
                              placement="top"
                              overlay={renderWalletPopover("Total retirado por el instructor")}
                            >
                              <strong className="text-white-50">Retirado:</strong>
                            </OverlayTrigger>{" "}
                            <span className="text-white">
                              {wallet.currency || "USD"}{" "}
                              {(Number(wallet.totalWithdrawn) || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="mb-0 text-white-50">
                      No se encontró información de wallet para este instructor.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center text-white py-5">
          <i className="bi bi-book text-orange" style={{ fontSize: "4rem" }}></i>
          <p className="mt-3">No tienes cursos asignados actualmente.</p>
        </div>
      ) : (
        <>
          {/* Filtros: mismo markup que Flota / Gestion / Certificados */}
          <div className="camarote-filters col-12 mb-4">
            <h4 className="text-orange"><i className="bi bi-funnel-fill me-2"></i>Filtros:</h4>
            <div className="row g-2 portafolio-modal-filters">
              <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                <label className="portafolio-modal-filter-label">Nombre</label>
                <input
                  type="text"
                  className="form-control portafolio-input form-control-sm"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                />
              </div>
              <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                <label className="portafolio-modal-filter-label">ID curso</label>
                <input
                  type="text"
                  className="form-control portafolio-input form-control-sm"
                  value={filterCourseId}
                  onChange={(e) => setFilterCourseId(e.target.value)}
                />
              </div>
              <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                <label className="portafolio-modal-filter-label">Dificultad</label>
                <select
                  className="form-select portafolio-input form-control-sm"
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
              <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                <label className="portafolio-modal-filter-label">Categoría</label>
                <input
                  type="text"
                  className="form-control portafolio-input form-control-sm"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                />
              </div>
              <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                <label className="portafolio-modal-filter-label">Moneda</label>
                <input
                  type="text"
                  className="form-control portafolio-input form-control-sm"
                  value={filterCurrency}
                  onChange={(e) => setFilterCurrency(e.target.value)}
                  placeholder="USD, UYU, etc..."
                />
              </div>
              <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                <label className="portafolio-modal-filter-label">Precio (desde - hasta)</label>
                <div className="camarote-filter-precio-range">
                  <input
                    type="number"
                    className="form-control portafolio-input form-control-sm"
                    value={filterPriceMin}
                    onChange={(e) => setFilterPriceMin(e.target.value)}
                    min={0}
                    step={1}
                    placeholder="Mín"
                  />
                  <input
                    type="number"
                    className="form-control portafolio-input form-control-sm"
                    value={filterPriceMax}
                    onChange={(e) => setFilterPriceMax(e.target.value)}
                    min={0}
                    step={1}
                    placeholder="Máx"
                  />
                </div>
              </div>
            </div>
            <div className="d-flex flex-wrap align-items-center justify-content-lg-end gap-2 mt-3 flota-filters-actions">
              <button type="button" className="btn btn-outline-orange btn-sm" onClick={clearFilters}>
                <i className="bi bi-funnel me-1"></i>Limpiar filtros
              </button>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="text-orange mb-0">Gestionar mis cursos asignados:</h4>
          </div>


          {filteredCourses.length === 0 ? (
            <div className="text-center text-white py-4 text-white-50">No hay cursos que coincidan con los filtros.</div>
          ) : (
            <div className="camarote-course-cards">
              {filteredCourses.map((course) => (
                <div key={course._id || course.courseId} className="camarote-course-card">
                  <div className="camarote-course-card-body">
                    <div className="camarote-course-card-main">
                      <div className="camarote-course-header">
                        <div className="camarote-course-title text-white">
                          <h3 className="mb-0">{course.courseName || "—"}</h3>
                        </div>
                        <div className="camarote-course-id text-white-50 d-flex align-items-center gap-2">
                          {course.courseId ? (
                            <>
                              <span className="text-truncate" title={course.courseId}>
                                <strong>ID:</strong> {course.courseId}
                              </span>
                            </>
                          ) : (
                            <span className="text-truncate" style={{ maxWidth: "160px" }}>
                              {course._id}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="camarote-course-meta">
                        <div className="camarote-course-field">
                          <span className="camarote-course-label">Dificultad</span>
                          <span className="camarote-course-value">
                            <span
                              className={`badge ${
                                course.difficulty === "Principiante"
                                  ? "bg-success"
                                  : course.difficulty === "Intermedio"
                                  ? "bg-warning text-dark"
                                  : course.difficulty === "Avanzado"
                                  ? "bg-danger"
                                  : "bg-secondary"
                              }`}
                            >
                              {course.difficulty || "—"}
                            </span>
                          </span>
                        </div>
                        <div className="camarote-course-field">
                          <span className="camarote-course-label">Categoría</span>
                          <span className="camarote-course-value">{course.category || "—"}</span>
                        </div>
                        <div className="camarote-course-field">
                          <span className="camarote-course-label">Precio</span>
                          <span className="camarote-course-value fw-bold">
                            {course.price != null
                              ? formatPrice(course.price, course.currency || "UYU")
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="camarote-course-card-actions">
                      <Button
                        variant="success"
                        size="sm"
                        className="camarote-course-action-btn mb-0"
                        onClick={() => handleViewMetrics(course)}
                        title="Métricas"
                      >
                        <i className="bi bi-bar-chart-line-fill me-1"></i>
                        Métricas
                      </Button>
                      <Button
                        variant="warning"
                        size="sm"
                        className="camarote-course-action-btn mb-0"
                        onClick={() => handleModifyCourse(course)}
                        title="Modificar"
                      >
                        <i className="bi bi-pencil-fill me-1"></i>
                        Modificar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="mt-4 d-flex justify-content-end">
        <Button variant="outline" onClick={onBack} className="btn-outline-orange">
          <i className="bi bi-arrow-left-circle-fill me-2"></i>
          Volver
        </Button>
      </div>

      <Modal show={showWithdrawalModal} onHide={handleCloseWithdrawalModal} centered className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Retiro de fondos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="camarote-withdrawal-account-box mb-3">
            <h6 className="text-orange mb-2">Cuenta de destino</h6>
            <p className="mb-1 text-white-50 d-flex justify-content-between">
              <strong>Banco / billetera:</strong>
              <span className="text-white">{bankAccount?.bank || "No definido"}</span>
            </p>
            <p className="mb-1 text-white-50 d-flex justify-content-between">
              <strong>Número de cuenta:</strong>
              <span className="text-white">{bankAccount?.number || "No definido"}</span>
            </p>
            <p className="mb-0 text-white-50 d-flex justify-content-between">
              <strong>Tipo:</strong>
              <span className="text-white">{formatBankAccountType(bankAccount?.type)}</span>
            </p>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Monto a retirar</Form.Label>
            <Form.Control
              type="number"
              min={MIN_WITHDRAWAL_USD}
              max={availableBalance}
              step={10}
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(e.target.value)}
              placeholder={`Máximo disponible: ${availableBalance.toFixed(2)} ${wallet?.currency || "USD"}`}
            />
            {withdrawalAmountError && (
              <small className="text-danger d-block mt-2">{withdrawalAmountError}</small>
            )}
            {!withdrawalAmountError && withdrawalAmount !== "" && (
              <small className="text-white-50 d-block mt-2">
                Solicitud por: {formattedWithdrawalAmount}
              </small>
            )}
          </Form.Group>

          <div className="camarote-withdrawal-notes text-white-50 small">
            <p className="mb-2">
              La plataforma no se responsabiliza por errores derivados de datos bancarios o de
              billetera electrónica ingresados de forma incorrecta por el usuario.
            </p>
            <p className="mb-2">
              Los pagos podrán quedar sujetos a revisión operativa, validación de identidad,
              disponibilidad de fondos y tiempos administrativos internos o bancarios.
            </p>
            <p className="mb-0">
              Te recomendamos leer los{" "}
              <Link to="/terminosycondiciones" className="camarote-withdrawal-link">
                Términos y Condiciones
              </Link>{" "}
              de la plataforma relativos al pago de honorarios antes de continuar.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={handleCloseWithdrawalModal}
            disabled={submittingWithdrawal}
            className="withdrawal-action-btn"
          >
            Cancelar
          </Button>
          <Button
            variant="warning"
            onClick={handleOpenWithdrawalConfirm}
            disabled={withdrawalAmount === "" || Boolean(withdrawalAmountError) || submittingWithdrawal}
            className="withdrawal-action-btn"
          >
            Solicitar pago
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showWithdrawalConfirmModal}
        onHide={() => setShowWithdrawalConfirmModal(false)}
        centered
        className="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar retiro</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3 text-white">
            Confirme que desea retirar <strong>{formattedWithdrawalAmount}</strong> a la cuenta:
          </p>
          <div className="camarote-withdrawal-account-box">
            <p className="mb-1 text-white-50">
              <strong>Banco / billetera:</strong> <span className="text-white">{bankAccount?.bank || "No definido"}</span>
            </p>
            <p className="mb-1 text-white-50">
              <strong>Número de cuenta:</strong> <span className="text-white">{bankAccount?.number || "No definido"}</span>
            </p>
            <p className="mb-0 text-white-50">
              <strong>Tipo:</strong> <span className="text-white">{formatBankAccountType(bankAccount?.type)}</span>
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => setShowWithdrawalConfirmModal(false)}
            disabled={submittingWithdrawal}
            className="withdrawal-action-btn"
          >
            Cancelar
          </Button>
          <Button variant="success" onClick={handleConfirmWithdrawal} disabled={submittingWithdrawal} className="withdrawal-action-btn">
            {submittingWithdrawal ? "Procesando..." : "Confirmar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
