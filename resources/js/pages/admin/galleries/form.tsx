import FeaturedImageDropzone from '@/components/admin/featured-image-dropzone';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FileDropzone from '@/components/ui/file-dropzone';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { Eye, FileText, ImageIcon, Save, Settings, Trash2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import * as v from 'valibot';

// Extend Window interface to include gallery files storage
declare global {
    interface Window {
        galleryFiles?: Map<string, File>;
    }
}

interface GalleryItem {
    id: string;
    title: string;
    caption: string;
    mime_type: string;
    file_path: string;
    is_featured: boolean;
    sort_order: number;
    metadata?: {
        file_size?: number;
        file_size_human?: string;
        width?: number;
        height?: number;
        dimensions?: string;
        aspect_ratio?: number;
        original_name?: string;
        extension?: string;
        exif?: {
            camera_make?: string;
            camera_model?: string;
            date_taken?: string;
            orientation?: number;
        };
        video_type?: string;
        duration?: number;
        _pendingFile?: File; // For temporary storage of File object before upload
    };
}

interface Gallery {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    featured_image: string | null;
    is_published: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    items?: GalleryItem[];
}

interface GalleryFormData {
    title: string;
    description: string;
    featured_image: string;
    is_published: boolean;
    sort_order: number;
    [key: string]: string | number | boolean | File | null | undefined;
}

export default function GalleryForm({ gallery }: { gallery?: Gallery }) {
    const { toast } = useToast();
    const isEditing = !!gallery;

    const breadcrumbs: BreadcrumbItem[] = isEditing
        ? [
              { title: 'Admin Dashboard', href: route('admin.dashboard') },
              { title: 'Gallery Management', href: route('admin.galleries.index') },
              { title: gallery.title, href: route('admin.galleries.show', gallery.id) },
              { title: 'Edit', href: route('admin.galleries.edit', gallery.id) },
          ]
        : [
              { title: 'Admin Dashboard', href: route('admin.dashboard') },
              { title: 'Gallery Management', href: route('admin.galleries.index') },
              { title: 'Create Gallery', href: route('admin.galleries.create') },
          ];

    const [publishNow, setPublishNow] = useState(gallery?.is_published || false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [featuredImageUrl, setFeaturedImageUrl] = useState<string>(gallery?.featured_image || '');

    // Loading states for better UX
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingStep, setLoadingStep] = useState<string>('');
    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
    const [selectedFeaturedImageFile, setSelectedFeaturedImageFile] = useState<File | null>(null);
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(
        // Initialize with existing gallery items when editing
        gallery?.items
            ? gallery.items.map((item) => ({
                  id: item.id.toString(),
                  title: item.title || '',
                  caption: item.caption || '',
                  mime_type: item.mime_type,
                  file_path: item.file_path,
                  is_featured: item.is_featured || false,
                  sort_order: item.sort_order || 0,
                  metadata: (item as { metadata?: unknown }).metadata || undefined, // Include existing metadata
              }))
            : [],
    );

    // Track items that had their images explicitly deleted (should delete from Google Drive)
    const [itemsToDeleteFromDrive, setItemsToDeleteFromDrive] = useState<Set<string>>(new Set());

    // Track items that had their images replaced (so we know to delete old Google Drive files)
    const [itemsWithReplacedImages, setItemsWithReplacedImages] = useState<Map<string, string>>(new Map());

    const { data, setData, errors } = useForm<GalleryFormData>({
        title: gallery?.title || '',
        description: gallery?.description || '',
        featured_image: gallery?.featured_image || '',
        is_published: gallery?.is_published || false,
        sort_order: gallery?.sort_order || 0,
    });

    const GallerySchema = v.object({
        title: v.pipe(v.string(), v.trim(), v.minLength(1, 'Title is required')),
        description: v.optional(v.string()),
        featured_image: v.optional(v.string()),
        is_published: v.boolean(),
        sort_order: v.optional(v.number()),
    });

    // Cleanup blob URLs on unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            galleryItems.forEach((item) => {
                if (item.file_path?.startsWith('blob:')) {
                    URL.revokeObjectURL(item.file_path);
                }
            });
        };
    }, [galleryItems]);

    const validateForm = () => {
        try {
            v.parse(GallerySchema, {
                ...data,
                is_published: publishNow,
            });
            setValidationErrors({});
            return true;
        } catch (error) {
            if (error instanceof v.ValiError) {
                const newErrors: Record<string, string> = {};
                for (const issue of error.issues) {
                    if (issue.path) {
                        const path = issue.path.map((p: { key: string }) => p.key).join('.');
                        newErrors[path] = issue.message;
                    }
                }
                setValidationErrors(newErrors);
            }
            return false;
        }
    };

    // Featured image dropzone handlers
    const handleFeaturedImageFileSelect = (file: File | null) => {
        setSelectedFeaturedImageFile(file);
        if (!file) {
            // If file is removed, keep the current URL or clear it
            setData('featured_image', featuredImageUrl);
        }
    };

    const handleFeaturedImageUrlChange = (url: string | null) => {
        if (url === null && !selectedFeaturedImageFile) {
            // Both file and URL are cleared
            setFeaturedImageUrl('');
            setData('featured_image', '');
        } else if (url) {
            // URL is set
            setFeaturedImageUrl(url);
            setData('featured_image', url);
        }
    };

    // Handle bulk file upload - create dynamic dropzones for each file
    const handleBulkFileUpload = (files: File[] | null) => {
        if (!files || files.length === 0) {
            // Don't clear galleryItems when clearing files - preserve existing items
            return;
        }

        // Filter out duplicate files based on name and size - check against ALL existing items
        const existingFileSignatures = new Set([
            // Check blob URL items (newly added in current session)
            ...galleryItems
                .filter((item) => item.file_path?.startsWith('blob:'))
                .map((item) => `${item.title}.${item.mime_type?.split('/')[1] || ''}_${item.metadata?.file_size || ''}`),
            // Check existing gallery items (from database) - use original_name if available, otherwise title
            ...galleryItems
                .filter((item) => item.file_path && !item.file_path.startsWith('blob:'))
                .map((item) => {
                    // Use original filename if available in metadata, otherwise use current title
                    const originalName = item.metadata?.original_name || `${item.title}.${item.mime_type?.split('/')[1] || ''}`;
                    const fileName = originalName.replace(/\.[^/.]+$/, ''); // Remove extension
                    const fileSize = item.metadata?.file_size || '';
                    return `${fileName}_${fileSize}`;
                }),
        ]);

        const uniqueFiles = files.filter((file) => {
            const fileSignature = `${file.name.replace(/\.[^/.]+$/, '')}_${file.size}`;
            const isUnique = !existingFileSignatures.has(fileSignature);
            return isUnique;
        });

        if (uniqueFiles.length === 0) {
            toast({
                title: 'No New Files',
                description: 'All selected files are already in the gallery.',
                variant: 'default',
            });
            return;
        }

        // Create gallery items with blob URLs for preview
        const newItems: GalleryItem[] = uniqueFiles.map((file, index) => {
            // Create a unique blob URL with timestamp to avoid caching issues
            const blobUrl = URL.createObjectURL(file);

            // Store the blob URL for cleanup later
            if (!window.galleryFiles) {
                window.galleryFiles = new Map();
            }
            const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${index}`;
            window.galleryFiles.set(itemId, file);

            return {
                id: itemId,
                title: '', // Leave title empty for user to fill
                caption: '',
                mime_type: file.type,
                file_path: blobUrl, // Blob URL for preview
                is_featured: false,
                sort_order: galleryItems.length + index, // Start after existing items
                metadata: {
                    file_size: file.size,
                    original_name: file.name,
                    // Store the file directly in metadata for easy access during upload
                    _pendingFile: file,
                },
            };
        });

        // Files are now stored directly in gallery item metadata
        setGalleryItems((prev) => {
            // Double-check for duplicates at state update time to prevent race conditions
            const existingIds = new Set(prev.map((item) => item.id));
            const uniqueNewItems = newItems.filter((item) => !existingIds.has(item.id));
            const result = [...prev, ...uniqueNewItems];
            return result;
        });

        toast({
            title: 'Files Ready',
            description: `${uniqueFiles.length} new item(s) created. ${files.length - uniqueFiles.length > 0 ? `${files.length - uniqueFiles.length} duplicate(s) skipped.` : ''} Fill in details and save the gallery to upload.`,
            variant: 'default',
        });
    };

    // Update gallery item
    const updateGalleryItem = (id: string, field: keyof GalleryItem, value: unknown) => {
        setGalleryItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    };

    // Remove gallery item
    const removeGalleryItem = (id: string) => {
        const itemToRemove = galleryItems.find((item) => item.id === id);
        if (!itemToRemove) {
            return;
        }

        // Remove from gallery items
        setGalleryItems((prev) => {
            const filtered = prev.filter((item) => item.id !== id);
            return filtered;
        });

        // Note: Files are stored directly in gallery item metadata, cleanup handled automatically

        toast({
            title: 'Item Removed',
            description: 'Gallery item has been removed',
            variant: 'default',
        });
    };

    // Handle replacing the image of a gallery item
    const handleItemImageReplace = (itemId: string, newFile: File) => {
        const item = galleryItems.find((item) => item.id === itemId);
        if (!item) return;

        // Track the old file path for deletion if it's a Google Drive URL
        if (
            item.file_path &&
            !item.file_path.startsWith('blob:') &&
            (item.file_path.includes('googleusercontent.com') || item.file_path.includes('drive.google.com'))
        ) {
            setItemsWithReplacedImages((prev) => new Map(prev.set(itemId, item.file_path!)));
        }

        // If the old item has a blob URL, revoke it to free memory
        if (item.file_path?.startsWith('blob:')) {
            URL.revokeObjectURL(item.file_path);
        }

        // Create new blob URL for the new file
        const newBlobUrl = URL.createObjectURL(newFile);

        // Update the gallery item with the new file data
        setGalleryItems((prev) =>
            prev.map((prevItem) =>
                prevItem.id === itemId
                    ? {
                          ...prevItem,
                          file_path: newBlobUrl,
                          mime_type: newFile.type,
                          title: prevItem.title || newFile.name.replace(/\.[^/.]+$/, ''),
                          metadata: {
                              ...prevItem.metadata,
                              file_size: newFile.size,
                              original_name: newFile.name,
                              _pendingFile: newFile, // Store the file for upload
                          },
                      }
                    : prevItem,
            ),
        );

        // Note: We no longer use pendingFiles since files are stored directly in metadata

        toast({
            title: 'Image Replaced',
            description: 'The gallery item image has been replaced successfully',
            variant: 'default',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent double submission
        if (isSubmitting) return;

        setIsSubmitting(true);
        setLoadingStep('Preparing...');

        // Clear previous validation errors
        setValidationErrors({});

        // Validate form before submission
        if (!validateForm()) {
            setIsSubmitting(false);
            setLoadingStep('');
            return;
        }

        let finalFeaturedImageUrl = featuredImageUrl;
        let targetGalleryId = gallery?.id; // For editing, use existing ID

        // For new galleries, create the gallery first to get an ID for proper folder structure
        if (!isEditing) {
            setLoadingStep('Creating gallery...');
            try {
                const initialGalleryData = {
                    title: data.title,
                    description: data.description,
                    featured_image: '',
                    sort_order: data.sort_order,
                    is_published: publishNow, // Send as boolean, not string
                };

                const response = await axios.post(route('admin.galleries.store'), initialGalleryData, {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                const result = response.data;

                if (result.gallery) {
                    targetGalleryId = result.gallery.id;
                    toast({
                        title: 'Gallery Created',
                        description: 'Gallery created successfully. Now uploading items...',
                        variant: 'success',
                    });
                } else {
                    throw new Error(result.message || 'Failed to create gallery');
                }
            } catch (error) {
                setIsSubmitting(false);
                setLoadingStep('');
                toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'Failed to create gallery',
                    variant: 'destructive',
                });
                return;
            }
        }

        // Upload pending files with proper gallery_id
        const uploadedItems: Array<{
            originalGalleryItem: GalleryItem;
            uploadData: {
                file_url: string;
                mime_type: string;
                metadata?: unknown;
                message?: string;
            };
        }> = [];

        // Get gallery items that have pending files (blob URLs with _pendingFile in metadata)
        const itemsToUpload = galleryItems.filter(
            (item) => item.file_path && item.file_path.startsWith('blob:') && item.metadata?._pendingFile instanceof File,
        );

        if (itemsToUpload.length > 0) {
            setLoadingStep('Uploading files to Google Drive...');
            setUploadProgress({ current: 0, total: itemsToUpload.length });

            try {
                toast({
                    title: 'Uploading Files',
                    description: `Uploading ${itemsToUpload.length} files to Google Drive...`,
                    variant: 'default',
                });

                // Upload each item's file
                for (const galleryItem of itemsToUpload) {
                    const file = galleryItem.metadata?._pendingFile as File;

                    if (!file) {
                        console.error('❌ Gallery item has no pending file:', {
                            itemId: galleryItem.id,
                            itemTitle: galleryItem.title,
                            metadata: galleryItem.metadata,
                        });
                        continue;
                    }

                    // Update progress
                    setUploadProgress((prev) => ({ ...prev, current: uploadedItems.length + 1 }));
                    setLoadingStep(`Uploading file ${uploadedItems.length + 1} of ${itemsToUpload.length}: ${file.name}`);

                    const uploadFormData = new FormData();
                    uploadFormData.append('file', file);
                    uploadFormData.append('gallery_name', data.title || 'Untitled Gallery');
                    uploadFormData.append('item_id', galleryItem.id);

                    // Always pass gallery_id for proper folder structure (now we have it for both new and existing galleries)
                    if (targetGalleryId) {
                        uploadFormData.append('gallery_id', targetGalleryId.toString());
                    }

                    const uploadResponse = await axios.post(route('admin.galleries.upload-item-file'), uploadFormData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    });

                    const uploadData = uploadResponse.data;

                    if (uploadData) {
                        // Store upload data to be used later when updating gallery items
                        uploadedItems.push({
                            originalGalleryItem: galleryItem, // Reference to original item
                            uploadData: uploadData, // Upload response data
                        });
                    } else {
                        throw new Error(`Upload failed for ${file.name}: ${uploadData.message}`);
                    }
                }

                toast({
                    title: 'Upload Complete',
                    description: `${uploadedItems.length} files uploaded successfully`,
                    variant: 'success',
                });

                // Clear upload progress
                setUploadProgress({ current: 0, total: 0 });
            } catch (error) {
                setIsSubmitting(false);
                setLoadingStep('');
                setUploadProgress({ current: 0, total: 0 });
                toast({
                    title: 'Upload Error',
                    description: `Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    variant: 'destructive',
                });
                return; // Don't proceed with form submission if file upload fails
            }
        }

        const updatedGalleryItems = galleryItems.map((item) => {
            // If this item has a blob URL (newly added), find its corresponding upload data
            if (item.file_path && item.file_path.startsWith('blob:')) {
                const correspondingUpload = uploadedItems.find((upload) => upload.originalGalleryItem.id === item.id);

                if (correspondingUpload) {
                    // Revoke the blob URL to free memory and prevent caching issues
                    URL.revokeObjectURL(item.file_path);

                    // Replace blob URL with Google Drive URL and add metadata
                    const cleanMetadata = correspondingUpload.uploadData.metadata || {};
                    // Remove the temporary _pendingFile from metadata
                    if (cleanMetadata && typeof cleanMetadata === 'object' && '_pendingFile' in cleanMetadata) {
                        delete (cleanMetadata as { _pendingFile?: File })._pendingFile;
                    }

                    return {
                        ...item,
                        file_path: correspondingUpload.uploadData.file_url,
                        mime_type: correspondingUpload.uploadData.mime_type,
                        metadata: cleanMetadata,
                    };
                } else {
                    console.error('❌ No corresponding upload found for blob URL item:', {
                        itemId: item.id,
                        itemTitle: item.title,
                        blobUrl: item.file_path,
                        hasPendingFile: !!item.metadata?._pendingFile,
                        availableUploadIds: uploadedItems.map((u) => u.originalGalleryItem.id),
                        uploadedItems: uploadedItems,
                    });
                }
            }
            // Return existing items unchanged
            return item;
        });

        // Use the updated items (no duplication - we updated existing items instead of creating new ones)
        const allItems = updatedGalleryItems;

        // Final validation: ensure no blob URLs are being sent to the database
        const itemsWithBlobUrls = allItems.filter((item) => item.file_path && item.file_path.startsWith('blob:'));

        if (itemsWithBlobUrls.length > 0) {
            setIsSubmitting(false);
            setLoadingStep('');

            // Enhanced debugging
            console.error('DETAILED DEBUG - Items with blob URLs:', {
                itemsWithBlobUrls: itemsWithBlobUrls.map((item) => ({
                    id: item.id,
                    title: item.title,
                    file_path: item.file_path,
                    has_pending_file: !!(
                        item.metadata &&
                        typeof item.metadata === 'object' &&
                        '_pendingFile' in item.metadata &&
                        (item.metadata as { _pendingFile?: File })._pendingFile
                    ),
                    metadata: item.metadata,
                })),
                allUploadedItems: uploadedItems.map((u) => ({
                    originalId: u.originalGalleryItem.id,
                    uploadedUrl: u.uploadData.file_url,
                })),
                totalItemsInGallery: allItems.length,
                totalUploadedItems: uploadedItems.length,
            });

            toast({
                title: 'Upload Error',
                description: `${itemsWithBlobUrls.length} item(s) still have blob URLs. All files must be uploaded to Google Drive before saving.`,
                variant: 'destructive',
            });

            return;
        }

        // Prepare form data
        const formData = {
            title: data.title,
            description: data.description,
            featured_image: '',
            sort_order: data.sort_order,
            is_published: publishNow,
            items: allItems.map((item) => ({
                id: item.id, // Include ID so backend knows if it's existing or new
                title: item.title,
                caption: item.caption,
                mime_type: item.mime_type || null,
                file_path: item.file_path || null,
                is_featured: item.is_featured,
                sort_order: item.sort_order,
                metadata: item.metadata || null, // Include metadata
                // Include the old file path for items that had images replaced
                old_file_path: itemsWithReplacedImages.get(item.id) || null,
            })),
        };

        // Process items marked for Google Drive deletion before form submission
        if (itemsToDeleteFromDrive.size > 0) {
            try {
                for (const itemId of itemsToDeleteFromDrive) {
                    await axios.delete(
                        route('admin.galleries.items.clear-image', {
                            gallery: gallery!.id,
                            item: itemId,
                        }),
                        {
                            headers: {
                                'X-Requested-With': 'XMLHttpRequest',
                            },
                        },
                    );
                }
            } catch (error) {
                console.error(error);
            }
        }

        if (isEditing) {
            // Update existing gallery
            setLoadingStep('Updating gallery...');

            // If there's a new file selected, upload it first
            if (selectedFeaturedImageFile) {
                setLoadingStep('Uploading featured image...');
                try {
                    const uploadFormData = new FormData();
                    uploadFormData.append('file', selectedFeaturedImageFile);

                    const response = await axios.post(route('admin.galleries.upload-featured-image', gallery!.id), uploadFormData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    });

                    const uploadData = response.data;
                    finalFeaturedImageUrl = uploadData.featured_image_url;
                } catch (error) {
                    toast({
                        title: 'Warning',
                        description: `${error} Failed to upload featured image, but gallery will still be updated`,
                        variant: 'destructive',
                    });
                }
            }

            const updateData = {
                ...formData,
                featured_image: finalFeaturedImageUrl || '',
            };

            setLoadingStep('Saving gallery updates...');

            router.put(route('admin.galleries.update', gallery!.id), JSON.parse(JSON.stringify(updateData)), {
                onSuccess: () => {
                    // Clear the items marked for deletion and replacement since submission was successful
                    setItemsToDeleteFromDrive(new Set());
                    setItemsWithReplacedImages(new Map());
                    setIsSubmitting(false);
                    setLoadingStep('');

                    toast({
                        title: 'Success',
                        description: 'Gallery updated successfully',
                        variant: 'success',
                    });
                },
                onError: () => {
                    setIsSubmitting(false);
                    setLoadingStep('');
                    toast({
                        title: 'Error',
                        description: 'Failed to update gallery. Please check the form for errors.',
                        variant: 'destructive',
                    });
                },
            });
        } else {
            // For new galleries, we've already created the gallery above, now just update it with final data
            if (targetGalleryId) {
                // If there's a selected featured image file, upload it
                if (selectedFeaturedImageFile) {
                    setLoadingStep('Uploading featured image...');
                    try {
                        toast({
                            title: 'Uploading Featured Image',
                            description: 'Gallery created successfully. Uploading featured image...',
                            variant: 'default',
                        });

                        const uploadFormData = new FormData();
                        uploadFormData.append('file', selectedFeaturedImageFile);

                        const uploadResponse = await axios.post(route('admin.galleries.upload-featured-image', targetGalleryId), uploadFormData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                'X-Requested-With': 'XMLHttpRequest',
                            },
                        });

                        const uploadData = uploadResponse.data;
                        finalFeaturedImageUrl = uploadData.featured_image_url;
                    } catch {
                        toast({
                            title: 'Warning',
                            description: 'Gallery created but featured image upload failed',
                            variant: 'destructive',
                        });
                    }
                }

                // Update the gallery with final data including uploaded items
                const updateData = {
                    ...formData,
                    featured_image: finalFeaturedImageUrl || '',
                };

                setLoadingStep('Finalizing gallery...');

                router.put(route('admin.galleries.update', targetGalleryId), JSON.parse(JSON.stringify(updateData)), {
                    onSuccess: () => {
                        setIsSubmitting(false);
                        setLoadingStep('');

                        toast({
                            title: 'Success',
                            description: 'Gallery created successfully with all items uploaded to proper folders',
                            variant: 'success',
                        });

                        // Navigate to the edit page of the created gallery
                        setTimeout(() => {
                            window.location.href = route('admin.galleries.edit', targetGalleryId);
                        }, 1000);
                    },
                    onError: () => {
                        setIsSubmitting(false);
                        setLoadingStep('');

                        toast({
                            title: 'Warning',
                            description: `${errors} Gallery created but failed to save final data. You may need to edit the gallery.`,
                            variant: 'destructive',
                        });
                    },
                });
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? `Edit Gallery - ${gallery?.title}` : 'Create Gallery'} />

            <div className="w-full max-w-none space-y-4 px-3 sm:px-4 md:px-6 lg:px-8">
                {/* Modern Header with Gradient */}
                <div className="relative overflow-hidden rounded-lg border-0 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-4 shadow-xl sm:rounded-xl sm:p-6 md:p-8 lg:rounded-2xl lg:p-10 dark:from-gray-900 dark:via-gray-800 dark:to-violet-900">
                    <div className="bg-grid-slate-100 dark:bg-grid-slate-700/25 absolute inset-0 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
                    <div className="relative flex flex-col gap-3 sm:gap-4 md:gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-3 sm:gap-4 md:gap-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-20 lg:w-20 lg:rounded-2xl">
                                <ImageIcon className="h-6 w-6 text-white sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10" />
                            </div>
                            <div className="space-y-1 sm:space-y-2">
                                <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl md:text-3xl lg:text-4xl dark:text-white">
                                    {isEditing ? 'Edit Gallery' : 'Create New Gallery'}
                                </h1>
                                <p className="max-w-2xl text-sm text-gray-600 sm:text-base md:text-lg dark:text-gray-300">
                                    {isEditing
                                        ? 'Update gallery details, manage media, and organize your collection'
                                        : 'Build a stunning gallery with images and videos from Google Drive'}
                                </p>
                                {isEditing && (
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 sm:gap-4 sm:text-sm dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <FileText className="h-4 w-4" />
                                            <span>{galleryItems.length} items</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Eye className="h-4 w-4" />
                                            <span>{gallery!.is_published ? 'Published' : 'Draft'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {isEditing && (
                            <div className="mt-4 flex gap-2 sm:gap-3 lg:mt-0">
                                <Link href={route('admin.galleries.show', gallery!.id)} className="w-full sm:w-auto">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="lg:size-default w-full border border-gray-200 bg-white/80 backdrop-blur-sm hover:bg-white sm:w-auto"
                                    >
                                        <Eye className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                                        <span className="hidden sm:inline">View Gallery</span>
                                        <span className="sm:hidden">View</span>
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-8">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-3">
                        {/* Main Content - 2/3 width */}
                        <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:col-span-2">
                            {/* Basic Information */}
                            <Card className="overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-900 dark:to-gray-800">
                                <CardHeader className="bg-gradient-to-r from-violet-500 to-indigo-600 p-2 text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl sm:text-2xl">Gallery Information</CardTitle>
                                            <CardDescription className="text-violet-100">Basic details and settings for your gallery</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="p-4 sm:p-5">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <Label htmlFor="title" className="text-base font-semibold text-gray-900 dark:text-white">
                                                Gallery Title *
                                            </Label>
                                            <Input
                                                id="title"
                                                type="text"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                placeholder="Enter a descriptive title..."
                                                className={`mt-2 h-12 text-base ${errors.title || validationErrors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-violet-500'} rounded-lg`}
                                            />
                                            {(errors.title || validationErrors.title) && (
                                                <p className="mt-2 text-sm text-red-600">{errors.title || validationErrors.title}</p>
                                            )}
                                        </div>

                                        <div className="sm:col-span-2">
                                            <Label htmlFor="description" className="text-base font-semibold text-gray-900 dark:text-white">
                                                Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Brief description of your gallery..."
                                                rows={4}
                                                className={`mt-2 text-base ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-violet-500'} resize-none rounded-lg`}
                                            />
                                            {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
                                            <p className="mt-2 text-sm text-gray-500">This will be shown on gallery listings and headers</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Gallery Items */}
                            <Card className="overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-900 dark:to-gray-800">
                                <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                                            <Upload className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl sm:text-2xl">Gallery Items</CardTitle>
                                            <CardDescription className="text-emerald-100">
                                                {galleryItems.length === 0
                                                    ? 'Upload images and videos to your gallery'
                                                    : `${galleryItems.length} item(s) in your gallery`}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="space-y-4 p-4 sm:p-5">
                                    {galleryItems.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900">
                                                <Upload className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Upload Your First Items</h3>
                                            <p className="mb-6 text-gray-600 dark:text-gray-400">Drag and drop files or click to browse</p>
                                            <FileDropzone
                                                onFileSelect={handleBulkFileUpload}
                                                accept={{
                                                    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
                                                    'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
                                                    'audio/*': ['.mp3', '.wav', '.aac', '.ogg', '.m4a'],
                                                }}
                                                maxSize={50 * 1024 * 1024}
                                                maxFiles={20}
                                                multiple={true}
                                                height="lg"
                                                showPreview={false}
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-4 sm:space-y-6">
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                                {galleryItems.map((item) => (
                                                    <Card
                                                        key={item.id}
                                                        className="overflow-hidden border border-gray-200 p-0 transition-shadow hover:shadow-lg dark:border-gray-700"
                                                    >
                                                        <div className="relative">
                                                            {/* Image Preview - Click to Replace */}
                                                            <div
                                                                className="group relative aspect-video cursor-pointer overflow-hidden bg-gray-100 sm:aspect-[4/3] dark:bg-gray-800"
                                                                onClick={() => document.getElementById(`replace-click-${item.id}`)?.click()}
                                                            >
                                                                {/* Hidden file input for click-to-replace */}
                                                                <input
                                                                    type="file"
                                                                    id={`replace-click-${item.id}`}
                                                                    accept="image/*,video/*,audio/*"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            handleItemImageReplace(item.id, file);
                                                                        }
                                                                        e.target.value = '';
                                                                    }}
                                                                    className="hidden"
                                                                />

                                                                {item.file_path ? (
                                                                    <>
                                                                        {item.mime_type?.startsWith('image/') ? (
                                                                            <img
                                                                                src={item.file_path}
                                                                                alt={item.title || 'Gallery item'}
                                                                                className="h-full w-full object-cover"
                                                                                onError={(e) => {
                                                                                    const img = e.currentTarget;
                                                                                    img.style.display = 'none';
                                                                                    const parent = img.parentElement;
                                                                                    if (parent) {
                                                                                        const fallbackDiv = document.createElement('div');
                                                                                        fallbackDiv.className =
                                                                                            'absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900';
                                                                                        fallbackDiv.innerHTML = `
                                                                                            <div class="text-center">
                                                                                                <div class="text-3xl mb-2">⚠️</div>
                                                                                                <span class="text-sm text-red-600 dark:text-red-400">Failed to load</span>
                                                                                            </div>
                                                                                        `;
                                                                                        parent.appendChild(fallbackDiv);
                                                                                    }
                                                                                }}
                                                                            />
                                                                        ) : item.mime_type?.startsWith('video/') ? (
                                                                            <video
                                                                                src={item.file_path}
                                                                                className="h-full w-full cursor-pointer object-cover"
                                                                                controls
                                                                                preload="metadata"
                                                                                playsInline
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    const video = e.currentTarget;
                                                                                    if (video.paused) {
                                                                                        video.play().catch(console.error);
                                                                                    } else {
                                                                                        video.pause();
                                                                                    }
                                                                                }}
                                                                                onError={(e) => {
                                                                                    const video = e.currentTarget;
                                                                                    video.style.display = 'none';
                                                                                    const parent = video.parentElement;
                                                                                    if (parent) {
                                                                                        const fallbackDiv = document.createElement('div');
                                                                                        fallbackDiv.className =
                                                                                            'absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700';
                                                                                        fallbackDiv.innerHTML = `
                                                                                            <div class="text-center">
                                                                                                <div class="text-3xl mb-2">🎥</div>
                                                                                                <span class="text-sm text-gray-600 dark:text-gray-400">Video preview unavailable</span>
                                                                                            </div>
                                                                                        `;
                                                                                        parent.appendChild(fallbackDiv);
                                                                                    }
                                                                                }}
                                                                            />
                                                                        ) : item.mime_type?.startsWith('audio/') ? (
                                                                            <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900">
                                                                                <div className="text-center">
                                                                                    <div className="mb-3 text-4xl">🎵</div>
                                                                                    <audio
                                                                                        src={item.file_path}
                                                                                        controls
                                                                                        preload="metadata"
                                                                                        className="max-w-full"
                                                                                        onError={(e) => {
                                                                                            const audio = e.currentTarget;
                                                                                            audio.style.display = 'none';
                                                                                            const parent = audio.parentElement;
                                                                                            if (parent) {
                                                                                                const fallbackSpan = document.createElement('span');
                                                                                                fallbackSpan.className =
                                                                                                    'text-sm text-gray-600 dark:text-gray-400';
                                                                                                fallbackSpan.textContent =
                                                                                                    'Audio preview unavailable';
                                                                                                parent.appendChild(fallbackSpan);
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                                                                <div className="text-center">
                                                                                    <div className="mb-2 text-3xl">📄</div>
                                                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                                        Unknown File Type
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                        <div className="text-center">
                                                                            <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                                                            <span className="text-sm text-gray-500">Click to add</span>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Action Buttons */}
                                                                <div className="absolute top-2 right-2 flex gap-1">
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() => removeGalleryItem(item.id)}
                                                                        className="h-8 w-8 p-0"
                                                                        title="Delete item"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>

                                                                {/* Featured Badge */}
                                                                {item.is_featured && (
                                                                    <div className="absolute top-2 left-2">
                                                                        <div className="rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                                                                            Featured
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Item Details */}
                                                            <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
                                                                <div>
                                                                    <Label htmlFor={`item-title-${item.id}`} className="text-sm font-medium">
                                                                        Title
                                                                    </Label>
                                                                    <Input
                                                                        id={`item-title-${item.id}`}
                                                                        value={item.title}
                                                                        onChange={(e) => updateGalleryItem(item.id, 'title', e.target.value)}
                                                                        placeholder="Enter title..."
                                                                        className="mt-1 h-8 text-sm sm:h-9 sm:text-base"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <Label htmlFor={`item-caption-${item.id}`} className="text-sm font-medium">
                                                                        Caption
                                                                    </Label>
                                                                    <Textarea
                                                                        id={`item-caption-${item.id}`}
                                                                        value={item.caption}
                                                                        onChange={(e) => updateGalleryItem(item.id, 'caption', e.target.value)}
                                                                        placeholder="Add caption..."
                                                                        rows={2}
                                                                        className="mt-1 resize-none text-xs sm:text-sm"
                                                                    />
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <Switch
                                                                        checked={item.is_featured}
                                                                        onCheckedChange={(checked) =>
                                                                            updateGalleryItem(item.id, 'is_featured', checked)
                                                                        }
                                                                    />
                                                                    <Label className="text-sm">Featured Item</Label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>

                                            {/* Add More Button */}
                                            <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors hover:border-emerald-400 sm:p-6 dark:border-gray-600">
                                                <FileDropzone
                                                    onFileSelect={handleBulkFileUpload}
                                                    accept={{
                                                        'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
                                                        'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
                                                        'audio/*': ['.mp3', '.wav', '.aac', '.ogg', '.m4a'],
                                                    }}
                                                    maxSize={50 * 1024 * 1024}
                                                    maxFiles={20}
                                                    multiple={true}
                                                    height="sm"
                                                    showPreview={false}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar - 1/3 width */}
                        <div className="space-y-4 sm:space-y-6 lg:col-span-1">
                            {/* Featured Image */}
                            <Card className="overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-900 dark:to-gray-800">
                                <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 p-2 text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                                            <ImageIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base sm:text-lg">Featured Image</CardTitle>
                                            <CardDescription className="text-sm text-amber-100">Gallery thumbnail</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="p-4">
                                    <FeaturedImageDropzone
                                        galleryId={gallery?.id || null}
                                        currentImageUrl={featuredImageUrl}
                                        onFileSelect={handleFeaturedImageFileSelect}
                                        onImageUrlChange={handleFeaturedImageUrlChange}
                                    />
                                    {errors.featured_image && <p className="mt-2 text-sm text-red-600">{errors.featured_image}</p>}
                                </div>
                            </Card>

                            {/* Settings */}
                            <Card className="overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-900 dark:to-gray-800">
                                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                                            <Settings className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base sm:text-lg">Settings</CardTitle>
                                            <CardDescription className="text-sm text-blue-100">Gallery configuration</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
                                    <div>
                                        <Label htmlFor="sort_order" className="text-sm font-medium">
                                            Display Order
                                        </Label>
                                        <Input
                                            id="sort_order"
                                            type="number"
                                            value={data.sort_order}
                                            onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                            min={0}
                                            className={`mt-1 ${errors.sort_order ? 'border-red-500' : ''}`}
                                        />
                                        {errors.sort_order && <p className="mt-1 text-sm text-red-600">{errors.sort_order}</p>}
                                        <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium">Publish Status</Label>
                                            <p className="text-sm text-gray-500">{publishNow ? 'Gallery will be public' : 'Save as draft'}</p>
                                        </div>
                                        <Switch checked={publishNow} onCheckedChange={setPublishNow} className="data-[state=checked]:bg-green-600" />
                                    </div>

                                    {isEditing && publishNow !== gallery!.is_published && (
                                        <Alert>
                                            <AlertDescription>
                                                {publishNow
                                                    ? '✅ Gallery will be made public after saving'
                                                    : '📝 Gallery will be unpublished after saving'}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {!isEditing && !publishNow && (
                                        <Alert>
                                            <AlertDescription>📝 Gallery will be saved as draft and can be published later</AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </Card>

                            {/* Actions */}
                            <Card className="overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 p-3 shadow-xl sm:p-4 dark:from-gray-900 dark:to-gray-800">
                                <div className="space-y-2 sm:space-y-3">
                                    <Button
                                        type="submit"
                                        className="h-10 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-medium shadow-lg hover:from-violet-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none sm:h-12 sm:text-base"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                <span className="hidden sm:inline">{loadingStep || 'Processing...'}</span>
                                                <span className="sm:hidden">Processing...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                <Save className="h-4 w-4 sm:h-5 sm:w-5" />
                                                <span className="hidden sm:inline">{isEditing ? 'Update Gallery' : 'Create Gallery'}</span>
                                                <span className="sm:hidden">{isEditing ? 'Update' : 'Create'}</span>
                                            </div>
                                        )}
                                    </Button>

                                    <Link href={route('admin.galleries.index')} className="w-full">
                                        <Button variant="outline" className="h-10 w-full text-sm font-medium sm:h-12 sm:text-base" type="button">
                                            Cancel
                                        </Button>
                                    </Link>
                                </div>
                            </Card>

                            {/* Gallery Details - Only show for existing galleries */}
                            {isEditing && (
                                <Card className="overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-900 dark:to-gray-800">
                                    <CardHeader className="pb-1">
                                        <CardTitle className="text-sm sm:text-base">Gallery Details</CardTitle>
                                    </CardHeader>
                                    <div className="space-y-2 p-3 pt-0 sm:space-y-3 sm:p-4 sm:pt-1">
                                        <div className="grid grid-cols-1 gap-2 text-xs sm:gap-3 sm:text-sm">
                                            <div>
                                                <Label className="text-gray-600 dark:text-gray-400">Slug</Label>
                                                <p className="rounded bg-gray-100 p-2 font-mono text-xs sm:text-sm dark:bg-gray-800">
                                                    {gallery!.slug}
                                                </p>
                                            </div>
                                            <div>
                                                <Label className="text-gray-600 dark:text-gray-400">Created</Label>
                                                <p>{new Date(gallery!.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <Label className="text-gray-600 dark:text-gray-400">Last Updated</Label>
                                                <p>{new Date(gallery!.updated_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* Loading Overlay Modal */}
            {isSubmitting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                        <div className="text-center">
                            {/* Animated Spinner */}
                            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-violet-600"></div>

                            {/* Current Step */}
                            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Processing Gallery</h3>

                            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{loadingStep || 'Please wait...'}</p>

                            {/* Progress Bar for File Uploads */}
                            {uploadProgress.total > 0 && (
                                <div className="mb-4">
                                    <div className="mb-2 flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                        <span>File Upload Progress</span>
                                        <span>
                                            {uploadProgress.current} of {uploadProgress.total}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                        <div
                                            className="h-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300"
                                            style={{
                                                width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Warning Message */}
                            <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                    Please don't close this window or navigate away. Multiple operations are in progress.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
