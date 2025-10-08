export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Jakarta',
    });
};

export const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const getCategoryLabel = (category: 'news' | 'announcements') => {
    return category === 'news' ? 'Berita' : 'Pengumuman';
};

export const getCategoryStyle = (category: 'news' | 'announcements') => {
    return category === 'news' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-emerald-500 bg-emerald-50 text-emerald-600';
};

export const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
};
