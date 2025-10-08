import { Card, CardHeader } from '@/components/ui/card';
import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Building2, ChevronDown, Mail, Search, User, Users } from 'lucide-react';
import { useRef, useState } from 'react';

interface StaffMember {
    id: number;
    name: string;
    position: string;
    division: string;
    photo: string | null;
    bio: string | null;
    email: string;
    phone: string | null;
}

interface StaffManagementProps {
    staff: StaffMember[];
    staffByDivision: Record<string, StaffMember[]>;
}

export default function StaffManagement({ staff }: StaffManagementProps) {
    const staffRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDivision, setSelectedDivision] = useState('');

    const staffInView = useInView(staffRef, { once: true, amount: 0.1 });

    // Filter staff based on search and division
    const filteredStaff = staff.filter((member) => {
        const matchesSearch =
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) || member.position.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDivision = selectedDivision === '' || member.division === selectedDivision;
        return matchesSearch && matchesDivision;
    });

    // Get unique divisions for filter
    const allDivisions = Array.from(new Set(staff.map((member) => member.division))).sort();

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
        <PublicLayout currentPath="/staff-management">
            <Head title="Manajemen Staf" />

            <div className="relative overflow-hidden">
                <motion.section
                    ref={staffRef}
                    className="py-6 pb-6 sm:py-8 md:py-10 lg:py-12"
                    initial="hidden"
                    animate={staffInView ? 'visible' : 'hidden'}
                    variants={containerVariants}
                >
                    <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
                        <motion.div className="mb-4 text-center sm:mb-6" variants={itemVariants}>
                            <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:mb-3 sm:text-3xl lg:text-4xl">Manajemen Staf</h2>
                            <p className="mx-auto mb-3 max-w-4xl text-base text-gray-600 sm:mb-4 sm:text-lg md:whitespace-nowrap">
                                Tim staf yang mendukung operasional dan administrasi sekolah.
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
                                    placeholder="Cari staf..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-full border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none sm:py-3 sm:text-base"
                                />
                            </motion.div>

                            <motion.div className="relative w-full sm:w-auto" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <select
                                    value={selectedDivision}
                                    onChange={(e) => setSelectedDivision(e.target.value)}
                                    className="w-full appearance-none rounded-full border border-gray-300 bg-white px-4 py-2.5 pr-8 text-sm text-gray-900 shadow-sm transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none sm:py-3 sm:text-base"
                                >
                                    <option value="">Semua Divisi</option>
                                    {allDivisions.map((division) => (
                                        <option key={division} value={division}>
                                            {division}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                            </motion.div>
                        </motion.div>

                        {filteredStaff.length > 0 ? (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${searchQuery}-${selectedDivision}`}
                                    className="xs:grid-cols-2 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 lg:gap-6 xl:grid-cols-4 2xl:grid-cols-5"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    {filteredStaff.map((member) => (
                                        <div key={member.id} className="group">
                                            <Card className="h-80 cursor-pointer overflow-hidden border border-gray-200 bg-white py-0 shadow-lg transition-all duration-300 hover:border-blue-300 hover:shadow-xl sm:h-96 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500">
                                                <CardHeader className="relative flex h-full flex-col p-0">
                                                    <div className="flex-1 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
                                                        {member.photo ? (
                                                            <img
                                                                src={member.photo}
                                                                alt={member.name}
                                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full items-center justify-center">
                                                                <User className="h-16 w-16 text-white/80 sm:h-20 sm:w-20" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Name and Position Overlay with Arrow */}
                                                    <div className="absolute right-0 bottom-0 left-0">
                                                        {/* Sharp Arrow Point */}
                                                        <div className="flex justify-center">
                                                            <div className="h-0 w-0 border-r-[15px] border-b-[12px] border-l-[15px] border-r-transparent border-b-blue-600 border-l-transparent sm:border-r-[20px] sm:border-b-[15px] sm:border-l-[20px] dark:border-b-blue-500"></div>
                                                        </div>

                                                        {/* Content Section */}
                                                        <div className="bg-blue-600 px-3 py-2 text-white transition-all duration-300 group-hover:py-3 sm:px-4 sm:group-hover:py-4 dark:bg-blue-500">
                                                            <h3 className="mb-1 text-center text-lg font-bold">{member.name}</h3>
                                                            <p className="text-center text-sm font-medium opacity-90">
                                                                {member.position.toUpperCase()}
                                                            </p>

                                                            {/* Email and Division - Visible on hover */}
                                                            <div className="max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:mt-3 group-hover:max-h-20 group-hover:opacity-100">
                                                                <div className="mb-2 text-center">
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        <Mail className="h-3 w-3" />
                                                                        <p className="truncate text-xs">{member.email}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        <Building2 className="h-3 w-3" />
                                                                        <p className="text-xs">{member.division}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                            </Card>
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
                                    {searchQuery || selectedDivision ? 'Tidak ada staf yang sesuai dengan pencarian' : 'Belum ada data staf'}
                                </motion.h3>
                                <motion.p
                                    className="mb-3 text-sm text-gray-600 sm:mb-4 sm:text-base"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                >
                                    {searchQuery || selectedDivision
                                        ? 'Coba ubah kata kunci pencarian atau filter divisi'
                                        : 'Data staf akan ditampilkan di sini ketika sudah tersedia.'}
                                </motion.p>
                                {(searchQuery || selectedDivision) && (
                                    <motion.button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedDivision('');
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
