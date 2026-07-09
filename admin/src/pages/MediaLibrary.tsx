import { useState } from 'react';
import { Folder, Upload, Search, MoreVertical, Plus } from 'lucide-react';

export default function MediaLibrary() {
  const [folders] = useState([
    { id: '1', name: 'Blog Assets', count: 24 },
    { id: '2', name: 'Logos & Branding', count: 8 },
    { id: '3', name: 'Team Photos', count: 12 },
  ]);

  const [files] = useState([
    { id: '1', name: 'hero-bg.png', url: 'https://placehold.co/600x400/png', size: '2.4 MB', date: '2 hours ago' },
    { id: '2', name: 'avatar-sagar.jpg', url: 'https://placehold.co/400x400/png', size: '450 KB', date: '1 day ago' },
    { id: '3', name: 'dashboard-preview.png', url: 'https://placehold.co/800x600/png', size: '1.2 MB', date: '3 days ago' },
    { id: '4', name: 'originyx-logo.svg', url: 'https://placehold.co/200x50/png', size: '24 KB', date: '1 week ago' },
  ]);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-medium text-text-primary mb-2">Media Library</h1>
          <p className="text-text-secondary">Manage and organize your visual assets.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search media..." 
              className="pl-9 pr-4 py-2 border border-border rounded-md focus:outline-none focus:border-accent text-sm w-64"
            />
          </div>
          <button className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-accent-light transition-colors text-sm font-medium shadow-sm">
            <Upload size={16} />
            Upload
          </button>
        </div>
      </div>

      <div className="flex gap-8 flex-1 min-h-0">
        {/* Sidebar / Folders */}
        <aside className="w-64 flex-shrink-0 flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Folders</h2>
            <button className="text-text-secondary hover:text-accent">
              <Plus size={16} />
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto">
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-accent/10 text-accent-dark font-medium text-sm mb-1">
              <div className="flex items-center gap-2">
                <Folder size={16} />
                All Media
              </div>
              <span className="text-xs bg-surface px-2 py-0.5 rounded-full border border-border">142</span>
            </button>
            
            {folders.map(folder => (
              <button key={folder.id} className="w-full flex items-center justify-between px-3 py-2 rounded-md text-text-secondary hover:bg-surface-hover hover:text-text-primary font-medium text-sm transition-colors mb-1">
                <div className="flex items-center gap-2">
                  <Folder size={16} />
                  {folder.name}
                </div>
                <span className="text-xs text-text-muted">{folder.count}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Grid */}
        <main className="flex-1 bg-surface border border-border rounded-lg p-6 overflow-y-auto shadow-sm">
          {/* Drag & Drop Zone */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center mb-8 hover:border-accent hover:bg-accent/5 transition-colors cursor-pointer">
            <div className="bg-surface-hover p-3 rounded-full mb-3">
              <Upload size={24} className="text-text-secondary" />
            </div>
            <h3 className="text-text-primary font-medium mb-1">Click to upload or drag and drop</h3>
            <p className="text-text-muted text-sm">SVG, PNG, JPG or GIF (max. 10MB)</p>
          </div>
          
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 border-b border-border pb-2">Recent Uploads</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map(file => (
              <div key={file.id} className="group relative border border-border rounded-lg overflow-hidden bg-bg-secondary hover:border-accent transition-colors">
                <div className="aspect-square bg-bg-tertiary flex items-center justify-center relative overflow-hidden">
                  <img src={file.url} alt={file.name} className="object-cover w-full h-full" />
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="truncate pr-2">
                      <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                      <p className="text-xs text-text-muted">{file.size} • {file.date}</p>
                    </div>
                    <button className="text-text-muted hover:text-text-primary mt-0.5">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
