import { useState, useEffect, useCallback } from 'react';
import {
  Library, Plus, Search, LayoutGrid, List,
  Calendar, CheckCircle2,
  MoreVertical, Edit3, Trash2, Globe, Archive,
  Send
} from 'lucide-react';
import { useAuth } from '../../../lib/AuthContext';
import { useToast } from '../../../components/Layout/ToastProvider';
import {
  getOCEClient,
  type GrowthContentItem,
  type ContentType,
  type ContentStatus,
  type MarketingChannel
} from '../../../lib/sdk';
import {
  GrowthPageHeader,
  ContentNav,
  ContentEditorModal,
  GrowthEmptyState
} from '../../../components/growth';

const TYPE_OPTIONS: { id: ContentType | 'all'; label: string }[] = [
  { id: 'all', label: 'All Types' },
  { id: 'blog', label: 'Blog Posts' },
  { id: 'article', label: 'Articles & Guides' },
  { id: 'social', label: 'Social Posts' },
  { id: 'newsletter', label: 'Newsletters' },
  { id: 'case_study', label: 'Case Studies' },
  { id: 'whitepaper', label: 'Whitepapers' },
  { id: 'other', label: 'Other Documents' },
];

const STATUS_OPTIONS: { id: ContentStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All Statuses' },
  { id: 'draft', label: 'Draft' },
  { id: 'in_review', label: 'In Review' },
  { id: 'changes_requested', label: 'Changes Requested' },
  { id: 'approved', label: 'Approved' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'published', label: 'Published' },
  { id: 'archived', label: 'Archived' },
];

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

