import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Ensuring process.env is polyfilled for the browser if needed, 
    // though usually handled by Vite's loadEnv in larger apps.
    // For this setup, we rely on Vite's import.meta.env or explicit process definition.
    'process.env': process.env
  }
})