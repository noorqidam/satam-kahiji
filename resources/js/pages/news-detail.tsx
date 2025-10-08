import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Home, User } from 'lucide-react';

interface User {
    id: number;
    name: string;
}

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    category: 'news' | 'announcements';
    image: string | null;
    created_at: string;
    is_published: boolean;
    user: User;
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

interface NewsDetailPageProps {
    post: Post;
    relatedPosts: Post[];
    contact?: Contact;
}

export default function NewsDetailPage({ post, relatedPosts, contact }: NewsDetailPageProps) {
    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getCategoryColor = (category: string) => {
        return category === 'news' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800';
    };

    const getCategoryLabel = (category: string) => {
        return category === 'news' ? 'Berita' : 'Pengumuman';
    };

    return (
        <PublicLayout currentPath={`/news/${post.slug}`}>
            <Head title={post.title} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <div className="mb-6">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                                        <Home className="mr-1 h-4 w-4" />
                                        Beranda
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/news" className="text-gray-600 hover:text-gray-900">
                                        Berita
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-medium text-gray-900">{post.title}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Article Header */}
                <article className="mb-8">
                    <header className="mb-6">
                        <div className="mb-4">
                            <Badge className={getCategoryColor(post.category)}>{getCategoryLabel(post.category)}</Badge>
                        </div>

                        <h1 className="mb-4 text-3xl leading-tight font-bold text-gray-900 md:text-4xl">{post.title}</h1>

                        {post.excerpt && <p className="mb-6 text-lg text-gray-600">{post.excerpt}</p>}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4" />
                                {formatDateTime(post.created_at)}
                            </div>
                        </div>
                    </header>

                    {/* Article Image */}
                    {post.image && (
                        <div className="mb-8 overflow-hidden rounded-lg">
                            <img
                                src={post.image.startsWith('http') ? post.image : `/storage/posts/${post.image}`}
                                alt={post.title}
                                className="h-auto w-full object-cover"
                            />
                        </div>
                    )}

                    {/* Article Content */}
                    <div
                        className="prose prose-lg max-w-none text-gray-800 [&_a]:text-blue-600 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-900 [&_h4]:text-gray-900 [&_h5]:text-gray-900 [&_h6]:text-gray-900 [&_li]:mb-1 [&_li]:text-gray-800 [&_ol]:mb-4 [&_ol]:ml-6 [&_ol]:list-decimal [&_p]:mb-4 [&_p]:text-gray-800 [&_strong]:text-gray-900 [&_ul]:mb-4 [&_ul]:ml-6 [&_ul]:list-disc"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </article>
            </div>
        </PublicLayout>
    );
}
