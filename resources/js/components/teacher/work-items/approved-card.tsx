import { CheckCircle } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

interface ApprovedCardProps {
    approvedCount: number;
    totalCount: number;
}

export function ApprovedCard({ approvedCount, totalCount }: ApprovedCardProps) {
    if (totalCount === 0) {
        return null;
    }

    return (
        <Card className="fixed right-4 bottom-4 z-40 w-auto max-w-[140px] border border-green-200/50 bg-green-50/80 shadow-sm backdrop-blur-sm transition-all hover:shadow-md sm:right-6 sm:bottom-6 dark:border-green-700/30 dark:bg-green-900/20">
            <CardContent className="p-2.5 sm:p-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 dark:bg-green-400/20">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-green-700 dark:text-green-300">
                            {approvedCount}/{totalCount} approved
                        </p>
                        <p className="text-xs text-green-600 opacity-75 dark:text-green-400">{Math.round((approvedCount / totalCount) * 100)}%</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
