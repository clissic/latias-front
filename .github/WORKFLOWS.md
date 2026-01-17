# GitHub Actions Workflows

Este directorio contiene los workflows de CI/CD para el proyecto Latias Frontend.

## Workflow Disponible

### Frontend CI (`frontend-ci.yml`)
- **Ubicación**: Este repositorio (`latias-front`)
- **Trigger**: Push/PR en ramas `master` o `develop`
- **Acciones**:
  - Instala dependencias
  - Ejecuta el linter
  - Construye el proyecto
  - Verifica que el build sea exitoso

## Scripts Disponibles

### Frontend (`package.json`)
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye el proyecto (solo build)
- `npm run build:copy` - Construye y copia a `latias-back/public` (multiplataforma)
- `npm run lint` - Ejecuta el linter
- `npm run lint:fix` - Ejecuta el linter y corrige errores automáticamente
- `npm run preview` - Previsualiza el build de producción

## Notas

- El workflow usa Node.js 20.x
- El script `copy-dist.js` es multiplataforma y reemplaza el comando `xcopy` de Windows
- El workflow se ejecuta automáticamente en push/PR a las ramas `master` y `develop`

