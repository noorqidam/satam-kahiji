# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Laravel React Starter Kit - a full-stack web application using Laravel 12 as the backend API and React 19 with TypeScript as the frontend. The project uses Inertia.js to seamlessly connect the Laravel backend with the React frontend, creating a modern SPA experience.

## Development Commands

### Frontend Development
- `npm run dev` - Start Vite development server for frontend assets
- `npm run build` - Build production frontend assets
- `npm run build:ssr` - Build both client and SSR assets
- `npm run lint` - Run ESLint with auto-fix
- `npm run types` - Type check TypeScript without emitting files
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Backend Development
- `composer dev` - Start full development environment (Laravel server, queue worker, logs, and Vite)
- `composer dev:ssr` - Start development environment with SSR
- `php artisan serve` - Start Laravel development server only
- `php artisan test` - Run PHP tests
- `composer test` - Run tests with config clearing

### Testing
- `php artisan test` - Run all PHP/Laravel tests (uses Pest testing framework)
- `npm run types` - TypeScript type checking

## Architecture

### Backend (Laravel)
- **Framework**: Laravel 12 with PHP 8.2+
- **Database**: SQLite (for development)
- **Testing**: Pest PHP testing framework
- **Key Features**: Authentication, user management, settings management
- **Routes**: Organized in `/routes/` with separate files for auth, settings, and web routes
- **Controllers**: Located in `app/Http/Controllers/` with Auth and Settings subdirectories

### Frontend (React + TypeScript)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6 with Laravel Vite Plugin
- **Styling**: Tailwind CSS 4 with custom components
- **UI Components**: Radix UI primitives with custom styled components in `resources/js/components/ui/`
- **State Management**: Inertia.js for server-client state sync
- **Icons**: Lucide React

### Key Directories
- `resources/js/pages/` - React page components that map to Laravel routes
- `resources/js/components/` - Reusable React components including UI primitives
- `resources/js/layouts/` - Layout components for different page types (app, auth, settings)
- `resources/js/hooks/` - Custom React hooks for state management
- `app/Http/Controllers/` - Laravel controllers organized by feature
- `routes/` - Laravel route definitions split by purpose

### Component Architecture
- **Layout System**: Multiple layout templates (app, auth, settings) with nested layout components
- **UI Components**: Custom component library built on Radix UI primitives
- **Appearance System**: Dark/light mode toggle with persistent theme state using custom hooks
- **Navigation**: Sidebar-based navigation with breadcrumbs support

### Authentication & Authorization
- Laravel Breeze-style authentication with Inertia.js
- Email verification and password reset flows
- User settings management (profile, password, appearance)
- Protected routes using Laravel middleware

## Development Workflow

1. **Starting Development**: Use `composer dev` to start the full development stack
2. **Frontend Changes**: Vite hot-reloads React components automatically
3. **Backend Changes**: Laravel development server auto-reloads
4. **Database Changes**: Migrations are in `database/migrations/`
5. **Testing**: Run `php artisan test` for backend tests, `npm run types` for frontend type checking

## Important Notes

- The project uses Inertia.js patterns - pages are React components that receive props from Laravel controllers
- TypeScript is strictly configured - ensure type safety when adding new features
- Tailwind CSS 4 is used - prefer utility classes and the custom component system
- All UI components follow the established patterns in `resources/js/components/ui/`
- Authentication flows are pre-built and tested - extend rather than replace existing patterns