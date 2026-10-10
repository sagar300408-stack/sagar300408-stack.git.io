import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, TrendingUp, Calendar, AlertCircle
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getOCEClient } from '../lib/sdk';
import { classifyDbError } from '../lib/dbErrors';

type OppStage = 'Discovery' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

interface Opportunity {
  id: string;
  name: string;
  company: string;
  product: string;
  value: number;
  currency: string;
  stage: OppStage;
  probability: number;
  expected_close: string | null;
  created_at: string;
}

const STAGES: OppStage[] = ['Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

export default function Opportunities() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const sdk = getOCEClient();

  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true); setError(null);
    try {
      const { data, error } = await sdk.supabase
        .from('opportunities')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOpps((data as Opportunity[]) ?? []);
    } catch (e: any) {
      setError(classifyDbError(e).message);
    } finally { setLoading(false); }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  const filtered = opps.filter(o =>
    !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.company?.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (val: number, cur: string) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: cur || 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-full bg-[#f5f5f4] flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Opportunities</h1>
          <p className="text-sm text-gray-400 mt-0.5">Track your sales pipeline and potential revenue.</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#244235] text-white rounded-lg text-sm font-medium hover:bg-[#1a3026] transition-colors"
          onClick={() => alert("Opportunity creation form is coming soon.")}
        >
          <Plus size={15} /> Add Opportunity
        </button>
      </div>

      <div className="flex-1 p-6 w-full max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search pipeline..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#244235]"
            />
          </div>
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
            <TrendingUp size={32} className="mx-auto text-gray-200 mb-4" />
            <p className="font-medium text-gray-500 text-sm">No opportunities found</p>
            <p className="text-xs text-gray-400 mt-1">Add your first deal to the pipeline.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-220px)]">
            {STAGES.map(stage => {
              const stageOpps = filtered.filter(o => o.stage === stage);
              const stageValue = stageOpps.reduce((sum, o) => sum + (Number(o.value) || 0), 0);
              
              return (
                <div key={stage} className="flex-shrink-0 w-72 flex flex-col bg-gray-50/50 rounded-xl border border-gray-200/60 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200/60 bg-gray-100/50">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 text-sm">{stage}</h3>
                      <span className="text-xs font-medium bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                        {stageOpps.length}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{formatCurrency(stageValue, 'INR')}</p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {stageOpps.map(opp => (
                      <div key={opp.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:border-[#244235]/30 hover:shadow transition-all cursor-pointer">
                        <p className="text-sm font-medium text-gray-900 mb-1 leading-tight">{opp.name}</p>
                        <p className="text-xs text-gray-500 mb-3 truncate">{opp.company || 'Unknown Company'}</p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <p className="text-sm font-semibold text-[#244235]">
                            {formatCurrency(opp.value, opp.currency)}
                          </p>
                          {opp.expected_close && (
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                              <Calendar size={10} />
                              {new Date(opp.expected_close).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
