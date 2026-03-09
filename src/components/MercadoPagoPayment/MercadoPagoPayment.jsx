import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import Swal from 'sweetalert2';
import { FadeIn } from '../FadeIn/FadeIn';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import './MercadoPagoPayment.css';

// Checkout Pro: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/overview
// Public Key desde Tus integraciones > Credenciales (prueba o producción)
const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '';

// Solo mostrar logs de debug en desarrollo
if (import.meta.env.DEV) {
  console.log('🔍 Debug - Variables de entorno Mercado Pago:', {
    hasPublicKey: !!publicKey,
    publicKeyLength: publicKey ? publicKey.length : 0,
    publicKeyPreview: publicKey ? `${publicKey.substring(0, 15)}...` : 'no definida',
    mode: import.meta.env.MODE,
    allViteEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
  });
}

if (publicKey) {
  initMercadoPago(publicKey);
  if (import.meta.env.DEV) {
    console.log('✅ Mercado Pago SDK inicializado correctamente');
  }
} else {
  // Solo mostrar warnings en desarrollo
  if (import.meta.env.DEV) {
    console.warn('⚠️ VITE_MERCADOPAGO_PUBLIC_KEY no está configurada. El botón de Mercado Pago no funcionará.');
    console.warn('💡 Asegúrate de:');
    console.warn('   1. Crear archivo .env o .env.development en la raíz del proyecto');
    console.warn('   2. Agregar: VITE_MERCADOPAGO_PUBLIC_KEY=TEST-tu-clave-aqui');
    console.warn('   3. Reiniciar el servidor de desarrollo (npm run dev) o rebuild (npm run build)');
  }
}

