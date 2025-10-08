import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';
import type { Editor as TinyMCEEditor } from 'tinymce';

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    height?: number;
    disabled?: boolean;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Enter text...', height = 300, disabled = false }: RichTextEditorProps) {
    const editorRef = useRef<Editor | null>(null);

    return (
        <div className="rich-text-editor">
            <Editor
                ref={editorRef}
                apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                value={value}
                onEditorChange={(content) => onChange(content)}
                disabled={disabled}
                init={{
                    height,
                    menubar: false,
                    plugins: [
                        'advlist',
                        'autolink',
                        'lists',
                        'link',
                        'image',
                        'charmap',
                        'preview',
                        'anchor',
                        'searchreplace',
                        'visualblocks',
                        'code',
                        'fullscreen',
                        'insertdatetime',
                        'media',
                        'table',
                        'code',
                        'help',
                        'wordcount',
                    ],
                    toolbar:
                        'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | help',
                    content_style:
                        'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; line-height: 1.6; }',
                    placeholder,
                    branding: false,
                    resize: false,
                    statusbar: false,
                    setup: (editor: TinyMCEEditor) => {
                        editor.on('init', () => {
                            console.log('TinyMCE editor initialized successfully');
                        });
                        editor.on('change', () => {
                            console.log('TinyMCE content changed');
                        });
                    },
                }}
            />
        </div>
    );
}
