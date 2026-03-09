import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { FadeIn } from "../FadeIn/FadeIn";
import { apiService } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import "../MercadoPagoPayment/MercadoPagoPayment.css";

const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || "";

if (publicKey) {
  initMercadoPago(publicKey);
}

const PROCEDURE_AMOUNT = 30;
const PROCEDURE_CURRENCY = "USD";
const PROCEDURE_TITLE = "Trámite de flota - Solicitud";

function getCurrencySymbol(currencyCode) {
  const symbols = { USD: "$", UYU: "$U", EUR: "€", ARS: "$", BRL: "R$", MXN: "$", CLP: "$", COP: "$", PEN: "S/", PYG: "₲" };
  return symbols[currencyCode?.toUpperCase()] || "$";
}

export function ProcedurePayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { preferenceId, requestId } = location.state || {};
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("mercadopago");
  const [devPurchaseLoading, setDevPurchaseLoading] = useState(false);
  const [devPurchaseError, setDevPurchaseError] = useState(null);

  const currencySymbol = getCurrencySymbol(PROCEDURE_CURRENCY);

  if (!preferenceId) {
    return (
      <div className="container payment-wrapper">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="alert alert-warning" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Sesión de pago no válida. Por favor, inicia el trámite nuevamente desde Mi gestor.
            </div>
            <button
              className="btn btn-outline-orange"
              onClick={() => navigate("/dashboard/general/gestor")}
            >
              <i className="bi bi-arrow-left-circle-fill me-2"></i>
              Volver a Mi gestor
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div className="container payment-wrapper">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="alert alert-warning" role="alert">
              La configuración de Mercado Pago no está completa.
            </div>
            <button
              className="btn btn-outline-orange"
              onClick={() => navigate("/dashboard/general/gestor")}
            >
              <i className="bi bi-arrow-left-circle-fill me-2"></i>
              Volver a Mi gestor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container payment-wrapper">
      <FadeIn>
        <div className="row justify-content-center align-items-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-7">
            <div className="payment-container">
              <div className="text-center mb-4">
                <h2 className="text-orange mb-3">
                  <i className="bi bi-cash-coin display-4"></i>
                  <div>Finalizar pago del trámite</div>
                </h2>
                <p className="text-white">
                  Aboná el trámite de flota para que tu solicitud sea enviada a tu gestor.
                </p>
              </div>

              <div className="payment-summary mb-4">
                <h4 className="text-orange mb-3">Resumen del pago</h4>
                <div className="payment-details">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-white">Concepto:</span>
                    <span className="text-white">{PROCEDURE_TITLE}</span>
                  </div>
                  <hr className="text-white" />
                  <div className="d-flex justify-content-between">
                    <span className="text-white"><strong>Total:</strong></span>
                    <span className="text-orange price-unified-text">
                      <span className="price-symbol">{currencySymbol} </span>
                      <span className="price-value">{PROCEDURE_AMOUNT}</span>
                      <span className="price-decimal">.00 </span>
                      <span className="price-currency">{PROCEDURE_CURRENCY}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="payment-methods mb-4">
                <h5 className="text-orange mb-3">Métodos de pago disponibles</h5>
                <div
                  className={`payment-icons payment-selectable ${selectedPaymentMethod === "mercadopago" ? "payment-selected" : ""}`}
                  onClick={() => setSelectedPaymentMethod("mercadopago")}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-credit-card-fill text-white me-2"></i>
                  <span className="text-white">Mercado Pago</span>
                  {selectedPaymentMethod === "mercadopago" && (
                    <i className="bi bi-check-circle-fill text-success ms-auto"></i>
                  )}
                </div>
                <div
                  className={`payment-icons payment-selectable ${selectedPaymentMethod === "paypal" ? "payment-selected" : ""}`}
                  onClick={() => setSelectedPaymentMethod("paypal")}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-paypal text-white me-2"></i>
                  <span className="text-white">PayPal</span>
                  {selectedPaymentMethod === "paypal" && (
                    <i className="bi bi-check-circle-fill text-success ms-auto"></i>
                  )}
                </div>
                <div
                  className={`payment-icons payment-selectable ${selectedPaymentMethod === "bank" ? "payment-selected" : ""}`}
                  onClick={() => setSelectedPaymentMethod("bank")}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-bank2 text-white me-2"></i>
                  <span className="text-white">Transferencia bancaria (BROU)</span>
                  {selectedPaymentMethod === "bank" && (
                    <i className="bi bi-check-circle-fill text-success ms-auto"></i>
                  )}
                </div>
              </div>

              {selectedPaymentMethod === "mercadopago" && (
                <div className="security-info mb-4">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-shield-fill-check text-success me-2"></i>
                    <small className="text-white">
                      Pago seguro procesado por Mercado Pago. Tus datos están protegidos.
                    </small>
                  </div>
                </div>
              )}
              {selectedPaymentMethod === "paypal" && (
                <div className="security-info mb-4" style={{ background: "rgba(40, 167, 69, 0.1)", borderLeft: "4px solid #28a745" }}>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-shield-fill-check text-success me-2"></i>
                    <small className="text-white">
                      Pago seguro procesado por PayPal. Tus datos están protegidos y encriptados.
                    </small>
                  </div>
                </div>
              )}
              {selectedPaymentMethod === "bank" && (
                <div className="security-info mb-4" style={{ background: "rgba(255, 165, 0, 0.1)", borderLeft: "4px solid #ffa500" }}>
                  <div className="d-flex align-items-center">
                    <span className="me-2" style={{ fontSize: "1.2rem" }}>⚠️</span>
                    <small className="text-white">
                      Las transferencias bancarias son validadas por nuestro personal, lo que puede demorar hasta 24 horas hábiles.
                    </small>
                  </div>
                </div>
              )}

              {selectedPaymentMethod === "mercadopago" ? (
                <div className="mb-4">
                  <Wallet initialization={{ preferenceId }} />
                  {/* Misma condición que cursos y planes: DEV o VITE_DEV_PAYMENT */}
                  {(import.meta.env.DEV || import.meta.env.VITE_DEV_PAYMENT === "true") && preferenceId && requestId && user && (
                    <div className="mt-3 text-center">
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={devPurchaseLoading}
                        onClick={async () => {
                          setDevPurchaseError(null);
                          setDevPurchaseLoading(true);
                          try {
                            const uid = user?.id ?? user?._id;
                            const res = await apiService.devCompleteProcedure(requestId, uid);
                            if (res.status === "success") {
                              navigate("/payment/success?dev=1&type=procedure");
                              return;
                            }
                            setDevPurchaseError(res.msg || "Error al simular el pago del trámite");
                          } catch (err) {
                            setDevPurchaseError(err?.message || "Error de conexión");
                          } finally {
                            setDevPurchaseLoading(false);
                          }
                        }}
                      >
                        {devPurchaseLoading ? (
                          <>
                            <span className="spinner-border me-2" style={{ width: "1em", height: "1em", borderWidth: "0.15em" }} aria-hidden="true" />
                            Simulando...
                          </>
                        ) : (
                          <>Comprar (Dev mode)</>
                        )}
                      </button>
                      <p className="small text-muted mt-2 mb-0">
                        Solo para pruebas: crea el trámite y lo registra como pagado sin usar Mercado Pago.
                      </p>
                      {devPurchaseError && (
                        <p className="small text-danger mt-1 mb-0">{devPurchaseError}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="alert alert-warning text-center mb-4">
                  <i className="bi bi-exclamation-triangle display-4 d-block mb-2 text-warning"></i>
                  <strong>Método de pago aún no implementado.</strong>
                  <p className="mt-2 mb-0">Por el momento solo está disponible el pago con Mercado Pago.</p>
                </div>
              )}

              <div className="mt-3 text-center">
                <small className="text-muted">
                  Al proceder con el pago, aceptas nuestros términos y condiciones.
                </small>
              </div>
            </div>

            <div className="mt-4 d-flex justify-content-end">
              <button
                className="btn btn-outline-orange"
                onClick={() => navigate("/dashboard/general/gestor")}
              >
                <i className="bi bi-arrow-left-circle-fill me-2"></i>
                Volver a Mi gestor
              </button>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
