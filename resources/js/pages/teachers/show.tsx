import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePreviewDialog } from '@/components/ui/file-preview-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import {
    BookOpen,
    Calendar,
    ChevronRight,
    ClipboardList,
    Eye,
    FileCheck,
    FileText,
    FolderOpen,
    GraduationCap,
    Home,
    User,
    Users,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Subject {
    id: number;
    name: string;
    code: string;
    description: string;
}

interface WorkFile {
    id: number;
    file_name: string;
    file_url: string;
    uploaded_at: string;
    file_size: number;
    mime_type: string;
}

interface Teacher {
    id: number;
    name: string;
    position: string;
    photo: string | null;
    bio: string | null;
    email: string;
    subjects: Subject[];
    slug: string;
}

interface FilesByType {
    prota: WorkFile[];
    prosem: WorkFile[];
    module: WorkFile[];
    attendance: WorkFile[];
    agenda: WorkFile[];
    other: WorkFile[];
}

interface Statistics {
    totalFiles: number;
    subjectCount: number;
    recentFiles: Array<{
        file: WorkFile;
        subject: string;
        work_item: string;
    }>;
}

interface TeacherShowProps {
    teacher: Teacher;
    filesByType: FilesByType;
    statistics: Statistics;
}

export default function TeacherShow({ teacher, filesByType, statistics }: TeacherShowProps) {
    const { t } = useTranslation();
    const headerRef = useRef(null);
    const contentRef = useRef(null);
    const [previewFile, setPreviewFile] = useState<{
        id: number;
        file_name: string;
        file_url: string;
        file_size?: number;
        created_at: string;
    } | null>(null);

    const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
    const contentInView = useInView(contentRef, { once: true, amount: 0.1 });

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

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getFileTypeIcon = (mimeType: string) => {
        if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
        if (mimeType.includes('word')) return <FileText className="h-5 w-5 text-blue-500" />;
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <FileText className="h-5 w-5 text-green-500" />;
        return <FileText className="h-5 w-5 text-gray-500" />;
    };

    const fileTypeConfig = {
        prota: {
            title: 'Program Tahunan',
            description: 'Rencana pembelajaran selama satu tahun',
            icon: <Calendar className="h-6 w-6 text-white" />,
            color: 'bg-blue-500',
        },
        prosem: {
            title: 'Program Semester',
            description: 'Rencana pembelajaran per semester',
            icon: <BookOpen className="h-6 w-6 text-white" />,
            color: 'bg-green-500',
        },
        module: {
            title: 'Modul Pembelajaran',
            description: 'Materi dan bahan ajar',
            icon: <GraduationCap className="h-6 w-6 text-white" />,
            color: 'bg-purple-500',
        },
        attendance: {
            title: 'Daftar Hadir',
            description: 'Rekap kehadiran siswa',
            icon: <ClipboardList className="h-6 w-6 text-white" />,
            color: 'bg-orange-500',
        },
        agenda: {
            title: 'Agenda Pembelajaran',
            description: 'Jadwal dan agenda harian',
            icon: <Calendar className="h-6 w-6 text-white" />,
            color: 'bg-indigo-500',
        },
        other: {
            title: 'File Lainnya',
            description: 'Dokumen pendukung lainnya',
            icon: <FolderOpen className="h-6 w-6 text-white" />,
            color: 'bg-gray-500',
        },
    };

    const handlePreviewFile = (file: WorkFile) => {
        setPreviewFile({
            id: file.id,
            file_name: file.file_name,
            file_url: file.file_url,
            file_size: file.file_size,
            created_at: file.uploaded_at,
        });
    };

    const renderFileSection = (type: keyof FilesByType, files: WorkFile[]) => {
        const config = fileTypeConfig[type];

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} whileHover={{ y: -2 }}>
                <Card className="h-fit overflow-hidden border border-gray-200 bg-white pt-0 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                    <CardHeader className="rounded-t-lg border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 py-2">
                        <div className="flex items-center gap-4">
                            <motion.div
                                className={`rounded-xl p-3 text-white ${config.color} shadow-md`}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ duration: 0.2 }}
                            >
                                {config.icon}
                            </motion.div>
                            <div className="flex-1">
                                <CardTitle className="text-xl text-gray-900">{config.title}</CardTitle>
                                <CardDescription className="text-gray-600">{config.description}</CardDescription>
                            </div>
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}>
                                <Badge variant="secondary" className="border-blue-200 bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                                    {files.length} File
                                </Badge>
                            </motion.div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {files.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {files.map((file, index) => (
                                    <motion.div
                                        key={file.id}
                                        className="group flex items-center justify-between p-4 transition-all duration-200 hover:bg-gray-50"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.4 }}
                                    >
                                        <div className="flex min-w-0 flex-1 items-center gap-4">
                                            <div className="flex-shrink-0">{getFileTypeIcon(file.mime_type)}</div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900 transition-colors group-hover:text-blue-700">
                                                    {file.file_name}
                                                </p>
                                                <p className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(file.uploaded_at)}
                                                    <span>•</span>
                                                    {formatFileSize(file.file_size)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handlePreviewFile(file)}
                                                className="hover:border-blue-300 hover:bg-blue-50"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100"
                                >
                                    <FileText className="h-8 w-8 text-gray-400" />
                                </motion.div>
                                <h3 className="mb-1 text-sm font-medium text-gray-900">Belum Ada File</h3>
                                <p className="text-xs text-gray-500">File {config.title.toLowerCase()} akan ditampilkan di sini</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    return (
        <PublicLayout currentPath={`/teachers/${teacher.slug}`}>
            <Head title={`${teacher.name} - Guru`} />

            <div className="relative overflow-hidden">
                {/* Content Section */}
                <motion.section
                    ref={contentRef}
                    className="bg-gray-50 py-8 sm:py-12"
                    initial="hidden"
                    animate={contentInView ? 'visible' : 'hidden'}
                    variants={containerVariants}
                >
                    <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6 xl:px-8">
                        {/* Breadcrumb */}
                        <motion.div
                            className="mb-4 sm:mb-6 md:mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                        >
                            <nav className="flex items-center space-x-1 text-xs sm:space-x-2 sm:text-sm">
                                <Link href="/" className="flex items-center text-gray-600 transition-colors duration-200 hover:text-gray-900">
                                    <Home className="h-4 w-4" />
                                </Link>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                <Link href="/teachers" className="text-gray-600 transition-colors duration-200 hover:text-gray-900">
                                    Guru
                                </Link>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                <span className="font-medium text-gray-900">{teacher.name}</span>
                            </nav>
                        </motion.div>

                        <motion.div
                            className="mb-6 text-center sm:mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">Informasi Detail</h2>
                            <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base lg:text-lg">Profil lengkap dan materi pembelajaran</p>
                        </motion.div>

                        <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6 lg:space-y-8">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
                                <TabsList className="grid h-12 w-full grid-cols-2 border border-gray-200 bg-white p-1 shadow-sm sm:h-14">
                                    <TabsTrigger
                                        value="profile"
                                        className="flex items-center gap-1 text-sm font-medium transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md sm:gap-2 sm:text-base"
                                    >
                                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline">Profil & Mata Pelajaran</span>
                                        <span className="sm:hidden">Profil</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="files"
                                        className="flex items-center gap-1 text-sm font-medium transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md sm:gap-2 sm:text-base"
                                    >
                                        <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline">File Pembelajaran</span>
                                        <span className="sm:hidden">File</span>
                                    </TabsTrigger>
                                </TabsList>
                            </motion.div>

                            <TabsContent value="profile">
                                <motion.div className="space-y-8" variants={containerVariants}>
                                    {/* Dynamic grid based on content availability */}
                                    <div
                                        className={`grid gap-4 sm:gap-6 lg:gap-8 ${teacher.bio ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}
                                    >
                                        {/* Bio Section - only show if bio exists */}
                                        {teacher.bio && (
                                            <motion.div variants={itemVariants} className="lg:col-span-2">
                                                <Card className="border border-gray-200 bg-white shadow-lg transition-shadow duration-300 hover:border-gray-300 hover:shadow-xl">
                                                    <CardHeader className="rounded-t-lg border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                                                        <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
                                                            <div className="rounded-full bg-blue-100 p-2">
                                                                <User className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                            Profil Guru
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-6">
                                                        <div className="prose prose-gray max-w-none">
                                                            <p className="text-base leading-relaxed text-gray-700">{teacher.bio}</p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        )}

                                        {/* Quick Info Section */}
                                        <motion.div variants={itemVariants} className={teacher.bio ? '' : 'lg:col-span-2'}>
                                            <Card className="border border-gray-200 bg-white pt-0 shadow-lg transition-shadow duration-300 hover:border-gray-300 hover:shadow-xl">
                                                <CardHeader className="rounded-t-lg border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50 py-2">
                                                    <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
                                                        <div className="rounded-full bg-indigo-100 p-2">
                                                            <Users className="h-5 w-5 text-indigo-600" />
                                                        </div>
                                                        Informasi Guru
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-3 sm:p-4 lg:p-6">
                                                    <div
                                                        className={`grid gap-3 sm:gap-4 ${teacher.bio ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}
                                                    >
                                                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                                            <GraduationCap className="h-5 w-5 text-blue-600" />
                                                            <div>
                                                                <p className="text-sm text-gray-500">Posisi</p>
                                                                <p className="font-medium text-gray-900">{teacher.position}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                                            <BookOpen className="h-5 w-5 text-blue-600" />
                                                            <div>
                                                                <p className="text-sm text-gray-500">Mata Pelajaran</p>
                                                                <p className="font-medium text-gray-900">{statistics.subjectCount} Mata Pelajaran</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                                            <FileText className="h-5 w-5 text-blue-600" />
                                                            <div>
                                                                <p className="text-sm text-gray-500">File Pembelajaran</p>
                                                                <p className="font-medium text-gray-900">{statistics.totalFiles} File</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    </div>

                                    {/* Subjects Section - only show if subjects exist */}
                                    {teacher.subjects.length > 0 && (
                                        <motion.div variants={itemVariants}>
                                            <Card className="border border-gray-200 bg-white p-0 shadow-lg transition-shadow duration-300 hover:border-gray-300 hover:shadow-xl">
                                                <CardHeader className="rounded-t-lg border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 py-2">
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
                                                            <div className="rounded-full bg-blue-100 p-2">
                                                                <BookOpen className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                            Mata Pelajaran
                                                        </CardTitle>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                                                {teacher.subjects.length} Mata Pelajaran
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-6">
                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                                                        {teacher.subjects.map((subject, index) => (
                                                            <motion.div
                                                                key={subject.id}
                                                                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 transition-all duration-300 hover:border-blue-300 hover:shadow-md"
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                                                whileHover={{ scale: 1.02, y: -2 }}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className="rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 p-2 transition-colors duration-300 group-hover:from-blue-200 group-hover:to-indigo-200">
                                                                        <GraduationCap className="h-5 w-5 text-blue-600" />
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <h3 className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-700">
                                                                            {subject.name}
                                                                        </h3>
                                                                        <p className="mt-1 text-sm text-gray-500">{subject.code}</p>
                                                                        {subject.description && (
                                                                            <p className="mt-2 line-clamp-2 text-xs text-gray-400">
                                                                                {subject.description}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    )}

                                    {/* Recent Files */}
                                    {statistics.recentFiles.length > 0 && (
                                        <motion.div variants={itemVariants}>
                                            <Card className="border border-gray-200 bg-white pt-0 shadow-lg transition-shadow duration-300 hover:border-gray-300 hover:shadow-xl">
                                                <CardHeader className="rounded-t-lg border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 py-2">
                                                    <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
                                                        <div className="rounded-full bg-blue-100 p-2">
                                                            <FileCheck className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        File Terbaru
                                                    </CardTitle>
                                                    <CardDescription className="text-gray-600">5 file terakhir yang diunggah</CardDescription>
                                                </CardHeader>
                                                <CardContent className="p-0">
                                                    <div className="divide-y divide-gray-100">
                                                        {statistics.recentFiles.map((item, index) => (
                                                            <motion.div
                                                                key={item.file.id}
                                                                className="group flex items-center justify-between p-4 transition-all duration-200 hover:bg-gray-50"
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.1, duration: 0.4 }}
                                                            >
                                                                <div className="flex min-w-0 flex-1 items-center gap-4">
                                                                    <div className="flex-shrink-0">{getFileTypeIcon(item.file.mime_type)}</div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-sm font-medium text-gray-900 transition-colors group-hover:text-blue-700">
                                                                            {item.file.file_name}
                                                                        </p>
                                                                        <p className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                                                            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                                                                                {item.subject}
                                                                            </span>
                                                                            <span>•</span>
                                                                            <span>{item.work_item}</span>
                                                                            <span>•</span>
                                                                            <Calendar className="h-3 w-3" />
                                                                            {formatDate(item.file.uploaded_at)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handlePreviewFile(item.file)}
                                                                        className="hover:border-blue-300 hover:bg-blue-50"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="files">
                                <motion.div className="space-y-8" variants={containerVariants}>
                                    {/* Summary Stats */}
                                    <motion.div
                                        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6"
                                        variants={itemVariants}
                                    >
                                        {Object.entries(filesByType).map(([type, files]) => {
                                            const config = fileTypeConfig[type as keyof FilesByType];
                                            return (
                                                <motion.div
                                                    key={type}
                                                    className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition-shadow duration-300 hover:shadow-md"
                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                >
                                                    <div className={`inline-flex rounded-lg p-2 ${config.color} mb-2`}>{config.icon}</div>
                                                    <div className="text-2xl font-bold text-gray-900">{files.length}</div>
                                                    <div className="mt-1 text-xs text-gray-500">{config.title}</div>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>

                                    {/* File Categories */}
                                    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                                        {Object.entries(filesByType).map(([type, files], index) => (
                                            <motion.div
                                                key={type}
                                                variants={itemVariants}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                            >
                                                {renderFileSection(type as keyof FilesByType, files)}
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </motion.section>
            </div>

            {/* File Preview Dialog */}
            {previewFile && (
                <FilePreviewDialog file={previewFile} isOpen={!!previewFile} onClose={() => setPreviewFile(null)} allowDownload={false} />
            )}
        </PublicLayout>
    );
}
