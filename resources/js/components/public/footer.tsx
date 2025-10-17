import { Clock, Mail, MapPin, Phone } from 'lucide-react';

interface Contact {
    id: number;
    name: string;
    email: string;
    message: string;
    phone: string | null;
    address: string | null;
    created_at: string;
    updated_at: string;
}

interface FooterProps {
    className?: string;
    contact?: Contact;
}

export default function Footer({ className = '', contact }: FooterProps) {
    return (
        <footer className={`bg-gray-950 py-12 text-gray-300 ${className}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 grid gap-8 md:grid-cols-3">
                    {/* School Information */}
                    <div>
                        <div className="mb-4 flex items-center space-x-3">
                            <img src="/logo-satam.png" alt="Logo SMP Negeri 1 Tambun Selatan" className="h-10 w-10 object-contain" />
                            <div>
                                <h3 className="text-lg font-bold text-white">SMP Negeri 1 Tambun Selatan</h3>
                            </div>
                        </div>
                        <p className="text-sm">Mencerdaskan bangsa dan membentuk karakter melalui pendidikan berkualitas.</p>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h4 className="mb-4 text-lg font-semibold text-white">Informasi Kontak</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <span className="flex items-center">
                                    <MapPin className="mr-2 h-8 w-8 text-blue-400" />
                                    {contact?.address}
                                </span>
                            </li>
                            {contact?.phone && (
                                <li>
                                    <a href={`tel:${contact.phone}`} className="flex items-center transition-colors hover:text-white">
                                        <Phone className="mr-2 h-4 w-4 text-emerald-400" />
                                        {contact.phone}
                                    </a>
                                </li>
                            )}
                            {contact?.email && (
                                <li>
                                    <a href={`mailto:${contact.email}`} className="flex items-center transition-colors hover:text-white">
                                        <Mail className="mr-2 h-4 w-4 text-purple-400" />
                                        {contact.email}
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Operating Hours */}
                    <div>
                        <h4 className="mb-4 text-lg font-semibold text-white">Jam Operasional</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <span className="flex items-center">
                                    <Clock className="mr-2 h-4 w-4 text-yellow-400" />
                                    Senin - Jumat
                                </span>
                                <span className="ml-6 text-gray-400">07:00 - 15:00 WIB</span>
                            </li>
                            {/* Contact Message */}
                            {contact?.message && (
                                <div className="mt-4">
                                    <p className="text-sm leading-relaxed text-gray-400">{contact.message}</p>
                                </div>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Copyright & Credits */}
                <div className="border-t border-gray-800 pt-8 text-center">
                    <div className="flex items-center justify-center space-x-4">
                        <img src="/logo-sks.png" alt="Setneg Goes to School Logo" className="h-12 w-auto object-contain opacity-90" />
                        <p className="text-base">
                            Copyright &copy; Setneg Goes to School {new Date().getFullYear()} Kementerian Sekretariat Negara Republik Indonesia
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
