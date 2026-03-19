# LATIAS Academia

**Descripción:**  
LATIAS Academia es una plataforma de aprendizaje online enfocada en cursos de náutica y supervivencia, entre otros. La aplicación permite a los cadetes acceder a cursos desarrollados por profesionales del mar, utilizando herramientas de inteligencia artificial para la generación de videos y diálogos, evaluaciones profesionales y académicas en conjunto con exámenes finales para la obtención de certificados oficiales, generados automáticamente al completar los cursos. En cuanto a los aspectos técnicos, la plataforma está desarrollada con el stack MERN y utiliza Bootstrap para la interfaz gráfica para mantener un diseño responsive y prolijo.

---

## Características principales

- Gestión de usuarios con roles: Cadetes, Instructores, Administradores y Gestores.  
- Creación y gestión de cursos (CRUD).  
- Vista de curso (Ir al curso): acceso restringido a usuarios con el curso comprado; ruta `/course/:courseId/learn` con validación de compra.  
- Utilización de plataformas externas de IA para generar avatares, diálogos y voces de los instructores.  
- Videos protegidos para evitar distribución no autorizada.  
- Evaluaciones automáticas tipo test (pruebas parciales por módulo y prueba final del curso).  
- **Condiciones de aprobación y cálculo de resultados**: para aprobar un curso se requiere un promedio de pruebas parciales ≥ 60% y prueba final ≥ 70%. La nota final (cuando se aprueba) es 60% prueba final + 40% promedio de parciales. Ver [Condiciones de aprobación del curso](CONDICIONES_APROBACION.md).  
- Generación automática de diplomas en PDF.  
- Pagos con Mercado Pago (con posibilidad de agregar otras pasarelas más adelante).  
- Panel de administración para gestión de usuarios, cursos, entregables, pagos y gestores.  
- Gestión de gestor: asignar/desvincular gestor (con motivos y envío de email); gestor puede desvincular clientes (con motivos y email al cliente).  
- **Estadísticas en General:** el dashboard muestra Horas conectado/a (acumuladas en minutos mientras el usuario está en la vista del curso `/course/:courseId/learn`, mostradas en horas), eventos atendidos y certificados obtenidos; el contador de tiempo se actualiza cada minuto en el backend solo mientras la pestaña está visible.  
- **Camarote (instructores):** acceso directo desde el menú a "Gestionar mis cursos asignados", con filtros estandarizados (nombre, ID curso, dificultad, categoría, moneda, precio desde–hasta), tarjetas de cursos con estilo unificado al resto de la plataforma, y flujo para solicitar modificación de curso.  
- **Filtros unificados:** en Portafolio (País de clientes y Bandera en tarjetas de cliente), Gestión de gestores (País) y Mi Flota (Bandera) los desplegables de país/bandera comparten el mismo comportamiento (mostrar opción elegida, al hacer clic borrar solo el texto del input manteniendo el filtro, no restaurar "Todos" al cerrar sin elegir) y estilo (blur, dropdown con búsqueda).  
- **Checkout de trámites (procedures):** cuando el plan premium del usuario tiene 0 trámites incluidos (`premium.procedures === 0`) y solicita un trámite de flota desde Mi gestor, en lugar de redirigir directamente al checkout de Mercado Pago se muestra un **checkout propio** (ruta `/payment/procedure`), con el mismo estilo que el de cursos y planes: resumen del pago (concepto "Trámite de flota - Solicitud", total 30 USD), elección de método de pago (Mercado Pago, PayPal, transferencia bancaria) y texto de seguridad por método. La ruta está protegida con `ProtectedRoute` y `CheckinRedirect`; el componente `ProcedurePayment` recibe `preferenceId` (y opcionalmente `requestId`) por `location.state` desde GestorDetalle al confirmar la solicitud que requiere pago. Si el usuario no paga, el trámite no se guarda en la base de datos (se usa la colección `pending-procedure-payments` hasta que el pago esté confirmado).
- **Gestión de pagos (Administrador):** en el dashboard, la sección **Pagos procesados** lista todos los pagos registrados (cursos, suscripciones a planes, trámites de flota). Los datos siguen la estructura unificada del backend: **Tipo** (curso, suscripción, trámite, etc.), **Concepto** (nombre + id del ítem), **Usuario** (nombre, email, id), **Monto** (valor y moneda), **Estado** y **Procesado**. Filtros por ID pago, ID concepto, nombre concepto, **Tipo** (itemType), email usuario, ID usuario, estado de pago y moneda.
- **Wallet + retiros (instructores/gestores):** vista de wallet en Camarote con `balance`, `pendingBalance` y `lockedBalance`, modal de retiro con validaciones (mínimo USD 50), y flujo administrativo para aprobar/rechazar con comprobante desde UI.

---

## Documentación del backend

La documentación completa de la API y del progreso/roadmap del proyecto está en el README del backend (no borrar este link):

