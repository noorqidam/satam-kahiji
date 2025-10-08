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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const getNavigationGroups = (userRole: string, t: (key: string) => string): NavGroup[] => {
    switch (userRole) {
        case 'super_admin':
            return [
                {
                    title: 'Dashboard',
                    items: [{ title: 'Overview', href: '/admin/dashboard', icon: LayoutGrid }],
                },
                {
                    title: 'User Management',
                    items: [{ title: 'Users', href: '/admin/users', icon: Shield }],
                },
                {
                    title: 'Staff Management',
                    items: [{ title: 'Staff Management', href: '/admin/staff', icon: Users }],
                },
                {
                    title: 'Academic Structure',
                    items: [
                        { title: 'Classes', href: '/admin/classes', icon: Building },
                        { title: 'Subjects', href: '/admin/subjects', icon: BookOpen },
                    ],
                },
                {
                    title: 'Assignments & Students',
                    items: [
                        { title: 'Subject Assignments', href: '/admin/subject-assignments', icon: ClipboardList },
                        { title: 'Homeroom Management', href: '/admin/homeroom', icon: UserCheck },
                        { title: 'Students', href: '/admin/students', icon: GraduationCap },
                    ],
                },
                {
                    title: 'Academic',
                    items: [
                        { title: 'Extracurriculars', href: '/admin/extracurriculars', icon: Trophy },
                        { title: 'Work Items', href: '/admin/work-items', icon: ClipboardList },
                    ],
                },
                {
                    title: 'Content Management',
                    items: [
                        { title: 'Posts & News', href: '/admin/posts', icon: Newspaper },
                        { title: 'Pages', href: '/admin/pages', icon: FileText },
                        { title: 'Gallery', href: '/admin/galleries', icon: Image },
                        { title: 'Facilities', href: '/admin/facilities', icon: Building },
                    ],
                },
                {
                    title: 'Communication',
                    items: [{ title: 'Contact Management', href: '/admin/contacts', icon: Phone }],
                },
                {
                    title: 'System',
                    items: [{ title: 'Google Drive Monitor', href: '/admin/google-drive/dashboard', icon: Cloud }],
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
                    title: 'Dashboard',
                    items: [{ title: 'Overview', href: '/staff/dashboard', icon: LayoutGrid }],
                },
                {
                    title: 'Academic Support',
                    items: [
                        { title: 'Staff Management', href: '/staff/staff', icon: Users },
                        { title: 'Students', href: '/staff/students', icon: GraduationCap },
                        { title: 'Subjects', href: '/staff/subjects', icon: BookOpen },
                        { title: 'Student Grades', href: '/staff/grades', icon: Award },
                    ],
                },
                {
                    title: 'Content Management',
                    items: [
                        { title: 'Posts & News', href: '/staff/posts', icon: Newspaper },
                        { title: 'Pages', href: '/staff/pages', icon: FileText },
                        { title: 'Gallery', href: '/staff/galleries', icon: Image },
                    ],
                },
                {
                    title: 'Administration',
                    items: [
                        { title: 'Reports', href: '/staff/reports', icon: BarChart3 },
                        { title: 'Facilities', href: '/staff/facilities', icon: Building },
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

export function NavRoleBased({ searchQuery = '' }: { searchQuery?: string }) {
    const { auth } = usePage<SharedData>().props;
    const page = usePage();
    const userRole = auth.user?.role ?? 'super_admin';
    const { t } = useTranslation();

    // State to track which groups are open (default: Dashboard open, others closed)
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    // Custom handler for staff management navigation to ensure fresh data
    const handleStaffManagementClick = (e: React.MouseEvent) => {
        e.preventDefault();
        router.get(
            '/admin/staff',
            {},
            {
                preserveState: false,
                preserveScroll: false,
            },
        );
    };

    const navigationGroups = getNavigationGroups(userRole, t);

    // Initialize the open state for all groups
    useEffect(() => {
        const currentNavigationGroups = getNavigationGroups(userRole, t);
        const initialState: Record<string, boolean> = {};
        currentNavigationGroups.forEach((group) => {
            initialState[group.title] = group.title === 'Dashboard' || group.title === 'User Management';
        });
        setOpenGroups(initialState);
    }, [userRole, t]); // Re-run when user role changes

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
                                                                className="text-sm font-medium group-data-[collapsible=icon]:sr-only"
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
                                                                className="text-sm font-medium group-data-[collapsible=icon]:sr-only"
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
                                                                    className="text-sm font-medium group-data-[collapsible=icon]:sr-only"
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
                                                                    className="text-sm font-medium group-data-[collapsible=icon]:sr-only"
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
}
