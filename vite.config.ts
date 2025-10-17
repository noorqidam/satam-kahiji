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
            // Ensure page files are included as entries
            buildDirectory: 'build',
        }),
        react({
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
    ssr: {
        noExternal: ['@tinymce/tinymce-react']
    },
    // Development server configuration
    server: {
        port: 5173,
        host: true,
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
        // Additional optimizations
        assetsInlineLimit: 4096, // Inline assets smaller than 4kb
        chunkSizeWarningLimit: 1000, // Increase warning limit for better chunking
        rollupOptions: {
            treeshake: {
                preset: 'recommended',
                propertyReadSideEffects: false,
                unknownGlobalSideEffects: false
            },
            output: {
                manualChunks: (id) => {
                    // React core - most critical
                    if (id.includes('react') || id.includes('react-dom')) {
                        return 'react-vendor';
                    }
                    
                    // Inertia - core routing
                    if (id.includes('@inertiajs')) {
                        return 'inertia';
                    }
                    
                    // UI component libraries - split into smaller chunks
                    if (id.includes('@radix-ui')) {
                        return 'radix-ui';
                    }
                    
                    if (id.includes('lucide-react')) {
                        return 'icons';
                    }
                    
                    // i18n libraries
                    if (id.includes('i18next') || id.includes('react-i18next')) {
                        return 'i18n';
                    }
                    
                    // Form and validation libraries
                    if (id.includes('valibot') || id.includes('react-dropzone')) {
                        return 'forms';
                    }
                    
                    // Animation libraries
                    if (id.includes('framer-motion')) {
                        return 'animations';
                    }
                    
                    // Editor - separate heavy component
                    if (id.includes('@tinymce/tinymce-react')) {
                        return 'editor';
                    }
                    
                    // Headless UI
                    if (id.includes('@headlessui')) {
                        return 'headless-ui';
                    }
                    
                    // Utility libraries - group together
                    if (id.includes('clsx') || id.includes('class-variance-authority') || id.includes('tailwind-merge')) {
                        return 'utils';
                    }
                    
                    // HTTP client
                    if (id.includes('axios')) {
                        return 'http';
                    }
                    
                    // Admin pages - split into smaller, more specific chunks
                    if (id.includes('/pages/admin/')) {
                        // People management
                        if (id.includes('/students/')) {
                            return 'admin-students';
                        }
                        if (id.includes('/staff/')) {
                            return 'admin-staff';
                        }
                        if (id.includes('/users/')) {
                            return 'admin-users';
                        }
                        
                        // Academic management
                        if (id.includes('/classes/')) {
                            return 'admin-classes';
                        }
                        if (id.includes('/subjects/')) {
                            return 'admin-subjects';
                        }
                        if (id.includes('/subject-assignments/')) {
                            return 'admin-assignments';
                        }
                        
                        // Content management - allow individual entries for Laravel routes
                        if (id.includes('/posts/')) {
                            return null;
                        }
                        if (id.includes('/pages/')) {
                            return null;
                        }
                        if (id.includes('/galleries/')) {
                            return null;
                        }
                        if (id.includes('/google-drive/')) {
                            return null;
                        }
                        
                        // Facilities and activities - allow individual entries for Laravel routes
                        if (id.includes('/facilities/')) {
                            return null;
                        }
                        if (id.includes('/extracurriculars/')) {
                            return null;
                        }
                        
                        // Other admin features - allow individual entries for Laravel routes
                        if (id.includes('/homeroom/') || id.includes('/work-items/') || id.includes('/contacts/')) {
                            return null;
                        }
                        
                        return 'admin-core';
                    }
                    
                    // Teacher pages - split by feature
                    if (id.includes('/pages/teacher/')) {
                        if (id.includes('/students/')) {
                            return 'teacher-students';
                        }
                        if (id.includes('/subjects/')) {
                            return 'teacher-subjects';
                        }
                        if (id.includes('/work-items/')) {
                            return 'teacher-work';
                        }
                        return 'teacher-core';
                    }
                    
                    // Headmaster pages
                    if (id.includes('/pages/headmaster/')) {
                        return 'headmaster-portal';
                    }
                    
                    // Auth pages - allow individual entries for Laravel routes
                    if (id.includes('/pages/auth/')) {
                        // Don't chunk auth pages to allow individual routing
                        return null;
                    }
                    
                    // Settings pages - allow individual entries for Laravel routes
                    if (id.includes('/pages/settings/')) {
                        // Don't chunk settings pages to allow individual routing
                        return null;
                    }
                    
                    // Public pages - allow individual entries for Laravel routes
                    if (id.includes('/pages/') && !id.includes('/admin/') && !id.includes('/teacher/') && !id.includes('/headmaster/') && !id.includes('/auth/') && !id.includes('/settings/')) {
                        // Don't chunk public pages to allow individual routing
                        return null;
                    }
                    
                    // Other vendor dependencies
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                },
                // Optimize chunk sizes and naming
                chunkFileNames: 'assets/[name]-[hash].js',
                // Ensure stable chunk naming for better caching
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            }
        },
        // Aggressive minification
        minify: 'esbuild',
        // Source maps for debugging (disable in production if not needed)
        sourcemap: false,
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
            'tailwind-merge',
            '@tinymce/tinymce-react'
        ],
        exclude: [
            'framer-motion'
        ],
        esbuildOptions: {
            define: {
                global: 'globalThis'
            },
        }
    },
    // Define external dependencies to reduce bundle size (production only)
    define: {
        global: 'globalThis',
        'process.env.NODE_ENV': mode === 'production' ? '"production"' : '"development"',
        __DEV__: mode !== 'production'
    }
}));
