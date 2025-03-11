import React from "react";
import "./Certificados.css";

export function Certificados({user}) {
    const cursosAprobados = Array.isArray(user.approvedCourses) ? user.approvedCourses : [];
    console.log(cursosAprobados)

    return (
        <div className="text-white col-12 col-lg-11 d-flex flex-column align-items-between container">
            <div className="col-12">
                <h2 className="mb-4 text-orange">Tus certificados obtenidos:</h2>
            </div>
            <div className="d-flex flex-column gap-3">
                {cursosAprobados.map((curso, index) => (
                    <div key={index} className="d-flex flex-column flex-lg-row col-12 p-4 gap-4 rounded certificate-banner" style={{ backgroundImage: `url(${curso.bannerUrl})`}}>
                        <div className="col-12 col-lg-3 my-auto text-center">
                            <img className="img-fluid col-6 col-lg-12 rounded certificate-frontline" src="../../src/assets/certificate-placeholder.webp" alt="certificado" />
                        </div>
                        <div className="col-12 col-lg-9 d-flex d-lg-block flex-column align-items-center gap-2">
                            <h3 className="text-orange text-center text-lg-start certificate-frontline">{curso.courseName || "Curso Aprobado"}</h3>
                            <div className="d-flex flex-column flex-sm-row gap-2 gap-sm-5">
                                <div className="text-center text-lg-start">
                                    <p className="m-0 text-white certificate-frontline">Fecha de finalización:</p>
                                    <strong className="text-white certificate-frontline">{curso.dateCompleted}</strong>
                                </div>
                                <div className="text-center text-lg-start">
                                    <p className="m-0 text-white certificate-frontline">N.º de Credencial:</p>
                                    <strong className="text-white certificate-frontline">{curso.certificate.credentialNumber}</strong>
                                </div>
                            </div>
                            <div className="justify-content-center text-start">
                                <button className="btn btn-warning mt-2">Generar certificado <i className="bi bi-award-fill"></i></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}