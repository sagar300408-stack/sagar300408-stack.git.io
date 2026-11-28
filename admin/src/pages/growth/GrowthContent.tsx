import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Plus, Library, Lightbulb, BookOpen,
  Share2, Mail, Calendar, CheckCircle2, Clock,
  ArrowRight, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { useToast } from '../../components/Layout/ToastProvider';
import {
  getOCEClient,
  type ContentOverviewMetrics,
  type ContentPerformanceMetrics,
  type GrowthContentItem,
  type GrowthContentIdea,
  type GrowthActivityItem,
  type ContentStatus
} from '../../lib/sdk';
import {
  GrowthPageHeader,
  ContentNav,
  ContentEditorModal,
  GrowthActivityFeed
} from '../../components/growth';

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

const FEATURE_HUBS = [
  {
    title: 'Content Library',
    description: 'Browse, filter, and edit all marketing assets and drafts across every format.',
    path: '/growth/content/library',
    icon: Library,
    color: '#0ea5e9',
    badge: 'Core Asset Hub',
  },
  {
    title: 'Ideas Backlog',
    description: 'Capture emerging inspirations, prioritize topics, and convert ideas directly to drafts.',
    path: '/growth/content/ideas',
    icon: Lightbulb,
    color: '#f59e0b',
    badge: 'Ideation Pipeline',
  },
  {
    title: 'Blog & Articles',
    description: 'Produce in-depth thought leadership with direct one-click synchronization to the Website Insights CMS.',
    path: '/growth/content/blog',
    icon: BookOpen,
    color: '#10b981',
    badge: 'Insights CMS Synced',
  },
  {
    title: 'Social Drafts',
    description: 'Compose channel-tailored posts with character counters, attachment previews, and queue schedules.',
    path: '/growth/content/social',
    icon: Share2,
    color: '#3b82f6',
    badge: 'Multi-Channel Snippets',
  },
  {
    title: 'Newsletter Editions',
    description: 'Author recurring executive updates, feature digests, and targeted subscriber broadcasts.',
    path: '/growth/content/newsletters',
    icon: Mail,
    color: '#6366f1',
    badge: 'Subscriber Broadcasts',
  },
  {
    title: 'Editorial Calendar',
    description: 'Plan publication cadences with monthly and weekly scheduling views and drag rescheduling.',
    path: '/growth/content/calendar',
    icon: Calendar,
    color: '#8b5cf6',
    badge: 'Visual Cadence',
  },
  {
    title: 'Approval Workflow',
    description: 'Review submissions, request author revisions with feedback, and sign off on scheduled releases.',
    path: '/growth/content/approvals',
    icon: CheckCircle2,
    color: '#059669',
    badge: 'Editorial Governance',
  },
];