- **README Backend (API + Roadmap):** [Link al README del backend](https://github.com/clissic/latias-back?tab=readme-ov-file#documentación-de-la-api---latias-backend)

---

## Instalación y ejecución (frontend)

### Requisitos

- Node.js (recomendado LTS)
- npm
- Backend corriendo (por defecto en `http://localhost:5000`)

### Instalar dependencias

```bash
npm install
```

### Ejecutar en desarrollo

```bash
npm run dev
```

Por defecto, el servidor de Vite **proxyea** `/api` hacia `http://localhost:5000` (ver `vite.config.js`).

### Build y preview

```bash
npm run build
npm run preview
```

---

## Variables de entorno

Las variables expuestas al frontend deben empezar con `VITE_` (Vite).

- `VITE_MERCADOPAGO_PUBLIC_KEY`: public key para Mercado Pago.
- `VITE_DEV_PAYMENT`: `true|false`. Si está en `true`, habilita controles/atajos de compra en modo dev donde corresponda.

Archivo local: `.env`.

---

## Arquitectura del frontend

### Stack

- **React 18 + Vite**
- **react-router-dom** para enrutado
- **react-bootstrap + Bootstrap** para UI
- **SweetAlert2** para alerts/modales de confirmación

### Acceso a API

El servicio `src/services/apiService.js` es la capa única de llamadas HTTP:

- Base URL: `'/api'` (vía proxy en dev).
- Manejo automático de sesión: ante `401` intenta refresh con `/api/users/refresh-token`; si falla, limpia sesión y redirige a `/login`.
- Métodos de alto nivel: cursos, pagos, usuarios, flota, ship-requests, wallet/transacciones y retiros.

### Autenticación en el cliente

`src/context/AuthContext.jsx` es la fuente de verdad del usuario en el front:

- Guarda `accessToken`/`refreshToken` en `localStorage`.
- En startup, hidrata estado llamando a `GET /api/auth/me`.
- `ProtectedRoute` bloquea rutas si no hay sesión y redirige a `/login`.
- `ProtectedAdminRoute` exige categoría `Administrador` (y espera `userLoading` para evitar redirects prematuros en accesos por link directo).

---

## Rutas principales (React Router)

Resumen (ver `src/App.jsx`):

| Ruta | Protección | Descripción |
|------|------------|-------------|
| `/` | Pública | Landing / Bienvenida (con redirect especial para checkin). |
| `/cursos` | Pública | Catálogo de cursos. |
| `/course/:courseId` | Pública | Detalle de curso. |
| `/course/:courseId/learn` | `ProtectedRoute` | Vista de curso (requiere compra). |
| `/course/buy/:courseId` | `ProtectedRoute` | Checkout de curso (Mercado Pago). |
| `/gestoria` | Pública | Gestoría. |
| `/gestoria/buy/:planId` | `ProtectedRoute` | Checkout de plan premium. |
| `/payment/procedure` | `ProtectedRoute` | Checkout de trámite (procedures). |
| `/payment/success` | `ProtectedRoute` | Resultado de pago. |
| `/dashboard/*` | `ProtectedRoute` | Dashboard (General/Admin/Gestor/Instructor). |
| `/admin/withdrawals/process?token=...` | `ProtectedRoute` + `ProtectedAdminRoute` | Procesar retiro desde link firmado (subir comprobante y aprobar/rechazar). |
| `/checkin` | `ProtectedCheckinRoute` | Pantalla de check-in. |
| `/verify-ticket/:ticketId` | Pública | Verificación de ticket. |
| `/boat-registration/approve/:id` | Pública | Aprobación de registro de barco por link. |
| `/boat-registration/reject/:id` | Pública | Rechazo de registro de barco por link. |

---

## Wallet y retiros (UI)

### Camarote (Instructor/Gestor)

- Panel de wallet mostrando **Balance disponible**, **Pendiente (hold)** y **Bloqueado** (`lockedBalance`).
- Modal “Retiro de fondos” al hacer click en Balance:
  - Requiere `bankAccount` configurada (si no, alert indicando ir a Ajustes).
  - Validaciones: monto > 0, no exceder balance, mínimo **USD 50**, y step de **10**.
  - Confirmación en segundo modal antes de solicitar.
- Llamada a backend: `POST /api/withdrawals` vía `apiService.createWithdrawal(amount)`.

### Procesamiento admin por link firmado

Ruta: `/admin/withdrawals/process?token=...`

- Carga datos del retiro con `GET /api/withdrawals/admin/process?token=...`.
- Permite subir comprobante con `POST /api/upload/withdrawal-proof`.
- Permite aprobar/rechazar con:
  - `PATCH /api/withdrawals/:id/process?token=...`
  - `PATCH /api/withdrawals/:id/reject?token=...`

### Gestión de retiros (Administrador)

En el dashboard, la sección **Gestión de retiros** lista solicitudes en tarjetas con:

- Filtros con debounce (status, email, userId, método de pago) y botón único “Limpiar filtros”.
- Paginación de 10 por página (estilo consistente con Cursos).
- Empty state con ícono inbox (estilo plataforma).

---

## Documentación adicional

- **[Condiciones de aprobación del curso](CONDICIONES_APROBACION.md)**: requisitos para aprobar (promedio de pruebas parciales ≥ 60%, prueba final ≥ 70%), cómo se calcula la nota final (60% prueba final + 40% promedio parcial) y qué ocurre en caso de reprobación (recursar el curso).

---

## Roadmap de desarrollo

El **ROADMAP DE DESARROLLO** completo con los 100 puntos a completar se encuentra en el README del backend del proyecto. El progreso se actualiza en el backend (completados, en desarrollo y pendientes). [Link al ROADMAP](https://github.com/clissic/latias-back?tab=readme-ov-file#roadmap-de-desarrollo)  

---

## Contacto del desarrollador

**Nombre:** Joaquín Pérez Coria  
**LinkedIn:** [https://www.linkedin.com/in/joaquin-perez-coria](https://www.linkedin.com/in/joaquin-perez-coria)  
**Sitio web / Portafolio:** [https://jpc-dev.uy](https://jpc-dev.uy)  

---

## Licencia

Copyright (c) 2026 JPC Dev

Este proyecto está bajo la Licencia MIT.
Se permite usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias del software. 