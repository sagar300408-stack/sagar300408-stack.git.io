import { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Megaphone, FileText, Share2, Radio, BarChart2,
  Plus, Users, CheckSquare, ImageIcon, RefreshCw,
  Sparkles, ArrowRight, BookOpen, ShieldCheck, Database
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { getOCEClient, type GrowthActivityItem, type GrowthOverviewStats } from '../../lib/sdk';
import {
  GrowthPageHeader,
  GrowthSectionHeader,
  GrowthModuleCard,
  GrowthActivityFeed,
  GrowthStatusBadge,
} from '../../components/growth';

const MODULES = [
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Manage marketing initiatives, channel acquisition performance, and inbound conversion tracking.',
    icon: Megaphone,
    to: '/growth/marketing',
    status: 'active' as const,
    statusLabel: 'Phase 2 Live',
    phaseLabel: 'Phase 2',
    color: '#244235',
  },
  {
    id: 'content',
    name: 'Content',
    description: 'Plan, create, schedule, and distribute content across Originyx channels and editorial publications.',
    icon: FileText,
    to: '/growth/content',
    status: 'active' as const,
    statusLabel: 'Phase 3 Live',
    phaseLabel: 'Phase 3',
    color: '#0ea5e9',
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Manage social channels, publishing schedules, founder updates, and brand engagement activities.',
    icon: Share2,
    to: '/growth/social',
    status: 'planned' as const,
    statusLabel: 'Phase 4 Planned',
    phaseLabel: 'Phase 4',
    color: '#8b5cf6',
  },
  {
    id: 'campaigns',
    name: 'Campaigns',
    description: 'Plan and coordinate multi-channel marketing campaigns, sprint initiatives, and launch cadences.',
    icon: Radio,
    to: '/growth/campaigns',
    status: 'planned' as const,
    statusLabel: 'Phase 5 Planned',
    phaseLabel: 'Phase 5',
    color: '#f59e0b',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Measure and understand growth performance, acquisition funnels, and content attribution.',
    icon: BarChart2,
    to: '/growth/analytics',
    status: 'planned' as const,
    statusLabel: 'Phase 6 Planned',
    phaseLabel: 'Phase 6',
    color: '#10b981',
  },
];

