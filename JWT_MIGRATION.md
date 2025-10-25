# Migración Frontend a JWT - Documentación

## Resumen de Cambios

El frontend ha sido migrado completamente de sesiones (Passport) a JWT para mantener consistencia con el backend.

## Archivos Modificados

### 1. AuthContext (`src/context/AuthContext.jsx`)
- **Antes**: Manejo básico de usuario en localStorage
- **Después**: Manejo completo de JWT con tokens de acceso y refresh
- **Nuevas funcionalidades**:
  - `accessToken` y `refreshToken` en el estado
  - `refreshAccessToken()` para renovar tokens automáticamente
  - `getAuthHeaders()` para obtener headers de autenticación
  - Manejo automático de expiración de tokens

### 2. Servicio de API (`src/services/apiService.js`)
- **Nuevo archivo**: Servicio centralizado para todas las llamadas a la API
- **Funcionalidades**:
  - Manejo automático de tokens JWT en headers
  - Refresh automático de tokens cuando expiran
  - Redirección automática a login cuando no hay sesión válida
  - Métodos específicos para cada endpoint

### 3. Hooks Personalizados (`src/hooks/useApi.js`)
- **Nuevo archivo**: Hooks para facilitar el uso de la API
- **Hooks disponibles**:
  - `useApiRequest()`: Manejo genérico de estados de carga y errores
  - `useCourses()`: Hook específico para obtener cursos
  - `useUserCourses()`: Hook para cursos del usuario
  - `useCoursePurchase()`: Hook para compras de cursos

### 4. Componentes Actualizados

#### LogInForm (`src/components/LogInForm/LogInForm.jsx`)
- **Cambio**: De `/api/sessions/login` a `/api/users/login`
- **Mejora**: Uso del servicio de API centralizado
- **Manejo**: Respuesta con estructura JWT (`data.payload.user` y `data.payload.tokens`)

#### SignUpForm (`src/components/SignUpForm/SignUpForm.jsx`)
- **Cambio**: De `/api/sessions/signup` a `/api/users/create`
- **Mejora**: Uso del servicio de API centralizado
- **Manejo**: Respuesta con estructura estándar (`data.status`)

#### CerrarSesion (`src/components/Dashboard/CerrarSesion/CerrarSesion.jsx`)
- **Cambio**: De `/api/sessions/logout` a `/api/users/logout`
- **Mejora**: Manejo de logout stateless (JWT)
- **Comportamiento**: Limpieza local independiente del servidor

#### Cursos (`src/components/Cursos/Cursos.jsx`)
- **Cambio**: De datos estáticos a API dinámica
- **Mejora**: Uso del hook `useCourses()`
- **Funcionalidades**: Estados de carga y error integrados

## Estructura de Respuesta JWT

### Login Exitoso
```json
{
  "status": "success",
  "msg": "Login exitoso",
  "payload": {
    "user": {
      "id": "userId",
      "firstName": "Nombre",
      "lastName": "Apellido",
      "email": "email@example.com",
      "category": "user",
      "rank": "Grumete",
      "avatar": "avatarUrl"
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token",
      "expiresIn": "24h"
    }
  }
}
```

### Registro Exitoso
```json
{
  "status": "success",
  "msg": "User created",
  "payload": {
    "userData": "..."
  }
}
```

## Flujo de Autenticación

1. **Login**: Usuario ingresa credenciales → API devuelve tokens → Se almacenan en localStorage
2. **Requests**: Cada request incluye `Authorization: Bearer <token>` automáticamente
3. **Expiración**: Si el token expira → Se intenta refresh automáticamente
4. **Refresh Fallido**: Si no se puede refrescar → Logout automático y redirección a login
5. **Logout**: Se limpia localStorage y se redirige a home

## Beneficios de la Migración

### Para el Usuario
- **Sesiones persistentes**: Los tokens se mantienen entre sesiones del navegador
- **Mejor UX**: Renovación automática de sesiones sin interrupciones
- **Seguridad**: Tokens con expiración controlada

### Para el Desarrollo
- **Stateless**: No dependencia de sesiones del servidor
- **Escalabilidad**: Preparado para múltiples servidores
- **Mantenibilidad**: Código más limpio y centralizado
- **Reutilización**: Hooks y servicios reutilizables

## Uso de los Nuevos Hooks

### Hook de Cursos
```jsx
import { useCourses } from '../hooks/useApi';

function MiComponente() {
  const { courses, loading, error, refetch } = useCourses();
  
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {courses.map(course => (
        <div key={course.id}>{course.name}</div>
      ))}
    </div>
  );
}
```

### Hook de Request Genérico
```jsx
import { useApiRequest } from '../hooks/useApi';
import { apiService } from '../services/apiService';

function MiComponente() {
  const { loading, error, executeRequest } = useApiRequest();
  
  const handleAction = async () => {
    try {
      const result = await executeRequest(() => 
        apiService.someMethod()
      );
      // Manejar resultado
    } catch (err) {
      // Error ya manejado por el hook
    }
  };
  
  return (
    <button onClick={handleAction} disabled={loading}>
      {loading ? 'Cargando...' : 'Acción'}
    </button>
  );
}
```

## Consideraciones de Seguridad

1. **Tokens en localStorage**: Aceptable para esta aplicación, pero considerar httpOnly cookies para mayor seguridad
2. **HTTPS**: Obligatorio en producción para proteger tokens en tránsito
3. **Expiración**: Tokens de acceso cortos (24h) con refresh tokens largos (7d)
4. **Logout**: Limpieza completa de tokens en logout

## Próximos Pasos Recomendados

1. **Testing**: Probar todos los flujos de autenticación
2. **Error Handling**: Mejorar manejo de errores específicos
3. **Loading States**: Implementar skeletons/loading states consistentes
4. **Offline Support**: Considerar service workers para funcionalidad offline
5. **Security Headers**: Implementar CSP y otros headers de seguridad
