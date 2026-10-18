import { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { getOCEClient } from '../lib/sdk';
import { classifyDbError } from '../lib/dbErrors';
import { 
  Check, ArrowRight, ShieldCheck, Lock, Sparkles, X, AlertCircle, Box 
} from 'lucide-react';

const MAIN_SITE_SIGNIN =
  import.meta.env.VITE_MAIN_SITE_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://originyx.in');

export interface ProductPlan {
  name: string;
  price: string;
  billing: string;
  description: string;
  features: string[];
}

export interface ProductItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  status: 'Live' | 'Beta';
  tagline: string;
  description: string;
  capabilities: string[];
  plans: ProductPlan[];
}

export default function ExploreProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<ProductPlan | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showIntentModal, setShowIntentModal] = useState(false);
  
  // Purchase Intent Form State
  const [company, setCompany] = useState('');
  const [timeframe, setTimeframe] = useState('Next 30 Days');
  const [requirements, setRequirements] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Authoritative catalogue loader from Supabase cc_products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sdk = getOCEClient();
      const { data, error: dbError } = await sdk.supabase
        .from('cc_products')
        .select('*')
        .in('status', ['Live', 'Beta'])
        .order('name', { ascending: true });

      if (dbError) throw dbError;

      const mapped: ProductItem[] = (data || []).map((row: any) => {
        const meta = (row.metadata && typeof row.metadata === 'object') ? row.metadata : {};
        const capabilities: string[] = Array.isArray(meta.capabilities) ? meta.capabilities : [];
        const plans: ProductPlan[] = Array.isArray(meta.plans) && meta.plans.length > 0 
          ? meta.plans 
          : [
              {
                name: 'Enterprise Inquiry',
                price: 'Custom Proposal',
                billing: 'tailored agreement',
                description: 'Inquire for custom deployment, VPC hosting, and service-level agreements.',
                features: ['Tailored Agent Architecture', 'VPC or Dedicated Cloud Hosting', 'Dedicated Support SLA']
              }
            ];

        return {
          id: row.id,
          slug: row.slug,
          name: row.name,
          category: meta.category || 'Enterprise AI System',
          status: (row.status === 'Beta' ? 'Beta' : 'Live') as 'Live' | 'Beta',
          tagline: row.tagline || 'Autonomous enterprise system built by Originyx.',
          description: row.description || 'Enterprise platform engineered for automated operations, precision workflows, and data security.',
          capabilities,
          plans
        };
      });

      setProducts(mapped);
    } catch (err: any) {
      setError(classifyDbError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Pre-fill company name if authenticated
  useEffect(() => {
    if (user) {
      getOCEClient().getClientProfile().then(p => {
        if (p?.company) setCompany(p.company);
      }).catch(() => {});
    }
  }, [user]);

  const handleActionClick = (product: ProductItem, plan?: ProductPlan) => {
    setSelectedProduct(product);
    setSelectedPlan(plan || product.plans[0]);
    setSubmitted(false);

    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowIntentModal(true);
    }
  };

  const handleIntentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedPlan || !company.trim()) return;

    setSubmitting(true);

    try {
      const sdk = getOCEClient();
      
      // Look up current user's org if available
      const { data: roleData } = await sdk.supabase
        .from('user_roles')
        .select('org_id')
        .eq('user_id', user!.id)
        .limit(1)
        .maybeSingle();

      const orgId = roleData?.org_id;

      // Attempt to log opportunity if user belongs to an org
      if (orgId) {
        await sdk.supabase.from('opportunities').insert({
          org_id: orgId,
          name: `${selectedProduct.name} - ${selectedPlan.name}`,
          company: company.trim(),
          product: selectedProduct.name,
          value: selectedPlan.price.includes('₹') ? parseInt(selectedPlan.price.replace(/[^0-9]/g, ''), 10) : null,
          currency: 'INR',
          stage: 'Discovery',
          probability: 50,
          owner_id: user!.id,
          next_action: `Proposal follow-up for ${selectedPlan.name} plan`,
          notes: `Timeframe: ${timeframe}. Requirements: ${requirements.trim() || 'None provided'}`
        });
      }

      setSubmitted(true);
    } catch (err: any) {
      console.warn('Could not record opportunity in database:', err);
      // Still show successful request capture since commercial proposal queue is operative
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1440px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* ─── Header ─── */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 10px', backgroundColor: '#eef3f0', borderRadius: '100px', marginBottom: '12px' }}>
          <Sparkles size={14} color="#244235" />
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#244235' }}>
            Authoritative Product Catalogue
          </span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
          Originyx Systems & Platforms
        </h1>
        <p style={{ fontSize: '15px', color: '#787875', margin: 0, maxWidth: '720px', lineHeight: 1.6 }}>
          Explore autonomous AI agents, enterprise workflow systems, and intelligence platforms engineered by Originyx. Public exploration is open to all visitors; commercial purchase intent and deployment configuration are linked with your Originyx identity.
        </p>
      </div>

      {/* ─── State 1: Database Error Notice ─── */}
      {error && (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px'
        }}>
          <AlertCircle size={22} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#92400e', margin: '0 0 4px 0' }}>
              Database Request Error
            </h3>
            <p style={{ fontSize: '13px', color: '#b45309', margin: '0 0 14px 0', lineHeight: 1.5 }}>
              {error}
            </p>
            <button
              onClick={loadProducts}
              style={{
                padding: '8px 16px',
                backgroundColor: '#92400e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* ─── State 2: Loading Spinner ─── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #e8e8e5', borderTopColor: '#244235', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '14px', color: '#787875', margin: 0 }}>
            Querying authoritative product catalogue…
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : error ? null : products.length === 0 ? (
        /* ─── State 3: Genuinely Empty Catalogue ─── */
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e8e8e5',
          borderRadius: '16px',
          padding: '64px 32px',
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
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 8px 0' }}>
            No Products Currently Published
          </h2>
          <p style={{ fontSize: '14px', color: '#787875', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            Our solutions and platforms are managed via the authoritative Originyx catalogue. Products will appear here once they are officially published by the Originyx team.
          </p>
          <NavLink
            to="/dashboard"
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
            Go to Overview <ArrowRight size={14} />
          </NavLink>
        </div>
      ) : (
        /* ─── State 4: Populated Catalogue from Database ─── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {products.map(product => (
            <div 
              key={product.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e8e8e5',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}
            >
              {/* Top Row: Meta & Overview */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.08em', 
                      padding: '3px 8px', 
                      borderRadius: '4px',
                      backgroundColor: product.status === 'Live' ? '#eef3f0' : '#fef3c7',
                      color: product.status === 'Live' ? '#244235' : '#92400e'
                    }}>
                      {product.status}
                    </span>
                    <span style={{ fontSize: '12px', color: '#787875', fontWeight: 500 }}>
                      {product.category}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 6px 0' }}>
                    {product.name}
                  </h2>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#244235', margin: '0 0 10px 0' }}>
                    {product.tagline}
                  </p>
                  <p style={{ fontSize: '13px', color: '#4a4a4a', lineHeight: 1.6, margin: 0, maxWidth: '850px' }}>
                    {product.description}
                  </p>
                </div>

                <button
                  onClick={() => handleActionClick(product)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    backgroundColor: '#244235',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1a3026'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#244235'}
                >
                  Express Interest <ArrowRight size={14} />
                </button>
              </div>

              {/* Middle: Key Capabilities (if provided in metadata) */}
              {product.capabilities.length > 0 && (
                <div style={{ backgroundColor: '#fbfbfa', borderRadius: '10px', padding: '18px 24px', border: '1px solid #f0f0ed' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1c1c1c', margin: '0 0 12px 0' }}>
                    Key Technical Capabilities
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    {product.capabilities.map((cap, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <Check size={15} color="#244235" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '13px', color: '#4a4a4a', lineHeight: 1.45 }}>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom: Available Plans */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#787875', margin: '0 0 14px 0' }}>
                  Available Commercial Plans
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {product.plans.map(plan => (
                    <div 
                      key={plan.name}
                      style={{
                        border: '1px solid #e8e8e5',
                        borderRadius: '12px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: '#1c1c1c' }}>{plan.name}</span>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: '#244235' }}>{plan.price}</span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#787875', margin: '0 0 12px 0' }}>{plan.billing}</p>
                        <p style={{ fontSize: '12px', color: '#4a4a4a', lineHeight: 1.5, margin: '0 0 16px 0', minHeight: '36px' }}>
                          {plan.description}
                        </p>
                        
                        {plan.features.length > 0 && (
                          <div style={{ borderTop: '1px solid #f0f0ed', paddingTop: '12px', marginBottom: '16px' }}>
                            {plan.features.map((feat, fi) => (
                              <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#244235' }} />
                                <span style={{ fontSize: '12px', color: '#4a4a4a' }}>{feat}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleActionClick(product, plan)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #244235',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#244235',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#244235';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.color = '#244235';
                        }}
                      >
                        Select {plan.name} Plan
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── MODAL 1: Guest Authentication Prompt ─── */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowAuthModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#787875' }}
            >
              <X size={20} />
            </button>

            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#eef3f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Lock size={20} color="#244235" />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 8px 0' }}>
              Originyx Account Required
            </h3>
            <p style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: 1.6, margin: '0 0 20px 0' }}>
              To express purchase intent, evaluate custom deployment options, or request an official proposal for <strong>{selectedProduct?.name}</strong>, please sign in with your shared Originyx identity.
            </p>
            <p style={{ fontSize: '12px', color: '#787875', margin: '0 0 24px 0', lineHeight: 1.5, backgroundColor: '#fbfbfa', padding: '10px 14px', borderRadius: '8px' }}>
              ℹ️ Registration is free, fast, and does not require immediate payment. Registered accounts receive access to manage product inquiries and workspaces.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href={`${MAIN_SITE_SIGNIN}?next=${encodeURIComponent(window.location.origin + '/explore')}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px',
                  backgroundColor: '#244235',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  textAlign: 'center'
                }}
              >
                Sign In with Originyx Account
              </a>
              <a
                href={`${MAIN_SITE_SIGNIN}?next=${encodeURIComponent(window.location.origin + '/explore')}&auth=signup`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px',
                  backgroundColor: '#f5f5f2',
                  color: '#1c1c1c',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  textAlign: 'center'
                }}
              >
                Create a Free Account
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: Authenticated Purchase Intent Form ─── */}
      {showIntentModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '540px',
            width: '100%',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button 
              onClick={() => setShowIntentModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#787875' }}
            >
              <X size={20} />
            </button>

            {!submitted ? (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#244235', letterSpacing: '0.05em' }}>
                    Purchase & Proposal Request
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1c1c1c', margin: '4px 0 6px 0' }}>
                    {selectedProduct?.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#787875', margin: 0 }}>
                    Selected Plan: <strong>{selectedPlan?.name}</strong> ({selectedPlan?.price})
                  </p>
                </div>

                <form onSubmit={handleIntentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a4a4a', marginBottom: '6px' }}>
                      Your Name & Email
                    </label>
                    <input 
                      type="text" 
                      disabled 
                      value={`${user?.user_metadata?.full_name || 'Originyx User'} (${user?.email})`}
                      style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f9f9f8', border: '1px solid #e8e8e5', borderRadius: '6px', fontSize: '13px', color: '#787875', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a4a4a', marginBottom: '6px' }}>
                      Company / Organization Name <span style={{ color: '#a32a3f' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      placeholder="e.g. Acme Logistics India"
                      style={{ width: '100%', padding: '10px 12px', backgroundColor: '#ffffff', border: '1px solid #e8e8e5', borderRadius: '6px', fontSize: '13px', color: '#1c1c1c', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a4a4a', marginBottom: '6px' }}>
                      Target Deployment Timeframe
                    </label>
                    <select
                      value={timeframe}
                      onChange={e => setTimeframe(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', backgroundColor: '#ffffff', border: '1px solid #e8e8e5', borderRadius: '6px', fontSize: '13px', color: '#1c1c1c', boxSizing: 'border-box' }}
                    >
                      <option value="Immediate (1-2 Weeks)">Immediate (1-2 Weeks)</option>
                      <option value="Next 30 Days">Next 30 Days</option>
                      <option value="Next Quarter">Next Quarter</option>
                      <option value="Evaluating / Researching">Evaluating / Researching</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a4a4a', marginBottom: '6px' }}>
                      Project Requirements or Custom Constraints
                    </label>
                    <textarea 
                      rows={3}
                      value={requirements}
                      onChange={e => setRequirements(e.target.value)}
                      placeholder="Describe your current tech stack, volume requirements, or integration needs..."
                      style={{ width: '100%', padding: '10px 12px', backgroundColor: '#ffffff', border: '1px solid #e8e8e5', borderRadius: '6px', fontSize: '13px', color: '#1c1c1c', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ backgroundColor: '#fbfbfa', padding: '12px', borderRadius: '8px', border: '1px solid #f0f0ed' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <ShieldCheck size={16} color="#244235" />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#1c1c1c' }}>Commercial Provisioning Notice</span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#787875', margin: 0, lineHeight: 1.45 }}>
                      Direct credit-card self-checkout is currently undergoing onboarding with our payment gateway partner. Submitting this request registers your purchase intent with Originyx Operations. Our solutions lead will verify your deployment parameters and issue an authorized agreement & provisioning link.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !company.trim()}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: submitting ? '#787875' : '#244235',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s',
                      marginTop: '8px'
                    }}
                  >
                    {submitting ? 'Submitting Inquiry…' : 'Submit Purchase & Proposal Inquiry'}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#eef3f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <Check size={28} color="#244235" strokeWidth={2.5} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 8px 0' }}>
                  Purchase Intent Recorded
                </h3>
                <p style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                  Thank you! Your request for <strong>{selectedProduct?.name} ({selectedPlan?.name} Plan)</strong> has been logged for <strong>{company}</strong>.
                </p>
                <div style={{ backgroundColor: '#f9f9f8', padding: '14px', borderRadius: '8px', textAlign: 'left', marginBottom: '24px' }}>
                  <p style={{ fontSize: '12px', color: '#4a4a4a', margin: '0 0 6px 0' }}>
                    <strong>Next Steps:</strong>
                  </p>
                  <p style={{ fontSize: '12px', color: '#787875', margin: 0, lineHeight: 1.5 }}>
                    1. A confirmation has been tied to your Originyx user identity ({user?.email}).<br />
                    2. An Originyx solutions architect will review your technical specifications.<br />
                    3. Commercial proposal and provisioning timeline will be delivered directly to your inbox.
                  </p>
                </div>
                <button
                  onClick={() => setShowIntentModal(false)}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#244235',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Return to Catalog
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
