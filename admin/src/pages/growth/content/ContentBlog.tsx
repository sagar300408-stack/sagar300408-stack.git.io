import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Plus, Search, Globe,
  CheckCircle2, Calendar, Edit3, Trash2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../../lib/AuthContext';
import { useToast } from '../../../components/Layout/ToastProvider';
import {
  getOCEClient,
  type GrowthContentItem,
  type ContentStatus
} from '../../../lib/sdk';
import {
  GrowthPageHeader,
  ContentNav,
  ContentEditorModal,
  GrowthEmptyState
} from '../../../components/growth';

const STATUS_BADGES: Record<ContentStatus, { label: string; bg: string; text: string; border: string }> = {
  draft: { label: 'Draft', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  in_review: { label: 'In Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  changes_requested: { label: 'Changes Requested', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  approved: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  scheduled: { label: 'Scheduled', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  published: { label: 'Published', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  rejected: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  archived: { label: 'Archived', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

export default function ContentBlog() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const { showToast } = useToast();
  const sdk = getOCEClient();

  const [articles, setArticles] = useState<GrowthContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [tabFilter, setTabFilter] = useState<'all' | 'drafts' | 'approved' | 'synced'>('all');

  // Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GrowthContentItem | null>(null);

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const allItems = await sdk.getContentItems(orgId);
      // Filter for blog and article content types
      const blogItems = allItems.filter(
        (i) => i.content_type === 'blog' || i.content_type === 'article' || i.content_type === 'case_study' || i.content_type === 'whitepaper'
      );
      setArticles(blogItems);
    } catch (e: any) {
      console.warn('[ContentBlog] Error loading articles:', e);
      showToast(e.message || 'Failed to load blog articles', 'error');
    } finally {
      setLoading(false);
    }
  }, [orgId, sdk, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Publish / Sync to Insights CMS
  const handlePublishToCMS = async (item: GrowthContentItem) => {
    if (!orgId) return;
    setSyncingId(item.id);
    try {
      await sdk.publishContentToCMS(orgId, item.id);
      showToast('Article published to Insights CMS', 'success');
      loadData();
    } catch (e: any) {
      showToast(e.message || 'Failed to sync to CMS', 'error');
    } finally {
      setSyncingId(null);
    }
  };

  const handleDelete = async (itemId: string, itemTitle: string) => {
    if (!orgId || !window.confirm(`Delete article "${itemTitle}"?`)) return;
    try {
      await sdk.deleteContentItem(orgId, itemId);
      showToast('Article deleted', 'success');
      loadData();
    } catch (e: any) {
      showToast(e.message || 'Failed to delete article', 'error');
    }
  };

  // Filtered Articles
  const filteredArticles = articles.filter((item) => {
    if (tabFilter === 'drafts' && item.status !== 'draft') return false;
    if (tabFilter === 'approved' && item.status !== 'approved') return false;
    if (tabFilter === 'synced' && !item.cms_node_id) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchSummary = item.summary?.toLowerCase().includes(q);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchSummary && !matchTags) return false;
    }
    return true;
  });

  // Pulse counts
  const totalCount = articles.length;
  const inProgressCount = articles.filter((a) => a.status === 'draft' || a.status === 'in_review').length;
  const approvedCount = articles.filter((a) => a.status === 'approved').length;
  const syncedCount = articles.filter((a) => Boolean(a.cms_node_id)).length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#fafafa]">
      <GrowthPageHeader
        title="Blog & Long-Form Articles"
        description="Produce in-depth thought leadership, technical guides, and case studies with seamless one-click publishing to the Originyx Website CMS."
        actions={
          <button
            onClick={() => {
              setEditingItem(null);
              setIsEditorOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#244235] text-white hover:bg-[#1a3026] rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <Plus size={14} />
            <span>Write New Article</span>
          </button>
        }
      />

      <ContentNav />

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-6">
        {/* Metric summary banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Total Articles
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{totalCount}</span>
              <span className="text-xs text-gray-400">publications</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              In Production
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{inProgressCount}</span>
              <span className="text-xs text-amber-600 font-medium">drafts & review</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Ready for Release
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{approvedCount}</span>
              <span className="text-xs text-emerald-600 font-medium">editorial approved</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Live on Website (CMS)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{syncedCount}</span>
              <span className="text-xs text-[#0ea5e9] font-medium">Insights synced</span>
            </div>
          </div>
        </div>

        {/* Tab & Search Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-gray-50 overflow-x-auto">
            <button
              onClick={() => setTabFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tabFilter === 'all' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              All Articles ({articles.length})
            </button>
            <button
              onClick={() => setTabFilter('drafts')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tabFilter === 'drafts' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setTabFilter('approved')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tabFilter === 'approved' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Ready to Publish ({approvedCount})
            </button>
            <button
              onClick={() => setTabFilter('synced')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tabFilter === 'synced' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Synced to CMS ({syncedCount})
            </button>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles by title, keywords..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:bg-white"
            />
          </div>
        </div>

        {/* Articles List */}
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading publications...</div>
        ) : filteredArticles.length === 0 ? (
          <GrowthEmptyState
            icon={BookOpen}
            title="No Articles Found"
            description={
              searchQuery || tabFilter !== 'all'
                ? 'No articles match your current filter settings.'
                : 'Start crafting your first long-form article or technical guide.'
            }
            action={
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsEditorOpen(true);
                }}
                className="px-3.5 py-2 bg-[#244235] text-white hover:bg-[#1a3026] rounded-lg text-xs font-medium transition-colors shadow-xs"
              >
                Write New Article
              </button>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article) => {
              const statusCfg = STATUS_BADGES[article.status] || STATUS_BADGES.draft;
              const isApprovedOrPublished = article.status === 'approved' || article.status === 'published';

              return (
                <div
                  key={article.id}
                  className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all shadow-xs p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
                >
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {article.cover_image ? (
                      <div className="w-24 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                        <img
                          src={article.cover_image}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 text-gray-400">
                        <BookOpen size={24} />
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                          {article.content_type.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                          {statusCfg.label}
                        </span>
                        {article.cms_node_id && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={10} />
                            CMS Live
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => {
                          setEditingItem(article);
                          setIsEditorOpen(true);
                        }}
                        className="text-sm font-semibold text-gray-900 hover:text-[#0ea5e9] cursor-pointer transition-colors"
                      >
                        {article.title}
                      </h3>

                      {article.summary && (
                        <p className="text-xs text-gray-500 line-clamp-1 max-w-xl">
                          {article.summary}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1">
                        {article.author_name && <span>Author: {article.author_name}</span>}
                        {article.scheduled_for && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(article.scheduled_for).toLocaleDateString()}
                          </span>
                        )}
                        {article.tags && article.tags.length > 0 && (
                          <span>Tags: {article.tags.slice(0, 3).join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Publishing actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {/* Direct CMS Publish Button */}
                    {!article.cms_node_id && isApprovedOrPublished && (
                      <button
                        onClick={() => handlePublishToCMS(article)}
                        disabled={syncingId === article.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0ea5e9]/10 hover:bg-[#0ea5e9]/20 text-[#0284c7] rounded-lg text-xs font-medium transition-colors"
                      >
                        <Globe size={13} />
                        <span>{syncingId === article.id ? 'Syncing...' : 'Publish to CMS'}</span>
                      </button>
                    )}

                    {article.cms_node_id && (
                      <button
                        onClick={() => handlePublishToCMS(article)}
                        disabled={syncingId === article.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                        title="Re-sync current content into CMS node"
                      >
                        <Sparkles size={12} className="text-[#0ea5e9]" />
                        <span>Update CMS</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setEditingItem(article);
                        setIsEditorOpen(true);
                      }}
                      className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Edit Article"
                    >
                      <Edit3 size={15} />
                    </button>

                    <button
                      onClick={() => handleDelete(article.id, article.title)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Article"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && orgId && (
        <ContentEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSaved={() => {
            setIsEditorOpen(false);
            loadData();
          }}
          orgId={orgId}
          item={editingItem}
          defaultType="blog"
        />
      )}
    </div>
  );
}
