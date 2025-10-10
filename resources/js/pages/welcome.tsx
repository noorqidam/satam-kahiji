import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link rel="dns-prefetch" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&display=swap" rel="stylesheet" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Laravel React Starter Kit - Modern web application built with Laravel and React" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('admin.login')}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Log in
                                </Link>
                            </>
                        )}
                    </nav>
                </header>
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[335px] flex-col lg:max-w-4xl lg:flex-row">
                        <div className="flex-1 rounded-lg bg-white p-6 pb-12 text-[13px] leading-[20px] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:p-20 dark:bg-[#161615] dark:text-[#EDEDEC] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                            <h1 className="mb-1 text-2xl font-bold">Laravel React Starter Kit</h1>
                            <p className="mb-6 text-[#706f6c] dark:text-[#A1A09A]">
                                A modern web application starter kit built with Laravel 12 and React 19.
                                <br />
                                Features authentication, user management, and a beautiful UI.
                            </p>
                            <ul className="mb-4 flex flex-col space-y-3 lg:mb-6">
                                <li className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F53003] text-xs text-white">✓</span>
                                    <span>Laravel 12 Backend with Authentication</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F53003] text-xs text-white">✓</span>
                                    <span>React 19 with TypeScript Frontend</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F53003] text-xs text-white">✓</span>
                                    <span>Tailwind CSS 4 for Styling</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F53003] text-xs text-white">✓</span>
                                    <span>Radix UI Components</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F53003] text-xs text-white">✓</span>
                                    <span>Inertia.js for SPA Experience</span>
                                </li>
                            </ul>
                            <div className="flex gap-3 text-sm leading-normal">
                                <Link
                                    href={route('admin.login')}
                                    className="inline-block rounded-sm border border-black bg-[#1b1b18] px-5 py-1.5 text-sm leading-normal text-white hover:border-black hover:bg-black dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:border-white dark:hover:bg-white"
                                >
                                    Get Started
                                </Link>
                                <a
                                    href="https://github.com/noorqidam/satam-kahiji"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    View on GitHub
                                </a>
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-center rounded-lg bg-gradient-to-br from-orange-50 to-red-50 p-8 lg:w-[400px] dark:from-orange-900/20 dark:to-red-900/20">
                            <div className="text-center">
                                <div className="mb-4 flex justify-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F53003] text-2xl font-bold text-white">
                                        L
                                    </div>
                                </div>
                                <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Laravel</h2>
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">The PHP Framework for Web Artisans</p>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
