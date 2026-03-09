
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/pozo-ai-tool/',
  server: {
    port: 8080,
    host: true, // Escuchar en 0.0.0.0 para permitir acceso desde fuera del contenedor
    strictPort: true,
  },
  preview: {
    port: 8080,
    host: true,
    strictPort: true,
  }
})
