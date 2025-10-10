import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => ({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            // Fix React Fast Refresh for development
            fastRefresh: command === 'serve',
            // Use SWC for better performance
            jsxRuntime: 'automatic'
        }),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
        // Exclude React Fast Refresh from production builds
        ...(mode === 'production' && {
            drop: ['console', 'debugger'],
            pure: ['console.log', 'console.warn']
        })
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    // Development server configuration
    server: {
        hmr: {
            overlay: true
        },
        // Clear any cached modules that might cause issues
        force: command === 'serve'
    },
    build: {
        target: 'es2020',
        cssCodeSplit: true,
        cssMinify: 'lightningcss',
        rollupOptions: {
            treeshake: {
                preset: 'recommended',
                propertyReadSideEffects: false,
                unknownGlobalSideEffects: false
            },
            output: {
                manualChunks: (id) => {
                    // Only critical React core for initial load
                    if (id.includes('react/jsx-runtime') || id.includes('react/index')) {
                        return 'critical-react';
                    }
                    
                    // Split React DOM into smaller pieces
                    if (id.includes('react-dom/client')) {
                        return 'react-client';
                    }
                    if (id.includes('react-dom')) {
                        return 'react-dom';
                    }
                    
                    // Other React utilities (lazy load)
                    if (id.includes('react') && !id.includes('react-dom') && !id.includes('react-dropzone') && !id.includes('react-i18next')) {
                        return 'react-utils';
                    }
                    
                    // Critical app dependencies
                    if (id.includes('@inertiajs/react')) {
                        return 'critical-inertia';
                    }
                    if (id.includes('clsx')) {
                        return 'critical-utils';
                    }
                    
                    // Non-critical utilities (can be lazy loaded)
                    if (id.includes('class-variance-authority') || id.includes('tailwind-merge')) {
                        return 'utils-styling';
                    }
                    
                    // Icons (lazy load)
                    if (id.includes('lucide-react')) {
                        return 'icons';
                    }
                    
                    // UI components (all lazy loaded)
                    if (id.includes('@radix-ui')) {
                        // Further split radix based on usage patterns
                        if (id.includes('dialog') || id.includes('dropdown') || id.includes('popover')) {
                            return 'ui-overlays';
                        }
                        if (id.includes('form') || id.includes('select') || id.includes('switch') || id.includes('checkbox')) {
                            return 'ui-forms';
                        }
                        return 'ui-base';
                    }
                    
                    // Heavy libraries (always lazy)
                    if (id.includes('@tinymce/tinymce-react')) {
                        return 'editor';
                    }
                    if (id.includes('framer-motion')) {
                        return 'animations';
                    }
                    if (id.includes('react-dropzone')) {
                        return 'dropzone';
                    }
                    if (id.includes('i18next')) {
                        return 'i18n';
                    }
                    if (id.includes('axios')) {
                        return 'http';
                    }
                    if (id.includes('valibot')) {
                        return 'validation';
                    }
                    
                    // Split other vendor libraries more granularly
                    if (id.includes('@headlessui')) {
                        return 'headlessui';
                    }
                    
                    // Group remaining node_modules by size/importance
                    if (id.includes('node_modules')) {
                        // Small utilities
                        if (id.includes('lodash') || id.includes('ramda') || id.includes('date-fns')) {
                            return 'vendor-utils';
                        }
                        // Everything else
                        return 'vendor-misc';
                    }
                },
                // Optimize chunk sizes and naming
                chunkFileNames: (chunkInfo) => {
                    const name = chunkInfo.name;
                    if (name?.startsWith('vendor-')) {
                        return `assets/${name}-[hash].js`;
                    }
                    return 'assets/[name]-[hash].js';
                },
                // Ensure stable chunk naming for better caching
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            }
        },
        // Aggressive minification
        minify: 'esbuild',
        // Source maps for debugging (disable in production if not needed)
        sourcemap: false,
        // Reduce bundle size
        chunkSizeWarningLimit: 150,
        // Additional esbuild optimizations
        esbuildOptions: {
            treeShaking: true,
            minifyIdentifiers: true,
            minifySyntax: true,
            minifyWhitespace: true,
            legalComments: 'none'
        }
    },
    // Optimize dependencies
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            '@inertiajs/react',
            'clsx',
            'class-variance-authority',
            'tailwind-merge'
        ],
        exclude: [
            '@tinymce/tinymce-react',
            'framer-motion',
            'react-dropzone'
        ]
    },
    // Define external dependencies to reduce bundle size (production only)
    define: mode === 'production' ? {
        __DEV__: false,
        'process.env.NODE_ENV': '"production"'
    } : {
        __DEV__: true
    }
}));
