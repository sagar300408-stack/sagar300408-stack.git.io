import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { getOCEClient } from '../lib/sdk';
import { Box, ExternalLink, ArrowRight } from 'lucide-react';

interface ActiveProduct {
  id: string;
  plan_name: string;
  status: string;
  start_date: string;
  renewal_date: string | null;
  product?: {
    name: string;
    slug: string;
    tagline: string;
    category?: string;
  };
}

export default function MyProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ActiveProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPurchasedProducts() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const sdk = getOCEClient();
        
        // 1. Get user's org
        const { data: roleData } = await sdk.supabase
          .from('user_roles')
          .select('org_id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (roleData?.org_id) {
          // 2. Fetch active subscriptions for this organization
          const { data, error } = await sdk.supabase
            .from('cc_subscriptions')
            .select(`
              id,
              plan_name,
              status,
              start_date,
              renewal_date,
              product:cc_products (
                name,
                slug,
                tagline
              )
            `)
            .eq('customer_org_id', roleData.org_id)
            .in('status', ['Active', 'Trial']);

          if (!error && data) {
            setProducts(data as unknown as ActiveProduct[]);
          }
        }
      } catch (err) {
        console.warn('Could not query customer subscriptions:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPurchasedProducts();
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '14px', color: '#787875' }}>Loading your organization's products…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1440px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* ─── Header ─── */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
          Your Products & Entitlements
        </h1>
        <p style={{ fontSize: '14px', color: '#787875', margin: 0, maxWidth: '640px' }}>
          Manage your organization's active Originyx solutions, monitor entitlement status, and launch deployed consoles.
        </p>
      </div>

      {products.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {products.map(p => (
            <div
              key={p.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e8e8e5',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#eef3f0',
                    color: '#244235'
                  }}>
                    {p.status}
                  </span>
                  <span style={{ fontSize: '12px', color: '#787875' }}>
                    Plan: <strong>{p.plan_name}</strong>
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 6px 0' }}>
                  {p.product?.name || 'Originyx Platform'}
                </h3>
                <p style={{ fontSize: '13px', color: '#4a4a4a', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  {p.product?.tagline || 'Active enterprise deployment.'}
                </p>

                <div style={{ borderTop: '1px solid #f0f0ed', paddingTop: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#787875', marginBottom: '4px' }}>
                    <span>Activated:</span>
                    <span>{p.start_date || 'Active'}</span>
                  </div>
                  {p.renewal_date && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#787875' }}>
                      <span>Renewal:</span>
                      <span>{p.renewal_date}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    backgroundColor: '#244235',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  onClick={() => alert(`Launching console for ${p.product?.name || 'platform'}`)}
                >
                  Launch Console <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e8e8e5',
          borderRadius: '16px',
          padding: '48px 32px',
          textAlign: 'center',
          maxWidth: '560px',
          margin: '40px auto'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#fbfbfa',
            border: '1px dashed #dcdcd8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <Box size={24} color="#787875" />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 8px 0' }}>
            No Active Products Yet
          </h2>
          <p style={{ fontSize: '13px', color: '#787875', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            You are signed in as an authenticated Originyx user.
            Purchased solutions, active subscription agreements, and verified pilot platforms will appear here once provisioned for your organization.
          </p>
          <NavLink
            to="/explore"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#244235',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            Explore Product Portfolio <ArrowRight size={14} />
          </NavLink>
        </div>
      )}
    </div>
  );
}
