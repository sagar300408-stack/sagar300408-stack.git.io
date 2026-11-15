import { useState, useEffect, useCallback } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import {
  Users, Search, ArrowRight, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../../lib/AuthContext';
import { getOCEClient } from '../../../lib/sdk';
import {
  GrowthPageHeader,
  MarketingNav,
  GrowthEmptyState,
} from '../../../components/growth';

interface CrmLead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  source: string;
  status: string;
  notes?: string;
  next_action?: string;
  created_at: string;
  updated_at: string;
}

const SOURCES = ['All Sources', 'Website', 'LinkedIn', 'Referral', 'Cold Outreach', 'Event', 'Inbound', 'Other'];
const STATUSES = ['All Statuses', 'New', 'Contacted', 'Qualified', 'Disqualified', 'Converted'];

export default function MarketingLeads() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const sdk = getOCEClient();
  const [searchParams] = useSearchParams();

  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>(searchParams.get('source') || 'All Sources');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'All Statuses');
  const [timeRange, setTimeRange] = useState<'all' | '30d' | '90d'>('all');

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      let query = sdk.supabase
        .from('leads')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (selectedSource !== 'All Sources') {
        query = query.eq('source', selectedSource);
      }
      if (selectedStatus !== 'All Statuses') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLeads((data as CrmLead[]) ?? []);
    } catch (e) {
      console.warn('[MarketingLeads] Error fetching CRM leads:', e);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [orgId, selectedSource, selectedStatus, sdk]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Client-side search and time filter
  const filteredLeads = leads.filter((l) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        l.name.toLowerCase().includes(q) ||
        (l.company && l.company.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (timeRange === '30d') {
      const d = new Date(l.created_at);
      const cutoff = new Date(Date.now() - 30 * 86400000);
      if (d < cutoff) return false;
    } else if (timeRange === '90d') {
      const d = new Date(l.created_at);
      const cutoff = new Date(Date.now() - 90 * 86400000);
      if (d < cutoff) return false;
    }

    return true;
  });

  const totalCount = leads.length;
  const qualifiedCount = leads.filter(l => l.status === 'Qualified' || l.status === 'Converted').length;
  const conversionRate = totalCount > 0 ? Math.round((qualifiedCount / totalCount) * 1000) / 10 : 0;

  return (
    <div className="min-h-full bg-[#f5f5f4] flex flex-col">
      <GrowthPageHeader
        title="Lead Generation"
        description="Marketing-focused visibility into customer acquisition channels, lead quality, and qualification velocity."
        breadcrumb={[
          { label: 'Growth', to: '/growth' },
          { label: 'Marketing', to: '/growth/marketing' },
          { label: 'Lead Generation' },
        ]}
        actions={
          <NavLink
            to="/leads?new=1"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#244235] text-white hover:bg-[#1a3026] rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <span>Record Lead in CRM</span>
            <ExternalLink size={13} />
          </NavLink>
        }
      />

      <MarketingNav />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-6">

        {/* Pulse Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Captured Leads
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{totalCount}</span>
              <span className="text-xs text-gray-400">in current view</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Sales Qualified
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{qualifiedCount}</span>
              <span className="text-xs text-gray-400">MQL / SQL</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Qualification Rate
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{conversionRate}%</span>
              <span className="text-xs text-gray-400">conversion</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              CRM Master Record
            </span>
            <NavLink
              to="/leads"
              className="text-xs font-semibold text-[#244235] hover:underline flex items-center gap-1 mt-2"
            >
              <span>Open Business Leads</span>
              <ArrowRight size={13} />
            </NavLink>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads by name, company, email..."
              className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-[#fbfbfa] focus:bg-white focus:outline-none focus:border-[#244235]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Source selector */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-[#fbfbfa] focus:bg-white focus:outline-none focus:border-[#244235]"
            >
              {SOURCES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Status selector */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-[#fbfbfa] focus:bg-white focus:outline-none focus:border-[#244235]"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Time range */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-xs">
              <button
                onClick={() => setTimeRange('all')}
                className={`px-2.5 py-1.5 ${timeRange === 'all' ? 'bg-[#244235] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                All
              </button>
              <button
                onClick={() => setTimeRange('90d')}
                className={`px-2.5 py-1.5 border-l border-gray-200 ${timeRange === '90d' ? 'bg-[#244235] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                90d
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-2.5 py-1.5 border-l border-gray-200 ${timeRange === '30d' ? 'bg-[#244235] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                30d
              </button>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-xs">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#244235] mr-2" />
              Connecting to CRM leads…
            </div>
          ) : filteredLeads.length === 0 ? (
            <GrowthEmptyState
              icon={Users}
              title="No acquisition leads matched"
              description="No leads match the current filters. Adjust your channel or status filters, or capture new inquiries from website contact forms."
              action={
                <NavLink
                  to="/leads?new=1"
                  className="px-4 py-2 bg-[#244235] text-white rounded-lg text-xs font-medium hover:bg-[#1a3026] inline-block"
                >
                  Capture New Lead
                </NavLink>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fbfbfa] text-gray-500 border-b border-gray-100 font-medium">
                  <tr>
                    <th className="py-3 px-6">Lead Name</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Acquisition Channel</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Next Action</th>
                    <th className="py-3 px-4">Acquired Date</th>
                    <th className="py-3 px-6 text-right">CRM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredLeads.map((lead) => {
                    const isQualified = lead.status === 'Qualified' || lead.status === 'Converted';
                    return (
                      <tr key={lead.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="font-semibold text-gray-900">{lead.name}</div>
                          {lead.email && (
                            <p className="text-[11px] text-gray-400 mt-0.5">{lead.email}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-800">
                          {lead.company || '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                            {lead.source}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                              isQualified
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : lead.status === 'New'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : lead.status === 'Contacted'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-gray-50 text-gray-500 border-gray-200'
                            }`}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 max-w-xs truncate">
                          {lead.next_action || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                          {new Date(lead.created_at).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <NavLink
                            to="/leads"
                            className="text-[#244235] hover:underline font-medium inline-flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ExternalLink size={11} />
                          </NavLink>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
