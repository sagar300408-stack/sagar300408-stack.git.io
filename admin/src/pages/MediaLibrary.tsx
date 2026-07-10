import { useState, useEffect, useRef } from 'react';
import { Upload, Search, Copy, Trash2 } from 'lucide-react';
import { getOCEClient } from '../lib/sdk';

export default function MediaLibrary() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sdk = getOCEClient();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await sdk.listMedia('general');
      const mapped = data?.map((file: any) => ({
        id: file.id,
        name: file.name,
        // Hacky way to get public URL based on list metadata without calling getPublicUrl for each item
        url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/oce_media/general/${file.name}`,
        size: (file.metadata?.size / 1024).toFixed(1) + ' KB',
        date: new Date(file.created_at).toLocaleDateString()
      })).filter(f => f.name !== '.emptyFolderPlaceholder') || [];
      
      setFiles(mapped);
    } catch (e) {
      console.error('Failed to load media', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        setUploading(true);
        await sdk.uploadMedia(file, 'general');
        await loadFiles();
      } catch (err) {
        console.error('Upload failed', err);
        alert('Upload failed. Ensure oce_media bucket exists and is public.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDelete = async (name: string) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      try {
        await sdk.deleteMedia(`general/${name}`);
        await loadFiles();
      } catch (err) {
        console.error('Delete failed', err);
      }
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-medium text-text-primary mb-2">Media Library</h1>
          <p className="text-text-secondary">Manage and organize your visual assets across Supabase Storage.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search media..." 
              className="pl-9 pr-4 py-2 bg-surface border border-border rounded-md focus:outline-none focus:border-accent text-sm w-64"
            />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
          <button 
            onClick={handleUploadClick}
            disabled={uploading}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-accent-light transition-colors text-sm font-medium shadow-sm disabled:opacity-50"
          >
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      <div className="flex gap-8 flex-1 min-h-0">
        {/* Main Grid */}
        <main className="flex-1 bg-surface border border-border rounded-lg p-6 overflow-y-auto shadow-sm">
          {/* Drag & Drop Zone */}
          <div 
            onClick={handleUploadClick}
            className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center mb-8 hover:border-accent hover:bg-accent/5 transition-colors cursor-pointer group"
          >
            <div className="bg-bg-primary p-4 rounded-full mb-3 group-hover:scale-110 transition-transform shadow-sm border border-border">
              <Upload size={24} className="text-accent" />
            </div>
            <h3 className="text-text-primary font-medium mb-1">Click to upload or drag and drop</h3>
            <p className="text-text-muted text-sm">SVG, PNG, JPG or GIF (max. 10MB)</p>
          </div>
          
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 border-b border-border pb-2">All Assets</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              <div className="col-span-full py-12 text-center text-text-muted">Loading assets...</div>
            ) : files.length === 0 ? (
              <div className="col-span-full py-12 text-center text-text-muted">No files found.</div>
            ) : (
              files.map(file => (
                <div key={file.id} className="group relative border border-border rounded-lg overflow-hidden bg-bg-primary hover:border-accent transition-colors shadow-sm">
                  <div className="aspect-square bg-bg-secondary flex items-center justify-center relative overflow-hidden group-hover:opacity-90 transition-opacity">
                    <img src={file.url} alt={file.name} className="object-cover w-full h-full" />
                    
                    {/* Hover Overlay Actions */}
                    <div className="absolute inset-0 bg-bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                      <button onClick={() => handleCopyUrl(file.url)} className="flex items-center gap-2 text-sm font-medium text-white bg-accent px-3 py-1.5 rounded-md hover:bg-accent-light">
                        <Copy size={14} /> Copy URL
                      </button>
                      <button onClick={() => handleDelete(file.name)} className="flex items-center gap-2 text-sm font-medium text-red bg-red/10 border border-red/20 px-3 py-1.5 rounded-md hover:bg-red/20">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                  <div className="p-3 bg-surface border-t border-border">
                    <p className="text-sm font-medium text-text-primary truncate" title={file.name}>{file.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{file.size} • {file.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
