import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages: base = /nome-do-repo/ (definido no workflow via VITE_BASE_PATH)
  // Local: base = '/' (fallback)
  base: process.env.VITE_BASE_PATH || '/',
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
