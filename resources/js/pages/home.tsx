import { EducationPattern } from '@/components/home/education-pattern';
import { FloatingElements } from '@/components/home/floating-elements';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { WelcomeSection } from '@/components/home/welcome-section';
import { useHomepageUpdates } from '@/hooks/use-content-updates';
import PublicLayout from '@/layouts/public-layout';
import { HomeProps } from '@/types/home';
import type { ContentUpdateEvent } from '@/types/echo';
import { Head, router } from '@inertiajs/react';
import { lazy, useCallback } from 'react';

// Lazy load components that are below the fold
const ExtracurricularSection = lazy(() =>
    import('@/components/home/extracurricular-section').then((module) => ({
        default: module.ExtracurricularSection,
    })),
);
const GallerySection = lazy(() =>
    import('@/components/home/gallery-section').then((module) => ({
        default: module.GallerySection,
    })),
);
const NewsSection = lazy(() =>
    import('@/components/home/news-section').then((module) => ({
        default: module.NewsSection,
    })),
);
const SchoolStats = lazy(() =>
    import('@/components/home/school-stats').then((module) => ({
        default: module.SchoolStats,
    })),
);

export default function Home({ featuredNews, latestNews, galleries, extracurriculars }: HomeProps) {
    // Handle real-time content updates
    const handleContentUpdate = useCallback((event: ContentUpdateEvent) => {
        console.log('Content updated:', event);
        // Reload the page data to get fresh content
        router.reload({ only: ['featuredNews', 'latestNews', 'galleries', 'extracurriculars'] });
    }, []);

    // Listen for homepage content updates
    useHomepageUpdates(handleContentUpdate);

    return (
        <>
            <Head title="Selamat Datang" />

            <PublicLayout currentPath="/" className="overflow-x-hidden">
                <section id="home" className="relative w-full max-w-full overflow-x-hidden">
                    <div className="absolute inset-0">
                        <EducationPattern />
                    </div>

                    <FloatingElements />

                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white/20 to-emerald-50/40" />
                    <div className="absolute inset-0">
                        <div className="bg-gradient-radial h-full w-full from-transparent via-blue-500/5 to-transparent" />
                    </div>

                    <HeroCarousel featuredNews={featuredNews} />
                </section>

                <WelcomeSection />
                <SchoolStats />
                <NewsSection latestNews={latestNews} />
                <GallerySection galleries={galleries} />
                <ExtracurricularSection extracurriculars={extracurriculars} />
            </PublicLayout>
        </>
    );
}