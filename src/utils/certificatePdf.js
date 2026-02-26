import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export function formatIssuedDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("es-UY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Genera y descarga el PDF del certificado (misma lógica que en Certificados del dashboard).
 * @param {Object} cert - Certificado desde API (course, userName, userCi, instructor, profession, duration, issuedAt, _id, ...)
 * @param {Object} [item] - Curso comprado opcional (difficulty, courseName, courseId) para completar datos del PDF
 */
export async function generateCertificatePdf(cert, item = null) {
  if (!cert) return;
  const durationText = cert.duration != null ? `${cert.duration} horas` : "";
  const difficulty = (item?.difficulty || cert.difficulty || "").replace(/</g, "&lt;");
  const userCi = (cert.userCi ?? "").toString().replace(/</g, "&lt;");

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
    const canvas = await html2canvas(certificado, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [1123, 794],
    });
    pdf.addImage(imgData, "PNG", 0, 0, 1123, 794, undefined, "FAST");
    const safeName = (cert.course || "certificado")
      .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]/g, "")
      .trim() || "certificado";
    pdf.save(`certificado_${safeName}.pdf`);
  } catch (err) {
    console.error("Error generando PDF:", err);
  } finally {
    if (certificado.parentNode) document.body.removeChild(certificado);
  }
}
