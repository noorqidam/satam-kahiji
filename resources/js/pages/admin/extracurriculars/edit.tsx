import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import ExtracurricularForm from '@/components/extracurricular/extracurricular-form';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { ExtracurricularWithPhoto } from '@/types/extracurricular';
import { extracurricularUtils } from '@/utils/extracurricular-utils';

interface ExtracurricularEditProps {
    extracurricular: ExtracurricularWithPhoto;
}

export default function ExtracurricularEdit({ extracurricular }: ExtracurricularEditProps) {
    const breadcrumbs = extracurricularUtils.createBreadcrumbs(extracurricular);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${extracurricular.name}`} />

            <div className="space-y-6 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">Edit Extracurricular Activity</h1>
                        <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">Update {extracurricular.name} details</p>
                    </div>
                    <Link href={route('admin.extracurriculars.index')}>
                        <Button variant="outline" className="w-full sm:w-auto">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Activities
                        </Button>
                    </Link>
                </div>

                <div className="mx-auto max-w-2xl">
                    <ExtracurricularForm extracurricular={extracurricular} isEditing={true} />
                </div>
            </div>
        </AppLayout>
    );
}
