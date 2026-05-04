"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  minHeight?: string;
}

type ToolbarButtonProps = {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded-lg text-sm transition-all duration-150 hover:bg-orange-50 hover:text-[#88542b]",
        isActive
          ? "bg-orange-100 text-[#88542b] font-semibold"
          : "text-slate-500",
        disabled && "opacity-30 cursor-not-allowed hover:bg-transparent hover:text-slate-500"
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Yahan likhein...",
  className,
  maxLength = 5000,
  minHeight = "150px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-slate-400 before:float-left before:h-0 before:pointer-events-none",
      }),
      CharacterCount.configure({ limit: maxLength }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      const isEmpty = editor.isEmpty;
      onChange?.(isEmpty ? "" : html);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none px-4 py-3 text-slate-800",
          "prose-headings:text-slate-800 prose-headings:font-bold",
          "prose-p:text-slate-700 prose-p:leading-relaxed",
          "prose-strong:text-slate-900 prose-em:text-slate-700",
          "prose-ul:text-slate-700 prose-ol:text-slate-700",
          "prose-blockquote:border-l-[#88542b] prose-blockquote:text-slate-600"
        ),
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // ✅ FIX: Sync external value → editor when data loads asynchronously (edit mode)
  // Only update if editor is not focused (to avoid cursor jump while typing)
  useEffect(() => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    // Normalize: empty editor returns "<p></p>", treat as ""
    const currentContent = editor.isEmpty ? "" : currentHTML;
    const incomingValue = value ?? "";
    if (incomingValue !== currentContent && !editor.isFocused) {
      editor.commands.setContent(incomingValue || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;


  const charCount = editor.storage.characterCount.characters();
  const percentage = Math.round((charCount / maxLength) * 100);

  return (
    <div
      className={cn(
        "border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#88542b] focus-within:ring-1 focus-within:ring-[#88542b]/30 transition-all duration-200 bg-white",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-2 border-b border-slate-100 bg-slate-50/70 flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        {/* Character Count */}
        <div className="ml-auto flex items-center gap-2">
          <div
            className={cn(
              "text-[10px] font-medium tabular-nums",
              percentage > 90 ? "text-red-500" : percentage > 70 ? "text-amber-500" : "text-slate-400"
            )}
          >
            {charCount}/{maxLength}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}

export default RichTextEditor;
