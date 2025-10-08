import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border/50 bg-gradient-to-r from-background to-background/95 px-6 backdrop-blur-sm transition-all duration-300 ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <SidebarTrigger className="group -ml-1 rounded-lg p-1.5 transition-all duration-200 hover:bg-sidebar-accent/50 hover:shadow-sm active:scale-95" />
                <div className="min-w-0 flex-1">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
        </header>
    );
}
