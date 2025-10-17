import { lazy, Suspense } from 'react';

const RichTextEditor = lazy(() => import('./rich-text-editor'));

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    height?: number;
    disabled?: boolean;
}

export default function RichTextEditorLazy(props: RichTextEditorProps) {
    return (
        <Suspense 
            fallback={
                <div 
                    className="animate-pulse border rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                    style={{ height: props.height || 300 }}
                >
                    <div className="text-gray-500 dark:text-gray-400">Loading editor...</div>
                </div>
            }
        >
            <RichTextEditor {...props} />
        </Suspense>
    );
}