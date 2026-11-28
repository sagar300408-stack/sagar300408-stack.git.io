import { useState, useEffect } from 'react';
import {
  X, Save, Send, CheckCircle2, Globe, Calendar, Image as ImageIcon,
  Tag, Trash2, History, AlertCircle, Video, Plus, RotateCcw, Eye, ExternalLink
} from 'lucide-react';
import OCEEditor from '../Editor/Editor';
import MediaDrawer from '../Editor/MediaDrawer';
import { useToast } from '../Layout/ToastProvider';
import {
  getOCEClient,
  type GrowthContentItem,
  type ContentType,
  type ContentStatus,
  type MarketingChannel,
  type MarketingObjective,
  type MarketingAudience,
  type MarketingInitiative,
  type GrowthContentRevision,
  VALID_CONTENT_TRANSITIONS
} from '../../lib/sdk';

interface ContentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  orgId: string;
  item?: GrowthContentItem | null;
  defaultType?: ContentType;
}

const CONTENT_TYPES: { id: ContentType; label: string }[] = [
  { id: 'blog', label: 'Blog Post' },
  { id: 'article', label: 'Article / Guide' },
  { id: 'social', label: 'Social Media Post' },
  { id: 'newsletter', label: 'Newsletter Edition' },
  { id: 'case_study', label: 'Case Study' },
  { id: 'whitepaper', label: 'Whitepaper / Report' },
  { id: 'landing_page', label: 'Landing Page' },
  { id: 'other', label: 'Other Document' },
];

