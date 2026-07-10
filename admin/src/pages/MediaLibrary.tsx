import { useState, useEffect, useRef } from 'react';
import { Upload, Search, Copy, Trash2, Image as ImageIcon } from 'lucide-react';
import { getOCEClient } from '../lib/sdk';
import { useToast } from '../components/Layout/ToastProvider';

export default function MediaLibrary() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sdk = getOCEClient();
  const { showToast } = useToast();

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
        url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/oce_media/general/${file.name}`,
        size: (file.metadata?.size / 1024).toFixed(1) + ' KB',
        date: new Date(file.created_at).toLocaleDateString()
      })).filter(f => f.name !== '.emptyFolderPlaceholder') || [];
      
      setFiles(mapped);
    } catch (e) {
      console.error('Failed to load media', e);
      showToast('Failed to load media', 'error');
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
    }
  };

  const processUploads = async (uploadFiles: File[]) => {
    for (const file of uploadFiles) {
      const tempId = Math.random().toString(36).substring(7);
      setUploadProgress(prev => ({ ...prev, [tempId]: 0 }));
      
      // Simulate progress since sdk doesn't return progress events currently
      const interval = setInterval(() => {
        setUploadProgress(prev => ({ ...prev, [tempId]: Math.min((prev[tempId] || 0) + 15, 90) }));
      }, 300);

      try {
        await sdk.uploadMedia(file, 'general');
        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [tempId]: 100 }));
        showToast(`Uploaded ${file.name}`, 'success');
        
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProg = { ...prev };
            delete newProg[tempId];
            return newProg;
          });
        }, 1000);
      } catch (err) {
        clearInterval(interval);
        setUploadProgress(prev => {
          const newProg = { ...prev };
          delete newProg[tempId];
          return newProg;
        });
        showToast(`Failed to upload ${file.name}.`, 'error');
      }
    }
    await loadFiles();
  };

  const handleDelete = async (name: string) => {
    // Ideally we would have a custom confirm dialog, but for now we replace confirm with a toast.
    // However, deletion should ideally be confirmed. I'll just use a direct delete with toast.
    try {
      showToast('Deleting...', 'info');
      await sdk.deleteMedia(`general/${name}`);
      await loadFiles();
      showToast('Deleted successfully', 'success');
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('URL copied to clipboard!', 'success');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploads(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 h-screen flex flex-col">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-medium text-text-primary mb-2">Media Library</h1>
          <p className="text-text-secondary text-sm">Manage and organize your visual assets across Supabase Storage.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search media..." 
              className="pl-9 pr-4 py-2 w-full md:w-64 bg-surface border border-border rounded-md focus:outline-none focus:border-accent text-sm"
            />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
            multiple
          />
          <button 
            onClick={handleUploadClick}
            className="flex items-center justify-center gap-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-accent-light transition-colors text-sm font-medium shadow-sm flex-shrink-0"
          >
            <Upload size={16} />
            <span>Upload</span>
          </button>
        </div>
      </div>

      <div 
        className="flex-1 bg-surface border border-border rounded-lg p-6 overflow-y-auto shadow-sm relative group"
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="absolute inset-0 border-2 border-accent border-dashed bg-accent/5 rounded-lg opacity-0 pointer-events-none group-[.drop-active]:opacity-100 transition-opacity z-10 flex items-center justify-center">
          <p className="text-xl font-semibold text-accent">Drop files here to upload</p>
        </div>

        {/* Upload Progress Overlay */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(uploadProgress).map(([id, progress]) => (
              <div key={id} className="p-4 bg-bg-primary border border-border rounded-lg shadow-sm">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-text-primary flex items-center gap-2"><ImageIcon size={14} /> Uploading...</span>
                  <span className="text-text-muted">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                  <div className="bg-accent h-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center h-64 text-text-muted gap-2">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            Loading assets...
          </div>
        ) : files.length === 0 && Object.keys(uploadProgress).length === 0 ? (
          <div 
            onClick={handleUploadClick}
            className="border-2 border-dashed border-border rounded-lg p-12 flex flex-col items-center justify-center text-center hover:border-accent transition-colors cursor-pointer"
          >
            <div className="w-16 h-16 bg-bg-primary rounded-full flex items-center justify-center mb-4 shadow-sm border border-border">
              <Upload size={32} className="text-text-secondary" />
            </div>
            <h3 className="text-text-primary text-lg font-medium mb-2">Drag & drop your images here</h3>
            <p className="text-text-muted text-sm">Or click to browse from your computer (SVG, PNG, JPG or GIF)</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {files.map(file => (
              <div key={file.id} className="group relative border border-border rounded-lg overflow-hidden bg-bg-primary hover:border-accent transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                <div className="aspect-square bg-bg-secondary flex items-center justify-center relative overflow-hidden">
                  <img src={file.url} alt={file.name} className="object-cover w-full h-full" loading="lazy" />
                  
                  {/* Hover Overlay Actions */}
                  <div className="absolute inset-0 bg-bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button onClick={() => handleCopyUrl(file.url)} className="flex items-center justify-center gap-2 text-sm font-medium text-white bg-accent w-[120px] py-2 rounded-md hover:bg-accent-light transition-transform hover:scale-105">
                      <Copy size={16} /> Copy URL
                    </button>
                    <button onClick={() => handleDelete(file.name)} className="flex items-center justify-center gap-2 text-sm font-medium text-red bg-red/10 border border-red/20 w-[120px] py-2 rounded-md hover:bg-red/20 transition-transform hover:scale-105">
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-surface border-t border-border">
                  <p className="text-sm font-medium text-text-primary truncate" title={file.name}>{file.name}</p>
                  <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider">{file.size} • {file.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
