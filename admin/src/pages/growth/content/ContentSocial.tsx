import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Calendar,
  Edit3, Trash2,
  MessageSquare, Globe
} from 'lucide-react';
import { useAuth } from '../../../lib/AuthContext';
import { useToast } from '../../../components/Layout/ToastProvider';
import {
  getOCEClient,
  type GrowthContentItem,
  type ContentStatus,
  type MarketingChannel
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

export default function ContentSocial() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const { showToast } = useToast();
  const sdk = getOCEClient();

  const [posts, setPosts] = useState<GrowthContentItem[]>([]);
  const [channels, setChannels] = useState<MarketingChannel[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<ContentStatus | 'all'>('all');

  // Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GrowthContentItem | null>(null);

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [allItems, allChannels] = await Promise.all([
        sdk.getContentItems(orgId),
        sdk.getMarketingChannels(orgId)
      ]);
      const socialItems = allItems.filter((i) => i.content_type === 'social');
      setPosts(socialItems);
      setChannels(allChannels);
    } catch (e: any) {
      console.warn('[ContentSocial] Error loading posts:', e);
      showToast(e.message || 'Failed to load social posts', 'error');
    } finally {
      setLoading(false);
    }
  }, [orgId, sdk, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (itemId: string, itemTitle: string) => {
    if (!orgId || !window.confirm(`Delete post "${itemTitle}"?`)) return;
    try {
      await sdk.deleteContentItem(orgId, itemId);
      showToast('Social post deleted', 'success');
      loadData();
    } catch (e: any) {
      showToast(e.message || 'Failed to delete post', 'error');
    }
  };

  const getChannelName = (id?: string | null) => {
    if (!id) return null;
    return channels.find((c) => c.id === id)?.name || null;
  };

  // Helper to extract text length from summary or content
  const getTextLength = (item: GrowthContentItem) => {
    if (item.summary) return item.summary.length;
    return 0;
  };

  // Filtered
  const filteredPosts = posts.filter((item) => {
    if (selectedChannel !== 'all' && item.channel_id !== selectedChannel) return false;
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchSummary = item.summary?.toLowerCase().includes(q);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchSummary && !matchTags) return false;
    }
    return true;
  });

  // Pulse numbers
  const totalCount = posts.length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#fafafa]">
      <GrowthPageHeader
        title="Social Drafts & Snippets"
        description="Compose, format, and queue multi-channel social media updates, announcements, and bite-sized insights."
        actions={
          <button
            onClick={() => {
              setEditingItem(null);
              setIsEditorOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#244235] text-white hover:bg-[#1a3026] rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <Plus size={14} />
            <span>New Social Draft</span>
          </button>
        }
      />

      <ContentNav />

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-6">
        {/* Metric summary banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Total Social Drafts
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{totalCount}</span>
              <span className="text-xs text-gray-400">snippets</span>
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
              Scheduled Queue
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{scheduledCount}</span>
              <span className="text-xs text-blue-600 font-medium">ready for release</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Published Posts
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{publishedCount}</span>
              <span className="text-xs text-emerald-600 font-medium">live across feeds</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search social drafts by text or hashtags..."
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
              <option value="draft">Draft</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>

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
          </div>
        </div>

        {/* Social Posts Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading social drafts...</div>
        ) : filteredPosts.length === 0 ? (
          <GrowthEmptyState
            icon={MessageSquare}
            title="No Social Drafts Found"
            description={
              searchQuery || selectedStatus !== 'all' || selectedChannel !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Create your first social media post or release announcement.'
            }
            action={
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsEditorOpen(true);
                }}
                className="px-3.5 py-2 bg-[#244235] text-white hover:bg-[#1a3026] rounded-lg text-xs font-medium transition-colors shadow-xs"
              >
                New Social Draft
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPosts.map((post) => {
              const statusCfg = STATUS_BADGES[post.status] || STATUS_BADGES.draft;
              const channelName = getChannelName(post.channel_id);
              const charCount = getTextLength(post);

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all shadow-xs flex flex-col justify-between p-5 group"
                >
                  <div>
                    {/* Header: Channel & Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                        <Globe size={11} className="text-[#0ea5e9]" />
                        <span>{channelName || 'Unassigned Channel'}</span>
                      </span>

                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    <h3
                      onClick={() => {
                        setEditingItem(post);
                        setIsEditorOpen(true);
                      }}
                      className="text-sm font-semibold text-gray-900 group-hover:text-[#0ea5e9] transition-colors cursor-pointer mb-2 line-clamp-1"
                    >
                      {post.title}
                    </h3>

                    {/* Post Copy / Content Preview */}
                    <div className="bg-gray-50/70 rounded-lg p-3 border border-gray-100 mb-3 text-xs text-gray-700 leading-relaxed font-sans min-h-[70px]">
                      {post.summary ? (
                        <p className="line-clamp-4">{post.summary}</p>
                      ) : (
                        <span className="text-gray-400 italic">No post copy written yet</span>
                      )}
                    </div>

                    {/* Media preview if any */}
                    {post.cover_image && (
                      <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 h-28 bg-gray-100">
                        <img
                          src={post.cover_image}
                          alt="Post attachment"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Character count & scheduled date */}
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
                      <span className="flex items-center gap-1">
                        <MessageSquare size={11} />
                        <span>{charCount} characters</span>
                      </span>

                      {post.scheduled_for && (
                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                          <Calendar size={11} />
                          {new Date(post.scheduled_for).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      )}
                    </div>

                    {/* Hashtags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tag) => (
                          <span key={tag} className="text-[10px] text-[#0ea5e9] bg-[#0ea5e9]/10 px-1.5 py-0.5 rounded font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setEditingItem(post);
                        setIsEditorOpen(true);
                      }}
                      className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium"
                    >
                      <Edit3 size={13} />
                      <span>Edit Draft</span>
                    </button>

                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded hover:bg-rose-50"
                      title="Delete Draft"
                    >
                      <Trash2 size={13} />
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
          defaultType="social"
        />
      )}
    </div>
  );
}
