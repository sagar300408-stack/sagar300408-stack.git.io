import { useState, useEffect, useRef } from 'react';
import { X, Search, Upload, CheckCircle } from 'lucide-react';
import { getOCEClient } from '../../lib/sdk';
import { useToast } from '../Layout/ToastProvider';

interface MediaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
}

export default function MediaDrawer({ isOpen, onClose, onSelectImage }: MediaDrawerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaFiles, setMediaFiles] = useState<{ name: string; url: string }[]>([]);
  const [search, setSearch] = useState('');
  const [loadingMedia, setLoadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sdk = getOCEClient();
  const { showToast } = useToast();

  // Load existing media from Supabase Storage when drawer opens
  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  const loadMedia = async () => {
    try {
      setLoadingMedia(true);
      const data = await sdk.listMedia('general');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const mapped = (data || [])
        .filter((f: any) => f.name && f.name !== '.emptyFolderPlaceholder')
        .map((f: any) => ({
          name: f.name,
          url: `${supabaseUrl}/storage/v1/object/public/oce_media/general/${f.name}`
        }));
      setMediaFiles(mapped);
    } catch (e) {
      console.error('Failed to load media in drawer', e);
    } finally {
      setLoadingMedia(false);
    }
  };

  const performUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(20);
    
    // Fake progress interval for UX
    const interval = setInterval(() => {
      setUploadProgress(prev => prev < 85 ? prev + 15 : prev);
    }, 400);

    try {
      const url = await sdk.uploadMedia(file, 'general');
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        onSelectImage(url);
        onClose();
      }, 300);
    } catch (e) {
      clearInterval(interval);
      console.error('Upload failed', e);
      setIsUploading(false);
      setUploadProgress(0);
      showToast('Upload failed. Please try again.', 'error');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      performUpload(e.target.files[0]);
    }
  };

  const handleDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      performUpload(e.dataTransfer.files[0]);
    }
  };

  const filteredMedia = mediaFiles.filter(f =>
    !search || f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-96 bg-surface border-l border-border shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-semibold text-text-primary">Media Library</h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-md transition-colors"
            aria-label="Close media drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-border flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
            <input 
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search uploaded images..."
              className="w-full bg-bg-primary border border-border rounded-md pl-9 pr-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          
          {/* Upload Zone */}
          <div
            className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-accent transition-colors group relative cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropZoneDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden"
              accept="image/*"
              onChange={handleFileInputChange}
            />
            <div className="w-10 h-10 bg-bg-primary rounded-full flex items-center justify-center mb-3 group-hover:bg-accent/10 transition-colors border border-border">
              <Upload className="text-text-secondary group-hover:text-accent" size={20} />
            </div>
            <p className="text-sm font-medium text-text-primary">Click to upload or drag & drop</p>
            <p className="text-xs text-text-muted mt-1">PNG, JPG, GIF or SVG (max. 10MB)</p>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="p-4 bg-bg-primary border border-border rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-text-primary">Uploading...</span>
                <span className="text-text-muted">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-accent h-full transition-all duration-200" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Media Grid */}
          {loadingMedia ? (
            <div className="flex items-center justify-center py-12 gap-2 text-text-muted">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading media...</span>
            </div>
          ) : filteredMedia.length > 0 ? (
            <>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                {search ? `Results for "${search}"` : 'Your Uploads'} ({filteredMedia.length})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {filteredMedia.map((file, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      onSelectImage(file.url);
                      onClose();
                    }}
                    className="relative aspect-square rounded-md overflow-hidden border border-border group hover:border-accent transition-all"
                    title={file.name}
                  >
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <CheckCircle className="text-white" size={22} />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-[10px] truncate">{file.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : !isUploading ? (
            <div className="text-center py-8 text-text-muted">
              <p className="text-sm">{search ? 'No images match your search.' : 'No uploaded images yet.'}</p>
              <p className="text-xs mt-1">Upload your first image above.</p>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
