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

  async getCourseByCourseId(courseId) {
    const response = await this.request(`/courses/courseId/${courseId}`, {
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

  async getGestors() {
    const response = await this.request('/users/gestors', {
      method: 'GET',
    });
    return response.json();
  }

  /** Clientes que eligieron al usuario actual como gestor (solo categoría Gestor). Incluye fleetCount. */
  async getGestorClients() {
    const response = await this.request('/users/gestor/clients', { method: 'GET' });
    return response.json();
  }

  async updateMyManager(managerId, jurisdictionName) {
    const body = { managerId: managerId || '' };
    if (jurisdictionName) body.jurisdiction = jurisdictionName;
    const response = await this.request('/users/profile/manager', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.json();
  }

  async deleteUser(userId) {
    const response = await this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  async updateUser(userData) {
    const response = await this.request('/users/update', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response.json();
  }

  async updatePassword(newPassword) {
    const response = await this.request('/users/update-password', {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
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

  async updateCourse(courseId, courseData) {
    const response = await this.request(`/courses/update/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
    return response.json();
  }

  async deleteCourse(courseId) {
    const response = await this.request(`/courses/delete/${courseId}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  async requestCourseModification(courseId, instructorData, courseData) {
    const response = await this.request(`/courses/request-modification/${courseId}`, {
      method: 'POST',
      body: JSON.stringify({ instructorData, courseData }),
    });
    return response.json();
  }

  // ========== EVENTOS ==========

  // Obtener eventos activos (público)
  async getActiveEvents() {
    const response = await this.request('/events/active', {
      method: 'GET',
      includeAuth: false, // Público
    });
    return response.json();
  }

  // Obtener todos los eventos (para administradores)
  async getAllEvents() {
    const response = await this.request('/events', {
      method: 'GET',
    });
    return response.json();
  }

  // Obtener evento por ID
  async getEventById(id) {
    const response = await this.request(`/events/id/${id}`, {
      method: 'GET',
      includeAuth: false, // Público
    });
    return response.json();
  }

  // Obtener evento por eventId
  async getEventByEventId(eventId) {
    const response = await this.request(`/events/eventId/${eventId}`, {
      method: 'GET',
      includeAuth: false, // Público
    });
    return response.json();
  }

  // Crear evento (para administradores)
  async createEvent(eventData) {
    const response = await this.request('/events/create', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    return response.json();
  }

  // Actualizar evento (para administradores)
  async updateEvent(eventId, eventData) {
    const response = await this.request(`/events/update/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
    return response.json();
  }

  // Eliminar evento (para administradores)
  async deleteEvent(eventId) {
    const response = await this.request(`/events/delete/${eventId}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  // Comprar ticket de evento (requiere autenticación)
  async purchaseEventTicket(eventId, quantity = 1) {
    const response = await this.request(`/events/purchase/${eventId}`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });
    return response.json();
  }

  // Verificar autenticidad de un ticket
  async verifyTicket(ticketId) {
    const response = await fetch(`${this.baseURL}/events/verify/${ticketId}`, {
      method: 'GET',
    });
    return response.json();
  }

  // Verificar ticket para usuarios checkin
  async verifyTicketCheckin(ticketId) {
    const response = await this.request(`/events/checkin/verify/${ticketId}`, {
      method: 'GET',
    });
    return response.json();
  }

  // Obtener logs de tickets para usuarios checkin
  async getTicketLogsCheckin(limit = 100) {
    const response = await this.request(`/events/checkin/logs?limit=${limit}`, {
      method: 'GET',
    });
    return response.json();
  }

  // Obtener logs de tickets (para administradores)
  async getTicketLogs(limit = 100) {
    const response = await this.request(`/events/logs?limit=${limit}`, {
      method: 'GET',
    });
    return response.json();
  }

  // ========== MÉTODOS DE FLOTA ==========

  // Solicitar registro de barco nuevo
  async requestBoatRegistration(boatData) {
    const response = await this.request(`/boats/request-registration`, {
      method: 'POST',
      body: JSON.stringify(boatData),
    });
    return response.json();
  }

  // Solicitar agregar barco a la flota (deprecated - usar requestBoatRegistration)
  async requestBoatToFleet(boatId) {
    const response = await this.request(`/users/fleet/request`, {
      method: 'POST',
      body: JSON.stringify({ boatId }),
    });
    return response.json();
  }

  // Obtener flota del usuario
  async getUserFleet() {
    const response = await this.request(`/users/fleet`, {
      method: 'GET',
    });
    return response.json();
  }

  // Remover barco de la flota
  async removeBoatFromFleet(boatId) {
    const response = await this.request(`/users/fleet/${boatId}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  // Obtener todos los barcos activos (para seleccionar y agregar a la flota)
  async getActiveBoats() {
    const response = await fetch(`${this.baseURL}/boats/active`, {
      method: 'GET',
    });
    return response.json();
  }

  // Obtener barco por ID
  async getBoatById(id) {
    const response = await fetch(`${this.baseURL}/boats/id/${id}`, {
      method: 'GET',
    });
    return response.json();
  }

  // Obtener barcos por propietario (propio usuario o gestor viendo cliente)
  async getBoatsByOwner(ownerId) {
    const response = await this.request(`/boats/owner/${ownerId}`, {
      method: 'GET',
    });
    return response.json();
  }

  // Subir imagen de barco
  async uploadBoatImage(formData) {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(`${this.baseURL}/upload/boat-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
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

  // Métodos para instructores
  async getInstructors() {
    const response = await this.request('/professors', {
      method: 'GET',
      includeAuth: false, // Los instructores son públicos
    });
    return response.json();
  }

  async getInstructorById(id) {
    const response = await this.request(`/professors/id/${id}`, {
      method: 'GET',
      includeAuth: false,
    });
    return response.json();
  }

  async getInstructorByCi(ci) {
    const response = await this.request(`/professors/ci/${ci}`, {
      method: 'GET',
      includeAuth: false,
    });
    return response.json();
  }

  async createInstructor(instructorData) {
    const response = await this.request('/professors/create', {
      method: 'POST',
      body: JSON.stringify(instructorData),
    });
    return response.json();
  }

  async updateInstructor(id, instructorData) {
    const response = await this.request(`/professors/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(instructorData),
    });
    return response.json();
  }

  async deleteInstructor(id) {
    const response = await this.request(`/professors/delete/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  async uploadInstructorImage(formData) {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(`${this.baseURL}/upload/professor-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });
    return response.json();
  }

  async uploadEventImage(formData) {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(`${this.baseURL}/upload/event-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });
    return response.json();
  }

  // Métodos para usuarios (administradores)
  async getAllUsers() {
    const response = await this.request('/users', {
      method: 'GET',
    });
    return response.json();
  }

  async getUserById(id) {
    const response = await this.request(`/users/${id}`, {
      method: 'GET',
    });
    return response.json();
  }

  async createUser(userData) {
    const response = await this.request('/users/create', {
      method: 'POST',
      body: JSON.stringify(userData),
      includeAuth: false, // La creación de usuarios puede ser pública
    });
    return response.json();
  }

  async updateUserById(id, userData) {
    const response = await this.request('/users/update', {
      method: 'PUT',
      body: JSON.stringify({ ...userData, _id: id }),
    });
    return response.json();
  }

  async deleteUserById(id) {
    const response = await this.request(`/users/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  // Método para enviar email de contacto
  async sendContactEmail(contactData) {
    const response = await this.request('/contact/send', {
      method: 'POST',
      body: JSON.stringify(contactData),
      includeAuth: false, // El formulario de contacto es público
    });
    return response.json();
  }

  // Métodos para certificados
  async getCertificatesByBoat(boatId) {
    const response = await this.request(`/certificates/boat/${boatId}`, {
      method: 'GET',
      includeAuth: false, // Es una ruta pública
    });
    return response.json();
  }

  async uploadCertificatePDF(formData) {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(`${this.baseURL}/upload/certificate-pdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });
    return response.json();
  }

  async createCertificate(certificateData) {
    const response = await this.request('/certificates/create', {
      method: 'POST',
      body: JSON.stringify(certificateData),
    });
    return response.json();
  }

  async updateCertificate(id, certificateData) {
    const response = await this.request(`/certificates/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(certificateData),
    });
    return response.json();
  }

  async deleteCertificate(id) {
    const response = await this.request(`/certificates/delete/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  // ========== SOLICITUDES AL GESTOR (SHIP-REQUESTS) ==========

  async getShipRequestsByOwner(ownerId) {
    const response = await this.request(`/ship-requests/owner/${ownerId}`, { method: 'GET' });
    return response.json();
  }

  async getShipRequestsByShip(shipId) {
    const response = await this.request(`/ship-requests/ship/${shipId}`, { method: 'GET' });
    return response.json();
  }

  async getShipRequestById(id) {
    const response = await this.request(`/ship-requests/${id}`, { method: 'GET' });
    return response.json();
  }

  async updateShipRequest(id, data) {
    const response = await this.request(`/ship-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updateShipRequestStatus(id, status, rejectionReason = null) {
    const body = { status };
    if (rejectionReason != null && String(rejectionReason).trim() !== "") {
      body.rejectionReason = String(rejectionReason).trim();
    }
    const response = await this.request(`/ship-requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.json();
  }

  async deleteShipRequest(id) {
    const response = await this.request(`/ship-requests/${id}`, { method: 'DELETE' });
    return response.json();
  }

  async createShipRequest(data) {
    const response = await this.request('/ship-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /** Crea solicitud desde certificado y envía email al gestor. types: ["Renovación"|"Preparación"|"Asesoramiento"], notes opcional */
  async createCertificateRequest(shipId, certificate, types, notes = null) {
    const response = await this.request('/ship-requests/certificate', {
      method: 'POST',
      body: JSON.stringify({ shipId, certificate, types, notes: notes || undefined }),
    });
    return response.json();
  }
}

export const apiService = new ApiService();
