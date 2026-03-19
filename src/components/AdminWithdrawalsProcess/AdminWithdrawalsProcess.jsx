import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { apiService } from "../../services/apiService";
import "./AdminWithdrawalsProcess.css";

function formatMoney(amount, currency = "USD") {
  return `${currency} ${(Number(amount) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "No definido";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No definido";
  return date.toLocaleString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getUserName(user) {
  if (!user) return "No definido";
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "No definido";
}

function getUserCategories(user) {
  if (!user?.category) return "No definido";
  return Array.isArray(user.category) ? user.category.join(", ") : user.category;
}

function getAccountSummary(withdrawal) {
  const details = withdrawal?.payoutDetails || {};
  return [details.bank || withdrawal?.payoutMethod, details.type, details.number]
    .filter(Boolean)
    .join(" | ");
}

export function AdminWithdrawalsProcess() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [withdrawal, setWithdrawal] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [proofUrl, setProofUrl] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    const loadWithdrawal = async () => {
      if (!token) {
        setErrorMessage("El link de procesamiento no incluye un token válido.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getAdminWithdrawalProcess(token);
        if (response?.status !== "success" || !response?.payload) {
          setWithdrawal(null);
          setErrorMessage(response?.msg || "No se pudo cargar la solicitud de retiro.");
          return;
        }

        setWithdrawal(response.payload);
        setProofUrl(response.payload.proofUrl || "");
        setErrorMessage("");
      } catch (error) {
        setWithdrawal(null);
        setErrorMessage(error?.message || "Ocurrió un error al cargar la solicitud.");
      } finally {
        setLoading(false);
      }
    };

    loadWithdrawal();
  }, [token]);

  const amountLabel = useMemo(() => {
    const currency = withdrawal?.userId?.wallet?.currency || "USD";
    return formatMoney(withdrawal?.amount, currency);
  }, [withdrawal]);

  const handleProofUpload = async () => {
    if (!proofFile || uploadingProof) return;

    try {
      setUploadingProof(true);
      const formData = new FormData();
      formData.append("proofFile", proofFile);

      const response = await apiService.uploadWithdrawalProof(formData);
      if (response?.status !== "success" || !response?.payload?.proofUrl) {
        throw new Error(response?.msg || "No se pudo subir el comprobante.");
      }

      setProofUrl(response.payload.proofUrl);
      setProofFile(null);

      Swal.fire({
        icon: "success",
        title: "Comprobante subido",
        text: "El archivo quedó listo para aprobar el retiro.",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al subir el comprobante",
        text: error?.message || "No se pudo subir el archivo seleccionado.",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
    } finally {
      setUploadingProof(false);
    }
  };

  const handleApprove = async () => {
    if (!withdrawal?._id || !proofUrl || submitting) return;

    const confirmResult = await Swal.fire({
      icon: "question",
      title: "Confirmar aprobación",
      text: `Se aprobará el retiro por ${amountLabel}. Esta acción no debe ejecutarse dos veces.`,
      showCancelButton: true,
      confirmButtonText: "Aprobar",
      cancelButtonText: "Cancelar",
      background: "#082b55",
      color: "#ffffff",
      customClass: { confirmButton: "custom-swal-button" },
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setSubmitting(true);
      const response = await apiService.processWithdrawal(withdrawal._id, proofUrl, token);
      if (response?.status !== "success" || !response?.payload) {
        throw new Error(response?.msg || "No se pudo aprobar el retiro.");
      }

      setWithdrawal((prev) =>
        prev
          ? {
              ...prev,
              ...response.payload,
              status: response.payload.status || "completed",
              proofUrl: response.payload.proofUrl || proofUrl,
            }
          : prev
      );

      Swal.fire({
        icon: "success",
        title: "Retiro aprobado",
        text: "La solicitud fue procesada correctamente y el usuario ya fue notificado.",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo aprobar",
        text: error?.message || "Ocurrió un error al aprobar la solicitud.",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!withdrawal?._id || submitting) return;

    const confirmResult = await Swal.fire({
      icon: "warning",
      title: "Confirmar rechazo",
      text: "Los fondos se devolverán al balance disponible del usuario.",
      showCancelButton: true,
      confirmButtonText: "Rechazar",
      cancelButtonText: "Cancelar",
      background: "#082b55",
      color: "#ffffff",
      customClass: { confirmButton: "custom-swal-button" },
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setSubmitting(true);
      const response = await apiService.rejectWithdrawal(
        withdrawal._id,
        rejectionReason.trim(),
        token
      );

      if (response?.status !== "success" || !response?.payload) {
        throw new Error(response?.msg || "No se pudo rechazar el retiro.");
      }

      setWithdrawal((prev) =>
        prev
          ? {
              ...prev,
              ...response.payload,
              status: response.payload.status || "rejected",
              rejectionReason: response.payload.rejectionReason || rejectionReason.trim(),
            }
          : prev
      );

      Swal.fire({
        icon: "success",
        title: "Retiro rechazado",
        text: "Los fondos fueron devueltos y el usuario ya fue notificado.",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo rechazar",
        text: error?.message || "Ocurrió un error al rechazar la solicitud.",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isResolved = ["completed", "rejected", "expired"].includes(withdrawal?.status);

  return (
    <div className="container mt-5 admin-withdrawal-process-page">
      <div className="admin-withdrawal-process-card">
        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4">
          <div>
            <h2 className="text-orange mb-2">Procesamiento de retiro</h2>
            <p className="text-white-50 mb-0">
              Validación operativa con sesión admin y token firmado del email.
            </p>
          </div>
          <Link to="/dashboard/gestion" className="btn btn-outline-orange">
            <i className="bi bi-arrow-left-circle-fill me-2"></i>
            Ir a Gestión
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5 text-white">
            <div className="spinner-border text-orange" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3 mb-0">Cargando solicitud de retiro...</p>
          </div>
        ) : errorMessage ? (
          <div className="alert custom-alert mb-0">
            <h5 className="mb-2">No se pudo abrir el retiro</h5>
            <p className="mb-0">{errorMessage}</p>
          </div>
        ) : withdrawal ? (
          <div className="admin-withdrawal-grid">
            <section className="admin-withdrawal-panel">
              <h5 className="text-orange mb-3">Solicitud</h5>

              <div className="admin-withdrawal-highlight mb-3">
                <span className="text-white-50 d-block mb-1">Monto</span>
                <strong className="text-money">{amountLabel}</strong>
              </div>

              <div className="admin-withdrawal-data">
                <p><strong>Estado:</strong> <span className={`admin-withdrawal-status status-${withdrawal.status}`}>{withdrawal.status}</span></p>
                <p><strong>Creado:</strong> {formatDate(withdrawal.createdAt)}</p>
                <p><strong>Expira:</strong> {formatDate(withdrawal.expiresAt)}</p>
                <p><strong>Procesado:</strong> {formatDate(withdrawal.processedAt)}</p>
                <p><strong>Método:</strong> {withdrawal.payoutMethod || "No definido"}</p>
                <p className="mb-0"><strong>Cuenta:</strong> {getAccountSummary(withdrawal) || "No definida"}</p>
              </div>

              {withdrawal.rejectionReason ? (
                <div className="admin-withdrawal-note mt-3">
                  <strong className="d-block mb-2">Motivo de rechazo</strong>
                  <span>{withdrawal.rejectionReason}</span>
                </div>
              ) : null}
            </section>

            <section className="admin-withdrawal-panel">
              <h5 className="text-orange mb-3">Usuario</h5>
              <div className="admin-withdrawal-data">
                <p><strong>Nombre:</strong> {getUserName(withdrawal.userId)}</p>
                <p><strong>Email:</strong> {withdrawal.userId?.email || "No definido"}</p>
                <p><strong>CI:</strong> {withdrawal.userId?.ci || "No definido"}</p>
                <p><strong>Teléfono:</strong> {withdrawal.userId?.phone || "No definido"}</p>
                <p className="mb-0"><strong>Categorías:</strong> {getUserCategories(withdrawal.userId)}</p>
              </div>

              <div className="admin-withdrawal-note mt-3">
                <strong className="d-block mb-2">Snapshot de pago</strong>
                <span>{getAccountSummary(withdrawal) || "No definido"}</span>
              </div>
            </section>

            <section className="admin-withdrawal-panel admin-withdrawal-panel-wide">
              <h5 className="text-orange mb-3">Comprobante y acciones</h5>

              <div className="mb-3">
                <label className="form-label text-white">Seleccionar comprobante</label>
                <input
                  type="file"
                  className="form-control portafolio-input"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  disabled={isResolved || submitting || uploadingProof}
                />
                <small className="text-white-50 d-block mt-2">
                  Formatos permitidos: PDF, PNG, JPG, JPEG y WEBP.
                </small>
              </div>

              <div className="d-flex gap-2 flex-wrap mb-3">
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleProofUpload}
                  disabled={!proofFile || isResolved || submitting || uploadingProof}
                >
                  {uploadingProof ? "Subiendo..." : "Subir comprobante"}
                </button>

                {proofUrl ? (
                  <a
                    href={proofUrl.startsWith("http") ? proofUrl : `/api${proofUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-orange"
                  >
                    Ver comprobante actual
                  </a>
                ) : null}
              </div>

              <div className="mb-3">
                <label className="form-label text-white">Motivo de rechazo</label>
                <textarea
                  className="form-control portafolio-input"
                  rows="4"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Opcional. Se enviará al usuario en el email de rechazo."
                  disabled={isResolved || submitting}
                />
              </div>

              <div className="admin-withdrawal-note mb-3">
                <strong className="d-block mb-2">Controles de seguridad</strong>
                <span>
                  Esta pantalla solo habilita la operación si existe sesión admin y el token firmado
                  del email sigue siendo válido. La validación final del retiro se hace en base de datos.
                </span>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleApprove}
                  disabled={!proofUrl || isResolved || submitting || uploadingProof}
                >
                  {submitting && !isResolved ? "Procesando..." : "Aprobar retiro"}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleReject}
                  disabled={isResolved || submitting}
                >
                  {submitting && !isResolved ? "Procesando..." : "Rechazar retiro"}
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
