import { EducationPattern } from '@/components/home/education-pattern';
import { ExtracurricularSection } from '@/components/home/extracurricular-section';
import { FloatingElements } from '@/components/home/floating-elements';
import { GallerySection } from '@/components/home/gallery-section';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { NewsSection } from '@/components/home/news-section';
import { SchoolStats } from '@/components/home/school-stats';
import { WelcomeSection } from '@/components/home/welcome-section';
import PublicLayout from '@/layouts/public-layout';
import { HomeProps } from '@/types/home';
import { Head } from '@inertiajs/react';

export default function Home({ featuredNews, latestNews, galleries, extracurriculars }: HomeProps) {
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
