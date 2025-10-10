import Footer from '@/components/public/footer';
import Navbar from '@/components/public/navbar';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { usePage } from '@inertiajs/react';
import { ReactNode } from 'react';

interface PublicLayoutProps {
    children: ReactNode;
    currentPath?: string;
    className?: string;
    showNavbar?: boolean;
    showFooter?: boolean;
}

export default function PublicLayout({ children, currentPath = '', className = '', showNavbar = true, showFooter = true }: PublicLayoutProps) {
    const { props } = usePage();
    const { contact } = props as { contact?: unknown; [key: string]: unknown };
    return (
        <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 ${className}`}>
            {/* Content Wrapper */}
            <div className="flex min-h-screen flex-col">
                {/* Navigation */}
                {showNavbar && <Navbar currentPath={currentPath} />}

                {/* Main Content */}
                <main className="flex-1 pt-10">{children}</main>

                {/* Footer */}
                {showFooter && <Footer contact={contact as never} />}
            </div>

            {/* Scroll to Top Button */}
            <ScrollToTop />
        </div>
    );
}
