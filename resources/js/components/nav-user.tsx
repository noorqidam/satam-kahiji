import { TeacherFeedbackNotification } from '@/components/teacher-feedback-notification';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';

export function NavUser() {
    const { auth } = usePage<SharedData>().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    return (
        <>
            {/* Teacher Feedback Notification - shown above avatar */}
            <TeacherFeedbackNotification />

            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="group relative overflow-hidden rounded-xl border border-sidebar-border/50 bg-gradient-to-r from-sidebar-accent/20 to-sidebar-accent/10 text-sidebar-accent-foreground transition-all duration-300 hover:border-sidebar-border hover:from-sidebar-accent/30 hover:to-sidebar-accent/20 hover:shadow-lg data-[state=open]:border-sidebar-accent data-[state=open]:from-sidebar-accent data-[state=open]:to-sidebar-accent/80 data-[state=open]:shadow-xl"
                            >
                                <UserInfo user={auth.user} />
                                <ChevronsUpDown className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                {/* Subtle shimmer effect */}
                                <div className="absolute inset-0 -top-4 -bottom-4 translate-x-[-100%] rotate-12 bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[200%]" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border-sidebar-border/80 bg-sidebar/95 shadow-2xl backdrop-blur-sm"
                            align="end"
                            side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
                        >
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </>
    );
}
