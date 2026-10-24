import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { getOCEClient } from '../lib/sdk';
import { CreditCard, ArrowRight } from 'lucide-react';

interface SubscriptionItem {
  id: string;
  plan_name: string;
  status: string;
  value: number | null;
  currency: string;
  start_date: string;
  renewal_date: string | null;
  product?: {
    name: string;
    slug: string;
  };
}

export default function Subscriptions() {
  useEffect(() => {
    document.title = 'Subscriptions | Originyx Client Portal';
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex, nofollow';
  }, []);


  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubscriptions() {
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
          const { data, error } = await sdk.supabase
            .from('cc_subscriptions')
            .select(`
              id,
              plan_name,
              status,
              value,
              currency,
              start_date,
              renewal_date,
              product:cc_products (
                name,
                slug
              )
            `)
            .eq('customer_org_id', roleData.org_id);

          if (!error && data) {
            setSubscriptions(data as unknown as SubscriptionItem[]);
          }
        }
      } catch (err) {
        console.warn('Could not query customer subscriptions:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSubscriptions();
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '14px', color: '#787875' }}>Loading subscription records…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1440px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* ─── Header ─── */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
          Subscription Management
        </h1>
        <p style={{ fontSize: '14px', color: '#787875', margin: 0, maxWidth: '640px' }}>
          View and manage active subscription plans, track renewal schedules, and inspect billing cycles for your organization.
        </p>
      </div>

      {subscriptions.length > 0 ? (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e8e5', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#fbfbfa', borderBottom: '1px solid #e8e8e5' }}>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#787875', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#787875', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#787875', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#787875', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Commitment</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#787875', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Start Date</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#787875', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Renewal Date</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map(sub => (
                <tr key={sub.id} style={{ borderBottom: '1px solid #f0f0ed' }}>
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#1c1c1c' }}>
                    {sub.product?.name || 'Originyx System'}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#4a4a4a' }}>
                    {sub.plan_name}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: sub.status === 'Active' ? '#eef3f0' : '#fef3c7',
                      color: sub.status === 'Active' ? '#244235' : '#92400e'
                    }}>
                      {sub.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: '#1c1c1c' }}>
                    {sub.value ? `${sub.currency} ${sub.value.toLocaleString()}` : 'Custom Agreement'}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#787875' }}>
                    {sub.start_date}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#787875' }}>
                    {sub.renewal_date || 'Ongoing'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <CreditCard size={24} color="#787875" />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 8px 0' }}>
            No Active Subscriptions Found
          </h2>
          <p style={{ fontSize: '13px', color: '#787875', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            Your organization does not currently have any billed or active subscription agreements.
            Once you finalize a plan proposal or activate a pilot with Originyx, billing cycles, SLA tiers, and renewals will be tracked here.
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
            Browse Products & Plans <ArrowRight size={14} />
          </NavLink>
        </div>
      )}
    </div>
  );
}
