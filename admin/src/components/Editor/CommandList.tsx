import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { 
  Type, Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, 
  Minus, Code, Image
} from 'lucide-react';

interface CommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (params: { editor: any; range: any }) => void;
}

export const getSuggestionItems = ({ query }: { query: string }): CommandItem[] => {
  const items: CommandItem[] = [
    {
      title: 'Text',
      description: 'Just start typing with plain text.',
      icon: <Type size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('paragraph').run();
      },
    },
    {
      title: 'Heading 1',
      description: 'Big section heading.',
      icon: <Heading1 size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading.',
      icon: <Heading2 size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
      },
    },
    {
      title: 'Heading 3',
      description: 'Small section heading.',
      icon: <Heading3 size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
      },
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bulleted list.',
      icon: <List size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: 'Numbered List',
      description: 'Create a list with numbering.',
      icon: <ListOrdered size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: 'Quote',
      description: 'Capture a quote.',
      icon: <Quote size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setBlockquote().run();
      },
    },
    {
      title: 'Divider',
      description: 'Visually divide blocks.',
      icon: <Minus size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
    {
      title: 'Code Block',
      description: 'Capture a code snippet.',
      icon: <Code size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setCodeBlock().run();
      },
    },
    {
      title: 'Image',
      description: 'Upload or choose an image.',
      icon: <Image size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        // Dispatch custom event to open media drawer
        window.dispatchEvent(new CustomEvent('open-media-drawer'));
      },
    }
  ];

  return items.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));
};

export const CommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  if (!props.items.length) {
    return (
      <div className="bg-surface border border-border shadow-xl rounded-lg overflow-hidden min-w-[300px] max-h-[330px] flex flex-col p-2 animate-in fade-in zoom-in-95 duration-100">
        <div className="p-3 text-sm text-text-muted text-center">No results found</div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border shadow-xl rounded-lg overflow-hidden min-w-[300px] max-h-[330px] flex flex-col p-2 animate-in fade-in zoom-in-95 duration-100">
      <div className="text-xs font-semibold text-text-muted px-2 py-1.5 uppercase tracking-wider">
        Basic Blocks
      </div>
      <div className="overflow-y-auto">
        {props.items.map((item: any, index: number) => (
          <button
            className={`w-full flex items-center gap-3 px-2 py-2 text-left rounded-md transition-colors ${
              index === selectedIndex ? 'bg-surface-hover' : 'hover:bg-surface-hover'
            }`}
            key={index}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className={`p-2 rounded-md ${index === selectedIndex ? 'bg-bg-primary border border-border' : 'bg-surface border border-transparent'}`}>
              {item.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary">{item.title}</span>
              <span className="text-xs text-text-muted">{item.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

CommandList.displayName = 'CommandList';
