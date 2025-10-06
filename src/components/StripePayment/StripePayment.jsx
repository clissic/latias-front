import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useParams, useNavigate } from 'react-router-dom';
import { FadeIn } from '../FadeIn/FadeIn';
import './StripePayment.css';

// Clave pública de Stripe (reemplaza con tu clave real)
const stripePromise = loadStripe('pk_test_51234567890abcdefghijklmnopqrstuvwxyz'); // Clave de prueba

const CheckoutForm = ({ course, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Crear sesión de pago en el backend
      const response = await fetch('/api/stripe/create-payment-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          courseName: course.name,
          price: course.price * 100, // Stripe usa centavos
          currency: 'usd'
        }),
      });

      const { sessionId } = await response.json();

      if (!response.ok) {
        throw new Error('Error al crear la sesión de pago');
      }

      // Redirigir a Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (error) {
        setError(error.message);
        onError(error.message);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError(err.message);
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-payment-form">
      <div className="payment-summary mb-4">
        <h4 className="text-orange mb-3">Resumen del Pago</h4>
        <div className="payment-details">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-white">Curso:</span>
            <span className="text-white">{course.name}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-white">Duración:</span>
            <span className="text-white">{course.duration}</span>
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
          <i className="bi bi-paypal text-white me-2"></i>
          <span className="text-white">PayPal</span>
        </div>
        <div className="payment-icons">
          <i className="bi bi-phone text-white me-2"></i>
          <span className="text-white">Pago móvil</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <div className="security-info mb-4">
        <div className="d-flex align-items-center">
          <i className="bi bi-shield-check text-success me-2"></i>
          <small className="text-white">
            Pago seguro procesado por Stripe. Tus datos están protegidos.
          </small>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn btn-success w-100 py-3"
      >
        {loading ? (
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
    </form>
  );
};

export function StripePayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Obtener datos del curso
    fetch(`https://raw.githubusercontent.com/clissic/latias-back/refs/heads/master/cursos.json`)
      .then((res) => res.json())
      .then((data) => {
        const foundCourse = data.find(course => course.id === Number(id));
        if (foundCourse) {
          setCourse(foundCourse);
        } else {
          setError('Curso no encontrado');
        }
      })
      .catch((error) => {
        console.error('Error fetching course:', error);
        setError('Error al cargar el curso');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handlePaymentSuccess = () => {
    // Aquí podrías mostrar un mensaje de éxito o redirigir
    console.log('Pago exitoso');
    // Redirigir al dashboard o página de éxito
    navigate('/dashboard/cursos');
  };

  const handlePaymentError = (errorMessage) => {
    console.error('Error en el pago:', errorMessage);
    // El error ya se muestra en el componente
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
                  Completa tu inscripción al curso <strong>{course.name}</strong>
                </p>
              </div>

              <Elements stripe={stripePromise}>
                <CheckoutForm 
                  course={course} 
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>

              <div className="text-center mt-4">
                <button 
                  className="btn btn-outline-secondary" 
                  onClick={() => navigate(`/course/${id}`)}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Volver al Curso
                </button>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
