// Single Responsibility: Display contact information in card format
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ContactCardProps } from '@/types/contact';
import { Link } from '@inertiajs/react';
import { Contact as ContactIcon, Edit, Mail, MapPin, MessageCircle, Phone, Trash2, User } from 'lucide-react';

/**
 * Reusable ContactCard component following SOLID principles
 * - SRP: Only responsible for displaying contact information
 * - OCP: Can be extended through props without modifying the component
 * - ISP: Focused interface with only needed props
 */
export function ContactCard({ contact, onDelete, onEdit, showActions = true }: ContactCardProps) {
    return (
        <Card className="group hover:shadow-3xl relative gap-0 overflow-hidden border-0 py-0 shadow-xl transition-all duration-500 dark:bg-gray-800/90">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Header Section */}
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                            <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-white">{contact.name}</CardTitle>
                            <div className="flex flex-col gap-1 text-emerald-100">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <span className="text-sm">{contact.email}</span>
                                </div>
                                {contact.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        <span className="text-sm">{contact.phone}</span>
                                    </div>
                                )}
                                {contact.address && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span className="text-sm">{contact.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {showActions && (
                        <div className="flex gap-2">
                            <Link href={route('admin.contacts.show', contact.id)}>
                                <Button
                                    size="sm"
                                    className="h-9 w-9 bg-white/20 p-0 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/30"
                                    title="View Details"
                                >
                                    <ContactIcon className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href={route('admin.contacts.edit', contact.id)}>
                                <Button
                                    size="sm"
                                    className="h-9 w-9 bg-blue-500/90 p-0 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-blue-600"
                                    title="Edit Contact"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </Link>
                            {onDelete && (
                                <Button
                                    size="sm"
                                    className="h-9 w-9 bg-red-500/90 p-0 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-red-600"
                                    title="Delete Contact"
                                    onClick={() => onDelete(contact)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>

            {/* Content Section */}
            <CardContent className="relative p-6">
                <div className="space-y-4">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-emerald-600" />
                            <span className="font-semibold text-gray-900 dark:text-white">Contact Message</span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{contact.message}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
