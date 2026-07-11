import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { SlashCommands } from './SlashCommands';
import suggestion from './suggestion';
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  Code, Link as LinkIcon, Highlighter
} from 'lucide-react';
import { useToast } from '../Layout/ToastProvider';
import MediaDrawer from './MediaDrawer';
import { getOCEClient } from '../../lib/sdk';

const SUPPORTED_NODES = new Set([
  'doc', 'paragraph', 'text', 'heading', 'bulletList', 
  'orderedList', 'listItem', 'blockquote', 'horizontalRule', 
  'codeBlock', 'image', 'hardBreak'
]);

const cleanContent = (json: any): any => {
  if (!json) return json;
  if (typeof json === 'string') return json;
  if (typeof json !== 'object') return json;
  
  if (Object.keys(json).length === 0) return json;

  const cleaned = { ...json };

  if (cleaned.type) {
    if (cleaned.type === 'image' && cleaned.attrs?.src?.startsWith('blob:')) {
      console.warn(`[CMS] Blob URL detected in saved image. Replacing with placeholder.`);
      cleaned.attrs = { ...cleaned.attrs, src: 'https://placehold.co/600x400?text=Image+Unavailable' };
    } else if (!SUPPORTED_NODES.has(cleaned.type)) {
      console.warn(`[CMS] Unsupported node type found: "${cleaned.type}". Migrating to paragraph.`);
      if (cleaned.content) {
        cleaned.type = 'paragraph';
      } else {
        return null;
      }
    }
  } else {
    if (cleaned.text) {
      cleaned.type = 'text';
    } else if (cleaned.content) {
      cleaned.type = 'doc';
    } else {
      console.warn(`[CMS] Invalid node missing type property:`, json);
      return null;
    }
  }

  if (Array.isArray(cleaned.content)) {
    cleaned.content = cleaned.content.map(cleanContent).filter(Boolean);
  }
  
  return cleaned;
};

interface OCEEditorProps {
  initialContent?: any;
  onChange?: (json: any) => void;
}

