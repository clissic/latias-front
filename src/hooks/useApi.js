import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

// Hook para manejar estados de carga y errores en requests de API
export function useApiRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeRequest = async (requestFn) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await requestFn();
      return result;
    } catch (err) {
      setError(err.message || 'Error en la solicitud');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, executeRequest };
}

// Hook específico para obtener cursos
export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getCourses();
      if (data.status === 'success') {
        setCourses(data.payload);
      } else {
        setError(data.msg || 'Error al cargar cursos');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar cursos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return { courses, loading, error, refetch: fetchCourses };
}

// Hook específico para obtener cursos comprados del usuario
export function useUserCourses(userId) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserCourses = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getUserPurchasedCourses(userId);
      if (data.status === 'success') {
        setCourses(data.payload);
      } else {
        setError(data.msg || 'Error al cargar cursos del usuario');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar cursos del usuario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCourses();
  }, [userId]);

  return { courses, loading, error, refetch: fetchUserCourses };
}

// Hook para manejar compras de cursos
export function useCoursePurchase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const purchaseCourse = async (userId, courseData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.purchaseCourse(userId, courseData);
      return data;
    } catch (err) {
      setError(err.message || 'Error al comprar curso');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, purchaseCourse };
}

// Hook para obtener el perfil del usuario
export function useUserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { forceLogin } = useAuth();

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching user profile...");
      const data = await apiService.getUserProfile();
      console.log("User profile response:", data);
      
      if (data.status === 'success') {
        setUser(data.payload.user);
        forceLogin(data.payload.user);
        // Actualizar también el localStorage
        localStorage.setItem('user', JSON.stringify(data.payload.user));
        console.log("User profile set successfully:", data.payload.user);
      } else {
        setError(data.msg || 'Error al cargar perfil');
        console.error("Error in user profile response:", data.msg);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar perfil');
      console.error("Error fetching user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return { user, loading, error, refetch: fetchUserProfile };
}
