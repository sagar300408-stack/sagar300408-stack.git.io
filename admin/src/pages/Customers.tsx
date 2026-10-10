import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Building2, Globe, FileText, Users,
  AlertCircle, ArrowRight
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getOCEClient } from '../lib/sdk';

interface Customer {
  id: string;
  name: string;
  slug: string;
  website?: string;
  industry?: string;
  // company_size is the canonical column (added in migration 010)
  company_size?: string;
  created_at: string;
}

export default function Customers() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const sdk = getOCEClient();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true); setError(null);
    try {
      const { data, error } = await sdk.supabase
        .from('organizations')
        // Use company_size (canonical column from migration 010), not employee_count
        .select('id, name, slug, website, industry, company_size, created_at')
        .neq('id', orgId)
        .order('name', { ascending: true });
      if (error) throw error;
      setCustomers((data as Customer[]) ?? []);
    } catch (e: any) {
      // Distinguish column errors from general failures
      if (e.code === '42703' || e.message?.includes('does not exist')) {
        setError('Database schema mismatch. Please run the latest migrations.');
      } else if (e.code === '42501') {
        setError('Permission denied. Check your RLS policies.');
      } else {
        setError(e.message);
      }
    } finally { setLoading(false); }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full bg-[#f5f5f4] flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage customer organizations and their details.</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#244235] text-white rounded-lg text-sm font-medium hover:bg-[#1a3026] transition-colors"
          onClick={() => alert("Creating customers manually is coming soon. Customers are created via Client Portal signup.")}
        >
          <Plus size={15} /> Add Customer
        </button>
      </div>

      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search customers..."
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
            <Building2 size={32} className="mx-auto text-gray-200 mb-4" />
            <p className="font-medium text-gray-500 text-sm">{search ? 'No customers found' : 'No customers yet'}</p>
            <p className="text-xs text-gray-400 mt-1">Client portal signups will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(customer => (
              <div key={customer.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <Building2 size={18} className="text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm truncate max-w-[150px]">{customer.name}</h3>
                      <p className="text-xs text-gray-400">@{customer.slug}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe size={14} className="text-gray-400" />
                    {customer.website
                      ? <a href={customer.website} target="_blank" rel="noreferrer" className="hover:text-[#244235] hover:underline truncate">{customer.website}</a>
                      : <span className="text-gray-400 italic">No website</span>}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText size={14} className="text-gray-400" />
                    <span className="truncate">{customer.industry || <span className="text-gray-400 italic">No industry</span>}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={14} className="text-gray-400" />
                    <span>
                      {customer.company_size
                        ? `${customer.company_size} employees`
                        : <span className="text-gray-400 italic">Size unknown</span>}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button className="flex items-center gap-1.5 text-xs font-medium text-[#244235] hover:underline">
                    View Details <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
