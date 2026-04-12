import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    build: {
        rolldownOptions: {
            input: {
                index: resolve(import.meta.dirname, 'index.html'),
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