const STATUS_LABELS: Record<ContentStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  in_review: { label: 'In Review', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  changes_requested: { label: 'Changes Requested', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  approved: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  scheduled: { label: 'Scheduled', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  published: { label: 'Published', color: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  archived: { label: 'Archived', color: 'bg-slate-100 text-slate-500 border-slate-200' },
};

export default function ContentEditorModal({
  isOpen,
  onClose,
  onSaved,
  orgId,
  item,
  defaultType = 'blog',
}: ContentEditorModalProps) {
  const { showToast } = useToast();
  const sdk = getOCEClient();

  const [activeTab, setActiveTab] = useState<'editor' | 'strategy' | 'schedule' | 'cms' | 'revisions'>('editor');
  const [saving, setSaving] = useState(false);
  const [isMediaDrawerOpen, setIsMediaDrawerOpen] = useState(false);
  const [channels, setChannels] = useState<MarketingChannel[]>([]);
  const [objectives, setObjectives] = useState<MarketingObjective[]>([]);
  const [audiences, setAudiences] = useState<MarketingAudience[]>([]);
  const [initiatives, setInitiatives] = useState<MarketingInitiative[]>([]);
  const [revisions, setRevisions] = useState<GrowthContentRevision[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [contentType, setContentType] = useState<ContentType>(defaultType);
  const [status, setStatus] = useState<ContentStatus>('draft');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState<any>({ type: 'doc', content: [{ type: 'paragraph' }] });
  const [coverImage, setCoverImage] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [mediaDrawerMode, setMediaDrawerMode] = useState<'cover' | 'attachment'>('cover');
  const [previewRevision, setPreviewRevision] = useState<GrowthContentRevision | null>(null);
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [channelId, setChannelId] = useState('');
  const [objectiveId, setObjectiveId] = useState('');
  const [audienceId, setAudienceId] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [cmsNodeId, setCmsNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setTitle(item.title || '');
        setSlug(item.slug || '');
        setContentType(item.content_type || 'blog');
        setStatus(item.status || 'draft');
        setSummary(item.summary || '');
        setContent(item.content || { type: 'doc', content: [{ type: 'paragraph' }] });
        setCoverImage(item.cover_image || '');
        setMediaUrls(item.media_urls || []);
        setCategory(item.category || '');
        setTagsInput((item.tags || []).join(', '));
        setChannelId(item.channel_id || '');
        setObjectiveId(item.objective_id || '');
        setAudienceId(item.audience_id || '');
        setCampaignId(item.campaign_id || '');
        setAuthorName(item.author_name || '');
        setReviewerName(item.reviewer_name || '');
        setScheduledFor(item.scheduled_for ? new Date(item.scheduled_for).toISOString().slice(0, 16) : '');
        setRejectionReason(item.rejection_reason || '');
        setCmsNodeId(item.cms_node_id || null);
        setPreviewRevision(null);

        // Load revisions
        sdk.getContentRevisions(orgId, item.id).then(setRevisions).catch(() => {});
      } else {
        // Reset defaults
        setTitle('');
        setSlug(`content-${Date.now()}`);
        setContentType(defaultType);
        setStatus('draft');
        setSummary('');
        setContent({ type: 'doc', content: [{ type: 'paragraph' }] });
        setCoverImage('');
        setMediaUrls([]);
        setCategory('');
        setTagsInput('');
        setChannelId('');
        setObjectiveId('');
        setAudienceId('');
        setCampaignId('');
        setAuthorName('');
        setReviewerName('');
        setScheduledFor('');
        setRejectionReason('');
        setCmsNodeId(null);
        setRevisions([]);
        setPreviewRevision(null);
      }

      // Load marketing relations
      sdk.getMarketingChannels(orgId).then(setChannels).catch(() => {});
      sdk.getMarketingObjectives(orgId).then(setObjectives).catch(() => {});
      sdk.getMarketingAudiences(orgId).then(setAudiences).catch(() => {});
      sdk.getMarketingInitiatives(orgId).then(setInitiatives).catch(() => {});
    }
  }, [isOpen, item, defaultType, orgId, sdk]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!item) {
      const generated = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setSlug(generated ? `${generated}-${Date.now().toString().slice(-4)}` : `content-${Date.now()}`);
    }
  };

  const parseTags = () => {
    return tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
  };

  const handleSave = async (overrideStatus?: ContentStatus) => {
    if (!title.trim()) {
      showToast('Please enter a content title', 'error');
      return;
    }

    try {
      setSaving(true);
      const targetStatus = overrideStatus || status;
      const tags = parseTags();

      const payload: Partial<GrowthContentItem> = {
        title: title.trim(),
        slug: slug.trim() || `content-${Date.now()}`,
        content_type: contentType,
        status: targetStatus,
        summary: summary.trim() || null,
        content,
        cover_image: coverImage.trim() || null,
        media_urls: mediaUrls,
        category: category.trim() || null,
        tags,
        channel_id: channelId || null,
        objective_id: objectiveId || null,
        audience_id: audienceId || null,
        campaign_id: campaignId || null,
        author_name: authorName.trim() || null,
        reviewer_name: reviewerName.trim() || null,
        scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : null,
        rejection_reason: rejectionReason.trim() || null,
      };

      let savedItem: GrowthContentItem;
      if (item?.id) {
        savedItem = (await sdk.updateContentItem(orgId, item.id, payload))!;
        // Also save revision snapshot
        await sdk.createContentRevision(orgId, item.id, title, summary, content, `Updated as ${targetStatus}`);
        showToast('Content item updated', 'success');
      } else {
        savedItem = await sdk.createContentItem(orgId, payload);
        await sdk.createContentRevision(orgId, savedItem.id, title, summary, content, 'Initial draft created');
        showToast('Content draft created', 'success');
      }

      onSaved();
      onClose();
    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Failed to save content', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToCMS = async () => {
    if (!item?.id) {
      showToast('Please save the draft first before publishing to website', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await sdk.publishContentToCMS(orgId, item.id);
      setCmsNodeId(res.cmsNodeId);
      setStatus('published');
      showToast('✓ Successfully published to Website (Insights CMS)!', 'success');
      onSaved();
    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Failed to publish to CMS', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item?.id) return;
    if (!confirm('Are you sure you want to delete this content item?')) return;

    try {
      setSaving(true);
      await sdk.deleteContentItem(orgId, item.id);
      showToast('Content item deleted', 'success');
      onSaved();
      onClose();
    } catch (e: any) {
      showToast(e?.message || 'Delete failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreRevision = async (rev: GrowthContentRevision) => {
    if (!item?.id) return;
    if (!confirm(`Restore content from Version ${rev.version}? Your current editor inputs will be replaced.`)) return;

    try {
      setSaving(true);
      await sdk.restoreContentRevision(orgId, item.id, rev.version);
      setTitle(rev.title);
      setSummary(rev.summary || '');
      setContent(rev.content);
      showToast(`Restored Version ${rev.version} snapshot`, 'success');
      const updatedRevs = await sdk.getContentRevisions(orgId, item.id);
      setRevisions(updatedRevs);
      setPreviewRevision(null);
      onSaved();
    } catch (e: any) {
      showToast(e.message || 'Failed to restore revision', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_LABELS[status]?.color || 'bg-gray-100 text-gray-700'}`}>
              {STATUS_LABELS[status]?.label || status}
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-500 bg-gray-200/80 px-2 py-0.5 rounded">
              {contentType.replace('_', ' ')}
            </span>
            {item?.id ? (
              <span className="text-xs text-gray-400">ID: {item.id.slice(0, 8)}…</span>
            ) : (
              <span className="text-xs text-blue-600 font-medium">New Content Item</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-gray-200 px-6 bg-white gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('editor')}
            className={`py-3 border-b-2 transition-colors ${activeTab === 'editor' ? 'border-[#0ea5e9] text-[#0ea5e9]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            Body & Content
          </button>
          <button
            onClick={() => setActiveTab('strategy')}
            className={`py-3 border-b-2 transition-colors ${activeTab === 'strategy' ? 'border-[#0ea5e9] text-[#0ea5e9]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            Strategy & Channel
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-3 border-b-2 transition-colors ${activeTab === 'schedule' ? 'border-[#0ea5e9] text-[#0ea5e9]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            Schedule & Status
          </button>
          <button
            onClick={() => setActiveTab('cms')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'cms' ? 'border-[#0ea5e9] text-[#0ea5e9]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            <Globe size={14} />
            <span>Website CMS</span>
            {cmsNodeId && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>
          {item?.id && (
            <button
              onClick={() => setActiveTab('revisions')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'revisions' ? 'border-[#0ea5e9] text-[#0ea5e9]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <History size={14} />
              <span>History ({revisions.length})</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'editor' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter a compelling title..."
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-lg font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="slug-url-identifier"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Cover Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://... or select from Media Library"
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setMediaDrawerMode('cover');
                        setIsMediaDrawerOpen(true);
                      }}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <ImageIcon size={14} />
                      <span>Media</span>
                    </button>
                  </div>
                </div>
              </div>

              {coverImage && (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 h-32 bg-gray-50 flex items-center justify-center">
                  <img src={coverImage} alt="Cover preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded p-1 text-xs hover:bg-black"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Image & Video Attachments Section */}
              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video size={16} className="text-[#0ea5e9]" />
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-800">
                      Image & Video Attachments ({mediaUrls.length})
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaDrawerMode('attachment');
                      setIsMediaDrawerOpen(true);
                    }}
                    className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Plus size={13} />
                    <span>Attach from Media Library</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    placeholder="Or paste direct video/image URL (MP4, WebM, YouTube, CDN asset)..."
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newMediaUrl.trim()) {
                          setMediaUrls((prev) => [...prev, newMediaUrl.trim()]);
                          setNewMediaUrl('');
                          showToast('Attachment added', 'success');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newMediaUrl.trim()) {
                        setMediaUrls((prev) => [...prev, newMediaUrl.trim()]);
                        setNewMediaUrl('');
                        showToast('Attachment added', 'success');
                      }
                    }}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-medium rounded-lg transition-colors"
                  >
                    Add URL
                  </button>
                </div>

                {mediaUrls.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                    {mediaUrls.map((url, idx) => {
                      const isVideo = /\.(mp4|webm|mov|mkv)($|\?)/i.test(url) || url.includes('youtube') || url.includes('vimeo');
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-white shadow-xs text-xs">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {isVideo ? (
                              <Video size={16} className="text-purple-600 shrink-0" />
                            ) : (
                              <ImageIcon size={16} className="text-blue-600 shrink-0" />
                            )}
                            <span className="truncate text-gray-700 font-mono text-[11px]" title={url}>
                              {url.split('/').pop() || url}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <a href={url} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-400 hover:text-gray-700">
                              <ExternalLink size={12} />
                            </a>
                            <button
                              type="button"
                              onClick={() => setMediaUrls((prev) => prev.filter((_, i) => i !== idx))}
                              className="p-1 text-rose-500 hover:text-rose-700"
                              title="Remove attachment"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Summary / Excerpt</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
                  placeholder="Short brief or hook summarizing the content piece..."
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Rich Text Content</label>
                <div className="border border-gray-300 rounded-lg overflow-hidden min-h-[320px] bg-white">
                  <OCEEditor
                    initialContent={content}
                    onChange={(json) => setContent(json)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'strategy' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Content Type</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as ContentType)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                  >
                    {CONTENT_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. AI Strategy, Automation, Product"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Tags (comma-separated)</label>
                <div className="relative">
                  <Tag size={14} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="LLM, enterprise-ai, workflows, roi"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Growth Module Alignment</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Marketing Channel</label>
                    <select
                      value={channelId}
                      onChange={(e) => setChannelId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-700"
                    >
                      <option value="">None / Unassigned</option>
                      {channels.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.category})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Marketing Objective</label>
                    <select
                      value={objectiveId}
                      onChange={(e) => setObjectiveId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-700"
                    >
                      <option value="">None / General</option>
                      {objectives.map(o => (
                        <option key={o.id} value={o.id}>{o.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Target Audience (ICP)</label>
                    <select
                      value={audienceId}
                      onChange={(e) => setAudienceId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-700"
                    >
                      <option value="">All Audiences</option>
                      {audiences.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.industry})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Marketing Campaign (Initiative)</label>
                    <select
                      value={campaignId}
                      onChange={(e) => setCampaignId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-700"
                    >
                      <option value="">None / Unassigned</option>
                      {initiatives.map(i => (
                        <option key={i.id} value={i.id}>{i.name} ({i.priority} Priority)</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Author name"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Assigned Reviewer</label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Editor / Reviewer name"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-5">
              {/* Visual Lifecycle Stepper */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Editorial Lifecycle Progression
                </span>
                <div className="flex items-center justify-between text-xs font-semibold gap-1 overflow-x-auto pb-1">
                  {[
                    { key: 'draft', label: '1. Draft' },
                    { key: 'in_review', label: '2. In Review' },
                    { key: 'approved', label: '3. Approved' },
                    { key: 'scheduled', label: '4. Scheduled' },
                    { key: 'published', label: '5. Published' },
                  ].map((step, idx, arr) => {
                    const isCurrent = status === step.key;
                    const isPassed =
                      (status === 'in_review' && idx < 1) ||
                      (status === 'approved' && idx < 2) ||
                      (status === 'scheduled' && idx < 3) ||
                      (status === 'published' && idx < 4);

                    return (
                      <div key={step.key} className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-lg border text-xs ${
                            isCurrent
                              ? 'bg-[#244235] text-white border-[#244235] font-bold shadow-xs'
                              : isPassed
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-white text-gray-400 border-gray-200'
                          }`}
                        >
                          {step.label}
                        </span>
                        {idx < arr.length - 1 && <span className="text-gray-300">→</span>}
                      </div>
                    );
                  })}
                </div>
                {(status === 'changes_requested' || status === 'rejected' || status === 'archived') && (
                  <div className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <AlertCircle size={13} className="text-amber-600 shrink-0" />
                    <span>Special Lifecycle State: <strong className="capitalize">{status.replace('_', ' ')}</strong></span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Enforce Valid Lifecycle Transition
                </label>
                <div className="p-3 bg-white border border-gray-200 rounded-lg space-y-2">
                  <div className="text-xs text-gray-500 mb-1">
                    Current Status: <span className={`font-bold px-2 py-0.5 rounded text-xs ${STATUS_LABELS[status]?.color || 'bg-gray-100 text-gray-700'}`}>{STATUS_LABELS[status]?.label || status}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[status, ...(VALID_CONTENT_TRANSITIONS[status] || [])].filter((val, i, self) => self.indexOf(val) === i).map((allowedSt) => (
                      <button
                        key={allowedSt}
                        type="button"
                        onClick={() => setStatus(allowedSt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          status === allowedSt
                            ? 'bg-[#0ea5e9] text-white border-[#0ea5e9] shadow-xs'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {STATUS_LABELS[allowedSt]?.label || allowedSt}
                        {status === allowedSt ? ' (Current)' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Scheduled Release Date & Time</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => {
                      setScheduledFor(e.target.value);
                      if (e.target.value && (status === 'draft' || status === 'approved')) {
                        setStatus('scheduled');
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Setting a release date automatically displays this item in the Editorial Calendar.
                </p>
              </div>

              {(status === 'changes_requested' || status === 'rejected' || rejectionReason) && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-rose-700 mb-1 flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    <span>Editorial Review Feedback / Revision Notes</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    placeholder="Provide actionable feedback on what requires modification before approval..."
                    className="w-full px-3 py-2 bg-rose-50/50 border border-rose-200 rounded-lg text-sm text-rose-900 placeholder:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'cms' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="text-[#0ea5e9]" size={18} />
                  <h4 className="text-sm font-semibold text-gray-900">Operations CMS Website Sync</h4>
                </div>
                <p className="text-xs text-gray-600">
                  Growth Content is fully synchronized with the website's public publication engine (Operations → Insights).
                  When an article or blog post is approved, you can publish or transfer it directly to the live site.
                </p>
              </div>

              {cmsNodeId ? (
                <div className="p-4 border border-emerald-200 bg-emerald-50 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                    <CheckCircle2 size={16} />
                    <span>Linked to CMS Node</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Live CMS Node ID: <code className="bg-white/80 px-2 py-0.5 rounded font-mono text-emerald-900">{cmsNodeId}</code>
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handlePublishToCMS}
                      disabled={saving}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Globe size={14} />
                      <span>{saving ? 'Syncing…' : 'Update Live CMS Publication'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-gray-200 rounded-xl space-y-3 bg-white">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700">Publish to Live Website</h5>
                  <p className="text-xs text-gray-500">
                    This content item has not yet been pushed to the website's public Insights CMS.
                  </p>
                  <button
                    type="button"
                    onClick={handlePublishToCMS}
                    disabled={saving}
                    className="px-4 py-2 bg-[#244235] hover:bg-[#1a3328] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Globe size={14} />
                    <span>{saving ? 'Publishing…' : 'Publish to Website (Insights CMS)'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'revisions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Snapshot & Revisions History</h4>
                  <p className="text-xs text-gray-400">Inspect past versions or restore previous content snapshots.</p>
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  {revisions.length} {revisions.length === 1 ? 'Snapshot' : 'Snapshots'}
                </span>
              </div>

              {previewRevision && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                    <span className="flex items-center gap-1.5">
                      <Eye size={14} />
                      Previewing Version {previewRevision.version}: {previewRevision.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewRevision(null)}
                      className="text-blue-700 hover:text-blue-900"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {previewRevision.summary && (
                    <p className="text-xs text-blue-800 italic">{previewRevision.summary}</p>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleRestoreRevision(previewRevision)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw size={12} />
                      <span>Restore This Version</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewRevision(null)}
                      className="px-2.5 py-1 bg-white border border-blue-300 text-blue-700 rounded text-xs font-medium hover:bg-blue-50"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              )}

              {revisions.length === 0 ? (
                <p className="text-xs text-gray-500 italic p-4 text-center border border-dashed border-gray-200 rounded-xl">
                  No previous revisions recorded yet. Revisions are created automatically whenever you save edits.
                </p>
              ) : (
                <div className="space-y-2">
                  {revisions.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 border border-gray-200 rounded-lg flex items-center justify-between text-xs bg-gray-50 hover:bg-gray-100/70 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[10px]">
                            v{r.version}
                          </span>
                          <span className="font-semibold text-gray-800">{r.title}</span>
                        </div>
                        <p className="text-[11px] text-gray-500">
                          {r.change_summary || 'Content revision update'}
                        </p>
                        <span className="text-[10px] text-gray-400">
                          {new Date(r.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewRevision(r)}
                          className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded flex items-center gap-1 transition-colors hover:border-gray-300"
                        >
                          <Eye size={12} />
                          <span>Preview</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRestoreRevision(r)}
                          className="px-2.5 py-1 text-xs text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded flex items-center gap-1 transition-colors font-medium"
                        >
                          <RotateCcw size={12} />
                          <span>Restore</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            {item?.id && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>
            {status === 'draft' && (
              <button
                type="button"
                onClick={() => handleSave('in_review')}
                disabled={saving}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Send size={14} />
                <span>Submit for Review</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="px-5 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <Save size={14} />
              <span>{saving ? 'Saving…' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Media Picker Drawer */}
      <MediaDrawer
        isOpen={isMediaDrawerOpen}
        onClose={() => setIsMediaDrawerOpen(false)}
        onSelectImage={(url) => {
          if (mediaDrawerMode === 'cover') {
            setCoverImage(url);
            showToast('Cover image selected from Media Library', 'success');
          } else {
            setMediaUrls((prev) => [...prev, url]);
            showToast('Media attachment added from Media Library', 'success');
          }
        }}
      />
    </div>
  );
}
