import { useState, useEffect, useCallback } from 'react';
import {
  Mail, Plus, Search, Calendar,
  CheckCircle2, Edit3, Trash2, Users
} from 'lucide-react';
import { useAuth } from '../../../lib/AuthContext';
import { useToast } from '../../../components/Layout/ToastProvider';
import {
  getOCEClient,
  type GrowthContentItem,
  type ContentStatus,
  type MarketingAudience
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
  published: { label: 'Sent / Published', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  rejected: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  archived: { label: 'Archived', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

export default function ContentNewsletters() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const { showToast } = useToast();
  const sdk = getOCEClient();

  const [newsletters, setNewsletters] = useState<GrowthContentItem[]>([]);
  const [audiences, setAudiences] = useState<MarketingAudience[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ContentStatus | 'all'>('all');

  // Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GrowthContentItem | null>(null);

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [allItems, allAudiences] = await Promise.all([
        sdk.getContentItems(orgId),
        sdk.getMarketingAudiences(orgId)
      ]);
      const nlItems = allItems.filter((i) => i.content_type === 'newsletter');
      setNewsletters(nlItems);
      setAudiences(allAudiences);
    } catch (e: any) {
      console.warn('[ContentNewsletters] Error loading newsletters:', e);
      showToast(e.message || 'Failed to load newsletters', 'error');
    } finally {
      setLoading(false);
    }
  }, [orgId, sdk, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (itemId: string, itemTitle: string) => {
    if (!orgId || !window.confirm(`Delete newsletter issue "${itemTitle}"?`)) return;
    try {
      await sdk.deleteContentItem(orgId, itemId);
      showToast('Newsletter issue deleted', 'success');
      loadData();
    } catch (e: any) {
      showToast(e.message || 'Failed to delete newsletter', 'error');
    }
  };

  const getAudienceName = (id?: string | null) => {
    if (!id) return null;
    return audiences.find((a) => a.id === id)?.name || null;
  };

  // Filtered list
  const filteredList = newsletters.filter((item) => {
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchSummary = item.summary?.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary) return false;
    }
    return true;
  });

  // Pulse numbers
  const totalCount = newsletters.length;
  const draftCount = newsletters.filter((n) => n.status === 'draft').length;
  const scheduledCount = newsletters.filter((n) => n.status === 'scheduled').length;
  const publishedCount = newsletters.filter((n) => n.status === 'published').length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#fafafa]">
      <GrowthPageHeader
        title="Newsletter Editions"
        description="Author, schedule, and curate recurring executive bulletins, release roundups, and targeted subscriber broadcasts."
        actions={
          <button
            onClick={() => {
              setEditingItem(null);
              setIsEditorOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#244235] text-white hover:bg-[#1a3026] rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <Plus size={14} />
            <span>Compose Newsletter</span>
          </button>
        }
      />

      <ContentNav />

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-6">
        {/* Metric summary banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Total Editions
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{totalCount}</span>
              <span className="text-xs text-gray-400">issues</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              In Draft
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{draftCount}</span>
              <span className="text-xs text-amber-600 font-medium">composing</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Scheduled Broadcasts
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{scheduledCount}</span>
              <span className="text-xs text-blue-600 font-medium">ready to send</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Sent Editions
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{publishedCount}</span>
              <span className="text-xs text-emerald-600 font-medium">dispatched</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search newsletters by subject, preview..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Sent / Published</option>
            </select>
          </div>
        </div>

        {/* Newsletters List */}
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading newsletters...</div>
        ) : filteredList.length === 0 ? (
          <GrowthEmptyState
            icon={Mail}
            title="No Newsletters Found"
            description={
              searchQuery || selectedStatus !== 'all'
                ? 'Try adjusting your search query or filter.'
                : 'Compose your first newsletter edition to connect with subscribers and prospects.'
            }
            action={
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsEditorOpen(true);
                }}
                className="px-3.5 py-2 bg-[#244235] text-white hover:bg-[#1a3026] rounded-lg text-xs font-medium transition-colors shadow-xs"
              >
                Compose Newsletter
              </button>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredList.map((item) => {
              const statusCfg = STATUS_BADGES[item.status] || STATUS_BADGES.draft;
              const audienceName = getAudienceName(item.audience_id);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all shadow-xs p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-[#0ea5e9]">
                      <Mail size={22} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                          {statusCfg.label}
                        </span>
                        {audienceName && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                            <Users size={11} className="text-gray-400" />
                            <span>{audienceName}</span>
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => {
                          setEditingItem(item);
                          setIsEditorOpen(true);
                        }}
                        className="text-sm font-semibold text-gray-900 hover:text-[#0ea5e9] cursor-pointer transition-colors"
                      >
                        {item.title}
                      </h3>

                      {item.summary && (
                        <p className="text-xs text-gray-500 line-clamp-1 max-w-xl">
                          Preview: {item.summary}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1">
                        {item.author_name && <span>Curator: {item.author_name}</span>}
                        {item.scheduled_for && (
                          <span className="flex items-center gap-1 text-blue-600 font-medium">
                            <Calendar size={11} />
                            Send Date: {new Date(item.scheduled_for).toLocaleDateString()}
                          </span>
                        )}
                        {item.published_at && (
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <CheckCircle2 size={11} />
                            Dispatched: {new Date(item.published_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsEditorOpen(true);
                      }}
                      className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Edit Newsletter"
                    >
                      <Edit3 size={15} />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Newsletter"
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
          defaultType="newsletter"
        />
      )}
    </div>
  );
}
