import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
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

interface Contact {
    id: number;
    name: string;
    email: string;
    message: string;
    phone: string | null;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    page: Page;
    contact?: Contact;
}

export default function Page({ page, contact }: PageProps) {
    return (
        <>
            <Head title={`${page.title} - SMP Negeri 1 Tambun Selatan`} />

            <PublicLayout currentPath={`/${page.slug}`}>
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        {/* Page Header */}
                        <div className="mb-8">
                            <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">{page.title}</h1>
                            <div className="text-sm text-gray-600">
                                Dipublikasikan pada{' '}
                                {new Date(page.created_at).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </div>
                        </div>

                        {/* Featured Image */}
                        {page.image && (
                            <div className="mb-8">
                                <img src={page.image} alt={page.title} className="w-full rounded-lg shadow-lg" />
                            </div>
                        )}

                        {/* Page Content */}
                        <div
                            className="prose prose-lg prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 max-w-none"
                            dangerouslySetInnerHTML={{ __html: page.content }}
                        />
                    </div>
                </div>
            </PublicLayout>
        </>
    );
}
