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

Copyright (c) 2025 JPC Dev

Este proyecto está bajo la Licencia MIT.
Se permite usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias del software. 