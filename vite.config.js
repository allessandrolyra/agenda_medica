import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// Injeta <base href> para GitHub Pages: corrige resolução de paths relativos
function htmlBasePlugin() {
    return {
        name: 'html-base',
        transformIndexHtml: function (html) {
            var base = process.env.VITE_APP_BASENAME || '/';
            if (base === '/')
                return html;
            return html.replace('<head>', "<head>\n    <base href=\"".concat(base, "\">"));
        },
    };
}
export default defineConfig({
    plugins: [react(), htmlBasePlugin()],
    // Path RELATIVO - GitHub Pages resolve melhor que absoluto (ref: Stack Overflow 79409403)
    base: process.env.VITE_BASE_PATH || '/',
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
