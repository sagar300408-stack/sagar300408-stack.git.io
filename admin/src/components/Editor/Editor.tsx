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
  onSaveDraft?: () => void;
}

export default function OCEEditor({ 
  initialContent = {}, 
  onChange, 
  title = '', 
  onTitleChange,
  status = 'Draft',
  lastSaved = 'Not saved',
  onSaveDraft
}: OCEEditorProps) {
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Advanced TipTap Editor with extensions
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-md max-w-full my-4 border border-border shadow-sm',
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
      // Custom Slash Command Extension placeholder (to be implemented via TipTap suggestion API)
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none min-h-[500px] focus:outline-none py-6 px-8 text-text-primary',
      },
      handleKeyDown: (_, event) => {
        if (event.key === '/') {
          // Open slash command palette (simplified mockup)
          console.log('Slash command palette triggered');
        }
        return false; // let TipTap handle other keys
      }
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
  });

  const handleAIGeneration = async (promptType: string) => {
    setIsGenerating(true);
    setIsAiMenuOpen(false);
    
    // Simulate non-blocking async AI generation
    setTimeout(() => {
      if (promptType === 'improve') {
        editor?.commands.setContent('<p><em>AI Improved Content:</em> The landscape of modern web development is rapidly evolving...</p>');
      } else if (promptType === 'meta') {
        alert("AI generated meta description: 'Discover the future of modern web development in this comprehensive guide.'");
      }
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      {/* Editor Header */}
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-bg-primary/95 backdrop-blur z-10 py-4 border-b border-border">
        <div className="flex-1 mr-4">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            placeholder="Insight Title"
            className="text-4xl font-serif font-medium bg-transparent border-none focus:outline-none focus:ring-0 text-text-primary placeholder:text-text-muted w-full"
          />
        </div>
        
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-text-secondary bg-surface px-3 py-1.5 rounded-full border border-border">
            <span className={`w-2 h-2 rounded-full ${status === 'Published' ? 'bg-green' : 'bg-amber'}`}></span>
            {status}
          </div>
          
          <div className="flex items-center gap-1 text-sm text-text-muted">
            {isGenerating ? <Sparkles size={14} className="animate-pulse text-accent" /> : <Clock size={14} />}
            <span>{isGenerating ? 'AI is thinking...' : lastSaved}</span>
          </div>

          {/* AI Non-blocking Toolbar Button */}
          <div className="relative">
            <button 
              onClick={() => setIsAiMenuOpen(!isAiMenuOpen)}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm shadow-sm transition-all ${
                isGenerating 
                  ? 'bg-surface text-text-muted cursor-not-allowed' 
                  : 'bg-gradient-to-r from-accent to-accent-light text-white hover:shadow'
              }`}
            >
              <Sparkles size={16} />
              AI Assistant
              <ChevronDown size={14} />
            </button>
            
            {/* AI Menu Dropdown */}
            {isAiMenuOpen && !isGenerating && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-lg shadow-xl overflow-hidden z-20 animate-in slide-in-from-top-2">
                <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider bg-bg-secondary flex justify-between">
                  Writing Tools <Sparkles size={12} className="text-accent" />
                </div>
                <button onClick={() => handleAIGeneration('improve')} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-hover flex items-center gap-2">
                  Improve Writing
                </button>
                <button onClick={() => handleAIGeneration('shorten')} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-hover flex items-center gap-2">
                  Shorten
                </button>
                <button onClick={() => handleAIGeneration('expand')} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-hover flex items-center gap-2">
                  Expand
                </button>
                
                <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider bg-bg-secondary border-t border-border mt-1">
                  Metadata
                </div>
                <button onClick={() => handleAIGeneration('meta')} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-hover flex items-center gap-2">
                  Generate SEO Title & Meta
                </button>
                <button onClick={() => handleAIGeneration('social')} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-hover flex items-center gap-2">
                  Generate LinkedIn Post
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={onSaveDraft}
            className="flex items-center gap-2 bg-text-primary text-bg-primary px-4 py-2 rounded-md font-medium text-sm hover:bg-text-secondary transition-colors shadow-sm"
          >
            <Save size={16} />
            Save Draft
          </button>
        </div>
      </div>

      {/* TipTap Toolbar & Body */}
      <div className="bg-surface border border-border rounded-lg shadow-sm">
        <Toolbar editor={editor} />
        <div className="relative">
          <EditorContent editor={editor} />
          
          {/* TipTap Slash Command Placeholder Hint */}
          {!editor?.getText() && !editor?.isFocused && (
            <div className="absolute top-8 left-8 text-text-muted pointer-events-none flex items-center gap-2">
              <span className="bg-bg-secondary px-1.5 rounded border border-border text-xs font-mono">/</span>
              to open command palette
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
