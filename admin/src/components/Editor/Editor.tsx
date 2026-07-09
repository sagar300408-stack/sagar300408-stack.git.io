import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Toolbar from './Toolbar';
import { Sparkles, Save, Clock, ChevronDown } from 'lucide-react';

interface OCEEditorProps {
  initialContent?: any;
  onChange?: (json: any) => void;
  title?: string;
  onTitleChange?: (title: string) => void;
  status?: string;
  lastSaved?: string;
}

export default function OCEEditor({ 
  initialContent = {}, 
  onChange, 
  title = '', 
  onTitleChange,
  status = 'Draft',
  lastSaved = 'Not saved'
}: OCEEditorProps) {
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-md max-w-full my-4 border border-border',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue hover:underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Press "/" for commands, or start writing...',
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none min-h-[500px] focus:outline-none py-6 px-8',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
  });

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Editor Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            placeholder="Insight Title"
            className="text-4xl font-serif font-medium bg-transparent border-none focus:outline-none focus:ring-0 text-text-primary placeholder:text-text-muted w-full max-w-2xl"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary bg-surface px-3 py-1.5 rounded-full border border-border">
            <span className="w-2 h-2 rounded-full bg-amber"></span>
            {status}
          </div>
          
          <div className="flex items-center gap-1 text-sm text-text-muted">
            <Clock size={14} />
            <span>{lastSaved}</span>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsAiMenuOpen(!isAiMenuOpen)}
              className="flex items-center gap-2 bg-gradient-to-r from-accent to-accent-light text-white px-4 py-2 rounded-md font-medium text-sm shadow-sm hover:shadow transition-all"
            >
              <Sparkles size={16} />
              AI Assistant
              <ChevronDown size={14} />
            </button>
            
            {/* AI Menu Dropdown */}
            {isAiMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-20">
                <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider bg-bg-secondary">
                  Content Pipeline
                </div>
                <button className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-hover flex items-center gap-2">
                  <Sparkles size={14} className="text-accent" /> Generate Draft
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-hover flex items-center gap-2">
                  Improve Writing
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-hover flex items-center gap-2">
                  Generate SEO Meta
                </button>
                <div className="border-t border-border my-1"></div>
                <button className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-hover flex items-center gap-2">
                  Fact Check
                </button>
              </div>
            )}
          </div>

          <button className="flex items-center gap-2 bg-text-primary text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-text-secondary transition-colors">
            <Save size={16} />
            Save Draft
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="bg-surface border border-border rounded-lg shadow-sm">
        <Toolbar editor={editor} />
        <div className="relative">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
