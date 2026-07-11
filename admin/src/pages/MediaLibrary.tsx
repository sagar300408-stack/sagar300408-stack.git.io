import { useState, useEffect, useRef } from 'react';
import { Upload, Search, Copy, Trash2, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { getOCEClient } from '../lib/sdk';
import { useToast } from '../components/Layout/ToastProvider';

export default function MediaLibrary() {
  const [files, setFiles] = useState<any[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sdk = getOCEClient();
  const { showToast } = useToast();

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      setFilteredFiles(files.filter(f => f.name.toLowerCase().includes(search.toLowerCase())));
    } else {
      setFilteredFiles(files);
    }
  }, [search, files]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await sdk.listMedia('general');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const mapped = data?.map((file: any) => ({
        id: file.id || file.name,
        name: file.name,
        url: `${supabaseUrl}/storage/v1/object/public/oce_media/general/${file.name}`,
        size: file.metadata?.size ? (file.metadata.size / 1024).toFixed(1) + ' KB' : '—',
        date: file.created_at ? new Date(file.created_at).toLocaleDateString() : '—'
      })).filter((f: any) => f.name && f.name !== '.emptyFolderPlaceholder') || [];
      
      setFiles(mapped);
      setFilteredFiles(mapped);
    } catch (e) {
      console.error('Failed to load media', e);
      showToast('Failed to load media library', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processUploads(Array.from(e.target.files));
      // Reset so the same file can be selected again
      e.target.value = '';
    }
  };

  const processUploads = async (uploadFiles: File[]) => {
    for (const file of uploadFiles) {
      const tempId = `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setUploadProgress(prev => ({ ...prev, [tempId]: 5 }));
      
      const interval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [tempId]: Math.min((prev[tempId] || 5) + 12, 88)
        }));
      }, 300);

      try {
        await sdk.uploadMedia(file, 'general');
        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [tempId]: 100 }));
        showToast(`✓ Uploaded: ${file.name}`, 'success');
        
        setTimeout(() => {
          setUploadProgress(prev => {
            const next = { ...prev };
            delete next[tempId];
            return next;
          });
        }, 800);
      } catch (err) {
        clearInterval(interval);
        setUploadProgress(prev => {
          const next = { ...prev };
          delete next[tempId];
          return next;
        });
        showToast(`Failed to upload ${file.name}`, 'error');
      }
    }
    await loadFiles();
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await sdk.deleteMedia(`general/${name}`);
      showToast('File deleted', 'success');
      await loadFiles();
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      showToast('URL copied to clipboard', 'success');
    }).catch(() => {
      showToast('Failed to copy URL', 'error');
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploads(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-serif font-medium text-text-primary mb-1">Media Library</h1>
          <p className="text-text-secondary text-sm">
            {files.length > 0 ? `${files.length} file${files.length !== 1 ? 's' : ''} in your library` : 'Manage your visual assets'}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
            <input 
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by filename..."
              className="pl-9 pr-4 py-2 w-full md:w-56 bg-surface border border-border rounded-md focus:outline-none focus:border-accent text-sm"
            />
          </div>
          <button
            onClick={loadFiles}
            className="p-2 border border-border rounded-md hover:bg-surface-hover text-text-secondary transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,video/*,.pdf,.svg"
            multiple
          />
          <button 
            onClick={handleUploadClick}
            className="flex items-center justify-center gap-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-accent-light transition-colors text-sm font-medium shadow-sm flex-shrink-0"
          >
            <Upload size={15} />
            Upload
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="bg-surface border border-border rounded-lg p-6 shadow-sm min-h-[400px] relative"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(uploadProgress).map(([id, progress]) => (
              <div key={id} className="p-4 bg-bg-primary border border-border rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-text-primary flex items-center gap-2">
                    <ImageIcon size={14} /> Uploading...
                  </span>
                  <span className="text-text-muted">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-accent h-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center h-64 text-text-muted gap-3">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            Loading assets...
          </div>
        ) : filteredFiles.length === 0 && Object.keys(uploadProgress).length === 0 ? (
          <div 
            onClick={handleUploadClick}
            className="border-2 border-dashed border-border rounded-lg p-16 flex flex-col items-center justify-center text-center hover:border-accent transition-colors cursor-pointer"
          >
            <div className="w-16 h-16 bg-bg-primary rounded-full flex items-center justify-center mb-4 shadow-sm border border-border">
              <Upload size={28} className="text-text-secondary" />
            </div>
            <h3 className="text-text-primary text-lg font-medium mb-2">
              {search ? 'No files match your search' : 'Drag & drop files here'}
            </h3>
            <p className="text-text-muted text-sm">
              {search ? `Try a different search term` : 'Or click to browse from your computer'}
            </p>
            {search && (
              <button
                onClick={(e) => { e.stopPropagation(); setSearch(''); }}
                className="mt-3 text-sm text-accent hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                className="group relative border border-border rounded-lg overflow-hidden bg-bg-primary hover:border-accent transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="aspect-square bg-bg-secondary flex items-center justify-center relative overflow-hidden">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="object-cover w-full h-full"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Error';
                    }}
                  />
                  
                  {/* Hover Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2.5 backdrop-blur-[2px]">
                    <button
                      onClick={() => handleCopyUrl(file.url)}
                      className="flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-accent w-28 py-1.5 rounded-md hover:bg-accent-light transition-colors"
                    >
                      <Copy size={13} /> Copy URL
                    </button>
                    <button
                      onClick={() => handleDelete(file.name)}
                      className="flex items-center justify-center gap-1.5 text-xs font-medium text-red-400 bg-black/40 border border-red-500/30 w-28 py-1.5 rounded-md hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
                <div className="p-2.5 bg-surface border-t border-border">
                  <p className="text-xs font-medium text-text-primary truncate" title={file.name}>{file.name}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{file.size} · {file.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
