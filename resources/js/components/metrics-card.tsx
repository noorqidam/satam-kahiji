import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface MetricsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
    gradient?: string;
}

export function MetricsCard({ title, value, description, icon: Icon, trend, className, gradient }: MetricsCardProps) {
    const defaultGradient = 'from-blue-500/10 via-purple-500/10 to-pink-500/10';
    const cardGradient = gradient || defaultGradient;

    return (
        <Card
            className={cn(
                'relative overflow-hidden border-0 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg',
                `bg-gradient-to-br ${cardGradient}`,
                'backdrop-blur-sm',
                className,
            )}
        >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 dark:to-transparent" />
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {Icon && (
                    <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm dark:bg-white/10">
                        <Icon className="h-4 w-4 text-foreground/70" />
                    </div>
                )}
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-foreground">{value}</div>
                {(description || trend) && (
                    <div className="mt-1 flex items-center gap-2">
                        {trend && (
                            <span
                                className={`text-xs font-medium ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                            >
                                {trend.isPositive ? '+' : ''}
                                {trend.value}%
                            </span>
                        )}
                        {description && <p className="text-xs text-muted-foreground">{description}</p>}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
