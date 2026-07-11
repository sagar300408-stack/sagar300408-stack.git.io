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
      console.warn(`[CMS] Blob URL detected in inline image. Replacing with placeholder.`);
      cleaned.attrs.src = 'https://placehold.co/600x400?text=Image+Upload+Failed';
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

  const handleImageUpload = async (file: File) => {
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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-blue hover:underline cursor-pointer',
          }
        },
        underline: {}
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-accent/20 text-accent-dark px-1 rounded',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-md max-w-full my-4 border border-border shadow-sm transition-all',
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
        class: 'prose prose-slate max-w-none min-h-[500px] focus:outline-none text-text-primary',
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

            handleImageUpload(file).then((url) => {
              const { state } = view;
              let foundPos: number | null = null;
              state.doc.descendants((node, pos) => {
                if (node.type.name === 'image' && node.attrs.src === blobUrl) {
                  foundPos = pos;
                  return false;
                }
              });
              
              if (foundPos !== null) {
                const tr = view.state.tr.setNodeMarkup(foundPos, null, { src: url });
                view.dispatch(tr);
              }
            }).catch(() => {
              const { state } = view;
              let foundPos: number | null = null;
              let nodeSize = 0;
              state.doc.descendants((node, pos) => {
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

                handleImageUpload(file).then((url) => {
                  const { state } = view;
                  let foundPos: number | null = null;
                  state.doc.descendants((node, pos) => {
                    if (node.type.name === 'image' && node.attrs.src === blobUrl) {
                      foundPos = pos;
                      return false;
                    }
                  });
                  
                  if (foundPos !== null) {
                    const tr = view.state.tr.setNodeMarkup(foundPos, null, { src: url });
                    view.dispatch(tr);
                  }
                }).catch(() => {
                  const { state } = view;
                  let foundPos: number | null = null;
                  let nodeSize = 0;
                  state.doc.descendants((node, pos) => {
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

  return (
    <div className="w-full">
      {editor && (
        <BubbleMenu 
          editor={editor} 
          className="flex items-center gap-1 bg-surface border border-border shadow-xl rounded-lg p-1 animate-in fade-in zoom-in-95"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-surface-hover transition-colors ${editor.isActive('bold') ? 'bg-accent/10 text-accent' : 'text-text-secondary'}`}
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-surface-hover transition-colors ${editor.isActive('italic') ? 'bg-accent/10 text-accent' : 'text-text-secondary'}`}
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded hover:bg-surface-hover transition-colors ${editor.isActive('underline') ? 'bg-accent/10 text-accent' : 'text-text-secondary'}`}
            title="Underline"
          >
            <UnderlineIcon size={16} />
          </button>
          <div className="w-px h-4 bg-border mx-1"></div>
          <button
            onClick={() => {
              if (editor.isActive('link')) {
                editor.chain().focus().unsetLink().run();
              } else {
                showToast('Link editing coming soon.', 'info');
              }
            }}
            className={`p-1.5 rounded hover:bg-surface-hover transition-colors ${editor.isActive('link') ? 'bg-accent/10 text-accent' : 'text-text-secondary'}`}
            title="Link"
          >
            <LinkIcon size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded hover:bg-surface-hover transition-colors ${editor.isActive('code') ? 'bg-accent/10 text-accent' : 'text-text-secondary'}`}
            title="Inline Code"
          >
            <Code size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-1.5 rounded hover:bg-surface-hover transition-colors ${editor.isActive('highlight') ? 'bg-accent/10 text-accent' : 'text-text-secondary'}`}
            title="Highlight"
          >
            <Highlighter size={16} />
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
