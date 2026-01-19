/* eslint-env node */
import { rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distPath = join(__dirname, '../dist');

try {
  if (existsSync(distPath)) {
    // Intentar eliminar con opciones más permisivas para Windows
    rmSync(distPath, { 
      recursive: true, 
      force: true,
      maxRetries: 3,
      retryDelay: 1000
    });
    console.log('✅ Directorio dist eliminado exitosamente');
  } else {
    console.log('ℹ️  El directorio dist no existe, continuando...');
  }
} catch (error) {
  console.warn('⚠️  No se pudo eliminar el directorio dist:', error.message);
  console.warn('⚠️  Continuando con el build (Vite intentará limpiar automáticamente)...');
  // No salir con error, dejar que Vite lo maneje
}
