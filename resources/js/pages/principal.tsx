import { Card } from '@/components/ui/card';
import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import { Calendar, Clock, GraduationCap, Mail, User, Users } from 'lucide-react';
import { useRef } from 'react';

interface PositionHistory {
    id: number;
    title: string;
    start_year: number;
    end_year: number | null;
}

interface EducationalBackground {
    id: number;
    degree: string;
    field_of_study: string;
    institution: string;
    graduation_year: number;
    description?: string;
}

interface PrincipalMember {
    id: number;
    name: string;
    position: string;
    division: string;
    photo: string | null;
    bio: string | null;
    email: string;
    phone: string | null;
    position_history: PositionHistory[];
    educational_background?: EducationalBackground[];
}

interface PrincipalProps {
    principal: PrincipalMember[];
}

export default function Principal({ principal }: PrincipalProps) {
    const principalRef = useRef(null);

    const principalInView = useInView(principalRef, { once: true, amount: 0.1 });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
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

    return (
        <PublicLayout currentPath="/principal">
            <Head title="Kepala Sekolah" />

            <div className="relative overflow-hidden">
                <motion.section
                    ref={principalRef}
                    className="py-6 pb-6 sm:py-8 md:py-10 lg:py-12"
                    initial="hidden"
                    animate={principalInView ? 'visible' : 'hidden'}
                    variants={containerVariants}
                >
                    <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
                        <motion.div className="mb-4 text-center sm:mb-6" variants={itemVariants}>
                            <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:mb-3 sm:text-3xl lg:text-4xl">Kepala Sekolah</h2>
                            <p className="mx-auto mb-3 max-w-4xl text-base text-gray-600 sm:mb-4 sm:text-lg md:whitespace-nowrap">
                                Pemimpin sekolah yang memimpin dan mengelola operasional pendidikan.
                            </p>
                        </motion.div>

                        {principal.length > 0 ? (
                            <motion.div className="space-y-8" variants={containerVariants}>
                                {principal.map((member) => (
                                    <motion.div key={member.id} variants={itemVariants}>
                                        <Card className="overflow-hidden border border-gray-200 bg-white p-0 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                                            <div className="flex flex-col md:flex-row">
                                                {/* Photo */}
                                                <div className="relative md:w-64 lg:w-80 xl:w-96">
                                                    {member.photo ? (
                                                        <img
                                                            src={member.photo}
                                                            alt={member.name}
                                                            className="h-80 w-full object-cover sm:h-96 md:h-full"
                                                        />
                                                    ) : (
                                                        <div className="flex h-80 w-full items-center justify-center bg-gray-100 sm:h-96 md:h-full">
                                                            <User className="h-16 w-16 text-gray-400 sm:h-20 sm:w-20" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 p-4 sm:p-6 md:p-8">
                                                    {/* Name */}
                                                    <h1 className="mb-1 text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl lg:text-4xl">
                                                        {member.name}
                                                    </h1>

                                                    {/* Email */}
                                                    <div className="mb-4 flex items-center text-sm text-gray-600 sm:mb-6 sm:text-base">
                                                        <Mail className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                        <span>{member.email}</span>
                                                    </div>

                                                    {/* Position History */}
                                                    {member.position_history && member.position_history.length > 0 && (
                                                        <div>
                                                            <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                                                                <div className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 p-1.5 sm:p-2">
                                                                    <Clock className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                                                                </div>
                                                                <h3 className="text-lg font-bold text-gray-900 sm:text-xl">Riwayat Jabatan</h3>
                                                            </div>

                                                            <div className="space-y-6 pl-12">
                                                                {member.position_history
                                                                    .sort((a, b) => b.start_year - a.start_year)
                                                                    .map((history, index) => (
                                                                        <div key={history.id} className="relative flex items-start gap-3">
                                                                            {/* Timeline connector line */}
                                                                            {index < member.position_history.length - 1 && (
                                                                                <div className="absolute top-6 left-3 h-full w-0.5 bg-gradient-to-b from-blue-500 to-indigo-600"></div>
                                                                            )}
                                                                            
                                                                            <div className="relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md">
                                                                                <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                                                                            </div>
                                                                            <div className="min-w-0 flex-1">
                                                                                <h4 className="font-bold text-gray-900">{history.title}</h4>
                                                                                <div className="mt-1 flex items-center gap-2 text-sm text-blue-600">
                                                                                    <Calendar className="h-4 w-4" />
                                                                                    <span className="font-semibold">
                                                                                        {history.start_year} - {history.end_year || 'Sekarang'}
                                                                                    </span>
                                                                                </div>
                                                                                {!history.end_year && (
                                                                                    <div className="mt-2">
                                                                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                                                                                            <div className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                                                                            Jabatan Aktif
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Educational Background */}
                                                    {member.educational_background && member.educational_background.length > 0 && (
                                                        <div className="mt-8">
                                                            <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                                                                <div className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 p-1.5 sm:p-2">
                                                                    <GraduationCap className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                                                                </div>
                                                                <h3 className="text-lg font-bold text-gray-900 sm:text-xl">Riwayat Pendidikan</h3>
                                                            </div>

                                                            <div className="space-y-6 pl-12">
                                                                {member.educational_background
                                                                    .sort((a, b) => b.graduation_year - a.graduation_year)
                                                                    .map((education, index) => (
                                                                        <div key={education.id} className="relative flex items-start gap-3">
                                                                            {/* Timeline connector line */}
                                                                            {index < member.educational_background!.length - 1 && (
                                                                                <div className="absolute top-6 left-3 h-full w-0.5 bg-gradient-to-b from-green-500 to-emerald-600"></div>
                                                                            )}

                                                                            <div className="relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-md">
                                                                                <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                                                                            </div>
                                                                            <div className="min-w-0 flex-1">
                                                                                <h4 className="font-bold text-gray-900">{education.degree}</h4>
                                                                                <p className="text-gray-700">{education.field_of_study}</p>
                                                                                <p className="text-sm text-gray-600">{education.institution}</p>
                                                                                <div className="mt-1 flex items-center gap-2 text-sm text-green-600">
                                                                                    <Calendar className="h-4 w-4" />
                                                                                    <span className="font-semibold">
                                                                                        Lulus {education.graduation_year}
                                                                                    </span>
                                                                                </div>
                                                                                {education.description && (
                                                                                    <p className="mt-2 text-sm text-gray-600">
                                                                                        {education.description}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Biography if exists */}
                                                    {member.bio && (
                                                        <div className="mt-8">
                                                            <h3 className="mb-3 text-lg font-bold text-gray-900">Profil</h3>
                                                            <p className="leading-relaxed text-gray-700">{member.bio}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                className="py-8 text-center sm:py-12"
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
                                    <Users className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                                </motion.div>
                                <motion.h3
                                    className="mb-2 text-lg font-medium text-gray-900"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                >
                                    Tidak ada data kepala sekolah
                                </motion.h3>
                                <motion.p
                                    className="text-gray-600"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                >
                                    Data kepala sekolah akan ditampilkan di sini ketika sudah tersedia.
                                </motion.p>
                            </motion.div>
                        )}
                    </div>
                </motion.section>
            </div>
        </PublicLayout>
    );
}
