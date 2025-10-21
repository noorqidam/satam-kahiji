<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }

                // Register service worker for caching
                if ('serviceWorker' in navigator) {
                    window.addEventListener('load', function() {
                        navigator.serviceWorker.register('/sw.js').catch(function(error) {
                            console.log('ServiceWorker registration failed: ', error);
                        });
                    });
                }

                // Performance optimizations - removed invalid wildcard prefetch attempts
            })();
        </script>

        {{-- Critical CSS - inline the most important styles --}}
        <style>
            html {
                background-color: oklch(1 0 0);
                font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }

            /* Critical loading styles */
            .inertia-progress {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background-color: #4B5563;
                z-index: 50;
                opacity: 0;
                transition: opacity 0.2s ease-in-out;
            }

            .inertia-progress.visible {
                opacity: 1;
            }

            /* Prevent layout shift */
            body {
                margin: 0;
                line-height: 1.5;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        {{-- Optimized favicon --}}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="icon" href="/logo-satam.png" type="image/png" sizes="32x32">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">

        {{-- Performance optimizations --}}
        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
        <link rel="dns-prefetch" href="https://fonts.bunny.net">
        
        {{-- Resource hints for better performance --}}
        <meta name="theme-color" content="#ffffff">
        <meta name="msapplication-TileColor" content="#ffffff">
        
        {{-- Optimize rendering --}}
        <meta name="color-scheme" content="light dark">
        <meta name="robots" content="index, follow">
        
        {{-- Critical resource hints --}}
        <link rel="preconnect" href="{{ config('app.url') }}" crossorigin>
        
        {{-- Critical resource preloading with font-display optimization --}}
        <link rel="preload" href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
        <noscript><link rel="stylesheet" href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&display=swap"></noscript>
        
        {{-- Preload critical font files --}}
        <link rel="preload" href="https://fonts.bunny.net/instrument-sans/files/instrument-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
        <link rel="preload" href="https://fonts.bunny.net/instrument-sans/files/instrument-sans-latin-500-normal.woff2" as="font" type="font/woff2" crossorigin>
        
        {{-- Preload critical JavaScript chunks --}}
        <link rel="modulepreload" href="{{ Vite::asset('resources/js/app.tsx') }}">
        
        {{-- Removed invalid wildcard asset references - Vite will handle chunk loading --}}

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