export default function GrowthContent() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const { showToast } = useToast();
  const sdk = getOCEClient();

  const [metrics, setMetrics] = useState<ContentOverviewMetrics | null>(null);
  const [perfMetrics, setPerfMetrics] = useState<ContentPerformanceMetrics | null>(null);
  const [recentItems, setRecentItems] = useState<GrowthContentItem[]>([]);
  const [recentIdeas, setRecentIdeas] = useState<GrowthContentIdea[]>([]);
  const [activities, setActivities] = useState<GrowthActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GrowthContentItem | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!orgId) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [overviewMetrics, allItems, allIdeas, recentActivities, performanceData] = await Promise.all([
        sdk.getContentOverviewMetrics(orgId),
        sdk.getContentItems(orgId),
        sdk.getContentIdeas(orgId),
        sdk.getGrowthActivity(orgId, 6),
        sdk.getContentPerformanceMetrics(orgId),
      ]);

      setMetrics(overviewMetrics);
      setRecentItems(allItems.slice(0, 6));
      setRecentIdeas(allIdeas.filter((i) => i.status !== 'converted').slice(0, 5));
      setActivities(recentActivities);
      setPerfMetrics(performanceData);
    } catch (e: any) {
      console.warn('[GrowthContent] Error loading content overview data:', e);
      showToast(e.message || 'Failed to load content engine data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orgId, sdk, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Upcoming items on calendar
  const upcomingItems = recentItems
    .filter((i) => Boolean(i.scheduled_for))
    .sort((a, b) => new Date(a.scheduled_for!).getTime() - new Date(b.scheduled_for!).getTime())
    .slice(0, 4);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#fafafa]">
      <GrowthPageHeader
        title="Content Engine"
        description="Unify thought leadership, collaborative editorial workflows, multi-channel scheduling, and Operations CMS publishing."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="p-2 text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => {
                setEditingItem(null);
                setIsEditorOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#244235] text-white hover:bg-[#1a3026] rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <Plus size={14} />
              <span>Create Content Draft</span>
            </button>
          </div>
        }
      />

      <ContentNav />

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
        {/* Top Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Total Library Assets
            </span>
            <div className="text-2xl font-bold text-gray-900">{metrics?.totalContent ?? 0}</div>
            <span className="text-[11px] text-gray-400">across all types</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Active Drafts
            </span>
            <div className="text-2xl font-bold text-amber-600">{metrics?.draftCount ?? 0}</div>
            <span className="text-[11px] text-amber-700/70">in composition</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Editorial Review
            </span>
            <div className="text-2xl font-bold text-orange-600">{metrics?.inReviewCount ?? 0}</div>
            <span className="text-[11px] text-orange-700/70">awaiting decision</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Scheduled Queue
            </span>
            <div className="text-2xl font-bold text-blue-600">{metrics?.scheduledCount ?? 0}</div>
            <span className="text-[11px] text-blue-700/70">ready for release</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Published Live
            </span>
            <div className="text-2xl font-bold text-emerald-600">{metrics?.publishedCount ?? 0}</div>
            <span className="text-[11px] text-emerald-700/70">live distribution</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Ideas Backlog
            </span>
            <div className="text-2xl font-bold text-purple-600">{metrics?.totalIdeas ?? 0}</div>
            <span className="text-[11px] text-purple-700/70">{metrics?.convertedIdeas ?? 0} converted</span>
          </div>
        </div>

        {/* Feature Hub Navigation Cards */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Content Workspaces & Capabilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {FEATURE_HUBS.map((hub) => {
              const Icon = hub.icon;
              return (
                <Link
                  key={hub.path}
                  to={hub.path}
                  className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: hub.color }}
                      >
                        <Icon size={18} />
                      </div>
                      <span className="text-[10px] font-medium text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                        {hub.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#0ea5e9] transition-colors mb-1">
                      {hub.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {hub.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#0ea5e9] font-medium">
                    <span>Open Workspace</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Two-Column Activity & Pipeline Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Recent Pipeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900">Recent Content Pipeline</h3>
                </div>
                <Link
                  to="/growth/content/library"
                  className="text-xs text-[#0ea5e9] hover:underline font-medium"
                >
                  View All in Library →
                </Link>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-gray-400">Loading pipeline...</div>
              ) : recentItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">No content items created yet.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentItems.map((item) => {
                    const statusCfg = STATUS_BADGES[item.status] || STATUS_BADGES.draft;

                    return (
                      <div
                        key={item.id}
                        className="p-4 hover:bg-gray-50/70 transition-colors flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                              {item.content_type.replace('_', ' ')}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                              {statusCfg.label}
                            </span>
                            {item.cms_node_id && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                <CheckCircle2 size={10} />
                                CMS Live
                              </span>
                            )}
                          </div>

                          <h4
                            onClick={() => {
                              setEditingItem(item);
                              setIsEditorOpen(true);
                            }}
                            className="text-xs font-semibold text-gray-900 hover:text-[#0ea5e9] cursor-pointer truncate"
                          >
                            {item.title}
                          </h4>

                          <div className="flex items-center gap-3 text-[11px] text-gray-400">
                            {item.author_name && <span>By {item.author_name}</span>}
                            <span>Updated {new Date(item.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsEditorOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                        >
                          Edit
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Growth Activity Stream */}
            <GrowthActivityFeed activities={activities} loading={loading} />
          </div>

          {/* Right Column (1 Col): Upcoming Schedule & Ideas Pool */}
          <div className="space-y-6">
            {/* Upcoming Releases */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900">Upcoming Releases</h3>
                </div>
                <Link
                  to="/growth/content/calendar"
                  className="text-xs text-[#0ea5e9] hover:underline font-medium"
                >
                  Calendar →
                </Link>
              </div>

              {upcomingItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  No scheduled releases in queue.
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {upcomingItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setEditingItem(item);
                        setIsEditorOpen(true);
                      }}
                      className="p-3 rounded-lg border border-gray-100 bg-gray-50/60 hover:bg-gray-100/70 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[11px] text-blue-600 font-medium mb-1">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(item.scheduled_for!).toLocaleDateString()}
                        </span>
                        <span className="text-gray-400 uppercase text-[10px]">
                          {item.content_type.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-gray-900 truncate">
                        {item.title}
                      </h4>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fresh Ideas Backlog */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb size={15} className="text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900">Fresh Ideas Pool</h3>
                </div>
                <Link
                  to="/growth/content/ideas"
                  className="text-xs text-[#0ea5e9] hover:underline font-medium"
                >
                  Backlog →
                </Link>
              </div>

              {recentIdeas.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  No pending ideas. Capture new inspirations in the backlog.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentIdeas.map((idea) => (
                    <div key={idea.id} className="p-3.5 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                          {idea.category || 'Idea'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">
                          {idea.priority}
                        </span>
                      </div>
                      <h4 className="text-xs font-medium text-gray-900 line-clamp-1">
                        {idea.title}
                      </h4>
                      {idea.description && (
                        <p className="text-[11px] text-gray-400 line-clamp-1">
                          {idea.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Performance & Telemetry Section (Phase 3 Requirement 9) */}
        <div className="space-y-4 pt-2">
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Content Performance & Distribution Telemetry
            </h2>
            <p className="text-xs text-gray-400">
              Audited metrics across publishing channels and media formats based on actual database records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Format Distribution Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                Production by Format
              </span>
              <div className="space-y-2">
                {perfMetrics?.byContentType.map((item) => (
                  <div key={item.type} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-semibold text-gray-900 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Published Channels Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                Published by Channel
              </span>
              {perfMetrics?.publishedByChannel.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No published assets assigned to channels yet.</p>
              ) : (
                <div className="space-y-2">
                  {perfMetrics?.publishedByChannel.map((ch) => (
                    <div key={ch.channelId} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 truncate max-w-[180px]">{ch.channelName}</span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {ch.count} published
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Website Insights CMS Live:</span>
                <span className="font-bold text-gray-900">{perfMetrics?.cmsPublishedCount ?? 0}</span>
              </div>
            </div>

            {/* Engagement Telemetry Card (Requirement 9: clear unavailable state, no fabricated data) */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Audience Telemetry & Impressions
                  </span>
                </div>
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
                  {perfMetrics?.telemetryNotice ||
                    'Real-time third-party telemetry (impressions, clicks, CTR, conversions) is currently unavailable. No external tracking pixels or channel webhooks are connected.'}
                </div>
              </div>
              <p className="text-[11px] text-gray-400 pt-3">
                Live audience engagement metrics will activate once external channel webhooks or tracking pixels are configured for this organization.
              </p>
            </div>
          </div>
        </div>
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
