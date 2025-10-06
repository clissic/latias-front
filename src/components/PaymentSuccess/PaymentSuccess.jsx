import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FadeIn } from '../FadeIn/FadeIn';
import './PaymentSuccess.css';

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);

  const sessionId = searchParams.get('session_id');
  const courseId = searchParams.get('course_id');

  useEffect(() => {
    if (!sessionId || !courseId) {
      setError('Parámetros de pago no válidos');
      setLoading(false);
      return;
    }

    // Verificar el estado del pago con el backend
    const verifyPayment = async () => {
      try {
        // Aquí puedes hacer una llamada al backend para verificar el pago
        // const response = await fetch(`/api/stripe/session/${sessionId}`);
        // const data = await response.json();
        
        // Por ahora, simulamos que el pago fue exitoso
        setTimeout(() => {
          setLoading(false);
          // Aquí podrías obtener los datos del curso si es necesario
        }, 2000);
      } catch (error) {
        console.error('Error al verificar el pago:', error);
        setError('Error al verificar el pago');
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, courseId]);

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
                  <div className="mt-4">
                    <button 
                      className="btn btn-warning me-3" 
                      onClick={handleGoToCourses}
                    >
                      Volver a Cursos
                    </button>
                    <button 
                      className="btn btn-outline-light" 
                      onClick={() => navigate('/dashboard')}
                    >
                      Ir al Dashboard
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
                <i className="bi bi-check-circle text-success display-1"></i>
                <h2 className="text-success mt-3">¡Pago Exitoso!</h2>
                <p className="text-white mb-4">
                  Tu pago ha sido procesado correctamente. Ya tienes acceso al curso.
                </p>
                
                <div className="success-details">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-white">ID de Sesión:</span>
                    <span className="text-orange">{sessionId}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-white">ID del Curso:</span>
                    <span className="text-orange">{courseId}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-white">Fecha:</span>
                    <span className="text-orange">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="next-steps mt-4">
                  <h5 className="text-orange mb-3">Próximos Pasos:</h5>
                  <ul className="text-white text-start">
                    <li>Revisa tu email para confirmación del pago</li>
                    <li>Accede a tu dashboard para ver el curso</li>
                    <li>Comienza tu aprendizaje inmediatamente</li>
                  </ul>
                </div>

                <div className="mt-4">
                  <button 
                    className="btn btn-success me-3" 
                    onClick={handleGoToDashboard}
                  >
                    <i className="bi bi-speedometer2 me-2"></i>
                    Ir al Dashboard
                  </button>
                  <button 
                    className="btn btn-outline-light" 
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
