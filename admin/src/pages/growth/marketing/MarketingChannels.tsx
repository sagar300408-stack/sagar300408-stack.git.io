import { useState, useEffect, useCallback } from 'react';
import {
  Share2, Plus, Edit2, CheckCircle2, X,
  ToggleLeft, ToggleRight
} from 'lucide-react';
import { useAuth } from '../../../lib/AuthContext';
import {
  getOCEClient,
  type MarketingChannel,
  type ChannelCategory,
  type ChannelStatus,
} from '../../../lib/sdk';
import {
  GrowthPageHeader,
  MarketingNav,
  GrowthEmptyState,
} from '../../../components/growth';

const CATEGORIES: ChannelCategory[] = [
  'Inbound', 'Outbound', 'Referral', 'Organic', 'Paid', 'Event', 'Other'
];

const CRM_SOURCES = [
  'Website', 'LinkedIn', 'Referral', 'Cold Outreach', 'Event', 'Inbound', 'Other'
];

export default function MarketingChannels() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const sdk = getOCEClient();

  const [channels, setChannels] = useState<MarketingChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingChannel, setEditingChannel] = useState<MarketingChannel | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    category: 'Inbound' as ChannelCategory,
    crm_source_mapping: 'Website',
    description: '',
    monthly_budget: 0,
    target_cpl: 0,
    status: 'active' as ChannelStatus,
  });

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const data = await sdk.getMarketingChannels(orgId);
      setChannels(data);
    } catch (e) {
      console.warn('[MarketingChannels] Error loading channels:', e);
    } finally {
      setLoading(false);
    }
  }, [orgId, sdk]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !form.name.trim()) return;

    if (editingChannel) {
      await sdk.updateMarketingChannel(orgId, editingChannel.id, form);
    } else {
      await sdk.createMarketingChannel(orgId, form);
    }
    setShowModal(false);
    setEditingChannel(null);
    loadData();
  };

  const handleToggleStatus = async (ch: MarketingChannel) => {
    if (!orgId) return;
    const nextStatus: ChannelStatus = ch.status === 'active' ? 'inactive' : 'active';
    await sdk.toggleMarketingChannelStatus(orgId, ch.id, nextStatus);
    loadData();
  };

  const filtered = channels.filter((c) => {
    if (selectedCategory === 'all') return true;
    return c.category === selectedCategory;
  });

  const totalBudget = channels.reduce((sum, c) => sum + (Number(c.monthly_budget) || 0), 0);
  const totalLeads = channels.reduce((sum, c) => sum + (c.leadCount || 0), 0);
  const activeCount = channels.filter(c => c.status === 'active').length;

  return (
    <div className="min-h-full bg-[#f5f5f4] flex flex-col">
      <GrowthPageHeader
        title="Acquisition Channels"
        description="Configure, evaluate, and monitor Originyx's customer acquisition channels and CRM source mappings."
        breadcrumb={[
          { label: 'Growth', to: '/growth' },
          { label: 'Marketing', to: '/growth/marketing' },
          { label: 'Channels' },
        ]}
        actions={
          <button
            onClick={() => {
              setEditingChannel(null);
              setForm({
                name: '',
                slug: '',
                category: 'Inbound',
                crm_source_mapping: 'Website',
                description: '',
                monthly_budget: 0,
                target_cpl: 0,
                status: 'active',
              });
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#244235] text-white hover:bg-[#1a3026] rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <Plus size={14} />
            <span>Configure Channel</span>
          </button>
        }
      />

      <MarketingNav />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-6">

        {/* Pulse Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Active Channels
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{activeCount}</span>
              <span className="text-xs text-gray-400">of {channels.length} configured</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Total Acquired Leads
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{totalLeads}</span>
              <span className="text-xs text-gray-400">across all sources</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Monthly Channel Budget
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalBudget)}
              </span>
              <span className="text-xs text-gray-400">allocated</span>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#244235] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Channels ({channels.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = channels.filter(c => c.category === cat).length;
            if (count === 0 && selectedCategory !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#244235] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Channels Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-xs">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#244235] mr-2" />
              Loading acquisition channels…
            </div>
          ) : filtered.length === 0 ? (
            <GrowthEmptyState
              icon={Share2}
              title="No acquisition channels found"
              description="Add or enable an acquisition channel to start tracking customer acquisition paths."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fbfbfa] text-gray-500 border-b border-gray-100 font-medium">
                  <tr>
                    <th className="py-3 px-6">Channel</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">CRM Mapping</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Leads Acquired</th>
                    <th className="py-3 px-4">Qualified</th>
                    <th className="py-3 px-4">Budget / Month</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filtered.map((ch) => (
                    <tr key={ch.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-gray-900">{ch.name}</div>
                        {ch.description && (
                          <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{ch.description}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                          {ch.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-gray-500">
                        {ch.crm_source_mapping || 'None'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            ch.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ch.status === 'evaluating'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-gray-50 text-gray-500 border border-gray-200'
                          }`}
                        >
                          {ch.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        {ch.leadCount ?? 0}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {ch.qualifiedLeadCount ?? 0} ({ch.conversionRate ?? 0}%)
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {ch.monthly_budget > 0
                          ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(ch.monthly_budget)
                          : 'Organic / Zero'}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 text-gray-400">
                          <button
                            onClick={() => handleToggleStatus(ch)}
                            title={ch.status === 'active' ? 'Deactivate channel' : 'Activate channel'}
                            className="hover:text-gray-700"
                          >
                            {ch.status === 'active' ? (
                              <ToggleRight size={20} className="text-[#244235]" />
                            ) : (
                              <ToggleLeft size={20} className="text-gray-300" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setEditingChannel(ch);
                              setForm({
                                name: ch.name,
                                slug: ch.slug,
                                category: ch.category,
                                crm_source_mapping: ch.crm_source_mapping || 'Website',
                                description: ch.description || '',
                                monthly_budget: ch.monthly_budget || 0,
                                target_cpl: ch.target_cpl || 0,
                                status: ch.status,
                              });
                              setShowModal(true);
                            }}
                            className="p-1 hover:text-gray-700"
                            title="Edit Channel"
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CRM Source Compatibility Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs text-xs text-gray-600 leading-relaxed">
          <div className="flex items-center gap-2 mb-1.5 font-semibold text-gray-800">
            <CheckCircle2 size={15} className="text-[#244235]" />
            <span>CRM Lead Source Compatibility</span>
          </div>
          Every acquisition channel maps directly to an existing enum value in the Originyx CRM (<code className="bg-gray-100 px-1 py-0.5 rounded text-[11px]">public.lead_source</code>). When leads submit inbound inquiries, contact forms, or referral introductions, their lead count and qualification ratios appear automatically in the acquisition metrics above.
        </div>

      </div>

      {/* Modal: Channel Config */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">
                {editingChannel ? 'Edit Acquisition Channel' : 'Configure New Channel'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Channel Name *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Founder LinkedIn"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Channel Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as ChannelCategory })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">CRM Lead Source Mapping *</label>
                  <select
                    value={form.crm_source_mapping}
                    onChange={(e) => setForm({ ...form, crm_source_mapping: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  >
                    {CRM_SOURCES.map(src => (
                      <option key={src} value={src}>{src}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Monthly Budget (INR)</label>
                  <input
                    type="number"
                    value={form.monthly_budget}
                    onChange={(e) => setForm({ ...form, monthly_budget: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ChannelStatus })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  >
                    <option value="active">Active</option>
                    <option value="evaluating">Evaluating</option>
                    <option value="paused">Paused</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="How leads enter via this channel..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                />
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#244235] text-white rounded-lg hover:bg-[#1a3026] font-medium"
                >
                  {editingChannel ? 'Save Channel' : 'Add Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
