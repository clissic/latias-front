import { useAuth } from '../context/AuthContext';

class ApiService {
  constructor() {
    this.baseURL = '/api';
  }

  // Método para obtener headers con autenticación
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    return headers;
  }

  // Método para hacer requests con manejo automático de tokens
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Si el token expiró, intentar refrescar
      if (response.status === 401 && options.includeAuth !== false) {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const refreshResponse = await fetch(`${this.baseURL}/users/refresh-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            const newAccessToken = refreshData.payload.accessToken;
            
            // Actualizar el token en localStorage
            localStorage.setItem('accessToken', newAccessToken);
            
            // Reintentar la request original con el nuevo token
            config.headers['Authorization'] = `Bearer ${newAccessToken}`;
            const retryResponse = await fetch(url, config);
            return retryResponse;
          } else {
            // Si no se puede refrescar, limpiar tokens y redirigir a login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            throw new Error('Sesión expirada');
          }
        } else {
          // No hay refresh token, redirigir a login
          window.location.href = '/login';
          throw new Error('No hay sesión activa');
        }
      }

      return response;
    } catch (error) {
      console.error('Error en API request:', error);
      throw error;
    }
  }

  // Métodos específicos para diferentes endpoints
  async login(email, password) {
    const response = await this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      includeAuth: false,
    });
    return response.json();
  }

  async register(userData) {
    const response = await this.request('/users/create', {
      method: 'POST',
      body: JSON.stringify(userData),
      includeAuth: false,
    });
    return response.json();
  }

  async refreshToken(refreshToken) {
    const response = await this.request('/users/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      includeAuth: false,
    });
    return response.json();
  }

  async logout() {
    const response = await this.request('/users/logout', {
      method: 'POST',
    });
    return response.json();
  }

  async getCourses() {
    const response = await this.request('/courses', {
      method: 'GET',
      includeAuth: false, // Los cursos son públicos
    });
    return response.json();
  }

  async getCourseById(id) {
    const response = await this.request(`/courses/id/${id}`, {
      method: 'GET',
      includeAuth: false, // Los detalles del curso son públicos
    });
    return response.json();
  }

  async getUserPurchasedCourses(userId) {
    const response = await this.request(`/courses/user/${userId}/purchased`, {
      method: 'GET',
    });
    return response.json();
  }

  async purchaseCourse(userId, courseData) {
    const response = await this.request(`/courses/purchase/${userId}`, {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
    return response.json();
  }

  async createPaymentPreference(preferenceData) {
    const response = await this.request('/mercadopago/create-preference', {
      method: 'POST',
      body: JSON.stringify(preferenceData),
    });
    return response.json();
  }

  async getPaymentMethods() {
    const response = await this.request('/mercadopago/payment-methods', {
      method: 'GET',
      includeAuth: false, // Los métodos de pago son públicos
    });
    return response.json();
  }

  async getUserProfile() {
    const response = await this.request('/users/profile', {
      method: 'GET',
    });
    return response.json();
  }

  async deleteUser(userId) {
    const response = await this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  async createCourse(courseData) {
    const response = await this.request('/courses/create', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
    return response.json();
  }

  async uploadCourseImages(formData) {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(`${this.baseURL}/upload/course-images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });
    return response.json();
  }
}

export const apiService = new ApiService();
