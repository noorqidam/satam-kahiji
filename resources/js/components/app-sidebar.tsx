// import { NavFooter } from '@/components/nav-footer';
import { NavRoleBased } from '@/components/nav-role-based';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import AppLogo from './app-logo';

// const footerNavItems: NavItem[] = [
//     {
//         title: 'Repository',
//         href: 'https://github.com/laravel/react-starter-kit',
//         icon: Folder,
//     },
//     {
//         title: 'Documentation',
//         href: 'https://laravel.com/docs/starter-kits#react',
//         icon: BookOpen,
//     },
// ];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const [searchQuery, setSearchQuery] = useState('');

    const getDashboardUrl = () => {
        const role = auth.user?.role ?? 'super_admin';
        switch (role) {
            case 'super_admin':
                return '/admin/dashboard';
            case 'headmaster':
                return '/headmaster/dashboard';
            case 'teacher':
                return '/teacher/dashboard';
            case 'deputy_headmaster':
                return '/staff/dashboard';
            default:
                return '/admin/dashboard';
        }
    };

    const dashboardUrl = getDashboardUrl();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="border-b border-sidebar-border/50 pb-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-sidebar-accent/20 hover:to-sidebar-accent/10 hover:shadow-md"
                        >
                            <Link href={dashboardUrl} prefetch className="flex items-center gap-3">
                                <AppLogo />
                                {/* Subtle shimmer effect on hover */}
                                <div className="absolute inset-0 -top-4 -bottom-4 translate-x-[-100%] rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[200%]" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                {/* Enhanced Search Bar */}
                <div className="relative mt-3 group-data-[collapsible=icon]:hidden">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/50 transition-colors duration-200 group-focus-within:text-sidebar-accent" />
                    <SidebarInput
                        type="search"
                        placeholder="Search navigation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-sidebar-border/30 bg-sidebar-accent/10 pr-4 pl-9 text-sm transition-all duration-200 placeholder:text-sidebar-foreground/40 focus:border-sidebar-accent/50 focus:bg-sidebar-accent/20"
                    />
                </div>
            </SidebarHeader>

            <SidebarContent className="px-0">
                <NavRoleBased searchQuery={searchQuery} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/50 pt-2">
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