export default function GrowthOverview() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const sdk = getOCEClient();

  const [stats, setStats] = useState<GrowthOverviewStats>({
    totalContent: 0,
    publishedContent: 0,
    growthLeads: 0,
    totalGrowthTasks: 0,
    activeGrowthTasks: 0,
    growthTasks: 0,
    activeTasks: 0,
  });
  const [activities, setActivities] = useState<GrowthActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [growthStats, activityData] = await Promise.all([
        sdk.getGrowthStats(orgId),
        sdk.getGrowthActivity(orgId, 8),
      ]);

      setStats(growthStats);
      setActivities(activityData);
    } catch (e) {
      console.warn('[GrowthOverview] Error loading growth data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orgId, sdk]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-full bg-[#f5f5f4] flex flex-col">
      {/* ── Page Header (Section 4A) ─────────────────────────────────── */}
      <GrowthPageHeader
        title="Growth"
        description="Manage and monitor Originyx's marketing, content, social presence, and campaigns."
        breadcrumb={[
          { label: 'Command', to: '/dashboard' },
          { label: 'Growth' },
        ]}
        badge={
          <GrowthStatusBadge
            status="foundation"
            label="Phase 1 Foundation"
          />
        }
        actions={
          <>
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              title="Refresh growth pulse data"
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-60"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <NavLink
              to="/editor/new"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#244235] text-white hover:bg-[#1a3026] rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <Plus size={14} />
              <span>Write Content</span>
            </NavLink>
          </>
        }
      />

      {/* ── Main Container ────────────────────────────────────────── */}
      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
        
        {/* ── Growth Pulse Metrics ─────────────────────────────────── */}
        <section>
          <GrowthSectionHeader
            category="FOUNDATION PULSE"
            title="Connected Growth Assets"
            description="Live inventory from existing Originyx CMS and business pipeline"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NavLink
              to="/insights"
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Total Content
                </span>
                <BookOpen size={15} className="text-[#0ea5e9]" />
              </div>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                {loading ? '…' : stats.totalContent}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                <span>{stats.publishedContent} published</span>
                <span className="text-[#244235] group-hover:underline">Browse</span>
              </div>
            </NavLink>

            <NavLink
              to="/leads"
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Inbound Leads
                </span>
                <Users size={15} className="text-[#6366f1]" />
              </div>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                {loading ? '…' : stats.growthLeads}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                <span>Inbound channels</span>
                <span className="text-[#244235] group-hover:underline">Inspect</span>
              </div>
            </NavLink>

            <NavLink
              to="/tasks"
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Growth Tasks
                </span>
                <CheckSquare size={15} className="text-[#10b981]" />
              </div>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                {loading ? '…' : stats.activeGrowthTasks}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                <span>{stats.totalGrowthTasks} total</span>
                <span className="text-[#244235] group-hover:underline">Review</span>
              </div>
            </NavLink>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Architecture Status
                </span>
                <Sparkles size={15} className="text-[#244235]" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mt-2">
                Phase 1 Active
              </p>
              <div className="mt-2 text-[11px] text-gray-400">
                5 Subsystems Mapped
              </div>
            </div>
          </div>
        </section>

        {/* ── Growth Module Cards (Section 4B) ─────────────────────── */}
        <section>
          <GrowthSectionHeader
            category="GROWTH SUBSYSTEMS"
            title="Core Functional Modules"
            description="Explore the five modules comprising the Originyx Growth management suite"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map((module) => (
              <GrowthModuleCard
                key={module.id}
                id={module.id}
                name={module.name}
                description={module.description}
                icon={module.icon}
                to={module.to}
                status={module.status}
                statusLabel={module.statusLabel}
                phaseLabel={module.phaseLabel}
                color={module.color}
              />
            ))}
          </div>
        </section>

        {/* ── Bottom Section: Activity & Quick Actions (Sections 4C & 4D) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Activity Section (Left - 3 columns) */}
          <div className="lg:col-span-3">
            <GrowthActivityFeed
              activities={activities}
              loading={loading}
            />
          </div>

          {/* Quick Actions & Foundation Ledger (Right - 2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Quick Actions (Section 4D) */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Working Quick Actions
              </h3>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                Direct entry points with active backend functionality:
              </p>

              <div className="space-y-2">
                {[
                  {
                    label: 'Write New Content Node',
                    description: 'Draft articles or announcements in CMS',
                    to: '/editor/new',
                    icon: Plus,
                  },
                  {
                    label: 'Explore Growth Leads',
                    description: 'Review inbound inquiries and referral leads',
                    to: '/leads',
                    icon: Users,
                  },
                  {
                    label: 'Create Growth Task',
                    description: 'Assign a marketing or content task',
                    to: '/my-work?new=1',
                    icon: CheckSquare,
                  },
                  {
                    label: 'Media Library Assets',
                    description: 'Manage brand imagery and campaign media',
                    to: '/media',
                    icon: ImageIcon,
                  },
                ].map(({ label, description, to, icon: Icon }) => (
                  <NavLink
                    key={label}
                    to={to}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-[#fbfbfa] transition-all group"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-gray-50 flex items-center justify-center text-gray-500 mt-0.5 group-hover:text-[#244235] group-hover:bg-[#244235]/10 transition-colors">
                        <Icon size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800 group-hover:text-[#244235] transition-colors">
                          {label}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-gray-300 group-hover:text-[#244235] transition-colors ml-2 flex-shrink-0" />
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Architecture Governance Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Foundation Architecture
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <ShieldCheck size={14} className="text-[#244235] flex-shrink-0" />
                  <span><strong>RBAC Enforced:</strong> Owner & Admin access</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Database size={14} className="text-[#244235] flex-shrink-0" />
                  <span><strong>Multi-Tenant:</strong> Isolated per organization</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Sparkles size={14} className="text-[#244235] flex-shrink-0" />
                  <span><strong>Activity Ledger:</strong> Real cms_activity_log stream</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
