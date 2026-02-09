import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { FadeIn } from "../FadeIn/FadeIn";
import { apiService } from "../../services/apiService";
import Swal from "sweetalert2";
import "./BoatRegistration.css";

export function ApproveBoatRegistration() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [boat, setBoat] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    loadBoat();
  }, [id]);

  const loadBoat = async () => {
    try {
      const response = await apiService.getBoatById(id);
      if (response.status === "success" && response.payload) {
        setBoat(response.payload);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Barco no encontrado",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      }
    } catch (error) {
      console.error("Error al cargar barco:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al cargar la información del barco",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setConfirming(true);
      const response = await fetch(`/api/boats/registration/approve/${id}?token=${token}`);
      const data = await response.json();

      if (data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Registro Aprobado",
          text: "El registro del barco ha sido aprobado exitosamente.",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
        // Redirigir después de 2 segundos
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        throw new Error(data.msg || "Error al aprobar el registro");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al aprobar el registro",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <FadeIn>
        <div className="container mt-5 text-center text-white">
          <div className="spinner-border text-orange" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </FadeIn>
    );
  }

  if (!boat) {
    return (
      <FadeIn>
        <div className="container mt-5 text-center text-white">
          <h2>Barco no encontrado</h2>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <div className="container mt-5 justify-content-center boat-registration-confirmation">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-10 col-xl-10">
            <div className="flota-form-container">
              <div className="d-flex justify-content-center align-items-center mb-3">
                <h5 className="text-white mb-0 px-3 py-2 rounded" style={{ backgroundColor: '#28a745', textTransform: 'uppercase' }}>Confirmar Aprobación de Registro</h5>
              </div>
              <div className="div-border-color my-3"></div>
              <div className="text-white">
                <p className="text-center mb-4">
                  ¿Estás seguro de que deseas <strong>APROBAR</strong> el registro del siguiente barco?
                </p>
                
                {boat && (
                  <>
                    {boat.owner && (
                      <div className="boat-info mb-4">
                        <h5 className="text-orange mb-3">Información del Solicitante</h5>
                        <p><strong>Nombre:</strong> {boat.owner.firstName} {boat.owner.lastName}</p>
                        <p><strong>Email:</strong> {boat.owner.email}</p>
                        {boat.owner.ci && <p><strong>CI:</strong> {boat.owner.ci}</p>}
                      </div>
                    )}
                    <div className="boat-info mb-4">
                      <h5 className="text-orange mb-3">Información del Barco</h5>
                      <p><strong>Nombre:</strong> {boat.name}</p>
                      <p><strong>Número de Registro:</strong> {boat.registrationNumber}</p>
                      <p><strong>Bandera:</strong> {boat.registrationCountry}</p>
                      <p><strong>Puerto de Registro:</strong> {boat.registrationPort}</p>
                      {boat.currentPort && <p><strong>Puerto Actual:</strong> {boat.currentPort}</p>}
                      <p><strong>Tipo:</strong> {boat.boatType}</p>
                      <p><strong>Eslora:</strong> {boat.lengthOverall}m</p>
                      <p><strong>Manga:</strong> {boat.beam}m</p>
                      {boat.depth && <p><strong>Calado:</strong> {boat.depth}m</p>}
                      {boat.displacement && <p><strong>Desplazamiento:</strong> {boat.displacement} Tons.</p>}
                      {boat.image && (
                        <div className="mt-3">
                          <p><strong>Imagen del Barco:</strong></p>
                          <img 
                            src={boat.image} 
                            alt={boat.name} 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '300px', 
                              borderRadius: '5px',
                              border: '2px solid rgba(255, 165, 0, 0.5)'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="d-flex gap-3 justify-content-center">
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/")}
                    disabled={confirming}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={handleConfirm}
                    disabled={confirming}
                  >
                    {confirming ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: "0.8em", height: "0.8em", borderWidth: "0.12em", borderColor: "#082b55", borderRightColor: "transparent", verticalAlign: "middle" }}></span>
                        Aprobando...
                      </>
                    ) : (
                      "Confirmar Aprobación"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
