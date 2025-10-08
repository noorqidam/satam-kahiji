import {
    ALL_PREDEFINED_ACTIVITIES,
    BaseExtracurricular,
    EXTRACURRICULAR_CATEGORIES,
    ExtracurricularCategory,
    ExtracurricularWithStats,
    PREDEFINED_ACTIVITIES,
} from '@/types/extracurricular';

export class ExtracurricularUtils {
    static isPredefinedActivity(name: string): boolean {
        return ALL_PREDEFINED_ACTIVITIES.includes(name);
    }

    static getCategoryForActivity(activityName: string): ExtracurricularCategory | null {
        for (const [category, activities] of Object.entries(PREDEFINED_ACTIVITIES)) {
            if (activities.includes(activityName)) {
                return category as ExtracurricularCategory;
            }
        }
        return null;
    }

    static getActivitiesByCategory(category: ExtracurricularCategory): string[] {
        return PREDEFINED_ACTIVITIES[category] || [];
    }

    static getAllCategories(): ExtracurricularCategory[] {
        return Object.values(EXTRACURRICULAR_CATEGORIES);
    }

    static formatStudentCount(count: number): string {
        if (count === 0) return 'No students';
        if (count === 1) return '1 student';
        return `${count} students`;
    }

    static formatDate(dateString: string): string {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return 'Invalid date';
        }
    }

    static generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    static truncateDescription(description: string | undefined, maxLength: number = 100): string {
        if (!description) return '-';
        if (description.length <= maxLength) return description;
        return description.substring(0, maxLength) + '...';
    }

    static sortExtracurriculars(
        extracurriculars: ExtracurricularWithStats[],
        sortBy: 'name' | 'students_count' | 'created_at' = 'name',
        sortOrder: 'asc' | 'desc' = 'asc',
    ): ExtracurricularWithStats[] {
        return [...extracurriculars].sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'students_count':
                    comparison = a.students_count - b.students_count;
                    break;
                case 'created_at':
                    comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    break;
            }

            return sortOrder === 'desc' ? -comparison : comparison;
        });
    }

    static filterExtracurriculars(
        extracurriculars: ExtracurricularWithStats[],
        searchTerm: string,
        category?: ExtracurricularCategory,
    ): ExtracurricularWithStats[] {
        return extracurriculars.filter((extracurricular) => {
            const matchesSearch =
                !searchTerm ||
                extracurricular.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (extracurricular.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

            const matchesCategory = !category || this.getCategoryForActivity(extracurricular.name) === category;

            return matchesSearch && matchesCategory;
        });
    }

    static getDefaultPhotoUrl(activityName: string): string {
        const category = this.getCategoryForActivity(activityName);

        switch (category) {
            case EXTRACURRICULAR_CATEGORIES.SPORTS:
                return '/images/defaults/sports.svg';
            case EXTRACURRICULAR_CATEGORIES.ARTS_CULTURE:
                return '/images/defaults/arts.svg';
            case EXTRACURRICULAR_CATEGORIES.ACADEMIC_SCIENCE:
                return '/images/defaults/academic.svg';
            case EXTRACURRICULAR_CATEGORIES.COMMUNITY_SERVICE:
                return '/images/defaults/service.svg';
            case EXTRACURRICULAR_CATEGORIES.RELIGION_CHARACTER:
                return '/images/defaults/character.svg';
            default:
                return '/images/defaults/activity.svg';
        }
    }

    static validateExtracurricularName(name: string): string | null {
        if (!name || !name.trim()) {
            return 'Activity name is required.';
        }

        if (name.trim().length < 3) {
            return 'Activity name must be at least 3 characters long.';
        }

        if (name.trim().length > 255) {
            return 'Activity name must not exceed 255 characters.';
        }

        return null;
    }

    static validateDescription(description: string): string | null {
        if (description && description.length > 1000) {
            return 'Description must not exceed 1000 characters.';
        }

        return null;
    }

    static createBreadcrumbs(extracurricular?: BaseExtracurricular) {
        const baseBreadcrumbs = [
            { title: 'Admin Dashboard', href: '/admin/dashboard' },
            { title: 'Extracurricular Management', href: '/admin/extracurriculars' },
        ];

        if (extracurricular) {
            baseBreadcrumbs.push({
                title: extracurricular.name,
                href: `/admin/extracurriculars/${extracurricular.id}`,
            });
        }

        return baseBreadcrumbs;
    }
}

export const extracurricularUtils = ExtracurricularUtils;
