import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type RequiredPasswordResetForm = {
    current_password: string;
    password: string;
    password_confirmation: string;
};

export default function RequiredPasswordReset() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RequiredPasswordResetForm>>({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.password.reset.update'), {
            onFinish: () => reset('current_password', 'password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Password Reset Required" description="You must reset your password before continuing">
            <Head title="Password Reset Required" />

            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                <div className="flex">
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Password Reset Required</h3>
                        <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                            <p>
                                Your account was created by an administrator with a temporary password. For security reasons, you must change your
                                password before accessing the system.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Reset Your Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6" onSubmit={submit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="current_password">Current (Temporary) Password</Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="current-password"
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    disabled={processing}
                                    placeholder="Enter your temporary password"
                                />
                                <InputError message={errors.current_password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    disabled={processing}
                                    placeholder="Enter your new password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    disabled={processing}
                                    placeholder="Confirm your new password"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button type="submit" className="mt-6 w-full" tabIndex={4} disabled={processing}>
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Reset Password
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
