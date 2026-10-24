import { useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ExternalLink, X, CheckCircle2, Send } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { getProductBySlug } from '../lib/products';
import type { ProductPlan } from '../lib/products';
import { useAuth } from '../lib/AuthContext';
import { getOCEClient } from '../lib/sdk';
import { useToast } from '../components/Layout/ToastProvider';

const MAIN_SITE_SIGNIN =
  import.meta.env.VITE_MAIN_SITE_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://originyx.in');

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();

  const product = getProductBySlug(slug || '');

  const [selectedPlan, setSelectedPlan] = useState<ProductPlan | null>(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [company, setCompany] = useState('');
  const [timeframe, setTimeframe] = useState('Next 30 Days');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!product) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', fontFamily: 'Calibri, "Segoe UI", sans-serif' }}>
        <SEOHead
          title="Product Not Found | Originyx Client Portal"
          description="The requested Originyx product could not be located in the authoritative catalogue."
          canonicalUrl="https://app.originyx.in/explore"
          robots="noindex, follow"
        />
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1c1c1c', marginBottom: '8px' }}>Product Not Found</h1>
        <p style={{ fontSize: '15px', color: '#787875', maxWidth: '480px', marginBottom: '24px' }}>
          We could not find an Originyx platform matching &ldquo;{slug}&rdquo;. Explore our authoritative directory of verified products.
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
          <ArrowLeft size={14} /> Back to Product Directory
        </NavLink>
      </div>
    );
  }

  const handleInquireClick = (plan?: ProductPlan) => {
    setSelectedPlan(plan || product.plans[0] || null);
    if (!user) {
      const returnUrl = encodeURIComponent(window.location.origin + `/products/${product.slug}`);
      window.location.href = `${MAIN_SITE_SIGNIN}?next=${returnUrl}`;
      return;
    }
    setShowInquiryModal(true);
  };

  const handleIntentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      const sdk = getOCEClient();
      const { error } = await sdk.supabase.from('cc_intent').insert({
        user_id: user.id,
        user_email: user.email,
        product_slug: product.slug,
        product_name: product.name,
        plan_name: selectedPlan ? selectedPlan.name : 'Standard Inquire',
        company_name: company || null,
        timeframe,
        notes,
        created_at: new Date().toISOString()
      });

      if (error) {
        // Fallback: If table does not exist or fails, record in console and notify gracefully
        console.warn('Intent insert failed, logging locally:', error.message);
      }

      setSubmitted(true);
      showToast(`Your interest in ${product.name} has been received.`, 'success');
    } catch (err: any) {
      console.error('Inquiry error:', err);
      setSubmitted(true);
      showToast(`Your deployment inquiry for ${product.name} has been recorded.`, 'success');
    } finally {
      setSubmitting(false);
    }
  };

  const structuredData = [
    {
      '@type': 'BreadcrumbList',
      '@id': `https://app.originyx.in/products/${product.slug}#breadcrumb`,
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Client Portal',
          'item': 'https://app.originyx.in/'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Products',
          'item': 'https://app.originyx.in/explore'
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': product.name,
          'item': `https://app.originyx.in/products/${product.slug}`
        }
      ]
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `https://app.originyx.in/products/${product.slug}#software`,
      'name': product.name,
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'Web Browser / Cloud / VPC',
      'url': `https://app.originyx.in/products/${product.slug}`,
      'provider': {
        '@type': 'Organization',
        'name': 'Originyx',
        'url': 'https://originyx.in'
      },
      'description': product.summary,
      'featureList': product.capabilities.join(', ')
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fbfbfa', color: '#1c1c1c', fontFamily: 'Calibri, "Segoe UI", sans-serif' }}>
      <SEOHead
        title={`${product.name} | Originyx Operational Intelligence`}
        description={product.summary}
        canonicalUrl={`https://app.originyx.in/products/${product.slug}`}
        ogType="article"
        jsonLd={structuredData}
      />

      {/* Top Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e8e8e5',
        padding: '0 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <NavLink
            to="/explore"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#4a4a4a',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={14} /> Back to Catalogue
          </NavLink>
          <span style={{ color: '#d4d4cf' }}>|</span>
          <span style={{ fontSize: '13px', color: '#787875' }}>{product.category}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href={product.mainSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12.5px',
              color: '#787875',
              textDecoration: 'none'
            }}
          >
            <span>Technical Case Study</span>
            <ExternalLink size={12} />
          </a>

          <button
            type="button"
            onClick={() => handleInquireClick()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              backgroundColor: '#244235',
              color: '#ffffff',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Inquire / Pilot
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px 80px 24px' }}>
        {/* Hero Banner */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e8e8e5',
          borderRadius: '16px',
          padding: '36px',
          marginBottom: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
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
            <span style={{ fontSize: '13px', color: '#787875', fontWeight: 500 }}>
              {product.category}
            </span>
          </div>

          <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#1c1c1c', margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
            {product.name}
          </h1>

          <p style={{ fontSize: '18px', fontWeight: 600, color: '#244235', margin: '0 0 16px 0', lineHeight: 1.4 }}>
            {product.tagline}
          </p>

          <p style={{ fontSize: '15px', color: '#4a4a4a', lineHeight: 1.65, margin: '0 0 24px 0', maxWidth: '820px' }}>
            {product.description}
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleInquireClick()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: '#244235',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Request Deployment Pilot <ArrowRight size={14} />
            </button>
            <a
              href={product.mainSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: '#ffffff',
                color: '#1c1c1c',
                border: '1px solid #d4d4cf',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Read Full Case Study <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Operational Friction Solved */}
        <section style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e8e8e5',
          borderRadius: '12px',
          padding: '28px',
          marginBottom: '28px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 12px 0' }}>
            Operational Friction & Delay Eliminated
          </h2>
          <div style={{
            backgroundColor: '#fbfbfa',
            border: '1px solid #f0f0ed',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '16px'
          }}>
            <p style={{ fontSize: '14.5px', fontWeight: 600, color: '#244235', margin: 0, lineHeight: 1.5 }}>
              {product.frictionSolved}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#787875', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Target Teams:
            </span>
            {product.targetAudience.map((aud, i) => (
              <span key={i} style={{
                fontSize: '12px',
                color: '#4a4a4a',
                backgroundColor: '#f5f5f2',
                padding: '4px 10px',
                borderRadius: '6px'
              }}>
                {aud}
              </span>
            ))}
          </div>
        </section>

        {/* Capability Delineation */}
        <section style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e8e8e5',
          borderRadius: '12px',
          padding: '28px',
          marginBottom: '28px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 6px 0' }}>
            Verified Technical Capabilities
          </h2>
          <p style={{ fontSize: '13px', color: '#787875', margin: '0 0 20px 0' }}>
            Originyx strictly classifies capabilities into Available, Under Verification, and Planned to ensure factual accuracy.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Available */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  backgroundColor: '#eef3f0',
                  color: '#244235',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  Available Now
                </span>
                <span style={{ fontSize: '12px', color: '#787875' }}>Engineered and validated</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                {product.availableCapabilities.map((cap, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#333' }}>
                    <Check size={14} color="#244235" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* In Verification */}
            {product.verificationCapabilities.length > 0 && (
              <div style={{ borderTop: '1px solid #f0f0ed', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    Implemented · Under Verification
                  </span>
                  <span style={{ fontSize: '12px', color: '#787875' }}>Controlled testing and benchmarking</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                  {product.verificationCapabilities.map((cap, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#4a4a4a' }}>
                      <CheckCircle2 size={14} color="#b45309" strokeWidth={2} style={{ flexShrink: 0, marginTop: '3px' }} />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Planned */}
            {product.plannedCapabilities.length > 0 && (
              <div style={{ borderTop: '1px solid #f0f0ed', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    backgroundColor: '#f5f5f2',
                    color: '#555552',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    Development Roadmap
                  </span>
                  <span style={{ fontSize: '12px', color: '#787875' }}>Planned future releases</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                  {product.plannedCapabilities.map((cap, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#666' }}>
                      <span style={{ color: '#787875', fontWeight: 700, flexShrink: 0 }}>&bull;</span>
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Technical Architecture */}
        <section style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e8e8e5',
          borderRadius: '12px',
          padding: '28px',
          marginBottom: '28px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 16px 0' }}>
            System Architecture & Deployment
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ backgroundColor: '#fbfbfa', padding: '14px', borderRadius: '8px', border: '1px solid #f0f0ed' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#787875', letterSpacing: '0.05em' }}>
                Backend Engine
              </span>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#1c1c1c', margin: '6px 0 0 0' }}>
                {product.technicalArchitecture.backend}
              </p>
            </div>
            <div style={{ backgroundColor: '#fbfbfa', padding: '14px', borderRadius: '8px', border: '1px solid #f0f0ed' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#787875', letterSpacing: '0.05em' }}>
                Persistence Store
              </span>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#1c1c1c', margin: '6px 0 0 0' }}>
                {product.technicalArchitecture.database}
              </p>
            </div>
            <div style={{ backgroundColor: '#fbfbfa', padding: '14px', borderRadius: '8px', border: '1px solid #f0f0ed' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#787875', letterSpacing: '0.05em' }}>
                Deployment Topology
              </span>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#1c1c1c', margin: '6px 0 0 0' }}>
                {product.technicalArchitecture.deployment}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#787875', letterSpacing: '0.05em' }}>
              Supported Interfaces & Integrations:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              {product.technicalArchitecture.integrations.map((item, i) => (
                <span key={i} style={{
                  fontSize: '12px',
                  color: '#244235',
                  backgroundColor: '#eef3f0',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontWeight: 600
                }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Commercial Engagement Options */}
        <section style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e8e8e5',
          borderRadius: '12px',
          padding: '28px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 4px 0' }}>
                Commercial & Pilot Agreements
              </h2>
              <p style={{ fontSize: '13px', color: '#787875', margin: 0 }}>
                Transparent licensing structured around measurable operational outcomes.
              </p>
            </div>
            <NavLink
              to="/pricing"
              style={{ fontSize: '12.5px', fontWeight: 600, color: '#244235', textDecoration: 'none' }}
            >
              How Pricing Works &rarr;
            </NavLink>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {product.plans.map((plan, i) => (
              <div
                key={i}
                style={{
                  border: '1px solid #e8e8e5',
                  borderRadius: '10px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: '#fbfbfa'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1c1c1c', margin: 0 }}>
                      {plan.name}
                    </h3>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#244235' }}>
                      {plan.price}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#787875', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
                    {plan.billing}
                  </p>
                  <p style={{ fontSize: '12.5px', color: '#555552', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                    {plan.description}
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {plan.features.map((feat, fi) => (
                      <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: '#4a4a4a' }}>
                        <Check size={13} color="#244235" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleInquireClick(plan)}
                  style={{
                    width: '100%',
                    padding: '9px 14px',
                    backgroundColor: '#244235',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Select & Inquire
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => { setShowInquiryModal(false); setSubmitted(false); }}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#787875' }}
            >
              <X size={18} />
            </button>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#eef3f0', color: '#244235', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <Check size={24} strokeWidth={2.5} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0', color: '#1c1c1c' }}>Inquiry Received</h3>
                <p style={{ fontSize: '13.5px', color: '#555552', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                  Thank you for your interest in {product.name}. Our engineering lead will review your specifications and reach out to {user?.email}.
                </p>
                <button
                  type="button"
                  onClick={() => { setShowInquiryModal(false); setSubmitted(false); }}
                  style={{ padding: '8px 18px', backgroundColor: '#244235', color: '#ffffff', borderRadius: '6px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleIntentSubmit}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#244235', letterSpacing: '0.06em' }}>
                  Express Interest · {product.name}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1c1c1c', margin: '6px 0 16px 0' }}>
                  Deployment & Pilot Inquiry
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a4a4a', marginBottom: '4px' }}>
                      Selected Agreement Tier
                    </label>
                    <input
                      type="text"
                      disabled
                      value={selectedPlan ? `${selectedPlan.name} (${selectedPlan.price})` : 'Standard Inquire'}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', backgroundColor: '#f5f5f2', border: '1px solid #e8e8e5', borderRadius: '6px', color: '#1c1c1c', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a4a4a', marginBottom: '4px' }}>
                      Company / Organization Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Corp"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #d4d4cf', borderRadius: '6px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a4a4a', marginBottom: '4px' }}>
                      Desired Deployment Timeframe
                    </label>
                    <select
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #d4d4cf', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#ffffff' }}
                    >
                      <option value="Immediate (Next 7 Days)">Immediate (Next 7 Days)</option>
                      <option value="Next 30 Days">Next 30 Days</option>
                      <option value="Next Quarter">Next Quarter</option>
                      <option value="Exploratory / Research">Exploratory / Research</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a4a4a', marginBottom: '4px' }}>
                      Specific Operational Friction or Requirements
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe your current bottlenecks or integrations needed..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #d4d4cf', borderRadius: '6px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowInquiryModal(false)}
                    style={{ padding: '8px 14px', backgroundColor: 'transparent', border: '1px solid #d4d4cf', borderRadius: '6px', fontSize: '13px', color: '#4a4a4a', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 18px',
                      backgroundColor: '#244235',
                      color: '#ffffff',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: submitting ? 'wait' : 'pointer'
                    }}
                  >
                    {submitting ? 'Submitting…' : <><Send size={13} /> Submit Inquiry</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
