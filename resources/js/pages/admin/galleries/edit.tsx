import { usePage } from '@inertiajs/react';
import GalleryForm from './form';

interface Gallery {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    featured_image: string | null;
    is_published: boolean;
    sort_order: number;
    google_drive_folder_id: string | null;
    created_at: string;
    updated_at: string;
}

interface GalleryEditPageProps {
    gallery: Gallery;
    [key: string]: unknown;
}

export default function EditGallery() {
    const { gallery } = usePage<GalleryEditPageProps>().props;

    return <GalleryForm gallery={gallery} />;
}
