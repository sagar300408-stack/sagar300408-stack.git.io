import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import OCEEditor from '../components/Editor/Editor';
import { 
  ChevronLeft, Send, Image, 
  Settings, Maximize2, Minimize2, 
  Columns, AlignLeft, CheckCircle, Clock
} from 'lucide-react';
import { getOCEClient } from '../lib/sdk';
import { useToast } from '../components/Layout/ToastProvider';

export default function EditorPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const sdk = getOCEClient();
  const { showToast } = useToast();

  const [nodeId, setNodeId] = useState<string | null>(id || null);
  const [baseIds, setBaseIds] = useState<{orgId: string, typeId: string} | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<any>({});
  const [status, setStatus] = useState('Draft');
  const [lastSaved, setLastSaved] = useState('Not saved yet');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Settings Sidebar State
  const [isPublishPanelOpen, setIsPublishPanelOpen] = useState(true);
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [featured, setFeatured] = useState(false);

  // New UI States
  const [editorWidth, setEditorWidth] = useState<'narrow' | 'default' | 'full'>('default');
  const [focusMode, setFocusMode] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [slug, setSlug] = useState('');

  // Advanced States
  // Revisions and healthScore were removed for clean UI focus

  // Refs for autosave comparison
  const contentRef = useRef(content);
  const titleRef = useRef(title);

  useEffect(() => {
    contentRef.current = content;
    titleRef.current = title;
  }, [content, title, excerpt, coverImage, category, seoTitle, seoDescription]);

  useEffect(() => {
    async function init() {
      try {
        const base = await sdk.getBaseMetadata();
        setBaseIds(base);
        
        if (nodeId) {
          const node = await sdk.getNodeById(nodeId);
          setTitle(node.title || '');
          setContent(node.content || {});
          setStatus(node.status || 'Draft');
          setExcerpt(node.excerpt || '');
          let cover = node.cover_image || '';
          if (cover.startsWith('blob:')) {
            console.warn(`[CMS] Blob URL detected in cover image. Removing broken image.`);
            cover = ''; // Blank out the broken cover image
          }
          setCoverImage(cover);
          setCategory(node.category || '');
          setTags(node.tags ? node.tags.join(', ') : '');
          setSeoTitle(node.seo_title || '');
          setSeoDescription(node.seo_description || '');
          setFeatured(node.featured || false);
          setSlug(node.slug || '');
          setLastSaved(`Saved ${new Date(node.updated_at).toLocaleTimeString()}`);
        } else {
          const templateId = location.state?.template || 'blank';
          if (templateId === 'ai') setTitle('AI Insights for Q3');
          else if (templateId === 'case-study') setTitle('Customer Success: Acme Corp');
          else setTitle('');
        }
      } catch (e: any) {
        if (e.message?.includes('SETUP_ERROR')) {
          setSetupError(e.message.replace('SETUP_ERROR: ', ''));
        } else {
          setSetupError(`Unexpected error loading editor: ${e.message}`);
        }
      }
    }
    init();
  }, [nodeId]);

  // Unsaved changes listener
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Autosave Hook (30s)
  useEffect(() => {
    const timer = setInterval(() => {
      if (hasUnsavedChanges && baseIds) {
        handleSaveDraft(false);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [hasUnsavedChanges, baseIds, nodeId]);

  const buildPayload = () => ({
    org_id: baseIds?.orgId,
    type_id: baseIds?.typeId,
    title: titleRef.current,
    content: contentRef.current,
    excerpt,
    cover_image: coverImage,
    category,
    tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
    seo_title: seoTitle,
    seo_description: seoDescription,
    featured
  });

  const hasBlobUrls = (contentObj: any): boolean => {
    if (!contentObj || typeof contentObj !== 'object') return false;
    if (contentObj.type === 'image' && contentObj.attrs?.src?.startsWith('blob:')) return true;
    if (Array.isArray(contentObj.content)) {
      return contentObj.content.some(hasBlobUrls);
    }
    return false;
  };

  const handleSaveDraft = async (manual = true) => {
    if (!baseIds) return;
    if (hasBlobUrls(contentRef.current) || coverImage?.startsWith('blob:')) {
      showToast('Please wait for image uploads to finish before saving.', 'error');
      return;
    }
    try {
      setLastSaved('Saving...');
      const payload = buildPayload();

      if (!nodeId) {
        const newNode = await sdk.createNode({ ...payload, status: 'Draft' });
        setNodeId(newNode.id);
        window.history.replaceState({}, '', `/admin/editor/${newNode.id}`);
        setLastSaved(`Saved just now`);
        if (manual) await sdk.createRevision(newNode.id, titleRef.current, contentRef.current);
      } else {
        await sdk.updateNode(nodeId, { ...payload, status: status === 'Published' ? 'Published' : 'Draft' });
        setLastSaved(`Saved just now`);
        if (manual) await sdk.createRevision(nodeId, titleRef.current, contentRef.current);
      }
      setHasUnsavedChanges(false);
      if (manual) showToast('Draft saved successfully', 'success');
    } catch (e) {
      setLastSaved('Save failed!');
      if (manual) showToast('Failed to save draft', 'error');
    }
  };

  const handlePublish = async (schedule: boolean = false) => {
    if (!baseIds) return;
    if (!titleRef.current) {
      showToast("Title is required before publishing.", 'error');
      return;
    }
    
    if (hasBlobUrls(contentRef.current) || coverImage?.startsWith('blob:')) {
      showToast('Please wait for image uploads to finish before publishing.', 'error');
      return;
    }
    
    try {
      showToast('Publishing...', 'info');
      let activeNodeId = nodeId;
      const payload = buildPayload();
      
      if (!activeNodeId) {
        const newNode = await sdk.createNode({ ...payload, status: schedule ? 'Scheduled' : 'Published' });
        activeNodeId = newNode.id;
        setNodeId(activeNodeId);
      } else {
        await sdk.updateNode(activeNodeId, { ...payload, status: schedule ? 'Scheduled' : 'Published' });
      }

      setStatus(schedule ? 'Scheduled' : 'Published');
      setHasUnsavedChanges(false);
      setShowSuccessCard(true);
      showToast(schedule ? 'Insight scheduled' : 'Insight published', 'success');
    } catch (e) {
      showToast('Publish failed', 'error');
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unpublished changes. Are you sure you want to leave?')) {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };

  const handleCoverUpload = () => {
    window.dispatchEvent(new CustomEvent('open-media-drawer', { detail: { target: 'cover' } }));
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        showToast('Uploading cover...', 'info');
        const tempBlobUrl = URL.createObjectURL(file);
        setCoverImage(tempBlobUrl);
        setHasUnsavedChanges(true);
        
        sdk.uploadMedia(file, 'general').then(url => {
          setCoverImage(url);
          showToast('Cover uploaded', 'success');
        }).catch(err => {
          console.error('Cover upload failed', err);
          setCoverImage('');
          showToast('Cover upload failed', 'error');
        });
      }
    };
    fileInput.click();
  };

  // Completion calculation
  const completionItems = [
    { label: 'Title', done: title.length > 0 },
    { label: 'Featured Image', done: !!coverImage },
    { label: 'Category', done: !!category },
    { label: 'SEO', done: !!seoTitle && !!seoDescription }
  ];
  const completedCount = completionItems.filter(i => i.done).length;

  // Reading Stats calculation
  const stats = useMemo(() => {
    let wordCount = 0;
    let charCount = 0;
    
    // Simplistic extraction of text from TipTap JSON
    const extractText = (node: any): string => {
      if (node.type === 'text') return node.text || '';
      if (node.content) return node.content.map(extractText).join(' ');
      return '';
    };

    if (content.content) {
      const text = extractText(content);
      charCount = text.length;
      wordCount = text.split(/\s+/).filter((w: string) => w.length > 0).length;
    }

    return {
      words: wordCount,
      chars: charCount,
      time: Math.max(1, Math.ceil(wordCount / 200)) // 200 WPM
    };
  }, [content]);

  if (setupError) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-bg-primary">
        <div className="bg-surface border border-border rounded-xl shadow-sm max-w-lg w-full p-8">
          <h2 className="text-lg font-semibold text-text-primary mb-1">Editor Error</h2>
          <p className="text-sm text-text-secondary leading-relaxed">{setupError}</p>
        </div>
      </div>
    );
  }

  const editorWidthClass = 
    editorWidth === 'narrow' ? 'max-w-2xl' : 
    editorWidth === 'full' ? 'max-w-none px-12' : 
    'max-w-4xl';

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden relative">
      {/* Top Navbar */}
      {!focusMode && (
        <header className="h-14 border-b border-border bg-surface px-4 flex items-center justify-between flex-shrink-0 z-10 transition-all duration-300">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-surface-hover transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="h-4 w-px bg-border"></div>
            <span className="text-sm text-text-muted">Draft in</span>
            <span className="text-sm font-medium text-text-primary">Insights</span>
            {hasUnsavedChanges && <span className="w-2 h-2 rounded-full bg-amber" title="Unsaved changes"></span>}
            <span className="text-xs text-text-muted ml-2">{lastSaved}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setFocusMode(true)}
              className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-md transition-colors mr-2"
              title="Focus Mode"
            >
              <Maximize2 size={16} />
            </button>
            
            <button onClick={() => handlePublish(false)} className="flex items-center gap-2 bg-accent text-white px-4 py-1.5 rounded-md hover:bg-accent-light transition-colors text-sm font-medium shadow-sm">
              <Send size={16} />
              Publish
            </button>
            <button 
              onClick={() => setIsPublishPanelOpen(!isPublishPanelOpen)}
              className={`p-1.5 rounded-md transition-colors lg:hidden ${isPublishPanelOpen ? 'bg-surface-hover text-text-primary' : 'text-text-secondary'}`}
            >
              <Settings size={20} />
            </button>
          </div>
        </header>
      )}

      {/* Focus Mode Exit */}
      {focusMode && (
        <div className="absolute top-4 left-4 z-50 animate-in fade-in">
          <button 
            onClick={() => setFocusMode(false)}
            className="flex items-center gap-2 bg-surface/80 backdrop-blur border border-border text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-md shadow-sm text-sm"
          >
            <Minimize2 size={14} /> Exit Focus
          </button>
        </div>
      )}

      {/* Success Card Overlay */}
      {showSuccessCard && (
        <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-surface border border-border shadow-2xl rounded-xl p-8 max-w-sm w-full text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-green/10 text-green rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">Published Successfully</h2>
            <p className="text-sm text-text-secondary mb-6">Your insight is now live and visible to viewers.</p>
            
            <div className="flex flex-col gap-3">
              <button className="w-full bg-accent text-white py-2 rounded-md font-medium hover:bg-accent-light transition-colors">
                View Live
              </button>
              <button className="w-full bg-bg-primary border border-border text-text-primary py-2 rounded-md font-medium hover:bg-surface-hover transition-colors">
                Copy Link
              </button>
              <button 
                onClick={() => setShowSuccessCard(false)}
                className="w-full text-text-secondary hover:text-text-primary py-2 text-sm transition-colors"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Editor Area */}
        <main className={`flex-1 overflow-y-auto bg-bg-primary transition-all duration-300 flex justify-center`}>
          <div className={`w-full ${editorWidthClass} py-12 px-6 lg:px-8`}>
            
            {/* Editor Width Controls - Only visible on hover in a real app, or top right */}
            {!focusMode && (
              <div className="flex justify-end mb-4 gap-1 opacity-50 hover:opacity-100 transition-opacity">
                <button onClick={() => setEditorWidth('narrow')} className={`p-1 rounded ${editorWidth === 'narrow' ? 'bg-border text-text-primary' : 'text-text-muted hover:bg-surface'}`} title="Narrow"><AlignLeft size={14} /></button>
                <button onClick={() => setEditorWidth('default')} className={`p-1 rounded ${editorWidth === 'default' ? 'bg-border text-text-primary' : 'text-text-muted hover:bg-surface'}`} title="Default"><Columns size={14} /></button>
                <button onClick={() => setEditorWidth('full')} className={`p-1 rounded ${editorWidth === 'full' ? 'bg-border text-text-primary' : 'text-text-muted hover:bg-surface'}`} title="Full Width"><Maximize2 size={14} /></button>
              </div>
            )}

            {/* Featured Image */}
            <div className="mb-8 group relative">
              {coverImage ? (
                <div className="relative rounded-xl overflow-hidden border border-border shadow-sm">
                  <img src={coverImage} alt="Featured" className="w-full h-64 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button onClick={handleCoverUpload} className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
                      Change Cover
                    </button>
                    <button onClick={() => {setCoverImage(''); setHasUnsavedChanges(true)}} className="bg-red/80 hover:bg-red text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleCoverUpload}
                  className="w-full h-32 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:border-text-secondary hover:bg-surface-hover transition-all gap-2"
                >
                  <Image size={18} />
                  <span className="font-medium text-sm">Add Featured Image</span>
                </button>
              )}
            </div>

            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setHasUnsavedChanges(true); }}
              placeholder="Insight Title"
              className="text-4xl lg:text-5xl font-serif font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-text-primary placeholder:text-text-muted w-full mb-8 leading-tight"
            />

            {/* Editor */}
            <OCEEditor 
              initialContent={content}
              onChange={(c) => { setContent(c); setHasUnsavedChanges(true); }}
            />
          </div>
        </main>

        {/* Publish Panel (Sticky Right) */}
        {!focusMode && (
          <aside className={`
            absolute inset-y-0 right-0 z-30 w-full md:w-80 bg-surface border-l border-border flex flex-col flex-shrink-0 transition-transform duration-300
            lg:relative lg:translate-x-0
            ${isPublishPanelOpen ? 'translate-x-0' : 'translate-x-full'}
          `}>
            <div className="p-4 border-b border-border flex items-center justify-between lg:hidden bg-surface">
              <h2 className="font-semibold text-text-primary">Publish Panel</h2>
              <button onClick={() => setIsPublishPanelOpen(false)} className="p-1 text-text-secondary"><ChevronLeft size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-8">
              
              {/* Publish Section */}
              <section>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Publish</h3>
                <div className="bg-bg-primary border border-border rounded-lg p-3 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">Status</span>
                    <span className={`font-medium ${status === 'Published' ? 'text-green' : 'text-amber'}`}>{status}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">Visibility</span>
                    <span className="font-medium text-text-primary">Public</span>
                  </div>
                  <button onClick={() => handlePublish(false)} className="w-full bg-text-primary text-bg-primary py-2 rounded-md text-sm font-medium hover:bg-text-secondary transition-colors mt-2">
                    {status === 'Published' ? 'Update Insight' : 'Publish Now'}
                  </button>
                </div>
              </section>

              {/* Completion Checklist */}
              <section>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Completion</h3>
                  <span className="text-xs font-medium text-text-secondary">{completedCount}/{completionItems.length}</span>
                </div>
                <div className="space-y-2">
                  {completionItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {item.done ? <CheckCircle size={14} className="text-green" /> : <div className="w-3.5 h-3.5 rounded-full border border-border"></div>}
                      <span className={item.done ? 'text-text-primary' : 'text-text-muted'}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              <hr className="border-border" />

              {/* Content Section */}
              <section>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Content</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
                    <input 
                      type="text" 
                      value={category}
                      onChange={(e) => { setCategory(e.target.value); setHasUnsavedChanges(true); }}
                      placeholder="e.g. AI Automation" 
                      className="w-full bg-bg-primary border border-border rounded-md p-2 text-sm focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Tags (comma separated)</label>
                    <input 
                      type="text" 
                      value={tags}
                      onChange={(e) => { setTags(e.target.value); setHasUnsavedChanges(true); }}
                      placeholder="e.g. future, tech" 
                      className="w-full bg-bg-primary border border-border rounded-md p-2 text-sm focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
              </section>

              <hr className="border-border" />

              {/* SEO Section */}
              <section>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">SEO & Meta</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">URL Slug</label>
                    <input 
                      type="text" 
                      value={slug}
                      readOnly
                      placeholder="auto-generated-from-title" 
                      className="w-full bg-bg-secondary border border-border rounded-md p-2 text-sm text-text-muted cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Meta Title</label>
                    <input 
                      type="text" 
                      value={seoTitle}
                      onChange={(e) => { setSeoTitle(e.target.value); setHasUnsavedChanges(true); }}
                      placeholder={title || "SEO Title"} 
                      className="w-full bg-bg-primary border border-border rounded-md p-2 text-sm focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Meta Description</label>
                    <textarea 
                      value={seoDescription}
                      onChange={(e) => { setSeoDescription(e.target.value); setHasUnsavedChanges(true); }}
                      placeholder="Brief summary for search engines..." 
                      className="w-full bg-bg-primary border border-border rounded-md p-2 text-sm focus:border-accent focus:outline-none min-h-[80px]"
                    />
                  </div>
                </div>
              </section>

              <hr className="border-border" />

              {/* Advanced / Stats Section */}
              <section>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Reading Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-bg-primary border border-border rounded p-3 text-center">
                    <span className="block text-xl font-semibold text-text-primary">{stats.words}</span>
                    <span className="text-[10px] uppercase text-text-muted">Words</span>
                  </div>
                  <div className="bg-bg-primary border border-border rounded p-3 text-center">
                    <span className="block text-xl font-semibold text-text-primary">{stats.chars}</span>
                    <span className="text-[10px] uppercase text-text-muted">Chars</span>
                  </div>
                  <div className="bg-bg-primary border border-border rounded p-3 text-center col-span-2 flex items-center justify-center gap-2">
                    <Clock size={14} className="text-text-muted" />
                    <span className="text-sm font-medium text-text-primary">{stats.time} min read</span>
                  </div>
                </div>
              </section>
              
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
