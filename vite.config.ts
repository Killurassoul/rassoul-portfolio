import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// three/R3F are only reached via lazy(() => import('./Scene')), so they land in a separate chunk
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
