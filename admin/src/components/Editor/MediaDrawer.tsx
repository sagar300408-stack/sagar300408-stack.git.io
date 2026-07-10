import { useState } from 'react';
import { X, Search, Upload, CheckCircle, Folder } from 'lucide-react';

interface MediaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
}

export default function MediaDrawer({ isOpen, onClose, onSelectImage }: MediaDrawerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const mockImages = [
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?auto=format&fit=crop&q=80&w=400',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      simulateUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload(e.dataTransfer.files[0]);
    }
  };

  const simulateUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            const url = URL.createObjectURL(file);
            onSelectImage(url);
            onClose();
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-bg-primary/50 backdrop-blur-sm z-40 transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-96 bg-surface border-l border-border shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Media Library</h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-border flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search images..." 
              className="w-full bg-bg-primary border border-border rounded-md pl-9 pr-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </div>
          <button className="p-2 border border-border rounded-md hover:bg-surface-hover text-text-secondary transition-colors" title="Folders">
            <Folder size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div 
            className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center mb-6 hover:border-accent transition-colors group relative cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept="image/*"
              onChange={handleFileUpload}
            />
            <div className="w-12 h-12 bg-bg-primary rounded-full flex items-center justify-center mb-3 group-hover:bg-accent/10 transition-colors">
              <Upload className="text-text-secondary group-hover:text-accent" size={24} />
            </div>
            <p className="text-sm font-medium text-text-primary">Click to upload or drag & drop</p>
            <p className="text-xs text-text-muted mt-1">SVG, PNG, JPG or GIF (max. 10MB)</p>
          </div>

          {isUploading && (
            <div className="mb-6 p-4 bg-bg-primary border border-border rounded-lg">
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

          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Recent Uploads</h3>
          <div className="grid grid-cols-2 gap-3">
            {mockImages.map((img, i) => (
              <button 
                key={i} 
                onClick={() => {
                  onSelectImage(img);
                  onClose();
                }}
                className="relative aspect-video rounded-md overflow-hidden border border-border group"
              >
                <img src={img} alt="Recent" className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <CheckCircle className="text-white" size={24} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
