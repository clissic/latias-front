import { cpSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distPath = join(__dirname, '../dist');
const publicPath = join(__dirname, '../../latias-back/public');

try {
  // Copiar el contenido de dist a public del backend
  cpSync(distPath, publicPath, { recursive: true, force: true });
  console.log('✅ Build copiado exitosamente a latias-back/public');
} catch (error) {
  console.error('❌ Error al copiar el build:', error.message);
  process.exit(1);
}

