import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    base: '/', // Para GitHub Pages com repo nomeado: '/agenda-medica/'
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
