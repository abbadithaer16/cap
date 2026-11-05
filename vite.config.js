import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this project site at
  // https://abbadithaer16.github.io/cap/, so all built asset URLs need
  // the /cap/ prefix rather than the default root path.
  base: '/cap/',
  plugins: [react()],
  build: {
    rollupOptions: {
      // Two pages: the McDonald's Jordan concept at the root, and the
      // earlier NEXORA headphone page kept at /nexora.html.
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        nexora: resolve(import.meta.dirname, 'nexora.html'),
      },
    },
  },
})
