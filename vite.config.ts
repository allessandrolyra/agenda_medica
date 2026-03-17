import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages: usa path RELATIVO (./) - absoluto (/repo/) causa 404 nos assets
  // Ref: https://stackoverflow.com/questions/79409403/github-pages-and-absolute-paths
  base: process.env.VITE_BASE_PATH || '/',
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
