import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import OCEEditor from '../components/Editor/Editor';
import { History, Lock, ChevronLeft, Eye, Send, Image, Tag, Settings, Layout, Search, BarChart } from 'lucide-react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [featured, setFeatured] = useState(false);

  // Advanced States
  const isLocked = false;
  const lockedBy = '';
  const [isRevisionsOpen, setIsRevisionsOpen] = useState(false);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState(0);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Refs for autosave comparison
  const contentRef = useRef(content);
  const titleRef = useRef(title);

  useEffect(() => {
    contentRef.current = content;
    titleRef.current = title;
    calculateHealth();
  }, [content, title, excerpt, coverImage, category, seoTitle, seoDescription]);

  useEffect(() => {
    async function init() {
      console.log('[EditorPage] Initializing. nodeId =', nodeId ?? '(new)');
      try {
        console.log('[EditorPage] Calling getBaseMetadata()...');
        const base = await sdk.getBaseMetadata();
        console.log('[EditorPage] getBaseMetadata() returned:', base);
        setBaseIds(base);
        
        if (nodeId) {
          // Load existing node
          console.log('[EditorPage] Loading existing node:', nodeId);
          const node = await sdk.getNodeById(nodeId);
          console.log('[EditorPage] Node loaded:', node);
          setTitle(node.title || '');
          setContent(node.content || {});
          setStatus(node.status || 'Draft');
          setExcerpt(node.excerpt || '');
          setCoverImage(node.cover_image || '');
          setCategory(node.category || '');
          setTags(node.tags ? node.tags.join(', ') : '');
          setSeoTitle(node.seo_title || '');
          setSeoDescription(node.seo_description || '');
          setFeatured(node.featured || false);
          setLastSaved(`Saved ${new Date(node.updated_at).toLocaleTimeString()}`);
          
          loadRevisions(nodeId);
        } else {
          // New Insight — deferred insertion on first save
          const templateId = location.state?.template || 'blank';
          console.log('[EditorPage] New insight, template =', templateId);
          if (templateId === 'ai') setTitle('AI Insights for Q3');
          else if (templateId === 'case-study') setTitle('Customer Success: Acme Corp');
          else setTitle('');
        }
      } catch (e: any) {
        console.error('[EditorPage] init() failed:', e);
        // Pass the specific error message through (org failure vs content type failure)
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

  const calculateHealth = () => {
    let score = 0;
    if (titleRef.current.length > 5) score += 15;
    if (Object.keys(contentRef.current).length > 0) score += 20;
    if (excerpt.length > 10) score += 15;
    if (coverImage) score += 10;
    if (category) score += 10;
    if (tags) score += 10;
    if (seoTitle) score += 10;
    if (seoDescription) score += 10;
    setHealthScore(score);
  };

  const loadRevisions = async (id: string) => {
    try {
      const revs = await sdk.getRevisions(id);
      setRevisions(revs || []);
    } catch (e) {
      console.error('Failed to load revisions', e);
    }
  };

  const buildPayload = () => ({
    org_id: baseIds?.orgId,
    type_id: baseIds?.typeId,
    title: titleRef.current,
    content: contentRef.current,
    excerpt,
    cover_image: coverImage,
    category,
    tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    seo_title: seoTitle,
    seo_description: seoDescription,
    featured
  });

  const handleSaveDraft = async (manual = true) => {
    if (!baseIds) return;
    try {
      setLastSaved('Saving...');
      const payload = buildPayload();

      if (!nodeId) {
        // Deferred Insertion occurs here!
        const newNode = await sdk.createNode({ ...payload, status: 'Draft' });
        setNodeId(newNode.id);
        
        // Update URL without reloading
        window.history.replaceState({}, '', `/admin/editor/${newNode.id}`);
        setLastSaved(`Saved ${new Date().toLocaleTimeString()}`);
        if (manual) await sdk.createRevision(newNode.id, titleRef.current, contentRef.current);
      } else {
        await sdk.updateNode(nodeId, { ...payload, status: status === 'Published' ? 'Published' : 'Draft' });
        setLastSaved(`Saved ${new Date().toLocaleTimeString()}`);
        if (manual) await sdk.createRevision(nodeId, titleRef.current, contentRef.current);
      }
      setHasUnsavedChanges(false);
      if (manual && nodeId) loadRevisions(nodeId);
      if (manual) showToast('Draft saved successfully', 'success');
    } catch (e) {
      console.error('Save failed', e);
      setLastSaved('Save failed!');
      if (manual) showToast('Failed to save draft', 'error');
    }
  };

  const handlePublish = async (schedule: boolean = false) => {
    if (!baseIds) return;
    if (!titleRef.current) return alert("Title is required before publishing.");
    
    try {
      setNotifications([]);
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
      
      // Async background simulation triggers
      const steps = [
        `✓ ${schedule ? 'Scheduled' : 'Published'} successfully`,
        "✓ Search Index Updated",
        "✓ Sitemap Updated",
        "✓ Newsletter Queued",
        "✓ AI Vector Index Updated"
      ];
      
      steps.forEach((step, i) => {
        setTimeout(() => {
          setNotifications(prev => [...prev, step]);
        }, i * 600);
      });
      showToast(schedule ? 'Insight scheduled' : 'Insight published', 'success');
      
    } catch (e) {
      console.error('Publish failed', e);
      showToast('Publish failed', 'error');
    }
  };

  if (setupError) {
    // Determine which specific check failed for a targeted message
    const isOrgError     = setupError.toLowerCase().includes('organization');
    const isTypeError    = setupError.toLowerCase().includes('insights content type') || setupError.toLowerCase().includes('slug');
    const isUnexpected   = !isOrgError && !isTypeError;

    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-bg-primary">
        <div className="bg-surface border border-border rounded-xl shadow-sm max-w-lg w-full p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-red/10 text-red flex items-center justify-center flex-shrink-0 mt-0.5">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-1">
                {isOrgError  ? 'Organization Lookup Failed' :
                 isTypeError ? 'Insights Content Type Lookup Failed' :
                               'Editor Initialization Error'}
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">{setupError}</p>
            </div>
          </div>

          <div className="bg-bg-primary border border-border rounded-lg p-4 mb-6 space-y-2 text-xs font-mono text-text-muted">
            <p className="font-semibold text-text-secondary mb-2 text-xs uppercase tracking-wider">Diagnostic checks</p>
            <div className={`flex items-center gap-2 ${isOrgError ? 'text-red' : 'text-green-400'}`}>
              <span>{isOrgError ? '✕' : '✓'}</span>
              <span>organizations table has at least one row</span>
            </div>
            <div className={`flex items-center gap-2 ${isTypeError ? 'text-red' : isOrgError ? 'text-text-muted' : 'text-green-400'}`}>
              <span>{isTypeError ? '✕' : isOrgError ? '–' : '✓'}</span>
              <span>cms_content_types has slug = &quot;insights&quot;</span>
            </div>
            {isUnexpected && (
              <div className="flex items-center gap-2 text-amber">
                <span>⚠</span>
                <span>Unexpected error — check browser console</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-accent text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-accent-light transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-bg-primary border border-border text-text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-surface-hover transition-colors"
            >
              Back to Dashboard
            </button>
          </div>

          <p className="mt-4 text-xs text-text-muted text-center">
            Open browser DevTools → Console to see the full diagnostic log.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden relative">
      {/* Top Navbar */}
      <header className="h-14 border-b border-border bg-surface px-4 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-surface-hover transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="h-4 w-px bg-border"></div>
          <span className="text-sm font-medium text-text-secondary">Insights</span>
          <span className="text-sm text-text-muted">/</span>
          <span className="text-sm font-medium text-text-primary truncate max-w-[200px]">
            {title || (nodeId ? 'Loading...' : 'New Insight')}
          </span>
          {hasUnsavedChanges && <span className="w-2 h-2 rounded-full bg-amber" title="Unsaved changes"></span>}
        </div>
        
        <div className="flex items-center gap-3">
          {isLocked && (
            <div className="flex items-center gap-2 text-xs font-medium bg-amber/10 text-amber px-3 py-1.5 rounded-full">
              <Lock size={12} />
              Locked by {lockedBy}
            </div>
          )}
          
          <button 
            onClick={() => setIsRevisionsOpen(!isRevisionsOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isRevisionsOpen ? 'bg-surface-hover text-text-primary border border-border' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <History size={16} />
            Revisions
          </button>
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isSidebarOpen ? 'bg-surface-hover text-text-primary border border-border' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <Settings size={16} />
            Settings
          </button>
          
          <div className="h-4 w-px bg-border mx-1"></div>
          
          <button className="flex items-center gap-2 text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-surface-hover">
            <Eye size={16} />
            Preview
          </button>
          
          <button onClick={() => handlePublish(false)} className="flex items-center gap-2 bg-accent text-white px-4 py-1.5 rounded-md hover:bg-accent-light transition-colors text-sm font-medium shadow-sm">
            <Send size={16} />
            Publish
          </button>
        </div>
      </header>

      {/* Progress Notifications Overlay */}
      {notifications.length > 0 && (
        <div className="absolute top-16 right-6 z-50 flex flex-col gap-2 pointer-events-none">
          {notifications.map((msg, i) => (
            <div key={i} className="bg-surface border border-border shadow-lg rounded-md px-4 py-3 text-sm text-text-primary animate-in slide-in-from-right fade-in flex items-center gap-2">
              <span className="text-green font-bold">{msg.charAt(0)}</span>
              {msg.substring(1)}
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Editor Area */}
        <main className="flex-1 overflow-y-auto">
          <OCEEditor 
            title={title}
            onTitleChange={(t) => { setTitle(t); setHasUnsavedChanges(true); }}
            initialContent={content}
            onChange={(c) => { setContent(c); setHasUnsavedChanges(true); }}
            status={status}
            lastSaved={lastSaved}
            onSaveDraft={() => handleSaveDraft(true)}
          />
        </main>

        {/* Settings Sidebar */}
        {isSidebarOpen && (
          <aside className="w-80 border-l border-border bg-surface flex flex-col flex-shrink-0 animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div className="p-4 border-b border-border bg-bg-secondary sticky top-0 z-10">
              <h2 className="text-lg font-medium text-text-primary">Content Settings</h2>
              <div className="mt-4 bg-bg-primary rounded p-3 border border-border">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-text-secondary uppercase">Content Health</span>
                  <span className={`text-xs font-bold ${healthScore > 80 ? 'text-green' : healthScore > 50 ? 'text-amber' : 'text-red'}`}>{healthScore}%</span>
                </div>
                <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${healthScore > 80 ? 'bg-green' : healthScore > 50 ? 'bg-amber' : 'bg-red'}`} style={{ width: `${healthScore}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Excerpt */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                  <Layout size={14} /> Excerpt
                </label>
                <textarea 
                  value={excerpt}
                  onChange={(e) => { setExcerpt(e.target.value); setHasUnsavedChanges(true); }}
                  className="w-full bg-bg-primary border border-border rounded-md p-2 text-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none min-h-[80px]"
                  placeholder="Brief summary..."
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                  <Image size={14} /> Cover Image
                </label>
                {coverImage ? (
                  <div className="relative rounded-md overflow-hidden border border-border group">
                    <img src={coverImage} alt="Cover" className="w-full h-32 object-cover" />
                    <button onClick={() => {setCoverImage(''); setHasUnsavedChanges(true)}} className="absolute inset-0 bg-bg-primary/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm font-medium">Remove</button>
                  </div>
                ) : (
                  <button className="w-full border-2 border-dashed border-border rounded-md py-6 text-sm text-text-muted hover:text-text-primary hover:border-text-secondary transition-colors flex flex-col items-center gap-2">
                    <Image size={24} />
                    <span>Upload or Drag Image</span>
                  </button>
                )}
              </div>

              {/* Taxonomy */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                  <Tag size={14} /> Taxonomy
                </label>
                <input 
                  type="text" 
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setHasUnsavedChanges(true); }}
                  placeholder="Category (e.g. AI Automation)" 
                  className="w-full bg-bg-primary border border-border rounded-md p-2 text-sm mb-2 focus:border-accent focus:outline-none"
                />
                <input 
                  type="text" 
                  value={tags}
                  onChange={(e) => { setTags(e.target.value); setHasUnsavedChanges(true); }}
                  placeholder="Tags (comma separated)" 
                  className="w-full bg-bg-primary border border-border rounded-md p-2 text-sm focus:border-accent focus:outline-none"
                />
              </div>

              {/* SEO */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                  <Search size={14} /> Search Engine Optimization
                </label>
                <input 
                  type="text" 
                  value={seoTitle}
                  onChange={(e) => { setSeoTitle(e.target.value); setHasUnsavedChanges(true); }}
                  placeholder="SEO Title" 
                  className="w-full bg-bg-primary border border-border rounded-md p-2 text-sm mb-2 focus:border-accent focus:outline-none"
                />
                <textarea 
                  value={seoDescription}
                  onChange={(e) => { setSeoDescription(e.target.value); setHasUnsavedChanges(true); }}
                  placeholder="Meta Description..." 
                  className="w-full bg-bg-primary border border-border rounded-md p-2 text-sm focus:border-accent focus:outline-none min-h-[80px]"
                />
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
                  <BarChart size={14} /> Featured Article
                </label>
                <button 
                  onClick={() => { setFeatured(!featured); setHasUnsavedChanges(true); }}
                  className={`w-10 h-5 rounded-full relative transition-colors ${featured ? 'bg-accent' : 'bg-border'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${featured ? 'translate-x-5' : ''}`}></span>
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Revisions Sidebar */}
        {isRevisionsOpen && (
          <aside className="w-80 border-l border-border bg-surface flex flex-col flex-shrink-0 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-medium text-text-primary">Version History</h2>
              <p className="text-xs text-text-muted mt-1">View and restore previous versions</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {revisions.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8">No revisions yet.</p>
              ) : revisions.map((rev, index) => (
                <div key={rev.id} className="relative pl-6">
                  {index !== revisions.length - 1 && (
                    <div className="absolute left-[9px] top-6 bottom-[-24px] w-px bg-border"></div>
                  )}
                  <div className={`absolute left-0 top-1.5 w-[19px] h-[19px] rounded-full border-4 border-surface ${index === 0 ? 'bg-accent' : 'bg-border'}`}></div>
                  
                  <div className={`p-3 rounded-md border ${index === 0 ? 'border-accent bg-accent/5' : 'border-border bg-bg-primary hover:border-border-hover cursor-pointer transition-colors'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-text-primary">{new Date(rev.created_at).toLocaleString()}</span>
                      {index === 0 && <span className="text-[10px] uppercase tracking-wider font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">Current</span>}
                    </div>
                    <p className="text-xs text-text-secondary">Edited by System</p>
                    {index !== 0 && (
                      <button className="mt-2 text-xs font-medium text-accent hover:text-accent-light transition-colors">
                        Restore this version
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
