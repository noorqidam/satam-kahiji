import { Card, CardHeader } from '@/components/ui/card';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { ChevronDown, Mail, Search, User, Users } from 'lucide-react';
import { useRef, useState } from 'react';

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface Teacher {
    id: number;
    name: string;
    position: string;
    photo: string | null;
    bio: string | null;
    email: string;
    homeroom_class: string | null;
    subjects: Subject[];
    slug: string;
}

interface TeachersIndexProps {
    teachers: Teacher[];
}

export default function TeachersIndex({ teachers }: TeachersIndexProps) {
    const teachersRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    const teachersInView = useInView(teachersRef, { once: true, amount: 0.1 });

    // Filter teachers based on search and subject
    const filteredTeachers = teachers.filter((teacher) => {
        const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject =
            selectedSubject === '' || teacher.subjects.some((subject) => subject.name.toLowerCase().includes(selectedSubject.toLowerCase()));
        return matchesSearch && matchesSubject;
    });

    // Get unique subjects for filter
    const allSubjects = Array.from(new Set(teachers.flatMap((teacher) => teacher.subjects.map((subject) => subject.name)))).sort();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: 'easeOut' as const,
            },
        },
    };

    const searchBarVariants = {
        hidden: { width: 0, opacity: 0 },
        visible: {
            width: '100%',
            opacity: 1,
            transition: { duration: 0.5, ease: 'easeOut' as const },
        },
    };

    return (
        <PublicLayout currentPath="/teachers">
            <Head title="Guru" />

            <div className="relative overflow-hidden">
                <motion.section
                    ref={teachersRef}
                    className="py-6 pb-6 sm:py-8 md:py-10 lg:py-12"
                    initial="hidden"
                    animate={teachersInView ? 'visible' : 'hidden'}
                    variants={containerVariants}
                >
                    <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
                        <motion.div className="mb-4 text-center sm:mb-6" variants={itemVariants}>
                            <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:mb-3 sm:text-3xl lg:text-4xl">Daftar Guru</h2>
                            <p className="mx-auto mb-3 max-w-4xl text-base text-gray-600 sm:mb-4 sm:text-lg md:whitespace-nowrap">
                                Berkenalan dengan para guru yang akan membimbing perjalanan pendidikan Anda.
                            </p>
                        </motion.div>

                        {/* Search and Filter Section */}
                        <motion.div
                            className="mx-auto mb-6 flex max-w-2xl flex-col items-stretch justify-center gap-3 sm:mb-8 sm:flex-row sm:items-center sm:gap-4"
                            variants={itemVariants}
                        >
                            <motion.div
                                className="relative w-full sm:max-w-md sm:flex-1"
                                variants={searchBarVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari guru..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-full border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none sm:py-3 sm:text-base"
                                />
                            </motion.div>

                            <motion.div className="relative w-full sm:w-auto" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full appearance-none rounded-full border border-gray-300 bg-white px-4 py-2.5 pr-8 text-sm text-gray-900 shadow-sm transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none sm:py-3 sm:text-base"
                                >
                                    <option value="">Semua Mata Pelajaran</option>
                                    {allSubjects.map((subject) => (
                                        <option key={subject} value={subject}>
                                            {subject}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                            </motion.div>
                        </motion.div>

                        {filteredTeachers.length > 0 ? (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${searchQuery}-${selectedSubject}`}
                                    className="xs:grid-cols-2 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 lg:gap-6 xl:grid-cols-4 2xl:grid-cols-5"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    {filteredTeachers.map((teacher) => (
                                        <div key={teacher.id} className="group">
                                            <Link href={`/teachers/${teacher.slug}`}>
                                                <Card className="h-80 cursor-pointer overflow-hidden border border-gray-200 bg-white py-0 shadow-lg transition-all duration-300 hover:border-blue-300 hover:shadow-xl sm:h-96 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500">
                                                    <CardHeader className="relative flex h-full flex-col p-0">
                                                        <div className="flex-1 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
                                                            {teacher.photo ? (
                                                                <img
                                                                    src={teacher.photo}
                                                                    alt={teacher.name}
                                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full items-center justify-center">
                                                                    <User className="h-12 w-12 text-blue-500 sm:h-16 sm:w-16 dark:text-blue-400" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Name and Subject Overlay with Arrow */}
                                                        <div className="absolute right-0 bottom-0 left-0">
                                                            {/* Sharp Arrow Point */}
                                                            <div className="flex justify-center">
                                                                <div className="h-0 w-0 border-r-[15px] border-b-[12px] border-l-[15px] border-r-transparent border-b-blue-600 border-l-transparent sm:border-r-[20px] sm:border-b-[15px] sm:border-l-[20px] dark:border-b-blue-500"></div>
                                                            </div>

                                                            {/* Blue Content Section */}
                                                            <div className="bg-blue-600 px-3 py-2 text-white transition-all duration-300 group-hover:py-3 sm:px-4 sm:group-hover:py-4 dark:bg-blue-500">
                                                                <h3 className="text-center text-sm font-bold sm:text-base">{teacher.name}</h3>

                                                                <div className="text-center">
                                                                    {teacher.subjects && teacher.subjects.length > 0 && (
                                                                        <p className="text-xs font-bold sm:text-sm">
                                                                            {teacher.subjects[0].name.toUpperCase()}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                {/* Class and Email - Hidden by default, visible on hover */}
                                                                <div className="max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:mt-1 group-hover:max-h-16 group-hover:opacity-100 sm:group-hover:mt-2 sm:group-hover:max-h-20">
                                                                    {teacher.homeroom_class && (
                                                                        <div className="mb-1 flex items-center justify-center gap-1 text-center">
                                                                            <p className="text-xs">Kelas :</p>
                                                                            <p className="text-xs font-bold sm:text-sm">{teacher.homeroom_class}</p>
                                                                        </div>
                                                                    )}

                                                                    <div className="flex items-center justify-center gap-1 text-center">
                                                                        <Mail className="h-3 w-3" />
                                                                        <p className="truncate text-xs">{teacher.email}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                </Card>
                                            </Link>
                                        </div>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        ) : (
                            <motion.div
                                className="py-6 text-center sm:py-8"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                >
                                    <Users className="mx-auto mb-3 h-12 w-12 text-gray-300 sm:mb-4 sm:h-16 sm:w-16" />
                                </motion.div>
                                <motion.h3
                                    className="mb-2 text-base font-medium text-gray-900 sm:text-lg"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                >
                                    {searchQuery || selectedSubject ? 'Tidak ada guru yang sesuai dengan pencarian' : 'Belum ada data guru'}
                                </motion.h3>
                                <motion.p
                                    className="mb-3 text-sm text-gray-600 sm:mb-4 sm:text-base"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                >
                                    {searchQuery || selectedSubject
                                        ? 'Coba ubah kata kunci pencarian atau filter mata pelajaran'
                                        : 'Data guru akan ditampilkan di sini ketika sudah tersedia.'}
                                </motion.p>
                                {(searchQuery || selectedSubject) && (
                                    <motion.button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedSubject('');
                                        }}
                                        className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white transition-colors duration-300 hover:bg-blue-700 sm:px-6 sm:text-base"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6, duration: 0.5 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Reset Filter
                                    </motion.button>
                                )}
                            </motion.div>
                        )}
                    </div>
                </motion.section>
            </div>
        </PublicLayout>
    );
}
