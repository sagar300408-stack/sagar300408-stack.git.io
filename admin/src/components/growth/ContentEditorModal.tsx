import { useState, useEffect } from 'react';
import {
  X, Save, Send, CheckCircle2, Globe, Calendar, Image as ImageIcon,
  Tag, Trash2, History, AlertCircle
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
  type GrowthContentRevision
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
  const [revisions, setRevisions] = useState<GrowthContentRevision[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [contentType, setContentType] = useState<ContentType>(defaultType);
  const [status, setStatus] = useState<ContentStatus>('draft');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState<any>({ type: 'doc', content: [{ type: 'paragraph' }] });
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [channelId, setChannelId] = useState('');
  const [objectiveId, setObjectiveId] = useState('');
  const [audienceId, setAudienceId] = useState('');
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
        setCategory(item.category || '');
        setTagsInput((item.tags || []).join(', '));
        setChannelId(item.channel_id || '');
        setObjectiveId(item.objective_id || '');
        setAudienceId(item.audience_id || '');
        setAuthorName(item.author_name || '');
        setReviewerName(item.reviewer_name || '');
        setScheduledFor(item.scheduled_for ? new Date(item.scheduled_for).toISOString().slice(0, 16) : '');
        setRejectionReason(item.rejection_reason || '');
        setCmsNodeId(item.cms_node_id || null);

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
        setCategory('');
        setTagsInput('');
        setChannelId('');
        setObjectiveId('');
        setAudienceId('');
        setAuthorName('');
        setReviewerName('');
        setScheduledFor('');
        setRejectionReason('');
        setCmsNodeId(null);
        setRevisions([]);
      }

      // Load marketing relations
      sdk.getMarketingChannels(orgId).then(setChannels).catch(() => {});
      sdk.getMarketingObjectives(orgId).then(setObjectives).catch(() => {});
      sdk.getMarketingAudiences(orgId).then(setAudiences).catch(() => {});
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
        category: category.trim() || null,
        tags,
        channel_id: channelId || null,
        objective_id: objectiveId || null,
        audience_id: audienceId || null,
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
                      onClick={() => setIsMediaDrawerOpen(true)}
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
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Lifecycle Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContentStatus)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-800"
                >
                  <option value="draft">Draft (Work in progress)</option>
                  <option value="in_review">In Review (Submitted for editorial check)</option>
                  <option value="changes_requested">Changes Requested (Revision needed)</option>
                  <option value="approved">Approved (Editorial approval granted)</option>
                  <option value="scheduled">Scheduled (Queued for calendar release)</option>
                  <option value="published">Published (Released to target channels)</option>
                  <option value="rejected">Rejected</option>
                  <option value="archived">Archived</option>
                </select>
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
                      if (e.target.value && status === 'draft') setStatus('scheduled');
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Snapshot & Revisions History</h4>
              {revisions.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No previous revisions recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {revisions.map(r => (
                    <div key={r.id} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between text-xs bg-gray-50">
                      <div>
                        <span className="font-semibold text-gray-900">Version {r.version}:</span>{' '}
                        <span className="text-gray-600">{r.change_summary || r.title}</span>
                      </div>
                      <span className="text-gray-400">{new Date(r.created_at).toLocaleString()}</span>
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
          setCoverImage(url);
          showToast('Cover image selected from Media Library', 'success');
        }}
      />
    </div>
  );
}
