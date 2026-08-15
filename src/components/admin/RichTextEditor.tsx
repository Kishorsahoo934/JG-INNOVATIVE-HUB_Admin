import React, { useEffect, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { productsApi } from '@/services/adminApi';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter detailed product description...',
}) => {
  const extensions = useMemo(
    () => [
      StarterKit,
      Link.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    [placeholder]
  );

  const editor = useEditor({
    extensions,
    content: value || '',
    editorProps: {
      attributes: {
        class: 'input-field min-h-[120px] prose prose-sm max-w-none',
      },
      handlePaste: (view, event) => {
        const clipboard = event.clipboardData;
        if (!clipboard) return false;

        const imageFiles: File[] = [];
        for (const item of Array.from(clipboard.items)) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) imageFiles.push(file);
          }
        }

        if (imageFiles.length === 0) return false;

        event.preventDefault();

        const html = clipboard.getData('text/html');
        const text = clipboard.getData('text/plain');
        if (html) {
          editor?.commands.insertContent(html);
        } else if (text) {
          editor?.commands.insertContent(text);
        }

        imageFiles.forEach(async (file) => {
          const url = await productsApi.uploadEditorImage(file);
          editor?.chain().focus().setImage({ src: url }).run();
        });
        return true;
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (moved) return false;
        const files = Array.from(event.dataTransfer?.files || []).filter((f) =>
          f.type.startsWith('image/')
        );
        if (!files.length) return false;
        event.preventDefault();
        files.forEach(async (file) => {
          const url = await productsApi.uploadEditorImage(file);
          editor?.chain().focus().setImage({ src: url }).run();
        });
        return true;
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || '';
    if (current !== next) {
      editor.commands.setContent(next, false);
    }
  }, [editor, value]);

  return <EditorContent editor={editor} />;
};

export default RichTextEditor;