export default function ContentLibrary() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const { showToast } = useToast();
  const sdk = getOCEClient();

  const [items, setItems] = useState<GrowthContentItem[]>([]);
  const [channels, setChannels] = useState<MarketingChannel[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ContentType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ContentStatus | 'all'>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GrowthContentItem | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [itemsData, channelsData] = await Promise.all([
        sdk.getContentItems(orgId),
        sdk.getMarketingChannels(orgId)
      ]);
      setItems(itemsData);
      setChannels(channelsData);
    } catch (e: any) {
      console.warn('[ContentLibrary] Error loading data:', e);
      showToast(e.message || 'Failed to load content library', 'error');
    } finally {
      setLoading(false);
    }
  }, [orgId, sdk, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered Items
  const filteredItems = items.filter((item) => {
    if (selectedType !== 'all' && item.content_type !== selectedType) return false;
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    if (selectedChannel !== 'all' && item.channel_id !== selectedChannel) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(query);
      const matchSummary = item.summary?.toLowerCase().includes(query);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(query));
      if (!matchTitle && !matchSummary && !matchTags) return false;
    }
    return true;
  });

  // Action handlers
  const handleOpenEditor = (item?: GrowthContentItem) => {
    setEditingItem(item || null);
    setIsEditorOpen(true);
    setMenuOpenId(null);
  };

  const handleDelete = async (itemId: string, itemTitle: string) => {
    if (!orgId || !window.confirm(`Are you sure you want to delete "${itemTitle}"?`)) return;
    try {
      await sdk.deleteContentItem(orgId, itemId);
      showToast('Content item removed', 'success');
      loadData();
    } catch (e: any) {
      showToast(e.message || 'Failed to delete item', 'error');
    }
  };

  const handleQuickStatus = async (item: GrowthContentItem, newStatus: ContentStatus) => {
    if (!orgId) return;
    try {
      if (newStatus === 'in_review') {
        await sdk.submitContentForReview(orgId, item.id);
        showToast('Submitted for editorial review', 'success');
      } else if (newStatus === 'archived') {
        await sdk.archiveContent(orgId, item.id);
        showToast('Content moved to archive', 'success');
      } else {
        await sdk.updateContentItem(orgId, item.id, { status: newStatus });
        showToast(`Status updated to ${newStatus}`, 'success');
      }
      loadData();
    } catch (e: any) {
      showToast(e.message || 'Status transition failed', 'error');
    } finally {
      setMenuOpenId(null);
    }
  };

  // Channel lookup helper
  const getChannelName = (id?: string | null) => {
    if (!id) return null;
    return channels.find((c) => c.id === id)?.name || null;
  };

  // Counts for pulse banner
  const draftCount = items.filter((i) => i.status === 'draft').length;
  const reviewCount = items.filter((i) => i.status === 'in_review' || i.status === 'changes_requested').length;
  const publishedCount = items.filter((i) => i.status === 'published').length;
  const scheduledCount = items.filter((i) => i.status === 'scheduled').length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#fafafa]">
      <GrowthPageHeader
        title="Content Library"
        description="Manage, edit, and organize all marketing assets and editorial publications in one place."
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#244235] text-white hover:bg-[#1a3026] rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <Plus size={14} />
            <span>Create Content Draft</span>
          </button>
        }
      />

      <ContentNav />

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-6">
        {/* Metric summary banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Total Library Assets
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{items.length}</span>
              <span className="text-xs text-gray-400">items indexed</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Active Drafts
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{draftCount}</span>
              <span className="text-xs text-amber-600 font-medium">in composition</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Pending Review
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{reviewCount}</span>
              <span className="text-xs text-orange-600 font-medium">awaiting approval</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Published & Scheduled
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{publishedCount + scheduledCount}</span>
              <span className="text-xs text-emerald-600 font-medium">{publishedCount} live, {scheduledCount} queue</span>
            </div>
          </div>
        </div>

        {/* Filter and Control Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, or tags..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>

              {channels.length > 0 && (
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]"
                >
                  <option value="all">All Channels</option>
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.id}>{ch.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 self-end md:self-auto border border-gray-200 rounded-lg p-0.5 bg-gray-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs transition-colors ${viewMode === 'grid' ? 'bg-white shadow-xs text-gray-900 font-medium' : 'text-gray-400 hover:text-gray-700'}`}
              title="Grid View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs transition-colors ${viewMode === 'table' ? 'bg-white shadow-xs text-gray-900 font-medium' : 'text-gray-400 hover:text-gray-700'}`}
              title="Table View"
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {/* Content Listing */}
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading library assets...</div>
        ) : filteredItems.length === 0 ? (
          <GrowthEmptyState
            icon={Library}
            title="No Content Items Found"
            description={
              searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'Create your first piece of content or thought leadership article to build out your library.'
            }
            action={
              <button
                onClick={() => handleOpenEditor()}
                className="px-3.5 py-2 bg-[#244235] text-white hover:bg-[#1a3026] rounded-lg text-xs font-medium transition-colors shadow-xs"
              >
                Create Content Draft
              </button>
            }
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const statusCfg = STATUS_BADGES[item.status] || STATUS_BADGES.draft;
              const channelName = getChannelName(item.channel_id);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all shadow-xs flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Cover or Banner */}
                  {item.cover_image ? (
                    <div className="h-36 w-full bg-gray-100 overflow-hidden relative">
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 pb-0 flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                        {item.content_type.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                  )}

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3
                      onClick={() => handleOpenEditor(item)}
                      className="text-sm font-semibold text-gray-900 group-hover:text-[#0ea5e9] transition-colors cursor-pointer line-clamp-2 mb-1"
                    >
                      {item.title}
                    </h3>

                    {item.summary && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                        {item.summary}
                      </p>
                    )}

                    {/* Metadata chips */}
                    <div className="mt-auto pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                      {channelName && (
                        <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-0.5 rounded">
                          <Globe size={11} className="text-gray-400" />
                          <span>{channelName}</span>
                        </span>
                      )}

                      {item.author_name && (
                        <span className="text-gray-500 truncate max-w-[120px]">
                          by {item.author_name}
                        </span>
                      )}

                      {item.cms_node_id && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-medium">
                          <CheckCircle2 size={10} />
                          CMS Synced
                        </span>
                      )}

                      {item.scheduled_for && (
                        <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">
                          <Calendar size={10} />
                          {new Date(item.scheduled_for).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleOpenEditor(item)}
                      className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium"
                    >
                      <Edit3 size={13} />
                      <span>Edit Content</span>
                    </button>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === item.id ? null : item.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-200"
                      >
                        <MoreVertical size={14} />
                      </button>

                      {menuOpenId === item.id && (
                        <div className="absolute right-0 bottom-full mb-1 w-44 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-20 text-xs">
                          {item.status === 'draft' && (
                            <button
                              onClick={() => handleQuickStatus(item, 'in_review')}
                              className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Send size={12} className="text-amber-500" />
                              <span>Submit for Review</span>
                            </button>
                          )}
                          {item.status !== 'archived' && (
                            <button
                              onClick={() => handleQuickStatus(item, 'archived')}
                              className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Archive size={12} className="text-slate-500" />
                              <span>Archive Item</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                          >
                            <Trash2 size={12} />
                            <span>Delete Asset</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Title & Description</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Author</th>
                    <th className="py-3 px-4">Target Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredItems.map((item) => {
                    const statusCfg = STATUS_BADGES[item.status] || STATUS_BADGES.draft;
                    const channelName = getChannelName(item.channel_id);

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-4 max-w-sm">
                          <span
                            onClick={() => handleOpenEditor(item)}
                            className="font-medium text-gray-900 hover:text-[#0ea5e9] cursor-pointer block truncate"
                          >
                            {item.title}
                          </span>
                          {item.summary && (
                            <span className="text-gray-400 text-[11px] truncate block mt-0.5">
                              {item.summary}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-gray-600">
                          <span className="capitalize">{item.content_type.replace('_', ' ')}</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-gray-500">
                          {channelName || '—'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-gray-500">
                          {item.author_name || '—'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-gray-500">
                          {item.scheduled_for
                            ? new Date(item.scheduled_for).toLocaleDateString()
                            : item.published_at
                            ? new Date(item.published_at).toLocaleDateString()
                            : '—'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditor(item)}
                              className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded"
                              title="Edit"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.title)}
                              className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
          defaultType={selectedType !== 'all' ? selectedType : 'blog'}
        />
      )}
    </div>
  );
}
