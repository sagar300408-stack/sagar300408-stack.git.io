// react imports
import { NavLink } from 'react-router-dom';
import { ArrowLeft, BookOpen, ShieldCheck, Key, Terminal, FileText, CheckCircle2 } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { useAuth } from '../lib/AuthContext';

const MAIN_SITE_SIGNIN =
  import.meta.env.VITE_MAIN_SITE_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://originyx.in');

export default function Docs() {
  const { user } = useAuth();
  const docsFaqs = [
    {
      q: 'How do I log into the Originyx Client Portal?',
      a: 'Navigate to https://app.originyx.in and click "Sign In". Enter your organization email to sign in via password or single sign-on. If your account is newly provisioned, check your inbox for an invitation email from Originyx.'
    },
    {
      q: 'Where do I find my active software licenses and API keys?',
      a: 'Once authenticated, click "My Products" in the navigation sidebar. Each active software deployment displays its current provisioning status, licensed endpoints, API credentials, and usage limits.'
    },
    {
      q: 'How does Originyx ensure data security and multi-tenant isolation?',
      a: 'The Originyx Client Portal enforces strict database row-level security (RLS) in PostgreSQL. Every database query is scoped cryptographically to your authenticated organization ID. No tenant can view another organization\'s subscriptions, invoices, or operational event logs.'
    },
    {
      q: 'How do I download monthly billing statements and invoices?',
      a: 'Go to the "Billing" tab in your portal sidebar. You can view all historical payment transactions, download official PDF invoices with tax breakdown, and update corporate credit cards or invoicing details.'
    }
  ];

  const docsJsonLd = [
    {
      '@type': 'WebPage',
      '@id': 'https://app.originyx.in/docs#webpage',
      'url': 'https://app.originyx.in/docs',
      'name': 'Client Portal Documentation & User Guides | Originyx',
      'description': 'Official documentation, onboarding guides, security policies, and subscription instructions for the Originyx Client Portal.',
      'publisher': {
        '@type': 'Organization',
        'name': 'Originyx',
        'url': 'https://originyx.in'
      }
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://app.originyx.in/docs#faq',
      'mainEntity': docsFaqs.map((faq) => ({
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
        title="Client Portal Documentation & Operational Guides | Originyx"
        description="Comprehensive guides for accessing the Originyx Client Portal, provisioning operational AI software, managing API credentials, and reviewing billing."
        canonicalUrl="https://app.originyx.in/docs"
        ogType="article"
        jsonLd={docsJsonLd}
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
          <NavLink to="/pricing" style={{ fontSize: '13px', color: '#787875', textDecoration: 'none' }}>
            Commercial Models
          </NavLink>
        </div>

        <div>
          {user ? (
            <NavLink
              to="/dashboard"
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
              My Workspace &rarr;
            </NavLink>
          ) : (
            <a
              href={`${MAIN_SITE_SIGNIN}?next=${encodeURIComponent(window.location.origin + '/docs')}`}
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

      {/* Main Layout */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 24px 80px 24px' }}>
        <div style={{ marginBottom: '36px' }}>
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
            marginBottom: '12px'
          }}>
            <BookOpen size={14} strokeWidth={2.5} />
            <span>Originyx Knowledge Base · Portal Documentation</span>
          </div>

          <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#1c1c1c', margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
            Client Portal Documentation
          </h1>

          <p style={{ fontSize: '15px', color: '#4a4a4a', maxWidth: '700px', margin: 0, lineHeight: 1.6 }}>
            Everything you need to know about accessing your account, managing deployed Originyx software systems, configuring webhooks, and reviewing invoices.
          </p>
        </div>

        {/* Documentation Content Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }}>
          {/* Section 1: Getting Started */}
          <section style={{ backgroundColor: '#ffffff', border: '1px solid #e8e8e5', borderRadius: '12px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#eef3f0', color: '#244235', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Key size={16} strokeWidth={2.5} />
              </div>
              <h2 style={{ fontSize: '19px', fontWeight: 700, color: '#1c1c1c', margin: 0 }}>
                1. Account Authentication & Workspace Access
              </h2>
            </div>
            <p style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: 1.6, margin: '0 0 14px 0' }}>
              The Originyx Client Portal uses a unified single sign-on (SSO) architecture powered by Supabase Auth. Unauthenticated visitors can freely browse the public product catalogue, documentation, and pricing models.
            </p>
            <div style={{ backgroundColor: '#fbfbfa', border: '1px solid #f0f0ed', borderRadius: '8px', padding: '16px', fontSize: '13px', color: '#555552', lineHeight: 1.55 }}>
              <strong style={{ color: '#1c1c1c' }}>Security Rule:</strong> To access private workspace data (including <code>/dashboard</code>, <code>/my-products</code>, <code>/subscriptions</code>, and <code>/billing</code>), users must sign in. Unauthenticated requests to private routes are automatically redirected to the secure sign-in flow.
            </div>
          </section>

          {/* Section 2: Product Provisioning */}
          <section style={{ backgroundColor: '#ffffff', border: '1px solid #e8e8e5', borderRadius: '12px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#eef3f0', color: '#244235', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Terminal size={16} strokeWidth={2.5} />
              </div>
              <h2 style={{ fontSize: '19px', fontWeight: 700, color: '#1c1c1c', margin: 0 }}>
                2. Product Provisioning & Entitlement
              </h2>
            </div>
            <p style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: 1.6, margin: '0 0 14px 0' }}>
              When your organization licenses a software system (such as HunterOS Engage or Enterprise RAG), our engineering team provisions your tenant:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 14px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#333' }}>
                <CheckCircle2 size={15} color="#244235" strokeWidth={2} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>API Keys & Secret Tokens:</strong> Issued under your organization namespace and visible in <code>/my-products</code>.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#333' }}>
                <CheckCircle2 size={15} color="#244235" strokeWidth={2} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Webhook Ingestion Endpoints:</strong> Dedicated webhook listeners for posting CRM and communication event streams.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#333' }}>
                <CheckCircle2 size={15} color="#244235" strokeWidth={2} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Telemetry Streaming:</strong> Health signals flow automatically into Mission Control for uptime monitoring.</span>
              </li>
            </ul>
          </section>

          {/* Section 3: Data Security */}
          <section style={{ backgroundColor: '#ffffff', border: '1px solid #e8e8e5', borderRadius: '12px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#eef3f0', color: '#244235', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={16} strokeWidth={2.5} />
              </div>
              <h2 style={{ fontSize: '19px', fontWeight: 700, color: '#1c1c1c', margin: 0 }}>
                3. Data Isolation & Security Architecture
              </h2>
            </div>
            <p style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: 1.6, margin: '0 0 14px 0' }}>
              Originyx treats data isolation as a foundational architecture requirement:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div style={{ backgroundColor: '#fbfbfa', padding: '14px', borderRadius: '8px', border: '1px solid #f0f0ed' }}>
                <strong style={{ fontSize: '12.5px', color: '#1c1c1c', display: 'block', marginBottom: '4px' }}>Row-Level Security (RLS)</strong>
                <span style={{ fontSize: '12px', color: '#555552', lineHeight: 1.45 }}>Strict database policies ensure tenants only access their own records.</span>
              </div>
              <div style={{ backgroundColor: '#fbfbfa', padding: '14px', borderRadius: '8px', border: '1px solid #f0f0ed' }}>
                <strong style={{ fontSize: '12.5px', color: '#1c1c1c', display: 'block', marginBottom: '4px' }}>Zero Model Training</strong>
                <span style={{ fontSize: '12px', color: '#555552', lineHeight: 1.45 }}>Customer business documents and event logs are never used to train public models.</span>
              </div>
              <div style={{ backgroundColor: '#fbfbfa', padding: '14px', borderRadius: '8px', border: '1px solid #f0f0ed' }}>
                <strong style={{ fontSize: '12.5px', color: '#1c1c1c', display: 'block', marginBottom: '4px' }}>VPC Isolation</strong>
                <span style={{ fontSize: '12px', color: '#555552', lineHeight: 1.45 }}>Dedicated VPC deployments keep all data inside your cloud boundary.</span>
              </div>
            </div>
          </section>

          {/* Section 4: Subscriptions & Billing */}
          <section style={{ backgroundColor: '#ffffff', border: '1px solid #e8e8e5', borderRadius: '12px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#eef3f0', color: '#244235', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={16} strokeWidth={2.5} />
              </div>
              <h2 style={{ fontSize: '19px', fontWeight: 700, color: '#1c1c1c', margin: 0 }}>
                4. Billing & Subscription Inquiries
              </h2>
            </div>
            <p style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: 1.6, margin: '0 0 14px 0' }}>
              All payment statements, renewal dates, and invoice receipts are accessible in real-time under <code>/billing</code>. Invoices include full itemized breakdown of platform fees, support tiers, and applicable tax credentials.
            </p>
            <NavLink
              to="/explore"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#244235',
                textDecoration: 'none'
              }}
            >
              Browse Available Systems in Catalogue &rarr;
            </NavLink>
          </section>
        </div>

        {/* Documentation FAQ */}
        <section style={{ maxWidth: '860px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1c1c1c', margin: '0 0 8px 0', textAlign: 'center' }}>
            Documentation FAQ
          </h2>
          <p style={{ fontSize: '14px', color: '#787875', margin: '0 0 24px 0', textAlign: 'center' }}>
            Common questions regarding portal access, permissions, and support.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {docsFaqs.map((faq, i) => (
              <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e8e8e5', borderRadius: '10px', padding: '18px 20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 8px 0' }}>
                  {faq.q}
                </h3>
                <p style={{ fontSize: '13.5px', color: '#4a4a4a', lineHeight: 1.55, margin: 0 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
