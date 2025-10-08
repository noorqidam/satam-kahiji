import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface AssignmentSearchFiltersProps {
    staffSearch: string;
    subjectSearch: string;
    onStaffSearchChange: (value: string) => void;
    onSubjectSearchChange: (value: string) => void;
}

export function AssignmentSearchFilters({ staffSearch, subjectSearch, onStaffSearchChange, onSubjectSearchChange }: AssignmentSearchFiltersProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Staff Search</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search staff by name, position..."
                            value={staffSearch}
                            onChange={(e) => onStaffSearchChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Subject Search</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search subjects by name, code..."
                            value={subjectSearch}
                            onChange={(e) => onSubjectSearchChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
