import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    Cloud,
    CloudOff,
    Database,
    Edit,
    HardDrive,
    RefreshCw,
    Server,
    Settings,
    Timer,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface TokenData {
    service_name: string;
    expires_at: string | null;
    expires_at_human: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_at_human: string;
    updated_at_human: string;
    access_token_preview: string | null;
    access_token_full: string | null;
    refresh_token_full: string | null;
    token_data_keys: string[];
}

interface ConfigData {
    filesystem_default: string;
    google_drive_configured: boolean;
    client_id_preview: string | null;
    folder_id: string | null;
}

interface GoogleDriveDashboardProps {
    token: TokenData | null;
    status: 'healthy' | 'warning' | 'critical' | 'expired' | 'error' | 'no_token' | 'unknown' | 'info';
    statusMessage: string;
    timeUntilExpiry: number | null;
    lastRefresh: string | null;
    config: ConfigData;
}

export default function GoogleDriveDashboard({ token, status, statusMessage, timeUntilExpiry, lastRefresh, config }: GoogleDriveDashboardProps) {
    const [mounted, setMounted] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        access_token: '',
        refresh_token: '',
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: route('admin.dashboard') },
        { title: 'Google Drive Monitor', href: route('admin.google-drive.dashboard') },
    ];

    // Calculate health score
    const getHealthScore = () => {
        if (!token || status === 'no_token') return 0;
        if (status === 'expired' || status === 'error') return 0;
        if (status === 'critical') return 25;
        if (status === 'warning') return 50;
        if (status === 'info') return 75;
        if (status === 'healthy') return 100;
        return 0;
    };

    const healthScore = getHealthScore();

    // Calculate time-based progress
    const getTimeProgress = () => {
        if (!timeUntilExpiry) return 0;
        if (timeUntilExpiry <= 0) return 0;
        if (timeUntilExpiry >= 24) return 100;
        return Math.max(0, (timeUntilExpiry / 24) * 100);
    };

    const getStatusColor = () => {
        switch (status) {
            case 'healthy':
                return 'text-green-600 dark:text-green-400';
            case 'info':
                return 'text-blue-600 dark:text-blue-400';
            case 'warning':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'critical':
                return 'text-orange-600 dark:text-orange-400';
            case 'expired':
            case 'error':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'info':
                return <Clock className="h-5 w-5 text-blue-500" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'critical':
                return <AlertTriangle className="h-5 w-5 text-orange-500" />;
            case 'expired':
            case 'error':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'no_token':
                return <CloudOff className="h-5 w-5 text-gray-500" />;
            default:
                return <Cloud className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusBadgeVariant = () => {
        switch (status) {
            case 'healthy':
                return 'default';
            case 'info':
                return 'secondary';
            case 'warning':
                return 'outline';
            case 'critical':
            case 'expired':
            case 'error':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const handleEditToken = () => {
        // Show current token values when editing
        setData({
            access_token: token?.access_token_full || '',
            refresh_token: token?.refresh_token_full || '',
        });
        setEditDialogOpen(true);
    };

    const handleUpdateToken = (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side validation
        if (!data.access_token.trim() || !data.refresh_token.trim()) {
            alert('Both access token and refresh token are required.');
            return;
        }

        put(route('admin.google-drive.token.update'), {
            onSuccess: () => {
                setEditDialogOpen(false);
                reset();
                // Refresh the page data
                router.reload({ only: ['token', 'status', 'statusMessage', 'timeUntilExpiry', 'lastRefresh'] });
            },
            onError: (errors) => {
                console.error('Token update failed:', errors);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Google Drive Token Monitor" />

            <div
                className={`w-full max-w-none space-y-6 px-4 pb-3 transition-all duration-500 sm:px-6 lg:px-8 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            >
                {/* Enhanced Hero Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 shadow-2xl">
                    {/* Background Pattern */}
                    <div className="bg-grid-white/[0.05] absolute inset-0 bg-[size:20px_20px]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-600/50 to-indigo-800/50" />

                    {/* Floating Orbs */}
                    <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

                    <div className="relative">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-6">
                                <div className="group relative">
                                    <div className="absolute -inset-1 rounded-xl bg-white/20 opacity-75 blur transition duration-300 group-hover:opacity-100" />
                                    <div className="relative flex h-20 w-20 items-center justify-center rounded-xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-sm">
                                        <Cloud
                                            className={`h-10 w-10 text-white transition-all duration-300 ${mounted ? 'scale-100 rotate-0' : 'scale-50 rotate-45'}`}
                                        />
                                    </div>
                                </div>
                                <div className="text-white">
                                    <h1 className="mb-2 text-3xl font-bold lg:text-4xl">Google Drive Monitor</h1>
                                    <p className="text-lg text-blue-100">Real-time authentication & storage monitoring</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button
                                    onClick={handleEditToken}
                                    variant="outline"
                                    size="lg"
                                    className="border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20"
                                >
                                    <Edit className="mr-2 h-5 w-5" />
                                    Edit Token
                                </Button>
                            </div>
                        </div>

                        {/* Live Status Indicator */}
                        <div className="mt-8 flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className={`h-3 w-3 rounded-full ${status === 'healthy' ? 'animate-pulse bg-green-400' : status === 'warning' || status === 'info' ? 'animate-pulse bg-yellow-400' : 'animate-pulse bg-red-400'}`}
                                />
                                <span className="font-medium text-white/90">Live Status</span>
                            </div>
                            <div className="hidden h-6 w-px bg-white/20 sm:block" />
                            <div className="text-sm text-white/80">Last updated: {new Date().toLocaleTimeString()}</div>
                        </div>
                    </div>
                </div>

                {/* Status Overview Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Health Score */}
                    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-emerald-100 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:from-green-900/20 dark:to-emerald-900/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="mb-1 text-sm font-medium text-green-800 dark:text-green-200">System Health</p>
                                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">{healthScore}%</p>
                                </div>
                                <div className="rounded-full bg-green-500/20 p-3">
                                    <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <Progress value={healthScore} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Token Expiry */}
                    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-cyan-100 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:from-blue-900/20 dark:to-cyan-900/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="mb-1 text-sm font-medium text-blue-800 dark:text-blue-200">Token Validity</p>
                                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                                        {timeUntilExpiry !== null ? `${Math.round(Math.abs(timeUntilExpiry * 10)) / 10}h` : '—'}
                                    </p>
                                </div>
                                <div className="rounded-full bg-blue-500/20 p-3">
                                    <Timer className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <Progress value={getTimeProgress()} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Connection Status */}
                    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-indigo-100 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:from-purple-900/20 dark:to-indigo-900/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="mb-1 text-sm font-medium text-purple-800 dark:text-purple-200">Connection</p>
                                    <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                                        {config.google_drive_configured ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                                <div className="rounded-full bg-purple-500/20 p-3">
                                    <Database className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <Badge variant={config.google_drive_configured ? 'default' : 'secondary'} className="w-full justify-center">
                                    {config.google_drive_configured ? 'Connected' : 'Disconnected'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Storage Type */}
                    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-amber-100 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:from-orange-900/20 dark:to-amber-900/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="mb-1 text-sm font-medium text-orange-800 dark:text-orange-200">Storage</p>
                                    <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                                        {config.filesystem_default === 'google_drive' ? 'Google Drive' : 'Local'}
                                    </p>
                                </div>
                                <div className="rounded-full bg-orange-500/20 p-3">
                                    <HardDrive className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <Badge
                                    variant={config.filesystem_default === 'google_drive' ? 'default' : 'outline'}
                                    className="w-full justify-center"
                                >
                                    {config.filesystem_default}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    {/* Main Content Area */}
                    <div className="space-y-6 xl:col-span-2">
                        {/* Enhanced Status Card */}
                        <Card className="group hover:shadow-3xl relative gap-0 overflow-hidden border-0 py-0 shadow-2xl transition-all duration-500">
                            {/* Animated background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                            <CardHeader className="relative rounded-t-lg bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 p-6 text-white">
                                <div className="absolute inset-0 opacity-10">
                                    <div className="h-full w-full bg-gradient-to-br from-white/5 to-transparent" />
                                </div>
                                <div className="relative flex items-center gap-4">
                                    <div className="relative">
                                        <div className="absolute -inset-2 rounded-xl bg-white/20 opacity-50 blur" />
                                        <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
                                            {getStatusIcon()}
                                        </div>
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold">Authentication Status</CardTitle>
                                        <CardDescription className="mt-1 text-purple-100">
                                            Real-time token monitoring and health check
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="relative p-8">
                                <div className="space-y-6">
                                    {/* Status Display */}
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon()}
                                                    <span className={`text-2xl font-bold ${getStatusColor()}`}>{statusMessage}</span>
                                                </div>
                                                <Badge variant={getStatusBadgeVariant()} className="px-3 py-1 text-xs font-semibold">
                                                    {status.toUpperCase()}
                                                </Badge>
                                            </div>

                                            <div className="space-y-2">
                                                {timeUntilExpiry !== null && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <Clock className="h-4 w-4" />
                                                        <span>
                                                            {timeUntilExpiry > 0
                                                                ? `Expires in ${timeUntilExpiry < 1 ? Math.round(timeUntilExpiry * 60) + ' minutes' : Math.round(timeUntilExpiry * 10) / 10 + ' hours'}`
                                                                : `Expired ${Math.abs(Math.round(timeUntilExpiry * 10) / 10)} hours ago`}
                                                        </span>
                                                    </div>
                                                )}

                                                {lastRefresh && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <RefreshCw className="h-4 w-4" />
                                                        <span>Last refreshed: {lastRefresh}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Alert Messages */}
                                    {(status === 'expired' || status === 'critical') && (
                                        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                                            <AlertTriangle className="h-5 w-5" />
                                            <AlertDescription className="text-red-800 dark:text-red-200">
                                                {status === 'expired'
                                                    ? 'Your Google Drive token has expired. File uploads may fail until the token is refreshed.'
                                                    : 'Your Google Drive token expires very soon. Consider refreshing it now to prevent service interruption.'}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {status === 'no_token' && (
                                        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                                            <CloudOff className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            <AlertDescription className="text-blue-800 dark:text-blue-200">
                                                No Google Drive token found. Please run the setup command to authenticate with Google Drive.
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {(status === 'healthy' || status === 'info') && (
                                        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            <AlertDescription className="text-green-800 dark:text-green-200">
                                                Google Drive integration is working properly. All systems operational.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Enhanced Token Details */}
                        {token && (
                            <Card className="group hover:shadow-3xl relative gap-0 overflow-hidden border-0 py-0 shadow-2xl transition-all duration-500">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                                <CardHeader className="relative rounded-t-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                                            <Settings className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold">Token Information</CardTitle>
                                            <CardDescription className="text-purple-100">Detailed authentication data</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="relative p-6">
                                    <div className="space-y-6">
                                        {/* Token Metadata Grid */}
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Server className="h-4 w-4 text-indigo-500" />
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Service</label>
                                                </div>
                                                <p className="ml-6 text-lg font-medium text-gray-900 dark:text-gray-100">{token.service_name}</p>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Activity className="h-4 w-4 text-green-500" />
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</label>
                                                </div>
                                                <div className="ml-6">
                                                    <Badge variant={token.is_active ? 'default' : 'secondary'} className="px-3 py-1">
                                                        {token.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-blue-500" />
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Expires</label>
                                                </div>
                                                <p className="ml-6 text-sm text-gray-900 dark:text-gray-100">{token.expires_at_human || 'Unknown'}</p>
                                            </div>
                                        </div>

                                        <Separator className="my-6" />

                                        {/* Timeline and Security Preview - Side by Side Layout */}
                                        <div className="col-span-full">
                                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                                {/* Timeline - Left Column */}
                                                <div className="space-y-4">
                                                    <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                                                        <Clock className="h-4 w-4" />
                                                        Timeline
                                                    </h4>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-3 rounded-lg border border-blue-200/50 bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 dark:border-blue-800/50 dark:from-blue-900/20 dark:to-blue-800/20">
                                                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20">
                                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                                                    Token Created
                                                                </p>
                                                                <p className="text-xs text-blue-700 dark:text-blue-300">{token.created_at_human}</p>
                                                                <p className="mt-1 truncate text-xs text-blue-600 dark:text-blue-400">
                                                                    {token.created_at}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 rounded-lg border border-green-200/50 bg-gradient-to-r from-green-50 to-green-100/50 p-4 dark:border-green-800/50 dark:from-green-900/20 dark:to-green-800/20">
                                                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20">
                                                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                                                                    Last Updated
                                                                </p>
                                                                <p className="text-xs text-green-700 dark:text-green-300">{token.updated_at_human}</p>
                                                                <p className="mt-1 truncate text-xs text-green-600 dark:text-green-400">
                                                                    {token.updated_at}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Security Preview - Right Column */}
                                                {token.access_token_preview && (
                                                    <div className="space-y-4">
                                                        <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                                                            <Settings className="h-4 w-4" />
                                                            Security Preview
                                                        </h4>
                                                        <div className="rounded-xl border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4 shadow-lg dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20">
                                                            <div className="mb-3 flex items-center gap-2">
                                                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/20">
                                                                    <Settings className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                                                                </div>
                                                                <label className="text-xs font-bold tracking-wide text-indigo-900 uppercase dark:text-indigo-100">
                                                                    Access Token
                                                                </label>
                                                            </div>
                                                            <div className="rounded-lg bg-white/80 p-3 backdrop-blur-sm dark:bg-gray-800/80">
                                                                <p className="font-mono text-xs leading-relaxed break-all text-gray-800 dark:text-gray-200">
                                                                    {token.access_token_preview}
                                                                </p>
                                                            </div>
                                                            <p className="mt-2 flex items-center gap-1 text-xs text-indigo-700 dark:text-indigo-300">
                                                                <Settings className="h-3 w-3 flex-shrink-0" />
                                                                <span className="truncate">Only first 20 chars shown</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Enhanced Sidebar */}
                    <div className="space-y-6">
                        {/* System Configuration */}
                        <Card className="group hover:shadow-3xl relative gap-0 overflow-hidden border-0 py-0 shadow-2xl transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-500/5 via-gray-500/5 to-zinc-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                            <CardHeader className="relative rounded-t-lg bg-gradient-to-r from-slate-800 via-gray-800 to-zinc-800 p-6 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                                        <Server className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-bold">System Configuration</CardTitle>
                                        <CardDescription className="text-gray-200">Current environment settings</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="relative space-y-6 p-6">
                                {/* Configuration Grid */}
                                <div className="space-y-4">
                                    <div className="rounded-xl border border-blue-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-blue-800/50 dark:from-blue-900/20 dark:to-indigo-900/20">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <HardDrive className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Default Storage</span>
                                            </div>
                                            <Badge
                                                variant={config.filesystem_default === 'google_drive' ? 'default' : 'secondary'}
                                                className="font-medium"
                                            >
                                                {config.filesystem_default === 'google_drive' ? 'Google Drive' : 'Local Storage'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-green-200/50 bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:border-green-800/50 dark:from-green-900/20 dark:to-emerald-900/20">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Database className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                <span className="text-sm font-semibold text-green-900 dark:text-green-100">API Configuration</span>
                                            </div>
                                            <Badge variant={config.google_drive_configured ? 'default' : 'destructive'} className="font-medium">
                                                {config.google_drive_configured ? 'Configured' : 'Missing'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Configuration Details */}
                                <div className="space-y-4">
                                    {config.client_id_preview && (
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                                            <label className="text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                                Client ID
                                            </label>
                                            <p className="mt-1 font-mono text-sm break-all text-gray-800 dark:text-gray-200">
                                                {config.client_id_preview}
                                            </p>
                                        </div>
                                    )}

                                    {config.folder_id && (
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                                            <label className="text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                                Default Folder
                                            </label>
                                            <p className="mt-1 font-mono text-sm break-all text-gray-800 dark:text-gray-200">{config.folder_id}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Edit Token Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5" />
                            Edit Google Drive Token
                        </DialogTitle>
                        <DialogDescription>
                            Update the Google Drive authentication tokens. Both access token and refresh token are required. Expiry and status will be
                            set automatically.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUpdateToken} className="space-y-6">
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="access_token">Access Token *</Label>
                                <Input
                                    id="access_token"
                                    type="text"
                                    value={data.access_token}
                                    onChange={(e) => setData('access_token', e.target.value)}
                                    placeholder="Enter new access token"
                                    required
                                    className={errors.access_token ? 'border-red-500' : ''}
                                />
                                {errors.access_token && <p className="text-sm text-red-500">{errors.access_token}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="refresh_token">Refresh Token *</Label>
                                <Input
                                    id="refresh_token"
                                    type="text"
                                    value={data.refresh_token}
                                    onChange={(e) => setData('refresh_token', e.target.value)}
                                    placeholder="Enter new refresh token"
                                    required
                                    className={errors.refresh_token ? 'border-red-500' : ''}
                                />
                                {errors.refresh_token && <p className="text-sm text-red-500">{errors.refresh_token}</p>}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Token'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
