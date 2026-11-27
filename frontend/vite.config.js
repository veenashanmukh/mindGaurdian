import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The site is served from https://veenashanmukh.github.io/mindGaurdian/
  base: '/mindGaurdian/',
})
