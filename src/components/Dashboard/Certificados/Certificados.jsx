import React from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "./Certificados.css";

export function Certificados({ user }) {
  const cursosAprobados = Array.isArray(user.approvedCourses)
    ? user.approvedCourses
    : [];

  const generarPDF = async (curso) => {
    const certificado = document.createElement("div");
    certificado.style.position = "absolute";
    certificado.style.left = "-9999px";
    certificado.style.width = "3508px"; // Ancho del diseño original
    certificado.style.height = "2480px"; // Alto del diseño original
    certificado.style.padding = "0px";
    certificado.style.margin = "0px";
    certificado.style.textAlign = "center";
    certificado.style.border = "none";
    certificado.style.backgroundImage = "url(/fondo-cert.webp)";
    certificado.innerHTML = `
          <div class="text-white" style="position: absolute; top: 48%; left: 66%; transform: translate(-50%, -50%); text-align: center;">
              <h1 class="custom-font" style="font-size: 8rem; width: 2000px;">${curso.courseName}</h1>
              <h2 style="font-size: 6rem; width: 2000px;">${curso.difficulty}</h2>
              <p style="font-size: 6rem; width: 2000px; margin-top: 100px;"><strong>${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}</strong></p>
              <p style="font-size: 4rem;">C.I.: ${user.ci}</p>
              <p style="font-size: 3.5rem; margin: 40px 0 100px 0;">Se certifica que con fecha ${curso.dateCompleted} el / la anteriormente mencionado/a ha completado con éxito su curso en Latias Academia, con una duración de ${curso.duration}, cumpliendo con todos los requisitos académicos exigidos durante su cursada.</p>
              <div>
                  <p style="font-size: 3rem; margin-top: 100px;">N.º de Credencial:</p>
                  <p style="font-size: 4rem;"><strong>${curso.certificate.credentialNumber}</strong></p>
              </div>
          </div>
          <div class="d-flex flex-row justify-content-evenly" style="margin-top: 2200px;">
              <div class="text-center text-white" style="border-top: white solid 1px; width: 500px;">
                  <strong class="w-100" style="font-size: 3rem;">${curso.professor.firstName} ${curso.professor.lastName}</strong>
                  <p class="w-100" style="font-size: 2rem;">${curso.professor.profession}</p>
              </div>
              <div class="text-center text-white" style="width: 500px;"></div>
              <div class="text-center text-white" style="border-top: white solid 1px; width: 500px;">
                  <strong class="w-100" style="font-size: 3rem;">Joaquín Pérez Coria</strong>
                  <p class="w-100" style="font-size: 2rem;">CEO Latias Academia</p>
              </div>
          </div>
      `;
    document.body.appendChild(certificado);

    await new Promise((resolve) => setTimeout(resolve, 300));

    html2canvas(certificado, { scale: 2, useCORS: true, backgroundColor: null })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [1123, 794], // Dimensiones ajustadas para horizontal
        });
        pdf.addImage(imgData, "PNG", 0, 0, 1123, 794, undefined, "FAST");
        pdf.save(`certificado_${curso.certificate.credentialNumber}.pdf`);
        document.body.removeChild(certificado);
      })
      .catch((err) => console.error("Error generando PDF:", err));
  };

  return (
    <div className="text-white col-12 col-lg-11 d-flex flex-column align-items-between container">
      <div className="col-12">
        <h2 className="mb-3 text-orange">Tus certificados obtenidos:</h2>
        <div className="div-border-color my-4"></div>
      </div>

      <div className="d-flex flex-column gap-4">
        {cursosAprobados.length === 0 ? (
          <div className="text-center my-5 d-flex flex-column align-items-center col-11">
            <i className="bi bi-award-fill mb-4 custom-display-1 text-orange"></i>
            <h3>No vemos certificados en tu bitácora.</h3>
            <p className="fst-italic">
              ¡Cuando completes un curso, recibirás tu merecido reconocimiento!
            </p>
          </div>
        ) : (
          cursosAprobados.map((curso, index) => (
            <div
              key={index}
              className="d-flex flex-column flex-lg-row col-12 p-4 gap-4 rounded certificate-banner"
              style={{ backgroundImage: `url(${curso.bannerUrl})` }}
            >
              <div className="col-12 col-lg-3 my-auto text-center">
                <img
                  className="img-fluid col-6 col-lg-12 rounded certificate-frontline"
                  src="/certificate-placeholder.webp"
                  alt="certificado"
                />
              </div>
              <div className="col-12 col-lg-9 d-flex d-lg-block flex-column align-items-center gap-2">
                <h3 className="text-orange text-center text-lg-start certificate-frontline">
                  {curso.courseName || "Curso Aprobado"}
                </h3>
                <div className="d-flex flex-column flex-sm-row gap-2 gap-sm-5">
                  <div className="text-center text-lg-start">
                    <p className="m-0 text-white certificate-frontline">
                      Fecha de finalización:
                    </p>
                    <strong className="text-white certificate-frontline">
                      {curso.dateCompleted}
                    </strong>
                  </div>
                  <div className="text-center text-lg-start">
                    <p className="m-0 text-white certificate-frontline">
                      N.º de Credencial:
                    </p>
                    <strong className="text-white certificate-frontline">
                      {curso.certificate.credentialNumber}
                    </strong>
                  </div>
                </div>
                <div className="justify-content-center text-start">
                  <button
                    className="btn btn-warning mt-2"
                    onClick={() => generarPDF(curso)}
                  >
                    Generar certificado <i className="bi bi-award-fill"></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}