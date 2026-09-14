import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this project site at
  // https://abbadithaer16.github.io/cap/, so all built asset URLs need
  // the /cap/ prefix rather than the default root path.
  base: '/cap/',
  plugins: [react()],
})
