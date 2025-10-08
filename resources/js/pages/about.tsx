import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import { BookOpen, Building, Target, Trophy, Users } from 'lucide-react';
import { useRef } from 'react';

// Enhanced responsive styles
const customStyles = `

  .prose h1 {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: bold;
    margin: 2rem 0 1rem 0;
    background: linear-gradient(to right, #1e40af, #059669);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;
  }
  
  .prose h2 {
    font-size: clamp(1.25rem, 3vw, 1.75rem);
    font-weight: 600;
    margin: 1.5rem 0 0.75rem 0;
    color: #374151;
    line-height: 1.3;
  }
  
  .prose p {
    margin: 1rem 0;
    line-height: 1.75;
    color: #4b5563;
    font-size: clamp(0.875rem, 2vw, 1rem);
  }
  
  .prose ul {
    margin: 1rem 0;
    padding-left: 0;
    list-style-type: none;
    display: block;
  }
  
  .prose li {
    margin: 0.75rem 0;
    line-height: 1.75;
    color: #4b5563;
    position: relative;
    display: flex;
    align-items: flex-start;
    padding-left: 1.5rem;
    font-size: clamp(0.875rem, 2vw, 1rem);
  }
  
  .prose li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.6rem;
    width: 6px;
    height: 6px;
    background: linear-gradient(135deg, #3b82f6, #10b981);
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
  }
  
  @media (min-width: 640px) {
    .prose li {
      padding-left: 2rem;
    }
    
    .prose li::before {
      width: 8px;
      height: 8px;
    }
  }
  
  .prose h1 {
    font-size: 2rem;
    font-weight: bold;
    margin: 2rem 0 1rem 0;
    background: linear-gradient(to right, #1e40af, #059669);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .prose h1::before {
    content: '';
    width: 12px;
    height: 12px;
    background: linear-gradient(135deg, #1e40af, #059669);
    border-radius: 50%;
    margin-right: 1rem;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(30, 64, 175, 0.4);
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.1);
    }
  }
  
  .prose strong {
    color: #1f2937;
    font-weight: 600;
  }
`;

interface Page {
    id: number;
    slug: string;
    title: string;
    content: string;
    image?: string | null;
}

interface Contact {
    id: number;
    name: string;
    email: string;
    message: string;
    phone: string | null;
    created_at: string;
    updated_at: string;
}

interface AboutProps {
    page: Page;
    contact?: Contact;
}

// Animation variants
const fadeInUp = {
    hidden: {
        opacity: 0,
        y: 60,
    },
    visible: {
        opacity: 1,
        y: 0,
    },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
    },
};

const scaleIn = {
    hidden: {
        opacity: 0,
        scale: 0.8,
    },
    visible: {
        opacity: 1,
        scale: 1,
    },
};

const slideInLeft = {
    hidden: {
        opacity: 0,
        x: -100,
    },
    visible: {
        opacity: 1,
        x: 0,
    },
};

const slideInRight = {
    hidden: {
        opacity: 0,
        x: 100,
    },
    visible: {
        opacity: 1,
        x: 0,
    },
};

