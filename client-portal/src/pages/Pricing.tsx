import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, Check, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { useAuth } from '../lib/AuthContext';

const MAIN_SITE_SIGNIN =
  import.meta.env.VITE_MAIN_SITE_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://originyx.in');

export default function Pricing() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const pricingFaqs = [
    {
      q: 'How does Originyx price its software products?',
      a: 'Originyx prices software based on deployment scale, throughput requirements, and infrastructure isolation. Rather than forcing arbitrary one-size-fits-all tiers, we structure engagements around measurable operational friction—ranging from 30-day guided pilots to annual multi-seat SaaS licenses and private VPC instances.'
    },
    {
      q: 'What is included in a 30-Day Pilot Evaluation?',
      a: 'A pilot deployment includes guided provisioning, custom rule configuration, webhook setup, and active engineering support to benchmark response latency, throughput, and error rates against existing operational baselines.'
    },
    {
      q: 'Can Originyx products run in our own AWS, GCP, or Azure account?',
      a: 'Yes. For enterprises requiring absolute data sovereignty and compliance isolation, we deploy our platforms into dedicated VPCs or client-controlled cloud environments with zero external egress and client-managed encryption keys.'
    },
    {
      q: 'Are there hidden setup fees or long-term lock-in?',
      a: 'No. All commercial proposals clearly articulate upfront setup requirements (if custom integration engineering is required) and ongoing licensing fees. Pilot evaluations carry zero long-term commitment.'
    },
    {
      q: 'How are subscriptions managed and billed in the Client Portal?',
      a: 'Active clients manage payment methods, review itemized monthly or annual invoices, and monitor provisioned license seats directly through the authenticated Client Portal under the Subscriptions and Billing sections.'
    }
  ];

  const pricingJsonLd = [
    {
      '@type': 'WebPage',
      '@id': 'https://app.originyx.in/pricing#webpage',
      'url': 'https://app.originyx.in/pricing',
      'name': 'Commercial Models & Enterprise Agreements | Originyx Client Portal',
      'description': 'Understand how Originyx licenses operational AI software through structured pilots, annual SaaS agreements, and dedicated VPC enterprise deployments.',
      'publisher': {
        '@type': 'Organization',
        'name': 'Originyx',
        'url': 'https://originyx.in'
      }
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://app.originyx.in/pricing#faq',
      'mainEntity': pricingFaqs.map((faq) => ({
        '@type': 'Question',
        'name': faq.q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.a
        }
      }))
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fbfbfa', color: '#1c1c1c', fontFamily: 'Calibri, "Segoe UI", sans-serif' }}>
      <SEOHead
        title="Commercial Models & Licensing | Originyx Client Portal"
        description="Transparent software licensing, pilot evaluations, and private VPC deployment models. Honest SaaS pricing aligned with measurable business outcomes."
        canonicalUrl="https://app.originyx.in/pricing"
        ogType="website"
        jsonLd={pricingJsonLd}
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
            to="/"
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
            <ArrowLeft size={14} /> Portal Home
          </NavLink>
          <span style={{ color: '#d4d4cf' }}>|</span>
          <NavLink to="/explore" style={{ fontSize: '13px', color: '#787875', textDecoration: 'none' }}>
            Catalogue
          </NavLink>
          <NavLink to="/docs" style={{ fontSize: '13px', color: '#787875', textDecoration: 'none' }}>
            Documentation
          </NavLink>
        </div>

        <div>
          {user ? (
            <NavLink
              to="/billing"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                backgroundColor: '#244235',
                color: '#ffffff',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              My Billing Statements &rarr;
            </NavLink>
          ) : (
            <a
              href={`${MAIN_SITE_SIGNIN}?next=${encodeURIComponent(window.location.origin + '/pricing')}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                backgroundColor: '#244235',
                color: '#ffffff',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Sign In
            </a>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '56px 24px 80px 24px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '16px',
            backgroundColor: '#eef3f0',
            color: '#244235',
            fontSize: '11.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '14px'
          }}>
            <ShieldCheck size={14} strokeWidth={2.5} />
            <span>Commercial Philosophy · Transparency First</span>
          </div>

          <h1 style={{ fontSize: '38px', fontWeight: 800, color: '#1c1c1c', margin: '0 0 14px 0', letterSpacing: '-0.02em' }}>
            Outcome-Driven Commercial Agreements
          </h1>

          <p style={{ fontSize: '16px', color: '#4a4a4a', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
            Originyx evaluates software through business outcomes rather than arbitrary feature gating. We offer transparent pilot evaluations, standard annual SaaS licenses, and custom VPC deployments.
          </p>
        </div>

        {/* Pricing Model Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '24px',
          marginBottom: '64px'
        }}>
          {/* Tier 1 */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e8e8e5',
            borderRadius: '14px',
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#787875', letterSpacing: '0.05em' }}>
                Evaluation Tier
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1c1c1c', margin: '6px 0 4px 0' }}>
                Guided Pilot
              </h2>
              <p style={{ fontSize: '13px', color: '#244235', fontWeight: 600, margin: '0 0 16px 0' }}>
                Fixed 30-Day Evaluation
              </p>
              <p style={{ fontSize: '13.5px', color: '#555552', lineHeight: 1.55, margin: '0 0 20px 0' }}>
                Designed for teams testing operational feasibility, throughput, and latency on real workflows before enterprise commitment.
              </p>

              <div style={{ borderTop: '1px solid #f0f0ed', paddingTop: '16px', marginBottom: '20px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#1c1c1c', letterSpacing: '0.04em' }}>
                  Includes:
                </span>
                <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#333' }}>
                    <Check size={14} color="#244235" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>Staging or production data pilot</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#333' }}>
                    <Check size={14} color="#244235" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>Direct engineering integration assistance</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#333' }}>
                    <Check size={14} color="#244235" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>Operational benchmark & latency report</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#333' }}>
                    <Check size={14} color="#244235" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>Zero long-term renewal obligation</span>
                  </li>
                </ul>
              </div>
            </div>

            <NavLink
              to="/explore"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '11px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #244235',
                color: '#244235',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Choose Product to Pilot &rarr;
            </NavLink>
          </div>

          {/* Tier 2 (Highlighted) */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '2px solid #244235',
            borderRadius: '14px',
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 16px rgba(36, 66, 53, 0.08)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#244235',
              color: '#ffffff',
              padding: '3px 12px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              Standard Commercial
            </div>

            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#787875', letterSpacing: '0.05em' }}>
                Production Deployment
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1c1c1c', margin: '6px 0 4px 0' }}>
                Annual SaaS License
              </h2>
              <p style={{ fontSize: '13px', color: '#244235', fontWeight: 600, margin: '0 0 16px 0' }}>
                Dedicated Multi-Tenant Instance
              </p>
              <p style={{ fontSize: '13.5px', color: '#555552', lineHeight: 1.55, margin: '0 0 20px 0' }}>
                Production-ready access to deployed software with guaranteed 99.9% uptime SLAs, priority updates, and automated scaling.
              </p>

              <div style={{ borderTop: '1px solid #f0f0ed', paddingTop: '16px', marginBottom: '20px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#1c1c1c', letterSpacing: '0.04em' }}>
                  Includes:
                </span>
                <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#333' }}>
                    <Check size={14} color="#244235" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>Full production software entitlements</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#333' }}>
                    <Check size={14} color="#244235" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>99.9% uptime SLA guarantee</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#333' }}>
                    <Check size={14} color="#244235" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>Priority technical and incident support</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#333' }}>
                    <Check size={14} color="#244235" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>Automated updates and performance patches</span>
                  </li>
                </ul>
              </div>
            </div>

            <NavLink
              to="/explore"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '11px 16px',
                backgroundColor: '#244235',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Request SaaS Proposal &rarr;
            </NavLink>
          </div>

          {/* Tier 3 */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e8e8e5',
            borderRadius: '14px',
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#787875', letterSpacing: '0.05em' }}>
                Enterprise Mandate
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1c1c1c', margin: '6px 0 4px 0' }}>
                Dedicated VPC / Cloud
              </h2>
              <p style={{ fontSize: '13px', color: '#244235', fontWeight: 600, margin: '0 0 16px 0' }}>
                Custom Architecture & Isolation
              </p>
              <p style={{ fontSize: '13.5px', color: '#555552', lineHeight: 1.55, margin: '0 0 20px 0' }}>
                For compliance-sensitive organizations requiring dedicated data boundaries, zero data retention AI endpoints, and custom integrations.
              </p>

              <div style={{ borderTop: '1px solid #f0f0ed', paddingTop: '16px', marginBottom: '20px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#1c1c1c', letterSpacing: '0.04em' }}>
                  Includes:
                </span>
                <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#333' }}>
                    <Check size={14} color="#244235" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>Isolated deployment on AWS, GCP, or Azure VPC</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#333' }}>
                    <Check size={14} color="#244235" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>Zero external AI data egress or training retention</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#333' }}>
                    <Check size={14} color="#244235" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>Custom ERP / CRM pipeline integration</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#333' }}>
                    <Check size={14} color="#244235" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>Tailored enterprise SLA and dedicated engineer</span>
                  </li>
                </ul>
              </div>
            </div>

            <NavLink
              to="/explore"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '11px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #d4d4cf',
                color: '#1c1c1c',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Enterprise Consultation &rarr;
            </NavLink>
          </div>
        </div>

        {/* Pricing FAQs */}
        <section style={{ maxWidth: '860px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1c1c1c', margin: '0 0 8px 0', textAlign: 'center' }}>
            Frequently Asked Questions on Pricing
          </h2>
          <p style={{ fontSize: '14px', color: '#787875', margin: '0 0 28px 0', textAlign: 'center' }}>
            Direct answers on procurement, licensing, and billing transparency.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pricingFaqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e8e8e5', borderRadius: '10px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => toggleFaq(i)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14.5px',
                      fontWeight: 600,
                      color: '#1c1c1c'
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={16} color="#244235" /> : <ChevronDown size={16} color="#787875" />}
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 20px 18px 20px', fontSize: '13.5px', color: '#4a4a4a', lineHeight: 1.55 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
