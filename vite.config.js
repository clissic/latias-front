import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Desactivar la limpieza automática ya que la hacemos manualmente con el script prebuild
    emptyOutDir: false,
  },
  // Exponer variables de entorno que empiecen con VITE_
  envPrefix: 'VITE_',
})