export default function About({ page, contact }: AboutProps) {
    const heroRef = useRef(null);
    const profileRef = useRef(null);
    const visionRef = useRef(null);
    const historyRef = useRef(null);

    const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
    const profileInView = useInView(profileRef, { once: true, amount: 0.3 });
    const visionInView = useInView(visionRef, { once: true, amount: 0.3 });
    const historyInView = useInView(historyRef, { once: true, amount: 0.3 });

    // Function to parse and extract sections from HTML content
    const parseContent = (content: string) => {
        // Create a temporary div to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;

        const sections: { [key: string]: string } = {};
        let currentSection = '';
        let currentContent: string[] = [];

        // Process each child node
        Array.from(tempDiv.children).forEach((element) => {
            if (element.tagName === 'H1') {
                // Save previous section if it exists
                if (currentSection) {
                    sections[currentSection] = currentContent.join('');
                }

                // Extract text from H1, handling nested strong tags and other elements
                let sectionText = '';
                if (element.textContent) {
                    sectionText = element.textContent.trim();
                } else if ((element as HTMLElement).innerText) {
                    sectionText = (element as HTMLElement).innerText.trim();
                }

                // Convert to lowercase and replace spaces with hyphens for section key
                currentSection = sectionText.toLowerCase().replace(/\s+/g, '-');
                currentContent = [];
            } else {
                // Add content to current section
                currentContent.push(element.outerHTML);
            }
        });

        // Save the last section
        if (currentSection) {
            sections[currentSection] = currentContent.join('');
        }

        return sections;
    };

    const sections = parseContent(page.content);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />
            <Head title={`${page.title}`} />

            <PublicLayout currentPath="/about-us">
                {/* Hero Section with Image */}
                <motion.section
                    ref={heroRef}
                    className="relative overflow-hidden"
                    initial="hidden"
                    animate={heroInView ? 'visible' : 'hidden'}
                    variants={staggerContainer}
                    transition={{ staggerChildren: 0.2, delayChildren: 0.1 }}
                >
                    {/* Hero Image */}
                    {page.image && (
                        <motion.div
                            className="relative h-96 sm:h-[500px] lg:h-[600px]"
                            variants={scaleIn}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        >
                            <motion.img
                                src={page.image}
                                alt={page.title}
                                className="h-full w-full object-cover"
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 8, ease: 'easeOut' }}
                            />
                            {/* Dark overlay for better text readability */}
                            <motion.div
                                className="absolute inset-0 bg-black/40"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 0.5 }}
                            />

                            {/* Hero Text Overlay */}
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center"
                                variants={fadeInUp}
                                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
                            />
                        </motion.div>
                    )}
                </motion.section>

                {/* School Profile Section */}
                {sections['profil-sekolah'] && (
                    <motion.section
                        ref={profileRef}
                        className="relative bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 py-5"
                        initial="hidden"
                        animate={profileInView ? 'visible' : 'hidden'}
                        variants={staggerContainer}
                    >
                        {/* Floating Background Elements */}
                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                            <motion.div
                                className="absolute top-20 right-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-3xl sm:h-64 sm:w-64"
                                animate={{
                                    y: [0, -20, 0],
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            />
                            <motion.div
                                className="absolute bottom-20 left-10 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400/10 to-cyan-400/10 blur-3xl sm:h-48 sm:w-48"
                                animate={{
                                    y: [0, 15, 0],
                                    scale: [1, 0.9, 1],
                                }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: 2,
                                }}
                            />
                        </div>

                        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="mx-auto max-w-6xl">
                                <motion.div className="mb-8 text-center" variants={fadeInUp}>
                                    <motion.div
                                        className="mb-6 inline-flex items-center rounded-full border border-blue-200/50 bg-gradient-to-r from-blue-50 to-emerald-50 px-4 py-2 sm:px-6 sm:py-3"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <Building className="mr-2 h-5 w-5 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-700 sm:text-base">Profil Sekolah</span>
                                    </motion.div>

                                    <motion.h2
                                        className="mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-emerald-800 bg-clip-text pb-2 text-3xl font-bold text-transparent sm:text-4xl lg:text-5xl"
                                        variants={fadeInUp}
                                    >
                                        Mengenal SMP Negeri 1 Tambun Selatan
                                    </motion.h2>

                                    <motion.div className="flex items-center justify-center space-x-2 sm:space-x-4" variants={staggerContainer}>
                                        <motion.div
                                            className="h-1 w-8 rounded-full bg-gradient-to-r from-transparent to-blue-400 sm:w-12"
                                            variants={scaleIn}
                                        />
                                        <motion.div
                                            className="h-2 w-4 rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 sm:w-6"
                                            variants={scaleIn}
                                        />
                                        <motion.div
                                            className="h-1 w-8 rounded-full bg-gradient-to-l from-transparent to-emerald-400 sm:w-12"
                                            variants={scaleIn}
                                        />
                                    </motion.div>
                                </motion.div>

                                <motion.div variants={fadeInUp} whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300 }}>
                                    <Card className="group relative overflow-hidden border-0 bg-white/90 shadow-xl backdrop-blur-sm transition-all duration-500 hover:shadow-2xl">
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100"
                                            transition={{ duration: 0.5 }}
                                        />
                                        <motion.div
                                            className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-5 group-hover:opacity-10 sm:h-32 sm:w-32"
                                            animate={{
                                                rotate: [0, 360],
                                            }}
                                            transition={{
                                                duration: 20,
                                                repeat: Infinity,
                                                ease: 'linear',
                                            }}
                                        />

                                        <div className="relative z-10 p-6 sm:p-8 lg:p-5">
                                            <div
                                                className="prose prose-lg max-w-none"
                                                dangerouslySetInnerHTML={{ __html: sections['profil-sekolah'] }}
                                            />
                                        </div>
                                    </Card>
                                </motion.div>
                            </div>
                        </div>
                    </motion.section>
                )}

                {/* Vision & Mission Section */}
                <motion.section
                    ref={visionRef}
                    className="relative bg-gradient-to-br from-slate-50 via-white to-emerald-50/50 py-5"
                    initial="hidden"
                    animate={visionInView ? 'visible' : 'hidden'}
                    variants={staggerContainer}
                >
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            className="absolute top-1/4 left-1/4 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-400/5 to-blue-400/5 blur-3xl sm:h-96 sm:w-96"
                            animate={{
                                x: [0, 30, 0],
                                y: [0, -20, 0],
                            }}
                            transition={{
                                duration: 10,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                        <motion.div
                            className="absolute right-1/4 bottom-1/4 h-40 w-40 rounded-full bg-gradient-to-br from-purple-400/5 to-pink-400/5 blur-3xl sm:h-80 sm:w-80"
                            animate={{
                                x: [0, -25, 0],
                                y: [0, 15, 0],
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: 1,
                            }}
                        />
                    </div>
                    <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <motion.div className="text-center sm:mb-12" variants={fadeInUp}>
                                <motion.div
                                    className="mb-6 inline-flex items-center rounded-full border border-emerald-200/50 bg-gradient-to-r from-emerald-50 to-blue-50 px-4 py-2 sm:px-6 sm:py-3"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <Trophy className="mr-2 h-5 w-5 text-emerald-600" />
                                    <span className="text-sm font-medium text-emerald-700 sm:text-base">Visi & Misi</span>
                                </motion.div>

                                <motion.h2
                                    className="mb-4 bg-gradient-to-r from-gray-900 via-emerald-800 to-blue-800 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl lg:text-5xl"
                                    variants={fadeInUp}
                                >
                                    Arah & Tujuan Pendidikan
                                </motion.h2>

                                <motion.p className="mx-auto max-w-3xl text-base text-gray-600 sm:text-lg" variants={fadeInUp}>
                                    Komitmen kami dalam mewujudkan pendidikan berkualitas dan berkarakter
                                </motion.p>

                                <motion.div className="mt-6 flex items-center justify-center space-x-2 sm:space-x-4" variants={staggerContainer}>
                                    <motion.div
                                        className="h-1 w-8 rounded-full bg-gradient-to-r from-transparent to-emerald-400 sm:w-12"
                                        variants={scaleIn}
                                    />
                                    <motion.div
                                        className="h-2 w-4 rounded-full bg-gradient-to-r from-emerald-600 to-blue-600 sm:w-6"
                                        variants={scaleIn}
                                    />
                                    <motion.div
                                        className="h-1 w-8 rounded-full bg-gradient-to-l from-transparent to-blue-400 sm:w-12"
                                        variants={scaleIn}
                                    />
                                </motion.div>
                            </motion.div>

                            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                                {/* Vision */}
                                {sections['visi'] && (
                                    <motion.div
                                        variants={slideInLeft}
                                        whileHover={{
                                            y: -10,
                                            rotateY: 5,
                                        }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <Card className="group relative h-full overflow-hidden border-0 bg-white/90 shadow-xl backdrop-blur-sm transition-all duration-500 hover:shadow-2xl">
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100"
                                                transition={{ duration: 0.5 }}
                                            />
                                            <motion.div
                                                className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-5 group-hover:opacity-15 sm:h-32 sm:w-32"
                                                animate={{
                                                    rotate: [0, 360],
                                                }}
                                                transition={{
                                                    duration: 15,
                                                    repeat: Infinity,
                                                    ease: 'linear',
                                                }}
                                            />

                                            <div className="relative z-10">
                                                <CardHeader className="px-4 py-6 text-center sm:px-6 sm:py-8">
                                                    <motion.div
                                                        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl sm:h-20 sm:w-20"
                                                        whileHover={{
                                                            scale: 1.1,
                                                            rotate: 5,
                                                        }}
                                                        transition={{ type: 'spring', stiffness: 400 }}
                                                    >
                                                        <Target className="h-8 w-8 text-white sm:h-10 sm:w-10" />
                                                    </motion.div>
                                                    <CardTitle className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                                                        Visi
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="px-4 pb-6 sm:px-8 sm:pb-8">
                                                    <div
                                                        className="prose prose-sm sm:prose max-w-none text-center"
                                                        dangerouslySetInnerHTML={{ __html: sections['visi'] }}
                                                    />
                                                </CardContent>
                                            </div>
                                        </Card>
                                    </motion.div>
                                )}

                                {/* Mission */}
                                {sections['misi'] && (
                                    <motion.div
                                        variants={slideInRight}
                                        whileHover={{
                                            y: -10,
                                            rotateY: -5,
                                        }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <Card className="group relative h-full overflow-hidden border-0 bg-white/90 shadow-xl backdrop-blur-sm transition-all duration-500 hover:shadow-2xl">
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100"
                                                transition={{ duration: 0.5 }}
                                            />
                                            <motion.div
                                                className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 opacity-5 group-hover:opacity-15 sm:h-32 sm:w-32"
                                                animate={{
                                                    rotate: [0, -360],
                                                }}
                                                transition={{
                                                    duration: 12,
                                                    repeat: Infinity,
                                                    ease: 'linear',
                                                }}
                                            />

                                            <div className="relative z-10">
                                                <CardHeader className="px-4 py-6 text-center sm:px-6 sm:py-8">
                                                    <motion.div
                                                        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl sm:h-20 sm:w-20"
                                                        whileHover={{
                                                            scale: 1.1,
                                                            rotate: -5,
                                                        }}
                                                        transition={{ type: 'spring', stiffness: 400 }}
                                                    >
                                                        <BookOpen className="h-8 w-8 text-white sm:h-10 sm:w-10" />
                                                    </motion.div>
                                                    <CardTitle className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                                                        Misi
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="px-4 pb-6 sm:px-8 sm:pb-8">
                                                    <div
                                                        className="prose prose-sm sm:prose max-w-none"
                                                        dangerouslySetInnerHTML={{ __html: sections['misi'] }}
                                                    />
                                                </CardContent>
                                            </div>
                                        </Card>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* History Section */}
                {sections['sejarah'] && (
                    <motion.section
                        ref={historyRef}
                        className="relative bg-gradient-to-br from-amber-50/50 via-yellow-50/30 to-orange-50/50 py-5"
                        initial="hidden"
                        animate={historyInView ? 'visible' : 'hidden'}
                        variants={staggerContainer}
                    >
                        <div className="absolute inset-0 overflow-hidden">
                            <motion.div
                                className="absolute top-1/4 left-1/4 h-48 w-48 rounded-full bg-gradient-to-br from-amber-400/8 to-orange-400/8 blur-3xl sm:h-96 sm:w-96"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.5, 0.3],
                                }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            />
                            <motion.div
                                className="absolute right-1/4 bottom-1/4 h-40 w-40 rounded-full bg-gradient-to-br from-yellow-400/8 to-red-400/8 blur-3xl sm:h-80 sm:w-80"
                                animate={{
                                    scale: [1, 0.8, 1],
                                    opacity: [0.4, 0.6, 0.4],
                                }}
                                transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: 2,
                                }}
                            />
                        </div>

                        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="mx-auto max-w-6xl">
                                <motion.div className="mb-8 text-center sm:mb-12" variants={fadeInUp}>
                                    <motion.div
                                        className="mb-6 inline-flex items-center rounded-full border border-amber-200/50 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 sm:px-6 sm:py-3"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <Users className="mr-2 h-5 w-5 text-amber-600" />
                                        <span className="text-sm font-medium text-amber-700 sm:text-base">Sejarah</span>
                                    </motion.div>

                                    <motion.h2
                                        className="mb-4 bg-gradient-to-r from-gray-900 via-amber-800 to-orange-800 bg-clip-text pb-2 text-3xl font-bold text-transparent sm:text-4xl lg:text-5xl"
                                        variants={fadeInUp}
                                    >
                                        Perjalanan Panjang Pendidikan
                                    </motion.h2>

                                    <motion.p className="mx-auto max-w-3xl text-base text-gray-600 sm:text-lg" variants={fadeInUp}>
                                        Lebih dari setengah abad mengabdi dalam dunia pendidikan
                                    </motion.p>

                                    <motion.div className="mt-6 flex items-center justify-center space-x-2 sm:space-x-4" variants={staggerContainer}>
                                        <motion.div
                                            className="h-1 w-8 rounded-full bg-gradient-to-r from-transparent to-amber-400 sm:w-12"
                                            variants={scaleIn}
                                        />
                                        <motion.div
                                            className="h-2 w-4 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 sm:w-6"
                                            variants={scaleIn}
                                        />
                                        <motion.div
                                            className="h-1 w-8 rounded-full bg-gradient-to-l from-transparent to-orange-400 sm:w-12"
                                            variants={scaleIn}
                                        />
                                    </motion.div>
                                </motion.div>

                                <motion.div variants={fadeInUp} whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300 }}>
                                    <Card className="group relative overflow-hidden border-0 bg-white/90 shadow-xl backdrop-blur-sm transition-all duration-500 hover:shadow-2xl">
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100"
                                            transition={{ duration: 0.5 }}
                                        />
                                        <motion.div
                                            className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 opacity-5 group-hover:opacity-10 sm:h-32 sm:w-32"
                                            animate={{
                                                rotate: [0, 360],
                                            }}
                                            transition={{
                                                duration: 25,
                                                repeat: Infinity,
                                                ease: 'linear',
                                            }}
                                        />

                                        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
                                            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: sections['sejarah'] }} />
                                        </div>
                                    </Card>
                                </motion.div>
                            </div>
                        </div>
                    </motion.section>
                )}
            </PublicLayout>
        </>
    );
}
