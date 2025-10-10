// Route-based code splitting for better performance
export const ROUTE_CHUNKS = {
  // Critical routes (preload)
  CRITICAL: [
    'auth/login',
    'auth/register', 
    'welcome',
    'dashboard'
  ],
  
  // Important routes (prefetch)
  IMPORTANT: [
    'settings/profile',
    'settings/password',
    'settings/appearance'
  ],
  
  // Heavy routes (lazy load on demand)
  HEAVY: [
    'admin/users',
    'admin/staff',
    'admin/students',
    'teacher/students',
    'admin/galleries',
    'admin/facilities'
  ],
  
  // Admin-only routes (lazy load)
  ADMIN: [
    'admin/system-activity',
    'admin/work-items'
  ]
};

// Determine loading strategy based on route
export function getLoadingStrategy(routeName: string): 'critical' | 'important' | 'heavy' | 'lazy' {
  if (ROUTE_CHUNKS.CRITICAL.includes(routeName)) return 'critical';
  if (ROUTE_CHUNKS.IMPORTANT.includes(routeName)) return 'important'; 
  if (ROUTE_CHUNKS.HEAVY.includes(routeName)) return 'heavy';
  if (ROUTE_CHUNKS.ADMIN.includes(routeName)) return 'lazy';
  
  return 'important'; // Default
}

// Preload routes based on user role and current page
export function preloadRoutesForUser(userRole: string, currentRoute: string) {
  const preloadTargets: string[] = [];
  
  // Always preload critical routes
  preloadTargets.push(...ROUTE_CHUNKS.CRITICAL);
  
  // Role-based preloading
  if (userRole === 'super_admin') {
    preloadTargets.push(...ROUTE_CHUNKS.ADMIN.slice(0, 2)); // Limit preloading
  }
  
  if (userRole.includes('teacher')) {
    preloadTargets.push('teacher/students/index', 'teacher/subjects/index');
  }
  
  // Preload likely next routes
  if (currentRoute === 'auth/login') {
    preloadTargets.push('dashboard');
  }
  
  // Remove duplicates and current route
  return Array.from(new Set(preloadTargets)).filter(route => route !== currentRoute);
}