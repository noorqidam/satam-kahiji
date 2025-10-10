import { translateDbContent } from '@/utils/translate-db-content';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Menu, User, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Page {
    id: number;
    slug: string;
    title: string;
    content: string;
    image: string | null;
    created_at: string;
    updated_at: string;
}

interface NavbarProps {
    currentPath?: string;
    className?: string;
}

export default function Navbar({ currentPath = '', className = '' }: NavbarProps) {
    const { t } = useTranslation();
    const { props } = usePage();
    const { dynamicPages = [] } = props as { dynamicPages?: Page[] };
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [mobileProfileMenuOpen, setMobileProfileMenuOpen] = useState(false);

    // Static navigation items
    const staticItems =
        currentPath === '/'
            ? [
                  { name: t('navigation.home'), href: '/' },
                  { name: t('navigation.news'), href: '/news' },
                  { name: t('navigation.gallery'), href: '/gallery' },
                  { name: t('navigation.extracurricular'), href: '/extracurricular' },
                  { name: t('navigation.facilities'), href: '/facilities' },
              ]
            : [
                  { name: t('navigation.home'), href: '/' },
                  { name: t('navigation.news'), href: '/news' },
                  { name: t('navigation.gallery'), href: '/gallery' },
                  { name: t('navigation.extracurricular'), href: '/extracurricular' },
                  { name: t('navigation.facilities'), href: '/facilities' },
              ];

    // Dynamic navigation items from admin pages
    const dynamicItems = dynamicPages.map((page: Page) => ({
        name: translateDbContent(page.title, t),
        href: `/${page.slug}`,
    }));

    // Combine static and dynamic items
    const navigationItems = [...staticItems, ...dynamicItems];

    const profileDropdownItems = [
        { name: t('profile_menu.teachers'), href: '/teachers', icon: Users },
        { name: t('profile_menu.principal'), href: '/principal', icon: User },
        { name: t('profile_menu.staff_management'), href: '/staff-management', icon: Users },
    ];

    return (
        <header className={`fixed top-0 right-0 left-0 z-50 ${className}`}>
            <div className="w-full">
                <div className="bg-white/80 shadow-xl backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
                    <div className="flex h-16 items-center justify-between px-4 sm:px-6">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <Link
                                href="/"
                                className="flex items-center space-x-3 rounded-lg p-1 focus:outline-none"
                                aria-label="SMP Negeri 1 Tambun Selatan - Beranda"
                            >
                                <div className="relative">
                                    <img
                                        src="/logo-satam.png"
                                        alt="Logo SMP Negeri 1 Tambun Selatan"
                                        className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                                    />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-lg leading-tight font-bold text-gray-900 lg:text-xl">SMP Negeri 1 Tambun Selatan</h1>
                                    <p className="text-xs font-medium text-gray-600 lg:text-sm">Mencerdaskan Bangsa, Membentuk Karakter</p>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden items-center lg:flex" role="navigation" aria-label="Menu utama">
                            <div className="flex items-center space-x-2">
                                {navigationItems.map((item) => {
                                    const isActive =
                                        currentPath === '/'
                                            ? item.name === 'Home' // On homepage, only Home is active
                                            : currentPath === item.href ||
                                              (item.name === 'Berita' && currentPath.startsWith('/news')) ||
                                              (item.name === 'Galeri' && currentPath.startsWith('/gallery')) ||
                                              (item.name === 'Ekstrakurikuler' && currentPath.startsWith('/extracurricular')) ||
                                              (item.href === '/facilities' && currentPath.startsWith('/facilities'));
                                    const Component = item.href.startsWith('#') ? 'a' : Link;
                                    return (
                                        <Component
                                            key={item.name}
                                            href={item.href}
                                            className={`relative px-5 py-3 text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none ${
                                                isActive
                                                    ? 'flex h-full transform items-center rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-lg hover:scale-105'
                                                    : 'transform rounded-xl text-gray-700 hover:-translate-y-0.5 hover:scale-105 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm'
                                            }`}
                                            aria-current={isActive ? 'page' : undefined}
                                        >
                                            {item.name}
                                        </Component>
                                    );
                                })}
                            </div>

                            {/* Profile Dropdown */}
                            <div
                                className="relative ml-4"
                                onMouseEnter={() => setProfileDropdownOpen(true)}
                                onMouseLeave={() => setProfileDropdownOpen(false)}
                            >
                                <button
                                    className={`relative flex items-center px-5 py-3 text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none ${
                                        profileDropdownItems.some((item) => currentPath === item.href)
                                            ? 'h-full transform rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-lg hover:scale-105'
                                            : 'transform rounded-xl text-gray-700 hover:-translate-y-0.5 hover:scale-105 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm'
                                    }`}
                                    aria-expanded={profileDropdownOpen}
                                    aria-haspopup="true"
                                >
                                    {t('navigation.school_profile')}
                                    <ChevronDown
                                        className={`ml-2 h-4 w-4 transition-transform duration-300 ease-in-out ${
                                            profileDropdownOpen ? 'rotate-180' : 'rotate-0'
                                        }`}
                                    />
                                </button>

                                {profileDropdownOpen && (
                                    <div className="absolute top-full right-0 z-50 w-64 pt-2 duration-200 animate-in fade-in slide-in-from-top-2">
                                        <div className="overflow-hidden rounded-2xl border border-gray-200/50 bg-white/95 shadow-2xl backdrop-blur-md">
                                            <div className="p-2">
                                                {profileDropdownItems.map((item, index) => (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        className="group flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 ease-in-out hover:scale-105 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm focus:outline-none"
                                                        style={{
                                                            animationDelay: `${index * 50}ms`,
                                                        }}
                                                    >
                                                        <item.icon className="mr-3 h-5 w-5 text-gray-400 transition-colors duration-200 group-hover:scale-110 group-hover:text-blue-500" />
                                                        {item.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => {
                                setMobileMenuOpen(!mobileMenuOpen);
                                if (!mobileMenuOpen) {
                                    setMobileProfileMenuOpen(false);
                                }
                            }}
                            className="relative transform rounded-xl p-3 text-gray-700 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-blue-50 hover:text-blue-700 focus:outline-none lg:hidden"
                            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
                            aria-expanded={mobileMenuOpen}
                        >
                            <div className="transition-transform duration-300 ease-in-out">
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="overflow-hidden bg-white/80 py-6 shadow-xl backdrop-blur-md duration-300 animate-in fade-in slide-in-from-top-2 supports-[backdrop-filter]:bg-white/70 lg:hidden">
                        <nav className="space-y-1 px-4" role="navigation" aria-label="Menu mobile">
                            {navigationItems.map((item) => {
                                const isActive =
                                    currentPath === '/'
                                        ? item.name === 'Home' // On homepage, only Home is active
                                        : currentPath === item.href ||
                                          (item.name === 'Berita' && currentPath.startsWith('/news')) ||
                                          (item.name === 'Galeri' && currentPath.startsWith('/gallery')) ||
                                          (item.name === 'Ekstrakurikuler' && currentPath.startsWith('/extracurricular')) ||
                                          (item.href === '/facilities' && currentPath.startsWith('/facilities'));
                                const Component = item.href.startsWith('#') ? 'a' : Link;
                                return (
                                    <div key={item.name} className="relative">
                                        {/* Active background for mobile */}
                                        {isActive && (
                                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg" />
                                        )}

                                        <Component
                                            href={item.href}
                                            className={`relative z-10 block transform rounded-2xl px-6 py-4 text-base font-semibold transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none ${
                                                isActive
                                                    ? 'text-white shadow-sm'
                                                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm'
                                            }`}
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                setMobileProfileMenuOpen(false);
                                            }}
                                            aria-current={isActive ? 'page' : undefined}
                                        >
                                            <div className="flex items-center">
                                                {isActive && <div className="mr-3 h-2 w-2 rounded-full bg-white" />}
                                                {item.name}
                                            </div>
                                        </Component>
                                    </div>
                                );
                            })}

                            {/* Mobile Profile Section */}
                            <div className="relative mt-4 border-t border-gray-200/60 pt-4">
                                {/* Active background for mobile profile */}
                                {profileDropdownItems.some((item) => currentPath === item.href) && (
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg" />
                                )}

                                <button
                                    onClick={() => setMobileProfileMenuOpen(!mobileProfileMenuOpen)}
                                    className={`relative z-10 flex w-full transform items-center justify-between rounded-2xl px-6 py-4 text-base font-semibold transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none ${
                                        profileDropdownItems.some((item) => currentPath === item.href)
                                            ? 'text-white shadow-sm'
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm'
                                    }`}
                                    aria-expanded={mobileProfileMenuOpen}
                                    aria-haspopup="true"
                                >
                                    <div className="flex items-center">
                                        {profileDropdownItems.some((item) => currentPath === item.href) && (
                                            <div className="mr-3 h-2 w-2 rounded-full bg-white" />
                                        )}
                                        {t('navigation.school_profile')}
                                    </div>
                                    <ChevronDown
                                        className={`h-5 w-5 transition-transform duration-200 ease-in-out ${
                                            mobileProfileMenuOpen ? 'rotate-180' : 'rotate-0'
                                        }`}
                                    />
                                </button>

                                {mobileProfileMenuOpen && (
                                    <div className="mt-2 space-y-1 overflow-hidden duration-200 animate-in fade-in slide-in-from-top-2">
                                        {profileDropdownItems.map((item, index) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className="flex transform items-center rounded-xl px-8 py-3 text-sm font-medium text-gray-600 transition-all duration-200 ease-in-out hover:scale-105 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm focus:outline-none"
                                                style={{
                                                    animationDelay: `${index * 50}ms`,
                                                }}
                                                onClick={() => {
                                                    setMobileMenuOpen(false);
                                                    setMobileProfileMenuOpen(false);
                                                }}
                                            >
                                                <item.icon className="mr-3 h-4 w-4 transition-all duration-200 ease-in-out" />
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
