import { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users, Target, TrendingUp, DollarSign,
  Plus, RefreshCw, ArrowRight, Share2,
  CheckCircle2, Radio, Sparkles
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import {
  getOCEClient,
  type MarketingOverviewMetrics,
  type LeadSourceDistribution,
  type GrowthActivityItem,
} from '../../lib/sdk';
import {
  GrowthPageHeader,
  GrowthSectionHeader,
  GrowthStatusBadge,
  GrowthActivityFeed,
  MarketingNav,
} from '../../components/growth';

export default function GrowthMarketing() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const sdk = getOCEClient();

  const [metrics, setMetrics] = useState<MarketingOverviewMetrics>({
    totalLeads: 0,
    qualifiedLeads: 0,
    activeOpportunities: 0,
    opportunityValue: 0,
    conversionRate: 0,
    activeInitiatives: 0,
    activeExperiments: 0,
    activeChannels: 0,
    topChannel: 'None',
  });
  const [channelsDistribution, setChannelsDistribution] = useState<LeadSourceDistribution[]>([]);
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
      const [overviewMetrics, distribution, recentActivities] = await Promise.all([
        sdk.getMarketingOverviewMetrics(orgId),
        sdk.getLeadAcquisitionDistribution(orgId),
        sdk.getGrowthActivity(orgId, 6),
      ]);

      setMetrics(overviewMetrics);
      setChannelsDistribution(distribution);
      setActivities(recentActivities);
    } catch (e) {
      console.warn('[GrowthMarketing] Error loading marketing overview data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orgId, sdk]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-full bg-[#f5f5f4] flex flex-col">
      {/* ── Page Header (Section 4A) ─────────────────────────────────── */}
      <GrowthPageHeader
        title="Marketing"
        description="Plan, manage, and measure Originyx's customer acquisition and marketing activities."
        breadcrumb={[
          { label: 'Growth', to: '/growth' },
          { label: 'Marketing' },
        ]}
        badge={
          <GrowthStatusBadge
            status="active"
            label="Command Center Active"
          />
        }
        actions={
          <>
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              title="Refresh marketing metrics"
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-60 shadow-xs"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <NavLink
              to="/growth/marketing/initiatives?new=1"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#244235] text-white hover:bg-[#1a3026] rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <Plus size={14} />
              <span>New Initiative</span>
            </NavLink>
          </>
        }
      />

      {/* ── Marketing Module Sub-Navigation ──────────────────────────── */}
      <MarketingNav />

      {/* ── Main Content Area ────────────────────────────────────────── */}
      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8">

        {/* ── B. Marketing Performance Metrics ──────────────────────── */}
        <section>
          <GrowthSectionHeader
            category="PERFORMANCE METRICS"
            title="Customer Acquisition Pipeline"
            description="Verified metrics aggregated in real time from CRM leads, active opportunities, and marketing programs"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Total Leads */}
            <NavLink
              to="/growth/marketing/leads"
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Total Leads
                </span>
                <Users size={15} className="text-[#6366f1]" />
              </div>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                {loading ? '…' : metrics.totalLeads}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Across all channels</p>
            </NavLink>

            {/* Qualified Leads */}
            <NavLink
              to="/growth/marketing/leads?status=Qualified"
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Qualified Leads
                </span>
                <CheckCircle2 size={15} className="text-[#10b981]" />
              </div>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                {loading ? '…' : metrics.qualifiedLeads}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Sales-ready leads</p>
            </NavLink>

            {/* Conversion Rate */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Conversion Rate
                </span>
                <TrendingUp size={15} className="text-[#0ea5e9]" />
              </div>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                {loading ? '…' : `${metrics.conversionRate}%`}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Lead to qualified</p>
            </div>

            {/* Active Opportunities */}
            <NavLink
              to="/opportunities"
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Pipeline Deals
                </span>
                <Target size={15} className="text-[#f59e0b]" />
              </div>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                {loading ? '…' : metrics.activeOpportunities}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Active deals</p>
            </NavLink>

            {/* Pipeline Value */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Active Value
                </span>
                <DollarSign size={15} className="text-[#244235]" />
              </div>
              <p className="text-xl font-semibold text-gray-900 mt-2 truncate" title={formatCurrency(metrics.opportunityValue)}>
                {loading ? '…' : formatCurrency(metrics.opportunityValue)}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">In negotiation</p>
            </div>

            {/* Active Initiatives */}
            <NavLink
              to="/growth/marketing/initiatives"
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Initiatives
                </span>
                <Radio size={15} className="text-[#8b5cf6]" />
              </div>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                {loading ? '…' : metrics.activeInitiatives}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Active programs</p>
            </NavLink>
          </div>
        </section>

        {/* ── C. Acquisition Overview (Channel Breakdown) ──────────── */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Share2 size={16} className="text-[#244235]" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Lead Acquisition Channel Distribution
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Breakdown of inbound vs. outbound channel contributions based on actual CRM lead records
              </p>
            </div>
            <NavLink
              to="/growth/marketing/channels"
              className="text-xs font-medium text-[#244235] hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Manage Channels</span>
              <ArrowRight size={12} />
            </NavLink>
          </div>

          {channelsDistribution.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              No acquisition channels or lead records detected yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fbfbfa] text-gray-500 border-b border-gray-100 font-medium">
                  <tr>
                    <th className="py-3 px-6">Channel Source</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Leads Acquired</th>
                    <th className="py-3 px-4">Distribution</th>
                    <th className="py-3 px-4">Qualified</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {channelsDistribution.map((ch) => (
                    <tr key={ch.source} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-6 font-medium text-gray-900">
                        {ch.label}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            ch.isOutbound
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {ch.isOutbound ? 'Outbound' : 'Inbound'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {ch.count}
                      </td>
                      <td className="py-3 px-4 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#244235] rounded-full transition-all duration-300"
                              style={{ width: `${ch.percentage}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-gray-500 w-9 text-right">
                            {ch.percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {ch.qualifiedCount} ({ch.count > 0 ? Math.round((ch.qualifiedCount / ch.count) * 100) : 0}%)
                      </td>
                      <td className="py-3 px-6 text-right">
                        <NavLink
                          to={`/growth/marketing/leads?source=${encodeURIComponent(ch.source)}`}
                          className="text-[#244235] hover:underline font-medium inline-flex items-center gap-1"
                        >
                          <span>Filter leads</span>
                          <ArrowRight size={11} />
                        </NavLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── D & E. Bottom Grid: Marketing Activity & Quick Actions ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* D. Marketing Activity Feed (3 units) */}
          <div className="lg:col-span-3">
            <GrowthActivityFeed
              activities={activities}
              loading={loading}
            />
          </div>

          {/* E. Quick Actions & Strategic Nav (2 units) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Working Quick Actions
              </h3>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                Direct entry points for core marketing operations:
              </p>

              <div className="space-y-2">
                {[
                  {
                    label: 'Create Marketing Initiative',
                    description: 'Launch a campaign program linked to tasks',
                    to: '/growth/marketing/initiatives?new=1',
                    icon: Radio,
                  },
                  {
                    label: 'Create Growth Experiment',
                    description: 'Test acquisition hypotheses and track results',
                    to: '/growth/marketing/experiments?new=1',
                    icon: Sparkles,
                  },
                  {
                    label: 'Configure Acquisition Channel',
                    description: 'Review budgets, statuses, and CRM mappings',
                    to: '/growth/marketing/channels',
                    icon: Share2,
                  },
                  {
                    label: 'Define Marketing Objective',
                    description: 'Set strategic acquisition targets and dates',
                    to: '/growth/marketing/strategy?new=1',
                    icon: Target,
                  },
                  {
                    label: 'Analyze Acquisition Leads',
                    description: 'Inspect leads filtered by channel and status',
                    to: '/growth/marketing/leads',
                    icon: Users,
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

            {/* Strategic Overview Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Strategic Acquisition Priorities
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                Originyx customer acquisition is organized across five coordinated sub-systems. Use the tabs above or the quick actions to manage each area.
              </p>
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#244235]" />
                  <span><strong>Audience & ICP:</strong> Targeted B2B founders & tech leaders</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#244235]" />
                  <span><strong>Primary Channels:</strong> LinkedIn, Direct Web, and Referrals</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#244235]" />
                  <span><strong>Ops Link:</strong> Growth tasks synced with Operations</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
