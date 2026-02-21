import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { FadeIn } from "../../FadeIn/FadeIn";
import { apiService } from "../../../services/apiService";
import "./Certificados.css";

const CERTIFICATES_PER_PAGE = 6;

export function Certificados({ user }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(certificates.length / CERTIFICATES_PER_PAGE));
  const start = (currentPage - 1) * CERTIFICATES_PER_PAGE;
  const certificatesPage = certificates.slice(start, start + CERTIFICATES_PER_PAGE);

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

  const formatIssuedDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("es-UY", { day: "numeric", month: "long", year: "numeric" });
  };

  const generarPDF = async (cert, item = null, userData = null) => {
    if (!cert) return;
    const durationText = cert.duration != null ? `${cert.duration} horas` : "";
    const difficulty = (item?.difficulty || cert.difficulty || "").replace(/</g, "&lt;");
    const userCi = (userData?.ci ?? "").toString().replace(/</g, "&lt;");

    const certificado = document.createElement("div");
    certificado.style.position = "absolute";
    certificado.style.left = "-9999px";
    certificado.style.width = "3508px";
    certificado.style.height = "2480px";
    certificado.style.padding = "0px";
    certificado.style.margin = "0px";
    certificado.style.textAlign = "center";
    certificado.style.border = "none";
    certificado.style.backgroundImage = "url(/fondo-cert.webp)";
    certificado.style.backgroundSize = "cover";
    certificado.style.backgroundPosition = "center";
    certificado.innerHTML = `
    <div class="text-white" style="position: absolute; top: 48%; left: 66%; transform: translate(-50%, -50%); text-align: center;">
        <h1 class="custom-font" style="font-size: 8rem; width: 2000px;">${(cert.course || "").replace(/</g, "&lt;")}</h1>
        <h2 style="font-size: 6rem; width: 2000px;">${difficulty}</h2>
        <p style="font-size: 6rem; width: 2000px; margin-top: 100px;"><strong>${(cert.userName || "").toUpperCase().replace(/</g, "&lt;")}</strong></p>
        <p style="font-size: 4rem;">C.I.: ${userCi}</p>
        <p style="font-size: 3.5rem; margin: 40px 0 100px 0;">Se certifica que con fecha ${formatIssuedDate(cert.issuedAt)} el / la anteriormente mencionado/a ha completado con éxito su curso en Latias Academia${durationText ? `, con una duración aproximada de ${durationText}` : ""}, cumpliendo con todos los requisitos académicos exigidos durante su cursada.</p>
        <div>
            <p style="font-size: 3rem; margin-top: 100px;">ID de la credencial:</p>
            <p style="font-size: 4rem;"><strong>${(cert._id || "").toString().replace(/</g, "&lt;")}</strong></p>
        </div>
    </div>
    <div class="d-flex flex-row justify-content-evenly" style="margin-top: 2200px;">
        <div class="text-center text-white" style="border-top: white solid 1px; width: 500px;">
            <strong class="w-100" style="font-size: 3rem;">${(cert.instructor || "").replace(/</g, "&lt;")}</strong>
            <p class="w-100" style="font-size: 2rem;">${(cert.profession || "").replace(/</g, "&lt;")}</p>
        </div>
        <div class="text-center text-white" style="width: 500px;"></div>
        <div class="text-center text-white" style="border-top: white solid 1px; width: 500px;">
            <strong class="w-100" style="font-size: 3rem;">Joaquín Pérez Coria</strong>
            <p class="w-100" style="font-size: 2rem;">CEO Latias Academia</p>
        </div>
    </div>
    `;
    document.body.appendChild(certificado);

    await new Promise((resolve) => setTimeout(resolve, 400));

    try {
      const canvas = await html2canvas(certificado, { scale: 2, useCORS: true, backgroundColor: null });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1123, 794],
      });
      pdf.addImage(imgData, "PNG", 0, 0, 1123, 794, undefined, "FAST");
      const safeName = (cert.course || "certificado").replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]/g, "").trim() || "certificado";
      pdf.save(`certificado_${safeName}.pdf`);
    } catch (err) {
      console.error("Error generando PDF:", err);
    } finally {
      if (certificado.parentNode) document.body.removeChild(certificado);
      setGeneratingId(null);
    }
  };

  const handleCertificateClick = async (item) => {
    const userId = user?.id ?? user?._id;
    if (!userId || !item.courseId) return;
    setGeneratingId(item.courseId);
    try {
      const res = await apiService.getCourseCertificate(userId, item.courseId);
      if (res?.status === "success" && res?.payload) {
        await generarPDF(res.payload, item, user);
      }
    } catch (e) {
      console.error("Error al obtener certificado:", e);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <FadeIn>
      <div className="text-white col-12 col-lg-11 d-flex flex-column align-items-between container">
        <div className="col-12">
          <h2 className="mb-3 text-orange">Tus certificados obtenidos:</h2>
          <div className="div-border-color my-4"></div>
        </div>

      <div className="d-flex flex-column gap-4">
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-warning" role="status" />
            <p className="text-white-50 mt-2 mb-0">Cargando certificados...</p>
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
            {totalPages > 1 && (
              <nav className="certificados-pagination mt-4" aria-label="Paginación de certificados">
                <button
                  type="button"
                  className="btn btn-outline-warning btn-sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <i className="bi bi-chevron-left" /> Anterior
                </button>
                <span className="certificados-pagination-info text-white-50">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-outline-warning btn-sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Siguiente <i className="bi bi-chevron-right" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
      </div>
    </FadeIn>
  );
}