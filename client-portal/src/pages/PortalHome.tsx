import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Zap, Lock, ExternalLink, ChevronDown, ChevronUp, Search, Cpu } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { AUTHORITATIVE_PRODUCTS } from '../lib/products';
import { useAuth } from '../lib/AuthContext';

const MAIN_SITE_SIGNIN =
  import.meta.env.VITE_MAIN_SITE_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://originyx.in');

export default function PortalHome() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const portalJsonLd = [
    {
      '@type': 'WebSite',
      '@id': 'https://app.originyx.in/#website',
      'url': 'https://app.originyx.in/',
      'name': 'Originyx Client Portal',
      'description': 'The central workspace to discover, evaluate, purchase, and manage Originyx operational AI SaaS platforms.',
      'publisher': {
        '@type': 'Organization',
        'name': 'Originyx',
        'url': 'https://originyx.in',
        'logo': 'https://app.originyx.in/logo.png'
      }
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://app.originyx.in/#portal-application',
      'name': 'Originyx Client Portal',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'Web Browser',
      'url': 'https://app.originyx.in/',
      'provider': {
        '@type': 'Organization',
        'name': 'Originyx',
        'url': 'https://originyx.in'
      },
      'description': 'Unified customer portal for discovering, licensing, and managing Originyx operational SaaS products including HunterOS Engage, Enterprise RAG, and Mission Control.'
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://app.originyx.in/#faq',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'What is the Originyx Client Portal?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'The Originyx Client Portal (https://app.originyx.in) is the unified authenticated platform where businesses discover, evaluate, license, and manage Originyx operational AI products and systems.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How do businesses acquire and access Originyx products?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Prospective customers can explore verified capabilities publicly on the portal, submit an evaluation or deployment inquiry, and upon approval receive provisioned access and license credentials managed through their authenticated portal dashboard.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What is the central operating philosophy of Originyx?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Speed is the ultimate competitive advantage. Originyx researches, designs, and engineers AI SaaS systems to eliminate operational friction and delays in lead follow-up, process routing, and knowledge retrieval.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What is HunterOS Engage and what problem does it solve?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'HunterOS Engage detects important operational events and helps teams respond before opportunities are lost across revenue and follow-up workflows, eliminating multi-hour delays in inbound customer qualification.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Can Originyx platforms be deployed into private VPCs or dedicated clouds?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes. Originyx platforms such as Enterprise RAG and HunterOS Engage support custom enterprise deployments with dedicated VPC isolation, zero-data-retention endpoints, and customized SLA guarantees.'
          }
        }
      ]
    }
  ];

  const faqs = [
    {
      q: 'What is the Originyx Client Portal?',
      a: 'The Originyx Client Portal (https://app.originyx.in) is the centralized workspace for businesses to explore, evaluate, license, and manage Originyx operational AI platforms. It provides transparent technical specifications, guided evaluation workflows, and an authenticated management dashboard for active client subscriptions.'
    },
    {
      q: 'How do businesses evaluate and purchase Originyx products?',
      a: 'Businesses can review detailed technical capabilities and architectural requirements across all platforms without creating an account. To evaluate or license a product, submit an inquiry from any product page. Our engineering team assists with proof-of-concept setup, custom VPC configuration, or immediate SaaS tenant provisioning.'
    },
    {
      q: 'What is the central philosophy behind Originyx software?',
      a: 'Speed is the ultimate competitive advantage. Unnecessary operational delays create friction: delayed responses to inbound leads cause lost deals, manual knowledge searches consume productive hours, and inefficient routing inflates operational costs. Originyx builds practical systems designed to measure and eliminate these delays.'
    },
    {
      q: 'What is the difference between Live and Beta status products?',
      a: 'Live products (such as HunterOS Engage, Enterprise RAG, SwiftRoute AI, and Mission Control) are commercially deployed and supported under standard enterprise service levels. Beta products (such as HunterOS, ShadowOS, and Tvira Receptionist) are actively undergoing controlled verification with select pilot partners.'
    },
    {
      q: 'Can Originyx products be deployed in our private cloud or VPC?',
      a: 'Yes. For enterprises with strict data sovereignty, compliance, or security mandates, Originyx offers dedicated VPC deployments on AWS, Google Cloud, or Azure with custom data boundaries, private endpoints, and tailored SLAs.'
    },
    {
      q: 'How is user data protected within the Client Portal?',
      a: 'Private workspaces and management interfaces are strictly gated behind Supabase row-level security (RLS) and cryptographic session management. Customer subscription records, telemetry, and account settings are accessible only to authenticated organization members.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fbfbfa', color: '#1c1c1c', fontFamily: 'Calibri, "Segoe UI", sans-serif' }}>
      <SEOHead
        title="Originyx Client Portal | Discover, Purchase & Manage Operational AI Products"
        description="Explore, license, and manage Originyx operational AI SaaS platforms. Practical systems engineered to eliminate business friction and accelerate operations."
        canonicalUrl="https://app.originyx.in/"
        ogType="website"
        jsonLd={portalJsonLd}
      />

      {/* Top Navigation */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e8e8e5',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/logo.png" alt="Originyx Logo" style={{ height: '24px', width: 'auto' }} />
            <span style={{ fontSize: '17px', fontWeight: 700, color: '#1c1c1c', letterSpacing: '-0.02em' }}>
              ORIGINYX <span style={{ color: '#244235', fontWeight: 600, fontSize: '13px', marginLeft: '6px' }}>PORTAL</span>
            </span>
          </NavLink>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <NavLink
              to="/explore"
              style={{ fontSize: '14px', fontWeight: 500, color: '#4a4a4a', textDecoration: 'none' }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#1c1c1c')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#4a4a4a')}
            >
              Explore Products
            </NavLink>
            <NavLink
              to="/pricing"
              style={{ fontSize: '14px', fontWeight: 500, color: '#4a4a4a', textDecoration: 'none' }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#1c1c1c')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#4a4a4a')}
            >
              Commercial Models
            </NavLink>
            <NavLink
              to="/docs"
              style={{ fontSize: '14px', fontWeight: 500, color: '#4a4a4a', textDecoration: 'none' }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#1c1c1c')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#4a4a4a')}
            >
              Documentation
            </NavLink>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a
            href="https://originyx.in"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#787875',
              textDecoration: 'none',
              padding: '6px 10px'
            }}
          >
            <span>Corporate Site</span>
            <ExternalLink size={13} />
          </a>

          {user ? (
            <NavLink
              to="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#244235',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Launch Workspace <ArrowRight size={14} />
            </NavLink>
          ) : (
            <a
              href={`${MAIN_SITE_SIGNIN}?next=${encodeURIComponent(window.location.origin + '/dashboard')}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#244235',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Sign In <ArrowRight size={14} />
            </a>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1120px',
        margin: '0 auto',
        padding: '72px 24px 48px 24px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '20px',
          backgroundColor: '#eef3f0',
          color: '#244235',
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '20px'
        }}>
          <Cpu size={14} strokeWidth={2.5} />
          <span>Originyx Client Portal · Product Directory & Management</span>
        </div>

        <h1 style={{
          fontSize: '44px',
          lineHeight: 1.15,
          fontWeight: 800,
          color: '#1c1c1c',
          margin: '0 auto 20px auto',
          maxWidth: '860px',
          letterSpacing: '-0.03em'
        }}>
          Discover, Evaluate, and Manage Practical Operational AI Platforms
        </h1>

        <p style={{
          fontSize: '17px',
          lineHeight: 1.6,
          color: '#4a4a4a',
          margin: '0 auto 32px auto',
          maxWidth: '720px'
        }}>
          <strong>Speed is the ultimate competitive advantage.</strong> Modern businesses lose revenue to operational friction, delayed customer follow-ups, and fragmented workflows. Originyx researches and engineers software systems to measure and eliminate these delays.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <NavLink
            to="/explore"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#244235',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(36, 66, 53, 0.15)'
            }}
          >
            Explore Product Catalogue <ArrowRight size={16} />
          </NavLink>
          <NavLink
            to="/pricing"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#ffffff',
              color: '#1c1c1c',
              border: '1px solid #d4d4cf',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            View Commercial Models
          </NavLink>
        </div>
      </section>

      {/* The 3-Step Journey: Discover -> Procure -> Manage */}
      <section style={{
        maxWidth: '1120px',
        margin: '0 auto 64px auto',
        padding: '0 24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e8e8e5',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#eef3f0',
              color: '#244235',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Search size={20} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#244235', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Phase 01
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '6px 0 10px 0', color: '#1c1c1c' }}>
              Discover & Evaluate
            </h3>
            <p style={{ fontSize: '13.5px', color: '#555552', lineHeight: 1.55, margin: 0 }}>
              Inspect verified technical capabilities, architectural specifications, and target operational friction. Every capability is explicitly classified as Available, Under Verification, or Planned.
            </p>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e8e8e5',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#eef3f0',
              color: '#244235',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Zap size={20} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#244235', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Phase 02
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '6px 0 10px 0', color: '#1c1c1c' }}>
              Procure & Pilot
            </h3>
            <p style={{ fontSize: '13.5px', color: '#555552', lineHeight: 1.55, margin: 0 }}>
              Engage through structured pilot evaluations or dedicated VPC enterprise deployments. We align software implementation directly with measurable business metrics and operational turnaround times.
            </p>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e8e8e5',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#eef3f0',
              color: '#244235',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Lock size={20} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#244235', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Phase 03
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '6px 0 10px 0', color: '#1c1c1c' }}>
              Manage & Monitor
            </h3>
            <p style={{ fontSize: '13.5px', color: '#555552', lineHeight: 1.55, margin: 0 }}>
              Authenticated customers access their private portal workspace to oversee provisioned software instances, view active service tiers, download billing statements, and review system telemetry.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section style={{
        maxWidth: '1120px',
        margin: '0 auto 64px auto',
        padding: '0 24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1c1c1c', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              Authoritative Product Catalogue
            </h2>
            <p style={{ fontSize: '14px', color: '#787875', margin: 0 }}>
              Verified SaaS products and operational intelligence engines engineered by Originyx.
            </p>
          </div>
          <NavLink
            to="/explore"
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#244235',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>View All ({AUTHORITATIVE_PRODUCTS.length})</span>
            <ArrowRight size={14} />
          </NavLink>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px'
        }}>
          {AUTHORITATIVE_PRODUCTS.map((product) => (
            <div
              key={product.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e8e8e5',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: product.status === 'Live' ? '#eef3f0' : '#fef3c7',
                    color: product.status === 'Live' ? '#244235' : '#92400e'
                  }}>
                    {product.status}
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#787875' }}>
                    {product.category}
                  </span>
                </div>

                <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 6px 0' }}>
                  <NavLink to={`/products/${product.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {product.name}
                  </NavLink>
                </h3>

                <p style={{ fontSize: '13px', fontWeight: 600, color: '#244235', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                  {product.tagline}
                </p>

                <p style={{ fontSize: '12.5px', color: '#555552', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  {product.summary}
                </p>

                <div style={{ borderTop: '1px solid #f0f0ed', paddingTop: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#787875', letterSpacing: '0.05em' }}>
                    Friction Solved:
                  </span>
                  <p style={{ fontSize: '12px', color: '#1c1c1c', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                    {product.frictionSolved}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid #f0f0ed' }}>
                <NavLink
                  to={`/products/${product.slug}`}
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#244235',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Technical Details <ArrowRight size={13} />
                </NavLink>

                <a
                  href={product.mainSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '11.5px',
                    color: '#787875',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="View engineering case study"
                >
                  Case Study <ExternalLink size={11} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Answer Engine & GEO FAQ Accordion */}
      <section style={{
        maxWidth: '900px',
        margin: '0 auto 80px auto',
        padding: '0 24px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1c1c1c', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '14px', color: '#787875', margin: 0 }}>
            Factual answers regarding portal access, commercial agreements, and technical architecture.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e8e8e5',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#1c1c1c'
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} color="#244235" /> : <ChevronDown size={18} color="#787875" />}
                </button>
                {isOpen && (
                  <div style={{ padding: '0 20px 20px 20px', fontSize: '13.5px', color: '#4a4a4a', lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e8e8e5',
        padding: '40px 24px',
        fontSize: '13px',
        color: '#787875'
      }}>
        <div style={{
          maxWidth: '1120px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="Originyx Logo" style={{ height: '20px', width: 'auto' }} />
            <span>&copy; {new Date().getFullYear()} Originyx. All rights reserved.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <NavLink to="/explore" style={{ color: '#4a4a4a', textDecoration: 'none' }}>Catalogue</NavLink>
            <NavLink to="/pricing" style={{ color: '#4a4a4a', textDecoration: 'none' }}>Commercial</NavLink>
            <NavLink to="/docs" style={{ color: '#4a4a4a', textDecoration: 'none' }}>Documentation</NavLink>
            <a href="https://originyx.in/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#4a4a4a', textDecoration: 'none' }}>Privacy</a>
            <a href="https://originyx.in/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#4a4a4a', textDecoration: 'none' }}>Terms</a>
            <a href="https://originyx.in" target="_blank" rel="noopener noreferrer" style={{ color: '#244235', fontWeight: 600, textDecoration: 'none' }}>originyx.in &rarr;</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
