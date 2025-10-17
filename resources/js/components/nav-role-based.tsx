import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavGroup, type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Award,
    BarChart3,
    BookOpen,
    Building,
    ChevronDown,
    ChevronRight,
    ClipboardList,
    Cloud,
    FileText,
    GraduationCap,
    Image,
    LayoutGrid,
    Newspaper,
    Phone,
    Shield,
    Trophy,
    UserCheck,
    Users,
} from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const getNavigationGroups = (userRole: string, t: (key: string) => string): NavGroup[] => {
    switch (userRole) {
        case 'super_admin':
            return [
                {
                    title: t('super_admin_navigation.groups.dashboard'),
                    items: [{ title: t('super_admin_navigation.items.overview'), href: '/admin/dashboard', icon: LayoutGrid }],
                },
                {
                    title: t('super_admin_navigation.groups.user_management'),
                    items: [{ title: t('super_admin_navigation.items.users'), href: '/admin/users', icon: Shield }],
                },
                {
                    title: t('super_admin_navigation.groups.staff_management'),
                    items: [{ title: t('super_admin_navigation.items.staff_management'), href: '/admin/staff', icon: Users }],
                },
                {
                    title: t('super_admin_navigation.groups.academic_structure'),
                    items: [
                        { title: t('super_admin_navigation.items.classes'), href: '/admin/classes', icon: Building },
                        { title: t('super_admin_navigation.items.subjects'), href: '/admin/subjects', icon: BookOpen },
                    ],
                },
                {
                    title: t('super_admin_navigation.groups.assignments_students'),
                    items: [
                        { title: t('super_admin_navigation.items.subject_assignments'), href: '/admin/subject-assignments', icon: ClipboardList },
                        { title: t('super_admin_navigation.items.homeroom_management'), href: '/admin/homeroom', icon: UserCheck },
                        { title: t('super_admin_navigation.items.students'), href: '/admin/students', icon: GraduationCap },
                    ],
                },
                {
                    title: t('super_admin_navigation.groups.academic'),
                    items: [
                        { title: t('super_admin_navigation.items.extracurriculars'), href: '/admin/extracurriculars', icon: Trophy },
                        { title: t('super_admin_navigation.items.work_items'), href: '/admin/work-items', icon: ClipboardList },
                    ],
                },
                {
                    title: t('super_admin_navigation.groups.content_management'),
                    items: [
                        { title: t('super_admin_navigation.items.posts_news'), href: '/admin/posts', icon: Newspaper },
                        { title: t('super_admin_navigation.items.pages'), href: '/admin/pages', icon: FileText },
                        { title: t('super_admin_navigation.items.gallery'), href: '/admin/galleries', icon: Image },
                        { title: t('super_admin_navigation.items.facilities'), href: '/admin/facilities', icon: Building },
                    ],
                },
                {
                    title: t('super_admin_navigation.groups.communication'),
                    items: [{ title: t('super_admin_navigation.items.contact_management'), href: '/admin/contacts', icon: Phone }],
                },
                {
                    title: t('super_admin_navigation.groups.system'),
                    items: [{ title: t('super_admin_navigation.items.google_drive_monitor'), href: '/admin/google-drive/dashboard', icon: Cloud }],
                },
            ];

        case 'headmaster':
            return [
                {
                    title: t('headmaster_navigation.groups.dashboard'),
                    items: [{ title: t('headmaster_navigation.items.overview'), href: '/headmaster/dashboard', icon: LayoutGrid }],
                },
                {
                    title: t('headmaster_navigation.groups.school_management'),
                    items: [
                        { title: t('headmaster_navigation.items.staff_overview'), href: '/headmaster/staff-overview', icon: Users },
                        { title: t('headmaster_navigation.items.students'), href: '/headmaster/students', icon: GraduationCap },
                        { title: t('headmaster_navigation.items.homeroom_management'), href: '/admin/homeroom', icon: UserCheck },
                        { title: t('headmaster_navigation.items.work_items'), href: '/admin/work-items', icon: ClipboardList },
                    ],
                },
            ];

        case 'teacher':
            return [
                {
                    title: t('teacher_navigation.groups.dashboard'),
                    items: [{ title: t('teacher_navigation.items.overview'), href: '/teacher/dashboard', icon: LayoutGrid }],
                },
                {
                    title: t('teacher_navigation.groups.my_teaching'),
                    items: [
                        { title: t('teacher_navigation.items.my_subjects'), href: '/teacher/subjects', icon: BookOpen },
                        { title: t('teacher_navigation.items.work_items'), href: '/teacher/work-items', icon: ClipboardList },
                    ],
                },
                {
                    title: t('teacher_navigation.groups.students'),
                    items: [{ title: t('teacher_navigation.items.my_students'), href: '/teacher/students', icon: GraduationCap }],
                },
            ];

        case 'deputy_headmaster':
            return [
                {
                    title: t('deputy_headmaster_navigation.groups.dashboard'),
                    items: [{ title: t('deputy_headmaster_navigation.items.overview'), href: '/staff/dashboard', icon: LayoutGrid }],
                },
                {
                    title: t('deputy_headmaster_navigation.groups.academic_support'),
                    items: [
                        { title: t('deputy_headmaster_navigation.items.staff_management'), href: '/staff/staff', icon: Users },
                        { title: t('deputy_headmaster_navigation.items.students'), href: '/staff/students', icon: GraduationCap },
                        { title: t('deputy_headmaster_navigation.items.subjects'), href: '/staff/subjects', icon: BookOpen },
                        { title: t('deputy_headmaster_navigation.items.student_grades'), href: '/staff/grades', icon: Award },
                    ],
                },
                {
                    title: t('deputy_headmaster_navigation.groups.content_management'),
                    items: [
                        { title: t('deputy_headmaster_navigation.items.posts_news'), href: '/staff/posts', icon: Newspaper },
                        { title: t('deputy_headmaster_navigation.items.pages'), href: '/staff/pages', icon: FileText },
                        { title: t('deputy_headmaster_navigation.items.gallery'), href: '/staff/galleries', icon: Image },
                    ],
                },
                {
                    title: t('deputy_headmaster_navigation.groups.administration'),
                    items: [
                        { title: t('deputy_headmaster_navigation.items.reports'), href: '/staff/reports', icon: BarChart3 },
                        { title: t('deputy_headmaster_navigation.items.facilities'), href: '/staff/facilities', icon: Building },
                    ],
                },
            ];

        default:
            return [
                {
                    title: 'Dashboard',
                    items: [{ title: 'Overview', href: '/dashboard', icon: LayoutGrid }],
                },
            ];
    }
};

