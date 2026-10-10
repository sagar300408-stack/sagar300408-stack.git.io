import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Layers, Calendar, Building2,
  AlertCircle, ArrowRight
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getOCEClient } from '../lib/sdk';
import { classifyDbError } from '../lib/dbErrors';

type SubStatus = 'Trial' | 'Active' | 'Past Due' | 'Paused' | 'Cancelled' | 'Expired';

interface Subscription {
  id: string;
  customer_org_id: string;
  product_id: string;
  plan_name: string;
  status: SubStatus;
  value: number;
  currency: string;
  renewal_date: string | null;
  customer?: { name: string; slug: string };
  product?: { name: string };
}

const STATUS_CONFIG: Record<SubStatus, { bg: string; text: string }> = {
  Trial:      { bg: 'bg-purple-100',  text: 'text-purple-700' },
  Active:     { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Past Due': { bg: 'bg-red-100',     text: 'text-red-700' },
  Paused:     { bg: 'bg-amber-100',   text: 'text-amber-700' },
  Cancelled:  { bg: 'bg-gray-100',    text: 'text-gray-600' },
  Expired:    { bg: 'bg-gray-100',    text: 'text-gray-600' },
};

export default function Subscriptions() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const sdk = getOCEClient();

  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Active');

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true); setError(null);
    try {
      let q = sdk.supabase
        .from('cc_subscriptions')
        .select(`
          id, plan_name, status, value, currency, renewal_date,
          customer:organizations!customer_org_id(name, slug),
          product:cc_products!product_id(name)
        `)
        .eq('org_id', orgId)
        .order('renewal_date', { ascending: true });
        
      if (filterStatus && filterStatus !== 'All') {
        q = q.eq('status', filterStatus);
      }
      
      const { data, error } = await q;
      if (error) throw error;
      setSubs((data as unknown as Subscription[]) ?? []);
    } catch (e: any) {
      setError(classifyDbError(e).message);
    } finally { setLoading(false); }
  }, [orgId, filterStatus]);

  useEffect(() => { load(); }, [load]);

  const filtered = subs.filter(s =>
    !search || 
    s.customer?.name.toLowerCase().includes(search.toLowerCase()) || 
    s.product?.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (val: number, cur: string) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: cur || 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-full bg-[#f5f5f4] flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Subscriptions</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage active customer subscriptions and renewals.</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#244235] text-white rounded-lg text-sm font-medium hover:bg-[#1a3026] transition-colors"
          onClick={() => alert("Subscription creator coming soon.")}
        >
          <Plus size={15} /> Add Subscription
        </button>
      </div>

      <div className="flex-1 p-6 w-full max-w-6xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative max-w-sm w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by customer or product..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#244235]"
            />
          </div>
          <select
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:border-[#244235]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Trial">Trial</option>
            <option value="Past Due">Past Due</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {error && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#244235]" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
            <Layers size={32} className="mx-auto text-gray-200 mb-4" />
            <p className="font-medium text-gray-500 text-sm">No subscriptions found</p>
            <p className="text-xs text-gray-400 mt-1">Active customer subscriptions will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Product / Plan</th>
                  <th className="px-5 py-3 font-medium">Value</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Renewal</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(sub => {
                  const sc = STATUS_CONFIG[sub.status] || STATUS_CONFIG.Active;
                  const isOverdue = sub.renewal_date && new Date(sub.renewal_date) < new Date() && sub.status === 'Active';
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Building2 size={16} className="text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{sub.customer?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{sub.customer?.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900">{sub.product?.name || 'Unknown Product'}</span>
                          <span className="text-xs text-gray-500">{sub.plan_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(sub.value, sub.currency)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${sc.bg} ${sc.text}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {sub.renewal_date ? (
                          <div className={`flex items-center gap-1.5 text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                            <Calendar size={14} className={isOverdue ? 'text-red-500' : 'text-gray-400'} />
                            {new Date(sub.renewal_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="text-gray-400 hover:text-[#244235] opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight size={16} />
                        </button>
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
  );
}