export function MercadoPagoPayment() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preferenceId, setPreferenceId] = useState(null);
  const [creatingPreference, setCreatingPreference] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('mercadopago');
  /** Solo desarrollo: estado para el botón "Comprar (Dev mode)" que simula el retorno sin MP */
  const [devPurchaseLoading, setDevPurchaseLoading] = useState(false);
  const [devPurchaseError, setDevPurchaseError] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [redeemFreeLoading, setRedeemFreeLoading] = useState(false);
  const freeCoursesCount = user?.premium?.freeCourses ?? 0;

  // Función para obtener el símbolo de moneda según el código
  const getCurrencySymbol = (currencyCode) => {
    const currencySymbols = {
      'USD': '$',
      'UYU': '$U',
      'EUR': '€',
      'ARS': '$',
      'BRL': 'R$',
      'MXN': '$',
      'CLP': '$',
      'COP': '$',
      'PEN': 'S/',
      'PYG': '₲'
    };
    return currencySymbols[currencyCode?.toUpperCase()] || '$';
  };

  // Cargar información del curso
  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getCourseByCourseId(courseId);
        if (response.status === "success") {
          setCourse(response.payload);
        } else {
          setError(response.msg || 'Curso no encontrado');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err.message || 'Error al cargar el curso');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // Resetear preferenceId cuando cambie el método de pago
  useEffect(() => {
    if (selectedPaymentMethod !== 'mercadopago') {
      setPreferenceId(null);
    }
  }, [selectedPaymentMethod]);

  // Crear preferencia de pago cuando el curso esté cargado y Mercado Pago esté seleccionado
  useEffect(() => {
    const createPreference = async () => {
      if (!course || !user || preferenceId || creatingPreference || selectedPaymentMethod !== 'mercadopago') return;

      setCreatingPreference(true);
      try {
        const numericPrice = Number(course.price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
          throw new Error('El precio del curso no es válido');
        }

        const response = await apiService.request('/mercadopago/create-preference', {
          method: 'POST',
          body: JSON.stringify({
            courseId: course.courseId || course._id,
            courseName: course.courseName || course.name,
            price: numericPrice,
            currency: course.currency || 'USD',
            userId: user.id
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.msg || 'Error al crear la preferencia de pago');
        }

        if (data.payload?.preferenceId) {
          setPreferenceId(data.payload.preferenceId);
        } else {
          throw new Error('No se pudo obtener el ID de la preferencia');
        }
      } catch (error) {
        console.error('Error al crear preferencia:', error);
        setError(error.message);
      } finally {
        setCreatingPreference(false);
      }
    };

    createPreference();
  }, [course, user, preferenceId, creatingPreference, selectedPaymentMethod]);

  // Obtener la moneda del curso o usar USD por defecto
  const courseCurrency = course?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(courseCurrency);

  if (loading || creatingPreference) {
    return (
      <div className="container payment-wrapper">
        <div className="d-flex justify-content-center align-items-center">
          <div className="text-center">
            <div className="spinner-border text-orange" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-white mt-3">
              {loading ? 'Cargando información del curso...' : 'Preparando el pago...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container payment-wrapper">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
            <div className="d-flex justify-content-end">
              <button 
                className="btn btn-outline-orange" 
                onClick={() => navigate('/cursos')}
              >
                <i className="bi bi-arrow-left-circle-fill me-2"></i>
                Volver a Cursos
              </button>
            </div>
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
              <i className="bi bi-exclamation-triangle me-2"></i>
              La configuración de Mercado Pago no está completa. Por favor, contacta al administrador.
            </div>
            <div className="d-flex justify-content-end">
              <button 
                className="btn btn-outline-orange" 
                onClick={() => navigate('/cursos')}
              >
                <i className="bi bi-arrow-left-circle-fill me-2"></i>
                Volver a Cursos
              </button>
            </div>
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
                  Completa tu inscripción al curso <strong>{course.courseName || course.name}</strong>
                </p>
              </div>

              <div className="payment-summary mb-4">
                <h4 className="text-orange mb-3">Resumen del Pago</h4>
                <div className="payment-details">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-white">Curso:</span>
                    <span className="text-white">{course.courseName || course.name}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-white">Duración:</span>
                    <span className="text-white">{course.duration} horas</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-white">Dificultad:</span>
                    <span className="text-white">{course.difficulty}</span>
                  </div>
                  <hr className="text-white" />
                  <div className="d-flex justify-content-between">
                    <span className="text-white"><strong>Total:</strong></span>
                    <span className="text-orange price-unified-text">
                      <span className="price-symbol">{currencySymbol} </span> 
                      <span className="price-value">{course.price}</span>
                      <span className="price-decimal">.00 </span>
                      <span className="price-currency">{courseCurrency}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="payment-summary mb-4">
                <h5 className="text-orange mb-3">Código de descuento</h5>
                <div className="payment-details">
                  <input
                    id="checkout-discount-code"
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    autoComplete="off"
                    aria-label="Código de descuento"
                  />
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

              {/* Mensajes de seguridad según el método de pago */}
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

              {/* Mostrar botón de pago según el método seleccionado */}
              {selectedPaymentMethod === 'mercadopago' ? (
                preferenceId ? (
                  <div className="mb-4">
                    {/* Wallet Brick: redirige a Checkout Pro con la preferencia creada en el backend */}
                    <Wallet initialization={{ preferenceId }} />
                    {/* Botón canjear curso gratuito: solo si tiene freeCourses, asigna curso y resta 1 en backend */}
                    {freeCoursesCount > 0 && course && user && (
                      <div className="mt-3 w-100">
                        <button
                          type="button"
                          className="btn btn-success w-100"
                          disabled={redeemFreeLoading}
                          onClick={async () => {
                            setRedeemFreeLoading(true);
                            try {
                              const id = course.courseId || course._id;
                              const uid = user?.id ?? user?._id;
                              const res = await apiService.redeemFreeCourse(id, uid);
                              if (res.status === 'success') {
                                navigate('/payment/success?free=1');
                                return;
                              }
                              Swal.fire({
                                icon: 'warning',
                                title: 'No se pudo canjear',
                                text: res.msg || 'Usuario no tiene cursos gratis disponibles para canjear.',
                                confirmButtonText: 'Aceptar',
                                background: '#082b55',
                                color: '#ffffff',
                                customClass: { confirmButton: 'custom-swal-button' },
                              });
                            } catch (err) {
                              Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: err.message || 'Usuario no tiene cursos gratis disponibles para canjear.',
                                confirmButtonText: 'Aceptar',
                                background: '#082b55',
                                color: '#ffffff',
                                customClass: { confirmButton: 'custom-swal-button' },
                              });
                            } finally {
                              setRedeemFreeLoading(false);
                            }
                          }}
                        >
                          {redeemFreeLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                              Canjeando...
                            </>
                          ) : (
                            <>Canjear gratis ({freeCoursesCount} disponible{freeCoursesCount !== 1 ? 's' : ''})</>
                          )}
                        </button>
                      </div>
                    )}
                    {/* SOLO DESARROLLO: simula compra y retorno a la app sin pasar por MP (sandbox no redirige a localhost).
                        Se muestra si npm run dev (import.meta.env.DEV) o si en .env está VITE_DEV_PAYMENT=true.
                        En producción: no definir VITE_DEV_PAYMENT y el build tendrá DEV=false. */}
                    {(import.meta.env.DEV || import.meta.env.VITE_DEV_PAYMENT === 'true') && course && user && (
                      <div className="mt-3 text-center">
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={devPurchaseLoading}
                          onClick={async () => {
                            setDevPurchaseError(null);
                            setDevPurchaseLoading(true);
                            try {
                              const id = course.courseId || course._id;
                              const res = await apiService.devCompletePurchase(id, user.id);
                              if (res.status === 'success') {
                                navigate('/payment/success?dev=1');
                                return;
                              }
                              setDevPurchaseError(res.msg || 'Error al simular la compra');
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
                          Solo para pruebas: asigna el curso al usuario y redirige a la página de éxito sin usar Mercado Pago.
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
                onClick={() => navigate(`/course/${courseId}/learn`)}
              >
                <i className="bi bi-arrow-left-circle-fill me-2"></i>
                Volver al Curso
              </button>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
