import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { FadeIn } from '../FadeIn/FadeIn';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import '../MercadoPagoPayment/MercadoPagoPayment.css';

const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '';

if (publicKey) {
  initMercadoPago(publicKey);
}

const PREMIUM_PLANS = {
  basico: { name: 'Plan Básico', price: 249, currency: 'USD' },
  navegante: { name: 'Plan Navegante', price: 359, currency: 'USD' },
  capitan: { name: 'Plan Capitán', price: 699, currency: 'USD' },
};

function getCurrencySymbol(currencyCode) {
  const symbols = { USD: '$', UYU: '$U', EUR: '€', ARS: '$', BRL: 'R$', MXN: '$', CLP: '$', COP: '$', PEN: 'S/', PYG: '₲' };
  return symbols[currencyCode?.toUpperCase()] || '$';
}

export function PremiumPayment() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const plan = PREMIUM_PLANS[planId];
  const [error, setError] = useState(null);
  const [preferenceId, setPreferenceId] = useState(null);
  const [creatingPreference, setCreatingPreference] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('mercadopago');
  const [devPurchaseLoading, setDevPurchaseLoading] = useState(false);
  const [devPurchaseError, setDevPurchaseError] = useState(null);

  useEffect(() => {
    if (!planId || !plan) {
      setError('Plan no válido. Debe ser basico, navegante o capitan.');
      return;
    }
    if (!user) {
      setError('Debes iniciar sesión para contratar un plan.');
      return;
    }
    setError(null);
  }, [planId, plan, user]);

  useEffect(() => {
    if (selectedPaymentMethod !== 'mercadopago') {
      setPreferenceId(null);
    }
  }, [selectedPaymentMethod]);

  useEffect(() => {
    const createPreference = async () => {
      if (!plan || !user || preferenceId || creatingPreference || selectedPaymentMethod !== 'mercadopago') return;

      setCreatingPreference(true);
      setError(null);
      try {
        const res = await apiService.createPremiumPreference(planId, user?.id ?? user?._id);
        if (res.status !== 'success') {
          throw new Error(res.msg || 'Error al crear la preferencia de pago');
        }
        const id = res.payload?.preferenceId;
        if (id) {
          setPreferenceId(id);
        } else {
          throw new Error('No se pudo obtener el ID de la preferencia');
        }
      } catch (err) {
        console.error('Error al crear preferencia premium:', err);
        setError(err.message);
      } finally {
        setCreatingPreference(false);
      }
    };

    createPreference();
  }, [planId, plan, user, preferenceId, creatingPreference, selectedPaymentMethod]);

  const currencySymbol = getCurrencySymbol(plan?.currency || 'USD');

  if (!planId || !plan) {
    return (
      <div className="container payment-wrapper">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Plan no válido.
            </div>
            <button className="btn btn-outline-orange" onClick={() => navigate('/gestoria')}>
              <i className="bi bi-arrow-left-circle-fill me-2"></i>
              Volver a Gestoría
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container payment-wrapper">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="alert alert-warning" role="alert">
              Debes iniciar sesión para contratar un plan.
            </div>
            <button className="btn btn-outline-orange" onClick={() => navigate('/login')}>
              Iniciar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error && !preferenceId) {
    return (
      <div className="container payment-wrapper">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
            <button className="btn btn-outline-orange" onClick={() => navigate('/gestoria')}>
              <i className="bi bi-arrow-left-circle-fill me-2"></i>
              Volver a Gestoría
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
            <button className="btn btn-outline-orange" onClick={() => navigate('/gestoria')}>
              Volver a Gestoría
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
                  <div>Finalizar Compra</div>
                </h2>
                <p className="text-white">
                  Contratación del plan: <strong>{plan.name}</strong>
                </p>
              </div>

              <div className="payment-summary mb-4">
                <h4 className="text-orange mb-3">Resumen del Pago</h4>
                <div className="payment-details">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-white">Plan:</span>
                    <span className="text-white">{plan.name}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-white">Vigencia:</span>
                    <span className="text-white">1 año (366 días)</span>
                  </div>
                  <hr className="text-white" />
                  <div className="d-flex justify-content-between">
                    <span className="text-white"><strong>Total:</strong></span>
                    <span className="text-orange price-unified-text">
                      <span className="price-symbol">{currencySymbol} </span>
                      <span className="price-value">{plan.price}</span>
                      <span className="price-decimal">.00 </span>
                      <span className="price-currency">{plan.currency}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="payment-methods mb-4">
                <h5 className="text-orange mb-3">Métodos de Pago Disponibles</h5>
                <div
                  className={`payment-icons payment-selectable ${selectedPaymentMethod === 'mercadopago' ? 'payment-selected' : ''}`}
                  onClick={() => setSelectedPaymentMethod('mercadopago')}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="bi bi-credit-card-fill text-white me-2"></i>
                  <span className="text-white">Mercado Pago</span>
                  {selectedPaymentMethod === 'mercadopago' && (
                    <i className="bi bi-check-circle-fill text-success ms-auto"></i>
                  )}
                </div>
                <div
                  className={`payment-icons payment-selectable ${selectedPaymentMethod === 'paypal' ? 'payment-selected' : ''}`}
                  onClick={() => setSelectedPaymentMethod('paypal')}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="bi bi-paypal text-white me-2"></i>
                  <span className="text-white">PayPal</span>
                  {selectedPaymentMethod === 'paypal' && (
                    <i className="bi bi-check-circle-fill text-success ms-auto"></i>
                  )}
                </div>
                <div
                  className={`payment-icons payment-selectable ${selectedPaymentMethod === 'bank' ? 'payment-selected' : ''}`}
                  onClick={() => setSelectedPaymentMethod('bank')}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="bi bi-bank2 text-white me-2"></i>
                  <span className="text-white">Transferencia bancaria (BROU)</span>
                  {selectedPaymentMethod === 'bank' && (
                    <i className="bi bi-check-circle-fill text-success ms-auto"></i>
                  )}
                </div>
              </div>

              {selectedPaymentMethod === 'mercadopago' && (
                <div className="security-info mb-4">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-shield-fill-check text-success me-2"></i>
                    <small className="text-white">
                      Pago seguro procesado por Mercado Pago. Tus datos están protegidos.
                    </small>
                  </div>
                </div>
              )}
              {selectedPaymentMethod === 'paypal' && (
                <div className="security-info mb-4" style={{ background: 'rgba(40, 167, 69, 0.1)', borderLeft: '4px solid #28a745' }}>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-shield-fill-check text-success me-2"></i>
                    <small className="text-white">
                      Pago seguro procesado por PayPal. Tus datos están protegidos y encriptados.
                    </small>
                  </div>
                </div>
              )}
              {selectedPaymentMethod === 'bank' && (
                <div className="security-info mb-4" style={{ background: 'rgba(255, 165, 0, 0.1)', borderLeft: '4px solid #ffa500' }}>
                  <div className="d-flex align-items-center">
                    <span className="me-2" style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <small className="text-white">
                      Las transferencias bancarias son validadas por nuestro personal, lo que puede demorar hasta 24 horas hábiles.
                    </small>
                  </div>
                </div>
              )}

              {selectedPaymentMethod === 'mercadopago' ? (
                creatingPreference ? (
                  <div className="mb-4 text-center">
                    <div className="spinner-border text-orange" role="status">
                      <span className="visually-hidden">Preparando pago...</span>
                    </div>
                    <p className="text-white mt-2">Preparando el botón de pago...</p>
                  </div>
                ) : preferenceId ? (
                  <div className="mb-4">
                    <Wallet initialization={{ preferenceId }} />
                    {(import.meta.env.DEV || import.meta.env.VITE_DEV_PAYMENT === 'true') && (
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
                              const res = await apiService.devCompletePremium(planId, uid);
                              if (res.status === 'success') {
                                navigate('/payment/success?dev=1&type=premium');
                                return;
                              }
                              setDevPurchaseError(res.msg || 'Error al simular la suscripción');
                            } catch (err) {
                              setDevPurchaseError(err.message || 'Error de conexión');
                            } finally {
                              setDevPurchaseLoading(false);
                            }
                          }}
                        >
                          {devPurchaseLoading ? (
                            <>
                              <span className="spinner-border me-2" style={{ width: '1em', height: '1em', borderWidth: '0.15em' }} aria-hidden="true" />
                              Simulando...
                            </>
                          ) : (
                            <>Comprar (Dev mode)</>
                          )}
                        </button>
                        <p className="small text-muted mt-2 mb-0">
                          Solo para pruebas: activa el plan en tu usuario y redirige a la página de éxito sin usar Mercado Pago.
                        </p>
                        {devPurchaseError && (
                          <p className="small text-danger mt-1 mb-0">{devPurchaseError}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Preparando el botón de pago...
                  </div>
                )
              ) : (
                <div className="alert alert-warning text-center mb-4">
                  <i className="bi bi-exclamation-triangle display-4 d-block mb-2 text-warning"></i>
                  <strong>Método de pago aún no implementado.</strong>
                  <p className="mt-2 mb-0">Este método de pago estará disponible próximamente.</p>
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
                onClick={() => navigate('/gestoria')}
              >
                <i className="bi bi-arrow-left-circle-fill me-2"></i>
                Volver a Gestoría
              </button>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
