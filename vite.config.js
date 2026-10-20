import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // IMPORTANTE: Le dice al programa cómo encontrar los colores y estilos cuando sea un .exe
})