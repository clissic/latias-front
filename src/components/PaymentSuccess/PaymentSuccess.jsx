import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FadeIn } from '../FadeIn/FadeIn';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import './PaymentSuccess.css';

/**
 * Página de resultado tras el pago (Checkout Pro).
 * - Con payment_id/collection_id: verifica estado en MP y llama a process-successful-payment.
 * - Con dev=1 (solo desarrollo): muestra éxito sin llamar a MP; el curso ya fue asignado por dev-complete-purchase.
 * - Cuando el pago queda "approved", se actualiza el user en contexto y localStorage (purchasedCourses) para que el front refleje el curso comprado.
 */
export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { forceLogin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);

  /** Actualiza el user en contexto y localStorage con los datos del perfil (incl. purchasedCourses) para que "En tu bitácora" y la lista de cursos se vean bien. */
  const refreshUserFromProfile = useCallback(async () => {
    try {
      const profileRes = await apiService.getUserProfile();
      if (profileRes.status === 'success' && profileRes.payload?.user) {
        forceLogin(profileRes.payload.user);
      }
    } catch (e) {
      console.error('Error al actualizar perfil tras pago:', e);
    }
  }, [forceLogin]);

  // Parámetros de retorno de Checkout Pro (back_urls): payment_id, collection_id, status, etc.
  const paymentId = searchParams.get('payment_id');
  const collectionId = searchParams.get('collection_id');
  /** Solo desarrollo: dev=1 indica que la compra se simuló con el botón "Comprar (Dev mode)" sin MP */
  const isDevSimulation = searchParams.get('dev') === '1';
  /** free=1: curso canjeado con cupo gratuito (plan gestoría) */
  const isFreeRedeem = searchParams.get('free') === '1';
  /** type=premium: suscripción a plan de gestoría (curso vs premium) */
  const isPremium = searchParams.get('type') === 'premium';
  /** type=procedure: pago de trámite de flota */
  const isProcedure = searchParams.get('type') === 'procedure';

  useEffect(() => {
    // Canje gratuito: curso ya asignado por redeem-free-course, actualizar usuario (freeCourses -1)
    if (isFreeRedeem) {
      setPaymentInfo({
        status: 'approved',
        paymentId: 'Canje gratuito',
        isFreeRedeem: true,
      });
      setLoading(false);
      refreshUserFromProfile();
      return;
    }

    // Modo desarrollo: simulación de retorno sin pago real (curso, premium o trámite ya procesado por dev-complete-*)
    if (isDevSimulation) {
      setPaymentInfo({
        status: 'approved',
        paymentId: 'DEV (simulación)',
        devMode: true,
        isPremium,
        isProcedure,
      });
      setLoading(false);
      refreshUserFromProfile();
      return;
    }

    // Obtener el ID del pago (puede venir como payment_id o collection_id)
    const finalPaymentId = paymentId || collectionId;

    if (!finalPaymentId) {
      setError('No se recibió el ID del pago desde Mercado Pago');
      setLoading(false);
      return;
    }

    // Verificar y procesar el pago con el backend
    const verifyAndProcessPayment = async () => {
      try {
        // Primero verificar el estado del pago usando apiService
        const checkResponse = await apiService.request(`/mercadopago/payment-status/${finalPaymentId}`, {
          method: 'GET',
        });

        if (!checkResponse.ok) {
          throw new Error('Error al verificar el estado del pago');
        }

        const checkData = await checkResponse.json();
        
        if (checkData.status !== 'success') {
          throw new Error(checkData.msg || 'Error al verificar el estado del pago');
        }
        
        // Si el pago está aprobado, procesarlo
        if (checkData.payload.status === 'approved') {
          const processResponse = await apiService.request('/mercadopago/process-successful-payment', {
            method: 'POST',
            body: JSON.stringify({
              paymentId: finalPaymentId
            }),
          });

          if (!processResponse.ok) {
            const errorData = await processResponse.json();
            throw new Error(errorData.msg || 'Error al procesar el pago');
          }

          const processData = await processResponse.json();
          
          if (processData.status !== 'success') {
            throw new Error(processData.msg || 'Error al procesar el pago');
          }

          setPaymentInfo({
            paymentId: finalPaymentId,
            status: checkData.payload.status,
            externalReference: checkData.payload.externalReference,
            ...processData.payload
          });
          await refreshUserFromProfile();
        } else if (checkData.payload.status === 'pending') {
          // Si el pago está pendiente, mostrar mensaje y activar polling por si se aprueba después
          // (en local el webhook no llega, así que procesamos cuando el usuario sigue en la página)
          setPaymentInfo({
            paymentId: finalPaymentId,
            status: checkData.payload.status,
            statusDetail: checkData.payload.statusDetail,
          });
        } else if (checkData.payload.status === 'rejected' || checkData.payload.status === 'cancelled') {
          // Si el pago fue rechazado o cancelado
          setPaymentInfo({
            paymentId: finalPaymentId,
            status: checkData.payload.status,
            statusDetail: checkData.payload.statusDetail,
          });
          setError(`El pago fue ${checkData.payload.status}. ${checkData.payload.statusDetail || 'Por favor, intenta nuevamente.'}`);
        } else {
          // Otros estados
          setPaymentInfo({
            paymentId: finalPaymentId,
            status: checkData.payload.status,
            statusDetail: checkData.payload.statusDetail,
          });
          setError(`El pago tiene estado: ${checkData.payload.status}. ${checkData.payload.statusDetail || ''}`);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error al verificar el pago:', error);
        setError(error.message || 'Error al verificar el pago');
        setLoading(false);
      }
    };

    verifyAndProcessPayment();
  }, [paymentId, collectionId, isDevSimulation, isFreeRedeem, refreshUserFromProfile]);

  // Cuando el pago está "pending", hacer polling por si pasa a "approved" (en local el webhook no llega)
  useEffect(() => {
    const finalPaymentId = paymentId || collectionId;
    if (!finalPaymentId || paymentInfo?.status !== 'pending') return;

    const maxAttempts = 24; // 24 * 5s = 2 min
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts += 1;
      if (attempts > maxAttempts) return;
      try {
        const checkResponse = await apiService.request(`/mercadopago/payment-status/${finalPaymentId}`, { method: 'GET' });
        if (!checkResponse.ok) return;
        const checkData = await checkResponse.json();
        if (checkData.status !== 'success' || checkData.payload?.status !== 'approved') return;

        const processResponse = await apiService.request('/mercadopago/process-successful-payment', {
          method: 'POST',
          body: JSON.stringify({ paymentId: finalPaymentId }),
        });
        if (!processResponse.ok) return;
        const processData = await processResponse.json();
        if (processData.status !== 'success') return;

        setPaymentInfo((prev) => ({
          ...prev,
          paymentId: finalPaymentId,
          status: 'approved',
          externalReference: checkData.payload?.externalReference,
          ...processData.payload,
        }));
        refreshUserFromProfile();
      } catch {
        // ignorar errores de polling
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentId, collectionId, paymentInfo?.status]);

  const handleGoToDashboard = () => {
    navigate('/dashboard/cursos');
  };

  const handleGoToCourses = () => {
    navigate('/cursos');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-orange" role="status">
              <span className="visually-hidden">Verificando pago...</span>
            </div>
            <p className="text-white mt-3">Verificando tu pago...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <FadeIn>
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="payment-result-container error">
                <div className="text-center">
                  <i className="bi bi-exclamation-triangle text-danger display-1"></i>
                  <h2 className="text-danger mt-3">Error en el Pago</h2>
                  <p className="text-white">{error}</p>
                  <div className="mt-4 d-flex justify-content-end gap-2">
                    <button 
                      className="btn btn-light" 
                      onClick={() => navigate('/dashboard')}
                    >
                      Ir al Dashboard
                    </button>
                    <button 
                      className="btn btn-outline-orange" 
                      onClick={handleGoToCourses}
                    >
                      <i className="bi bi-arrow-left-circle-fill me-2"></i>
                      Volver a Cursos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="container">
      <FadeIn>
        <div className="row justify-content-center col-12 col-md-10 col-lg-8 col-xl-7">
          <div className="col-12">
            <div className="payment-result-container success">
              <div className="text-center">
                {paymentInfo?.status === 'pending' ? (
                  <>
                    <i className="bi bi-clock-history text-warning display-1"></i>
                    <h2 className="text-warning mt-3">Pago Pendiente</h2>
                    <p className="text-white mb-4">
                      Tu pago está siendo procesado. Recibirás acceso al curso una vez que el pago sea confirmado.
                      {paymentInfo?.statusDetail && (
                        <><br /><small className="text-muted">{paymentInfo.statusDetail}</small></>
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle-fill text-success display-1"></i>
                    {paymentInfo?.devMode && (
                      <div className="mt-2">
                        <span className="badge bg-info">Modo desarrollo (simulación)</span>
                      </div>
                    )}
                    {paymentInfo?.isFreeRedeem && (
                      <div className="mt-2">
                        <span className="badge bg-success">Canje gratuito</span>
                      </div>
                    )}
                    <h2 className="text-success mt-3">¡Pago Exitoso!</h2>
                    <p className="text-white mb-4">
                      {paymentInfo?.isFreeRedeem
                        ? '¡Curso canjeado! Has utilizado un cupo gratuito de tu plan. Ya tienes acceso al curso.'
                        : (paymentInfo?.isPremium || paymentInfo?.premium)
                          ? 'Tu plan de gestoría ha sido activado correctamente.'
                          : (paymentInfo?.isProcedure)
                            ? 'Tu trámite de flota fue registrado. Tu gestor recibirá la solicitud.'
                            : 'Tu pago ha sido procesado correctamente. Ya tienes acceso al curso.'}
                    </p>
                  </>
                )}

                <div className="success-details">
                  {paymentInfo?.paymentId && (
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-white">ID de Pago:</span>
                      <span className="text-orange">{paymentInfo.paymentId}</span>
                    </div>
                  )}
                  {paymentInfo?.status && (
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-white">Estado:</span>
                      <span className="text-success">{paymentInfo.status}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-white">Fecha:</span>
                    <span className="text-orange">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                {paymentInfo?.status !== 'pending' && (
                  <div className="next-steps mt-4">
                    <h5 className="text-orange mb-3">Próximos Pasos:</h5>
                    <ul className="text-white text-start">
                      {(paymentInfo?.isPremium || paymentInfo?.premium) ? (
                        <>
                          <li>Revisa tu email para confirmación del pago</li>
                          <li>Accede a Mi Latias para gestionar tus embarcaciones y trámites</li>
                          <li>Tu plan está activo por 1 año</li>
                        </>
                      ) : (paymentInfo?.isProcedure) ? (
                        <>
                          <li>Tu gestor recibirá un correo con los datos del trámite</li>
                          <li>Podés seguir el estado desde Mi gestor en General</li>
                        </>
                      ) : (
                        <>
                          <li>Revisa tu email para confirmación del pago</li>
                          <li>Accede a Mi Latias para ver el curso</li>
                          <li>Comienza tu aprendizaje inmediatamente</li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
                {paymentInfo?.status === 'pending' && (
                  <div className="next-steps mt-4">
                    <h5 className="text-warning mb-3">Información Importante:</h5>
                    <ul className="text-white text-start">
                      <li>Tu pago está siendo procesado</li>
                      <li>Recibirás un email cuando el pago sea confirmado</li>
                      <li>El acceso al curso se activará automáticamente</li>
                      <li>Si el pago no se confirma en 24 horas, contacta con soporte</li>
                    </ul>
                  </div>
                )}

                <div className="mt-4">
                  <button 
                    className="btn btn-success me-3" 
                    onClick={handleGoToDashboard}
                  >
                    <i className="bi bi-speedometer me-2"></i>
                    Ir a Mi Latias
                  </button>
                  <button 
                    className="btn btn-light" 
                    onClick={() => {
                      if (paymentInfo?.isProcedure) navigate('/dashboard/general/gestor');
                      else if (paymentInfo?.isPremium || paymentInfo?.premium) navigate('/gestoria');
                      else handleGoToCourses();
                    }}
                  >
                    {(paymentInfo?.isProcedure) ? (
                      <>
                        <i className="bi bi-person-badge me-2"></i>
                        Ir a Mi gestor
                      </>
                    ) : (paymentInfo?.isPremium || paymentInfo?.premium) ? (
                      <>
                        <i className="bi bi-briefcase me-2"></i>
                        Volver a Gestoría
                      </>
                    ) : (
                      <>
                        <i className="bi bi-book-half me-2"></i>
                        Ver más cursos
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
