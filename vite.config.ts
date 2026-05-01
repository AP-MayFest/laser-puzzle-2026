import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        babel({ presets: [reactCompilerPreset()] }),
    ],
    server: {
        proxy: {
            '/api': { target: 'http://localhost:8787/' },
            '/2026/laser-puzzle/api': { target: 'http://localhost:8787/' },
        }
    },
    build: {
        rolldownOptions: {
            input: {
                index: resolve(import.meta.dirname, 'index.html'),
                daily: resolve(import.meta.dirname, 'daily.html'),
                play: resolve(import.meta.dirname, 'play.html'),
                builder: resolve(import.meta.dirname, 'builder.html'),
                tutorial: resolve(import.meta.dirname, 'tutorial.html'),
                color: resolve(import.meta.dirname, 'color.html'),
                '404': resolve(import.meta.dirname, '404.html'),
            }
        },
    },
    base: '/2026/laser-puzzle/',
});