export default function OCEEditor({ 
  initialContent = {}, 
  onChange
}: OCEEditorProps) {
  const { showToast } = useToast();
  const [isMediaDrawerOpen, setIsMediaDrawerOpen] = useState(false);

  const sdk = getOCEClient();

  const handleImageUpload = async (file: File): Promise<string> => {
    showToast('Uploading image...', 'info');
    try {
      const url = await sdk.uploadMedia(file, 'general');
      showToast('Image uploaded successfully', 'success');
      return url;
    } catch (err) {
      console.error('Image upload failed', err);
      showToast('Image upload failed', 'error');
      throw err;
    }
  };

  const replaceBlobInView = (view: any, blobUrl: string, newSrc: string) => {
    const { state } = view;
    let foundPos: number | null = null;
    state.doc.descendants((node: any, pos: number) => {
      if (node.type.name === 'image' && node.attrs.src === blobUrl) {
        foundPos = pos;
        return false;
      }
    });
    if (foundPos !== null) {
      const tr = view.state.tr.setNodeMarkup(foundPos, null, { src: newSrc });
      view.dispatch(tr);
    }
  };

  const removeBlobFromView = (view: any, blobUrl: string) => {
    const { state } = view;
    let foundPos: number | null = null;
    let nodeSize = 0;
    state.doc.descendants((node: any, pos: number) => {
      if (node.type.name === 'image' && node.attrs.src === blobUrl) {
        foundPos = pos;
        nodeSize = node.nodeSize;
        return false;
      }
    });
    if (foundPos !== null) {
      const tr = view.state.tr.delete(foundPos, foundPos + nodeSize);
      view.dispatch(tr);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-blue-600 hover:underline cursor-pointer',
          }
        },
        underline: {}
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-100 text-yellow-900 px-0.5 rounded',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-md max-w-full my-4 border border-border shadow-sm',
        },
      }),
      Placeholder.configure({
        placeholder: 'Type "/" for commands, or start writing...',
      }),
      SlashCommands.configure({
        suggestion: {
          char: '/',
          command: ({ editor, range, props }: any) => {
            props.command({ editor, range });
          },
          ...suggestion
        }
      }),
    ],
    content: cleanContent(initialContent),
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none min-h-[500px] focus:outline-none',
      },
      handleDrop: function(view, event, _slice, moved) {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
            
            const blobUrl = URL.createObjectURL(file);
            const node = view.state.schema.nodes.image.create({ src: blobUrl });
            const transaction = view.state.tr.insert(coordinates?.pos || 0, node);
            view.dispatch(transaction);

            handleImageUpload(file)
              .then((url) => {
                URL.revokeObjectURL(blobUrl);
                replaceBlobInView(view, blobUrl, url);
              })
              .catch(() => {
                URL.revokeObjectURL(blobUrl);
                removeBlobFromView(view, blobUrl);
              });
            return true;
          }
        }
        return false;
      },
      handlePaste: function(view, event, _slice) {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of Array.from(items)) {
            if (item.type.indexOf('image') === 0) {
              const file = item.getAsFile();
              if (file) {
                event.preventDefault();
                const blobUrl = URL.createObjectURL(file);
                const node = view.state.schema.nodes.image.create({ src: blobUrl });
                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);

                handleImageUpload(file)
                  .then((url) => {
                    URL.revokeObjectURL(blobUrl);
                    replaceBlobInView(view, blobUrl, url);
                  })
                  .catch(() => {
                    URL.revokeObjectURL(blobUrl);
                    removeBlobFromView(view, blobUrl);
                  });
                return true;
              }
            }
          }
        }
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
  });

  useEffect(() => {
    const handleOpenMediaDrawer = () => {
      setIsMediaDrawerOpen(true);
    };
    window.addEventListener('open-media-drawer', handleOpenMediaDrawer);
    return () => window.removeEventListener('open-media-drawer', handleOpenMediaDrawer);
  }, []);

  const insertImage = (url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleAddLink = () => {
    if (!editor) return;
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
    } else {
      const selection = editor.state.selection;
      const hasText = !selection.empty;
      const url = window.prompt('Enter URL (e.g. https://example.com):');
      if (url && url.trim()) {
        const cleanUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
        if (hasText) {
          editor.chain().focus().setLink({ href: cleanUrl }).run();
        } else {
          editor.chain().focus().insertContent(`<a href="${cleanUrl}">${cleanUrl}</a>`).run();
        }
      }
    }
  };

  return (
    <div className="w-full">
      {editor && (
        <BubbleMenu 
          editor={editor} 
          className="flex items-center gap-0.5 bg-surface border border-border shadow-xl rounded-lg p-1"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-surface-hover transition-colors ${editor.isActive('bold') ? 'bg-accent/10 text-accent' : 'text-text-secondary'}`}
            title="Bold (Ctrl+B)"
          >
            <Bold size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-surface-hover transition-colors ${editor.isActive('italic') ? 'bg-accent/10 text-accent' : 'text-text-secondary'}`}
            title="Italic (Ctrl+I)"
          >
            <Italic size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded hover:bg-surface-hover transition-colors ${editor.isActive('underline') ? 'bg-accent/10 text-accent' : 'text-text-secondary'}`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={15} />
          </button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button
            onClick={handleAddLink}
            className={`p-1.5 rounded hover:bg-surface-hover transition-colors ${editor.isActive('link') ? 'bg-accent/10 text-accent' : 'text-text-secondary'}`}
            title={editor.isActive('link') ? 'Remove Link' : 'Add Link'}
          >
            <LinkIcon size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded hover:bg-surface-hover transition-colors ${editor.isActive('code') ? 'bg-accent/10 text-accent' : 'text-text-secondary'}`}
            title="Inline Code"
          >
            <Code size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-1.5 rounded hover:bg-surface-hover transition-colors ${editor.isActive('highlight') ? 'bg-accent/10 text-accent' : 'text-text-secondary'}`}
            title="Highlight"
          >
            <Highlighter size={15} />
          </button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 text-xs font-bold rounded hover:bg-surface-hover transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-accent/10 text-accent' : 'text-text-secondary'}`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2 py-1 text-xs font-bold rounded hover:bg-surface-hover transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-accent/10 text-accent' : 'text-text-secondary'}`}
            title="Heading 3"
          >
            H3
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-2 py-1 text-xs font-bold rounded hover:bg-surface-hover transition-colors ${editor.isActive('blockquote') ? 'bg-accent/10 text-accent' : 'text-text-secondary'}`}
            title="Quote"
          >
            "
          </button>
        </BubbleMenu>
      )}

      <div className="relative">
        <EditorContent editor={editor} />
      </div>
      
      <MediaDrawer 
        isOpen={isMediaDrawerOpen} 
        onClose={() => setIsMediaDrawerOpen(false)} 
        onSelectImage={insertImage}
      />
    </div>
  );
}
