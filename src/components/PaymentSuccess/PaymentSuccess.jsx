import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FadeIn } from '../FadeIn/FadeIn';
import { apiService } from '../../services/apiService';
import './PaymentSuccess.css';

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);

  // Parámetros de retorno de Checkout Pro (back_urls): payment_id, collection_id, status, etc.
  const paymentId = searchParams.get('payment_id');
  const collectionId = searchParams.get('collection_id');

  useEffect(() => {
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
        } else if (checkData.payload.status === 'pending') {
          // Si el pago está pendiente, mostrar mensaje informativo
          setPaymentInfo({
            paymentId: finalPaymentId,
            status: checkData.payload.status,
            statusDetail: checkData.payload.statusDetail,
          });
          // No es un error, solo informativo - el webhook procesará cuando se apruebe
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
  }, [paymentId, collectionId]);

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
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
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
                    <h2 className="text-success mt-3">¡Pago Exitoso!</h2>
                    <p className="text-white mb-4">
                      Tu pago ha sido procesado correctamente. Ya tienes acceso al curso.
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
                      <li>Revisa tu email para confirmación del pago</li>
                      <li>Accede a tu dashboard para ver el curso</li>
                      <li>Comienza tu aprendizaje inmediatamente</li>
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
                    Ir al Dashboard
                  </button>
                  <button 
                    className="btn btn-light" 
                    onClick={handleGoToCourses}
                  >
                    <i className="bi bi-book me-2"></i>
                    Ver Más Cursos
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
