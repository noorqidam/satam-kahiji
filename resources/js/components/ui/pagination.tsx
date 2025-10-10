import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface PaginationData {
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface PaginationProps {
    data: PaginationData;
    className?: string;
}

export function Pagination({ data, className }: PaginationProps) {
    const {last_page, from, to, total, links } = data;

    if (last_page <= 1) return null;

    return (
        <div className={cn("flex items-center justify-between", className)}>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <p>
                    Showing <span className="font-medium">{from}</span> to{' '}
                    <span className="font-medium">{to}</span> of{' '}
                    <span className="font-medium">{total}</span> results
                </p>
            </div>

            <div className="flex items-center space-x-2">
                <nav className="flex items-center space-x-1" aria-label="Pagination">
                    {links.map((link, index) => {
                        const isFirst = index === 0;
                        const isLast = index === links.length - 1;
                        const isEllipsis = link.label === '...';
                        const isNumber = !isFirst && !isLast && !isEllipsis;

                        if (isEllipsis) {
                            return (
                                <Button
                                    key={index}
                                    variant="ghost"
                                    size="sm"
                                    disabled
                                    className="w-10 h-10"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">More pages</span>
                                </Button>
                            );
                        }

                        if (isFirst) {
                            return (
                                <Button
                                    key={index}
                                    variant="ghost"
                                    size="sm"
                                    disabled={!link.url}
                                    asChild={!!link.url}
                                    className="w-10 h-10"
                                >
                                    {link.url ? (
                                        <Link href={link.url}>
                                            <ChevronLeft className="h-4 w-4" />
                                            <span className="sr-only">Previous</span>
                                        </Link>
                                    ) : (
                                        <>
                                            <ChevronLeft className="h-4 w-4" />
                                            <span className="sr-only">Previous</span>
                                        </>
                                    )}
                                </Button>
                            );
                        }

                        if (isLast) {
                            return (
                                <Button
                                    key={index}
                                    variant="ghost"
                                    size="sm"
                                    disabled={!link.url}
                                    asChild={!!link.url}
                                    className="w-10 h-10"
                                >
                                    {link.url ? (
                                        <Link href={link.url}>
                                            <ChevronRight className="h-4 w-4" />
                                            <span className="sr-only">Next</span>
                                        </Link>
                                    ) : (
                                        <>
                                            <ChevronRight className="h-4 w-4" />
                                            <span className="sr-only">Next</span>
                                        </>
                                    )}
                                </Button>
                            );
                        }

                        if (isNumber) {
                            return (
                                <Button
                                    key={index}
                                    variant={link.active ? "default" : "ghost"}
                                    size="sm"
                                    disabled={!link.url}
                                    asChild={!!link.url && !link.active}
                                    className="w-10 h-10"
                                >
                                    {link.url && !link.active ? (
                                        <Link href={link.url}>
                                            {link.label}
                                        </Link>
                                    ) : (
                                        <span>{link.label}</span>
                                    )}
                                </Button>
                            );
                        }

                        return null;
                    })}
                </nav>
            </div>
        </div>
    );
}