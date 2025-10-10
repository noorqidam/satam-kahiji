import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

type LanguageForm = {
    language: string;
};

export default function Language({ currentLanguage }: { currentLanguage?: string }) {
    const { t, i18n } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('settings.language.breadcrumb'),
            href: '/settings/language',
        },
    ];

    const { data, setData, patch, processing, recentlySuccessful } = useForm<LanguageForm>({
        language: currentLanguage || i18n.language,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('settings.language.update'), {
            preserveScroll: true,
            onSuccess: () => {
                // Update the i18n language and localStorage
                i18n.changeLanguage(data.language);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('i18nextLng', data.language);
                }
            },
        });
    };

    const handleLanguageChange = (value: string) => {
        setData('language', value);
        // Immediately change the language for preview
        i18n.changeLanguage(value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.language.page_title')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={t('settings.language.section_title')} description={t('settings.language.section_description')} />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-4">
                            <Label htmlFor="language" className="text-sm font-medium">
                                {t('settings.language.form.language_label')}
                            </Label>

                            <p className="text-sm text-muted-foreground">{t('settings.language.form.language_description')}</p>

                            <Select value={data.language} onValueChange={handleLanguageChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t('settings.language.form.language_label')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">
                                        <div className="flex w-full items-center justify-between">
                                            <span>{t('settings.language.languages.en')}</span>
                                            <span className="ml-2 text-sm text-muted-foreground">EN</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="id">
                                        <div className="flex w-full items-center justify-between">
                                            <span>{t('settings.language.languages.id')}</span>
                                            <span className="ml-2 text-sm text-muted-foreground">ID</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                {t('settings.language.form.save_button')}
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-muted-foreground">{t('settings.language.form.saved_message')}</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
