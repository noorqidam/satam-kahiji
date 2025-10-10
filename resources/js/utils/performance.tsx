import { lazy, Suspense, ComponentType } from 'react';

// Performance-optimized lazy loading with fallbacks
export function createLazyComponent<P extends Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  return function WrappedComponent(props: P) {
    return (
      <Suspense fallback={fallback || <div className="h-32 w-full animate-pulse bg-gray-100 rounded"></div>}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Intersection observer for performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private observer: IntersectionObserver | null = null;

  static getInstance() {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  observeElement(element: Element, callback: () => void) {
    if (!this.observer) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              callback();
              this.observer?.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '50px' }
      );
    }

    this.observer.observe(element);
  }

  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Critical CSS detection
export function addCriticalCSS(css: string) {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.insertBefore(style, document.head.firstChild);
}

// Preload important resources
export function preloadResource(href: string, as: string = 'script') {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

// Types for Web Vitals
interface LargestContentfulPaint extends PerformanceEntry {
  renderTime: number;
  loadTime: number;
  size: number;
  id: string;
  url: string;
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
  cancelable: boolean;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
  lastInputTime: number;
  sources: LayoutShiftAttribution[];
}

interface LayoutShiftAttribution {
  node?: Node;
  previousRect: DOMRectReadOnly;
  currentRect: DOMRectReadOnly;
}

// Web vitals tracking
export function trackWebVitals() {
  if (typeof window !== 'undefined') {
    // Track LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries() as LargestContentfulPaint[];
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Track FID
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const fidEntry = entry as FirstInputEntry;
        console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Track CLS
    new PerformanceObserver((list) => {
      let clsValue = 0;
      list.getEntries().forEach((entry) => {
        const clsEntry = entry as LayoutShiftEntry;
        if (!clsEntry.hadRecentInput) {
          clsValue += clsEntry.value;
        }
      });
      console.log('CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
}