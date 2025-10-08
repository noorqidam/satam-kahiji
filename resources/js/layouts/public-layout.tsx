import Footer from '@/components/public/footer';
import Navbar from '@/components/public/navbar';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { usePage } from '@inertiajs/react';
import { ReactNode } from 'react';

interface Contact {
    id: number;
    name: string;
    email: string;
    message: string;
    phone: string | null;
    created_at: string;
    updated_at: string;
}

interface Page {
    id: number;
    slug: string;
    title: string;
    content: string;
    image: string | null;
    created_at: string;
    updated_at: string;
}

interface PublicLayoutProps {
    children: ReactNode;
    currentPath?: string;
    className?: string;
    showNavbar?: boolean;
    showFooter?: boolean;
}

export default function PublicLayout({ children, currentPath = '', className = '', showNavbar = true, showFooter = true }: PublicLayoutProps) {
    const { props } = usePage();
    const { contact } = props as any;
    return (
        <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 ${className}`}>
            {/* Content Wrapper */}
            <div className="flex min-h-screen flex-col">
                {/* Navigation */}
                {showNavbar && <Navbar currentPath={currentPath} />}

                {/* Main Content */}
                <main className="flex-1 pt-10">{children}</main>

                {/* Footer */}
                {showFooter && <Footer contact={contact} />}
            </div>

            {/* Scroll to Top Button */}
            <ScrollToTop />
        </div>
    );
}
