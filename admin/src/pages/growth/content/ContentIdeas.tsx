import { useState, useEffect, useCallback } from 'react';
import {
  Lightbulb, Plus, Search, ArrowRight,
  CheckCircle2,
  Edit2, Trash2, X
} from 'lucide-react';
import { useAuth } from '../../../lib/AuthContext';
import { useToast } from '../../../components/Layout/ToastProvider';
import {
  getOCEClient,
  type GrowthContentIdea,
  type IdeaStatus,
  type IdeaPriority,
  type ContentType,
  type MarketingObjective,
  type MarketingAudience,
  type GrowthContentItem
} from '../../../lib/sdk';
import {
  GrowthPageHeader,
  ContentNav,
  ContentEditorModal,
  GrowthEmptyState
} from '../../../components/growth';

const STATUS_CONFIG: Record<IdeaStatus, { label: string; bg: string; text: string; border: string }> = {
  new: { label: 'New', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  under_review: { label: 'Under Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  approved: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  rejected: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  converted: { label: 'Converted to Draft', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  archived: { label: 'Archived', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

const PRIORITY_CONFIG: Record<IdeaPriority, { label: string; badge: string }> = {
  low: { label: 'Low', badge: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', badge: 'bg-blue-50 text-blue-700' },
  high: { label: 'High', badge: 'bg-amber-100 text-amber-800' },
};

const CONTENT_TYPES: { id: ContentType; label: string }[] = [
  { id: 'blog', label: 'Blog Post' },
  { id: 'article', label: 'Article / Guide' },
  { id: 'social', label: 'Social Post' },
  { id: 'newsletter', label: 'Newsletter' },
  { id: 'case_study', label: 'Case Study' },
  { id: 'whitepaper', label: 'Whitepaper' },
  { id: 'other', label: 'Other Document' },
];

export default function ContentIdeas() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const { showToast } = useToast();
  const sdk = getOCEClient();

  const [ideas, setIdeas] = useState<GrowthContentIdea[]>([]);
  const [objectives, setObjectives] = useState<MarketingObjective[]>([]);
  const [audiences, setAudiences] = useState<MarketingAudience[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<IdeaStatus | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<IdeaPriority | 'all'>('all');
  const [selectedType, setSelectedType] = useState<ContentType | 'all'>('all');

  // Idea Capture Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<GrowthContentIdea | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContentType, setFormContentType] = useState<ContentType>('blog');
  const [formPriority, setFormPriority] = useState<IdeaPriority>('medium');
  const [formStatus, setFormStatus] = useState<IdeaStatus>('new');
  const [formObjectiveId, setFormObjectiveId] = useState('');
  const [formAudienceId, setFormAudienceId] = useState('');
  const [formTargetAudience, setFormTargetAudience] = useState('');
  const [formTags, setFormTags] = useState('');
  const [saving, setSaving] = useState(false);

  // Editor Modal for converted or created draft
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [convertedDraft, setConvertedDraft] = useState<GrowthContentItem | null>(null);

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [ideasData, objData, audData] = await Promise.all([
        sdk.getContentIdeas(orgId),
        sdk.getMarketingObjectives(orgId),
        sdk.getMarketingAudiences(orgId)
      ]);
      setIdeas(ideasData);
      setObjectives(objData);
      setAudiences(audData);
    } catch (e: any) {
      console.warn('[ContentIdeas] Error loading data:', e);
      showToast(e.message || 'Failed to load content ideas', 'error');
    } finally {
      setLoading(false);
    }
  }, [orgId, sdk, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open capture modal
  const handleOpenCapture = (idea?: GrowthContentIdea) => {
    if (idea) {
      setEditingIdea(idea);
      setFormTitle(idea.title);
      setFormSummary(idea.description || '');
      setFormContentType((idea.category as ContentType) || 'blog');
      setFormPriority(idea.priority || 'medium');
      setFormStatus(idea.status || 'new');
      setFormObjectiveId(idea.objective_id || '');
      setFormAudienceId(idea.audience_id || '');
      setFormTargetAudience(idea.notes || '');
      setFormTags(idea.tags ? idea.tags.join(', ') : '');
    } else {
      setEditingIdea(null);
      setFormTitle('');
      setFormSummary('');
      setFormContentType('blog');
      setFormPriority('medium');
      setFormStatus('new');
      setFormObjectiveId('');
      setFormAudienceId('');
      setFormTargetAudience('');
      setFormTags('');
    }
    setIsModalOpen(true);
  };

  const handleSaveIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !formTitle.trim()) return;

    setSaving(true);
    try {
      const parsedTags = formTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: formTitle.trim(),
        description: formSummary.trim() || undefined,
        category: formContentType,
        priority: formPriority,
        status: formStatus,
        objective_id: formObjectiveId || undefined,
        audience_id: formAudienceId || undefined,
        notes: formTargetAudience.trim() || undefined,
        tags: parsedTags,
      };

      if (editingIdea) {
        await sdk.updateContentIdea(orgId, editingIdea.id, payload);
        showToast('Idea updated successfully', 'success');
      } else {
        await sdk.createContentIdea(orgId, payload);
        showToast('Idea captured into backlog', 'success');
      }

      setIsModalOpen(false);
      loadData();
    } catch (e: any) {
      showToast(e.message || 'Failed to save idea', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ideaId: string, ideaTitle: string) => {
    if (!orgId || !window.confirm(`Delete idea "${ideaTitle}"?`)) return;
    try {
      await sdk.deleteContentIdea(orgId, ideaId);
      showToast('Idea removed', 'success');
      loadData();
    } catch (e: any) {
      showToast(e.message || 'Failed to delete idea', 'error');
    }
  };

  const handleConvertToDraft = async (idea: GrowthContentIdea) => {
    if (!orgId) return;
    try {
      const result = await sdk.convertIdeaToDraft(orgId, idea.id, (idea.category as ContentType) || 'blog');
      showToast(`Converted "${idea.title}" into draft`, 'success');
      setConvertedDraft(result.contentItem);
      setEditorModalOpen(true);
      loadData();
    } catch (e: any) {
      showToast(e.message || 'Failed to convert idea to draft', 'error');
    }
  };

  // Filter ideas
  const filteredIdeas = ideas.filter((item) => {
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && item.priority !== selectedPriority) return false;
    if (selectedType !== 'all' && item.category !== selectedType) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchSummary = item.description?.toLowerCase().includes(query);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(query));
      if (!matchTitle && !matchSummary && !matchTags) return false;
    }
    return true;
  });

  // Summary counts
  const newCount = ideas.filter((i) => i.status === 'new').length;
  const convertedCount = ideas.filter((i) => i.status === 'converted').length;
  const urgentCount = ideas.filter((i) => i.priority === 'high').length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#fafafa]">
      <GrowthPageHeader
        title="Content Ideas Backlog"
        description="Capture, prioritize, and seamlessly convert inspiration and topic proposals into production drafts."
        actions={
          <button
            onClick={() => handleOpenCapture()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#244235] text-white hover:bg-[#1a3026] rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <Plus size={14} />
            <span>Capture Idea</span>
          </button>
        }
      />

      <ContentNav />

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-6">
        {/* Metric summary banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Backlog Pool
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{ideas.length}</span>
              <span className="text-xs text-gray-400">total concepts</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Fresh Ideas
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{newCount}</span>
              <span className="text-xs text-blue-600 font-medium">{newCount} unreviewed</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              High Priority
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{urgentCount}</span>
              <span className="text-xs text-rose-600 font-medium">high or urgent</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Converted to Drafts
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{convertedCount}</span>
              <span className="text-xs text-purple-600 font-medium">in production</span>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ideas by title, summary, or tags..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="under_review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="converted">Converted</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]"
            >
              <option value="all">All Formats</option>
              {CONTENT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ideas Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading ideas backlog...</div>
        ) : filteredIdeas.length === 0 ? (
          <GrowthEmptyState
            icon={Lightbulb}
            title="No Ideas in Backlog"
            description={
              searchQuery || selectedStatus !== 'all' || selectedPriority !== 'all'
                ? 'No ideas match your current filter settings.'
                : 'Capture your first content topic, article pitch, or social campaign angle to begin filling the pipeline.'
            }
            action={
              <button
                onClick={() => handleOpenCapture()}
                className="px-3.5 py-2 bg-[#244235] text-white hover:bg-[#1a3026] rounded-lg text-xs font-medium transition-colors shadow-xs"
              >
                Capture Idea
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredIdeas.map((idea) => {
              const statusCfg = STATUS_CONFIG[idea.status] || STATUS_CONFIG.new;
              const priorityCfg = PRIORITY_CONFIG[idea.priority] || PRIORITY_CONFIG.medium;
              const isConverted = idea.status === 'converted';

              return (
                <div
                  key={idea.id}
                  className={`bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all shadow-xs flex flex-col justify-between p-5 group ${
                    isConverted ? 'opacity-80 bg-gray-50/50' : ''
                  }`}
                >
                  <div>
                    {/* Header Chips */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                        {statusCfg.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${priorityCfg.badge}`}>
                          {priorityCfg.label}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                          {idea.category || 'Idea'}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#0ea5e9] transition-colors mb-2">
                      {idea.title}
                    </h3>

                    {idea.description && (
                      <p className="text-xs text-gray-500 line-clamp-3 mb-4 leading-relaxed">
                        {idea.description}
                      </p>
                    )}

                    {/* Metadata tags */}
                    <div className="space-y-1.5 mb-4">
                      {idea.notes && (
                        <div className="text-[11px] text-gray-500 line-clamp-1">
                          Notes: {idea.notes}
                        </div>
                      )}

                      {idea.tags && idea.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          {idea.tags.map((tag) => (
                            <span key={tag} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenCapture(idea)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors"
                        title="Edit Idea"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(idea.id, idea.title)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        title="Delete Idea"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {!isConverted ? (
                      <button
                        onClick={() => handleConvertToDraft(idea)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#0ea5e9]/10 hover:bg-[#0ea5e9]/20 text-[#0284c7] font-medium rounded-lg text-xs transition-colors"
                      >
                        <span>Convert to Draft</span>
                        <ArrowRight size={12} />
                      </button>
                    ) : (
                      <span className="text-[11px] text-purple-700 font-medium inline-flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Draft Active
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Capture / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Lightbulb className="text-[#0ea5e9]" size={18} />
                <h3 className="text-sm font-semibold text-gray-900">
                  {editingIdea ? 'Edit Content Idea' : 'Capture New Content Idea'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveIdea} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Topic or Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Scaling Enterprise RAG Systems with Vector Indices"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Summary / Talking Points
                </label>
                <textarea
                  rows={3}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Brief notes, key hooks, core premise, or research references..."
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Intended Format
                  </label>
                  <select
                    value={formContentType}
                    onChange={(e) => setFormContentType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white"
                  >
                    {CONTENT_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Marketing Objective
                  </label>
                  <select
                    value={formObjectiveId}
                    onChange={(e) => setFormObjectiveId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="">None / Unaligned</option>
                    {objectives.map((o) => (
                      <option key={o.id} value={o.id}>{o.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Target Audience Segment
                  </label>
                  <select
                    value={formAudienceId}
                    onChange={(e) => setFormAudienceId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="">None / Broad</option>
                    {audiences.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Notes & Angles
                  </label>
                  <input
                    type="text"
                    value={formTargetAudience}
                    onChange={(e) => setFormTargetAudience(e.target.value)}
                    placeholder="e.g. Focus on ROI metrics, key quote"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Backlog Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="new">New</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="converted">Converted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="ai, architecture, enterprise, thought-leadership"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formTitle.trim()}
                  className="px-4 py-2 bg-[#244235] text-white hover:bg-[#1a3026] disabled:opacity-50 rounded-lg text-xs font-medium transition-colors"
                >
                  {saving ? 'Saving...' : editingIdea ? 'Update Idea' : 'Capture Idea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editor Modal for converted draft */}
      {editorModalOpen && orgId && convertedDraft && (
        <ContentEditorModal
          isOpen={editorModalOpen}
          onClose={() => {
            setEditorModalOpen(false);
            setConvertedDraft(null);
          }}
          onSaved={() => {
            setEditorModalOpen(false);
            setConvertedDraft(null);
            loadData();
          }}
          orgId={orgId}
          item={convertedDraft}
          defaultType={convertedDraft.content_type}
        />
      )}
    </div>
  );
}
