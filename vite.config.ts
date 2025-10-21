import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
            buildDirectory: 'build',
        }),
        react({
            jsxRuntime: 'automatic',
        }),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    ssr: {
        noExternal: ['@tinymce/tinymce-react'],
    },
    server: {
        port: 5173,
        host: '0.0.0.0',
        cors: true,
    },
    build: {
        target: 'es2020',
        rollupOptions: {
            output: {
                // Simplified chunking - keep React together
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                    vendor: ['@inertiajs/react', 'axios'],
                },
            },
        },
        minify: 'esbuild',
        sourcemap: false,
    },
    optimizeDeps: {
        include: ['react', 'react-dom', '@inertiajs/react'],
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
        },
    },
    define: {
        global: 'globalThis',
        'process.env.NODE_ENV': mode === 'production' ? '"production"' : '"development"',
    },
}));
