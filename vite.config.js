import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// GitHub Pages: base DEVE ser /repo-name/ (docs oficiais Vite)
// https://vitejs.dev/guide/static-deploy.html#github-pages
export default defineConfig({
    plugins: [react()],
    base: process.env.VITE_BASE_PATH || '/',
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
