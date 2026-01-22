import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Desactivar la limpieza automática ya que la hacemos manualmente con el script prebuild
    emptyOutDir: false,
    // Generar nombres de archivos con hash para invalidar caché
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },
  // Exponer variables de entorno que empiecen con VITE_
  envPrefix: 'VITE_',
  // Configuración del servidor de desarrollo para prevenir caché
  server: {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }
})
