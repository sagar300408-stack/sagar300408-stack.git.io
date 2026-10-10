import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Package, ExternalLink, AlertCircle
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getOCEClient } from '../lib/sdk';
import { classifyDbError } from '../lib/dbErrors';

type ProductStatus = 'Concept' | 'Development' | 'Beta' | 'Live' | 'Deprecated' | 'Discontinued';

interface Product {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  status: ProductStatus;
  website?: string;
  created_at: string;
}

const STATUS_CONFIG: Record<ProductStatus, { bg: string; text: string }> = {
  Concept:      { bg: 'bg-gray-100',    text: 'text-gray-600' },
  Development:  { bg: 'bg-blue-100',    text: 'text-blue-700' },
  Beta:         { bg: 'bg-purple-100',  text: 'text-purple-700' },
  Live:         { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Deprecated:   { bg: 'bg-amber-100',   text: 'text-amber-700' },
  Discontinued: { bg: 'bg-red-100',     text: 'text-red-700' },
};

export default function Products() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const sdk = getOCEClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true); setError(null);
    try {
      const { data, error } = await sdk.supabase
        .from('cc_products')
        .select('*')
        .eq('org_id', orgId)
        .order('name', { ascending: true });
      if (error) throw error;
      setProducts((data as Product[]) ?? []);
    } catch (e: any) {
      setError(classifyDbError(e).message);
    } finally { setLoading(false); }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full bg-[#f5f5f4] flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Product Portfolio</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your internal and external product catalogue.</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#244235] text-white rounded-lg text-sm font-medium hover:bg-[#1a3026] transition-colors"
          onClick={() => alert("Product creator coming soon.")}
        >
          <Plus size={15} /> Add Product
        </button>
      </div>

      <div className="flex-1 p-6 w-full max-w-5xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative max-w-sm w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
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
            <Package size={32} className="mx-auto text-gray-200 mb-4" />
            <p className="font-medium text-gray-500 text-sm">No products found</p>
            <p className="text-xs text-gray-400 mt-1">Add your first product to the portfolio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(product => {
              const sc = STATUS_CONFIG[product.status] || STATUS_CONFIG.Concept;
              return (
                <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <Package size={20} className="text-gray-400" />
                    </div>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                      {product.status}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.tagline || 'No description provided.'}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 mt-auto flex items-center justify-between">
                    {product.website ? (
                      <a href={product.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#244235]">
                        <ExternalLink size={13} /> Visit Site
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No URL</span>
                    )}
                    
                    <button className="text-xs font-medium text-[#244235] hover:underline">
                      Manage
                    </button>
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
