/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        {
            name: 'header',
            configureServer: (server) => {
                server.middlewares.use((_req, res, next) => {
                    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
                    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
                    next();
                })
            }
        }
    ],
    test: {
        include: ['**/__test__/**/*.spec.ts']
    }
});
