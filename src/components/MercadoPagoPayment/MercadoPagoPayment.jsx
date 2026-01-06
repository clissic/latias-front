import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FadeIn } from '../FadeIn/FadeIn';
import { apiService } from '../../services/apiService';
import './MercadoPagoPayment.css';

export function MercadoPagoPayment() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

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

  const handlePayment = async () => {
    if (!course) return;

    setProcessing(true);
    setError(null);

    try {
      // Crear preferencia de pago
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.courseId || course._id,
          courseName: course.courseName || course.name,
          price: course.price,
          currency: course.currency || 'USD'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Error al crear la preferencia de pago');
      }

      // Redirigir a Mercado Pago
      const initPoint = data.payload.initPoint || data.payload.sandboxInitPoint;
      if (initPoint) {
        window.location.href = initPoint;
      } else {
        throw new Error('No se pudo obtener el enlace de pago');
      }
    } catch (error) {
      console.error('Error en el pago:', error);
      setError(error.message);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-orange" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-white mt-3">Cargando información del curso...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
        <button 
          className="btn btn-warning" 
          onClick={() => navigate('/cursos')}
        >
          Volver a Cursos
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <FadeIn>
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="payment-container">
              <div className="text-center mb-4">
                <h2 className="text-orange mb-3">
                  <i className="bi bi-credit-card me-2"></i>
                  Finalizar Compra
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
                    <span className="text-orange"><strong>${course.price}.00</strong></span>
                  </div>
                </div>
              </div>

              <div className="payment-methods mb-4">
                <h5 className="text-orange mb-3">Métodos de Pago Aceptados</h5>
                <div className="payment-icons">
                  <i className="bi bi-credit-card text-white me-2"></i>
                  <span className="text-white">Tarjetas de crédito y débito</span>
                </div>
                <div className="payment-icons">
                  <i className="bi bi-cash text-white me-2"></i>
                  <span className="text-white">Efectivo (Rapipago, Pago Fácil)</span>
                </div>
                <div className="payment-icons">
                  <i className="bi bi-phone text-white me-2"></i>
                  <span className="text-white">Transferencia bancaria</span>
                </div>
                <div className="payment-icons">
                  <i className="bi bi-wallet text-white me-2"></i>
                  <span className="text-white">Mercado Pago</span>
                </div>
              </div>

              <div className="security-info mb-4">
                <div className="d-flex align-items-center">
                  <i className="bi bi-shield-check text-success me-2"></i>
                  <small className="text-white">
                    Pago seguro procesado por Mercado Pago. Tus datos están protegidos.
                  </small>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="btn btn-success w-100 py-3"
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Procesando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-credit-card me-2"></i>
                    Pagar ${course.price}.00
                  </>
                )}
              </button>

              <div className="mt-3 text-center">
                <small className="text-muted">
                  Al proceder con el pago, aceptas nuestros términos y condiciones.
                </small>
              </div>
            </div>

            <div className="text-center mt-4">
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => navigate(`/course/${courseId}`)}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Volver al Curso
              </button>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