export const NavRoleBased = memo(function NavRoleBased({ searchQuery = '' }: { searchQuery?: string }) {
    const { auth } = usePage<SharedData>().props;
    const page = usePage();
    const userRole = auth.user?.role ?? 'super_admin';
    const { t, i18n } = useTranslation();

    // Get navigation groups - memoize properly to avoid infinite loops
    const navigationGroups = useMemo(() => getNavigationGroups(userRole, t), [userRole, t]);

    // State to track which groups are open (simple initialization)
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
        const initialState: Record<string, boolean> = {};
        if (userRole === 'super_admin') {
            initialState[t('super_admin_navigation.groups.dashboard')] = true;
            initialState[t('super_admin_navigation.groups.user_management')] = true;
        } else if (userRole === 'headmaster') {
            initialState[t('headmaster_navigation.groups.dashboard')] = true;
        } else if (userRole === 'teacher') {
            initialState[t('teacher_navigation.groups.dashboard')] = true;
        } else if (userRole === 'deputy_headmaster') {
            initialState[t('deputy_headmaster_navigation.groups.dashboard')] = true;
        } else {
            initialState['Dashboard'] = true; // fallback for others
        }
        return initialState;
    });

    // Update open groups when language changes
    useEffect(() => {
        const newState: Record<string, boolean> = {};
        if (userRole === 'super_admin') {
            newState[t('super_admin_navigation.groups.dashboard')] = true;
            newState[t('super_admin_navigation.groups.user_management')] = true;
        } else if (userRole === 'headmaster') {
            newState[t('headmaster_navigation.groups.dashboard')] = true;
        } else if (userRole === 'teacher') {
            newState[t('teacher_navigation.groups.dashboard')] = true;
        } else if (userRole === 'deputy_headmaster') {
            newState[t('deputy_headmaster_navigation.groups.dashboard')] = true;
        } else {
            newState['Dashboard'] = true; // fallback for others
        }
        setOpenGroups(newState);
    }, [userRole, t, i18n]);

    // Custom handler for staff management navigation to ensure fresh data
    const handleStaffManagementClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        router.get(
            '/admin/staff',
            {},
            {
                preserveState: false,
                preserveScroll: false,
            },
        );
    }, []);

    const toggleGroup = (groupTitle: string) => {
        setOpenGroups((prev) => ({ ...prev, [groupTitle]: !prev[groupTitle] }));
    };

    // Filter navigation items based on search query
    const filteredGroups = navigationGroups
        .map((group) => {
            if (!searchQuery.trim()) return group;

            const filteredItems = group.items.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

            return { ...group, items: filteredItems };
        })
        .filter((group) => group.items.length > 0);

    // Auto-expand groups when searching
    const isSearching = searchQuery.trim().length > 0;

    return (
        <>
            {filteredGroups.map((group) => {
                const isOpen = isSearching || (openGroups[group.title] ?? false);
                const isDashboard = group.title === 'Dashboard';

                return (
                    <SidebarGroup key={group.title} className="px-2 py-1 group-data-[collapsible=icon]:px-1">
                        {isDashboard ? (
                            // Dashboard items are always visible, no collapsible
                            <>
                                <SidebarGroupLabel className="mb-2 px-1 text-[10px] font-medium tracking-wider text-sidebar-foreground/60 uppercase">
                                    {group.title}
                                </SidebarGroupLabel>
                                <SidebarMenu className="space-y-1 group-data-[collapsible=icon]:space-y-2">
                                    {group.items.map((item) => {
                                        const isActive = page.url.startsWith(item.href);

                                        return (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={isActive}
                                                    tooltip={{ children: item.title }}
                                                    className="group relative h-8 rounded-lg transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-l-0 hover:bg-sidebar-accent/70 hover:shadow-sm data-[active=true]:border-l-4 data-[active=true]:border-blue-500 data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-md group-data-[collapsible=icon]:data-[active=true]:border-2 group-data-[collapsible=icon]:data-[active=true]:border-blue-500 dark:data-[active=true]:border-blue-400 dark:group-data-[collapsible=icon]:data-[active=true]:border-blue-400"
                                                >
                                                    {item.title === 'Staff Management' ? (
                                                        <a
                                                            href={item.href}
                                                            onClick={handleStaffManagementClick}
                                                            className="relative flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                                                        >
                                                            {item.icon && (
                                                                <item.icon className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-110 data-[active=true]:text-blue-600 dark:data-[active=true]:text-blue-400" />
                                                            )}
                                                            <span
                                                                className="min-w-0 truncate text-sm font-medium group-data-[collapsible=icon]:sr-only"
                                                                dangerouslySetInnerHTML={{
                                                                    __html:
                                                                        isSearching && searchQuery.trim()
                                                                            ? item.title.replace(
                                                                                  new RegExp(`(${searchQuery.trim()})`, 'gi'),
                                                                                  '<mark class="bg-yellow-200/80 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-100 px-0.5 rounded">$1</mark>',
                                                                              )
                                                                            : item.title,
                                                                }}
                                                            />
                                                            {isActive && (
                                                                <div className="absolute right-2 h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 group-data-[collapsible=icon]:hidden dark:bg-blue-400" />
                                                            )}
                                                        </a>
                                                    ) : (
                                                        <Link
                                                            href={item.href}
                                                            prefetch
                                                            className="relative flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                                                        >
                                                            {item.icon && (
                                                                <item.icon className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-110 data-[active=true]:text-blue-600 dark:data-[active=true]:text-blue-400" />
                                                            )}
                                                            <span
                                                                className="min-w-0 truncate text-sm font-medium group-data-[collapsible=icon]:sr-only"
                                                                dangerouslySetInnerHTML={{
                                                                    __html:
                                                                        isSearching && searchQuery.trim()
                                                                            ? item.title.replace(
                                                                                  new RegExp(`(${searchQuery.trim()})`, 'gi'),
                                                                                  '<mark class="bg-yellow-200/80 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-100 px-0.5 rounded">$1</mark>',
                                                                              )
                                                                            : item.title,
                                                                }}
                                                            />
                                                            {isActive && (
                                                                <div className="absolute right-2 h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 group-data-[collapsible=icon]:hidden dark:bg-blue-400" />
                                                            )}
                                                        </Link>
                                                    )}
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </>
                        ) : (
                            // Other groups are collapsible
                            <Collapsible open={isOpen} onOpenChange={() => toggleGroup(group.title)}>
                                <CollapsibleTrigger asChild>
                                    <SidebarGroupLabel className="group mb-1 flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-[10px] font-medium tracking-wider text-sidebar-foreground/60 uppercase transition-all duration-200 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground/80">
                                        <span>{group.title}</span>
                                        {isOpen ? (
                                            <ChevronDown className="h-3 w-3 transition-transform duration-200" />
                                        ) : (
                                            <ChevronRight className="h-3 w-3 transition-transform duration-200" />
                                        )}
                                    </SidebarGroupLabel>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
                                    <SidebarMenu className="space-y-1 pl-2 group-data-[collapsible=icon]:space-y-2 group-data-[collapsible=icon]:pl-0">
                                        {group.items.map((item) => {
                                            const isActive = page.url.startsWith(item.href);

                                            return (
                                                <SidebarMenuItem key={item.title}>
                                                    <SidebarMenuButton
                                                        asChild
                                                        isActive={isActive}
                                                        tooltip={{ children: item.title }}
                                                        className="group relative h-8 rounded-lg transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-l-0 hover:bg-sidebar-accent/70 hover:shadow-sm data-[active=true]:border-l-4 data-[active=true]:border-blue-500 data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-md group-data-[collapsible=icon]:data-[active=true]:border-2 group-data-[collapsible=icon]:data-[active=true]:border-blue-500 dark:data-[active=true]:border-blue-400 dark:group-data-[collapsible=icon]:data-[active=true]:border-blue-400"
                                                    >
                                                        {item.title === 'Staff Management' ? (
                                                            <a
                                                                href={item.href}
                                                                onClick={handleStaffManagementClick}
                                                                className="relative flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                                                            >
                                                                {item.icon && (
                                                                    <item.icon className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-110 data-[active=true]:text-blue-600 dark:data-[active=true]:text-blue-400" />
                                                                )}
                                                                <span
                                                                    className="truncate text-sm font-medium group-data-[collapsible=icon]:sr-only"
                                                                    dangerouslySetInnerHTML={{
                                                                        __html:
                                                                            isSearching && searchQuery.trim()
                                                                                ? item.title.replace(
                                                                                      new RegExp(`(${searchQuery.trim()})`, 'gi'),
                                                                                      '<mark class="bg-yellow-200/80 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-100 px-0.5 rounded">$1</mark>',
                                                                                  )
                                                                                : item.title,
                                                                    }}
                                                                />
                                                                {isActive && (
                                                                    <div className="absolute right-2 h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 group-data-[collapsible=icon]:hidden dark:bg-blue-400" />
                                                                )}
                                                            </a>
                                                        ) : (
                                                            <Link
                                                                href={item.href}
                                                                prefetch
                                                                className="relative flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                                                            >
                                                                {item.icon && (
                                                                    <item.icon className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-110 data-[active=true]:text-blue-600 dark:data-[active=true]:text-blue-400" />
                                                                )}
                                                                <span
                                                                    className="truncate text-sm font-medium group-data-[collapsible=icon]:sr-only"
                                                                    dangerouslySetInnerHTML={{
                                                                        __html:
                                                                            isSearching && searchQuery.trim()
                                                                                ? item.title.replace(
                                                                                      new RegExp(`(${searchQuery.trim()})`, 'gi'),
                                                                                      '<mark class="bg-yellow-200/80 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-100 px-0.5 rounded">$1</mark>',
                                                                                  )
                                                                                : item.title,
                                                                    }}
                                                                />
                                                                {isActive && (
                                                                    <div className="absolute right-2 h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 group-data-[collapsible=icon]:hidden dark:bg-blue-400" />
                                                                )}
                                                            </Link>
                                                        )}
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            );
                                        })}
                                    </SidebarMenu>
                                </CollapsibleContent>
                            </Collapsible>
                        )}
                    </SidebarGroup>
                );
            })}
        </>
    );
});
