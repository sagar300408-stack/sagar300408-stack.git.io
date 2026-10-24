import SEOHead from '../components/SEO/SEOHead';
import { Receipt, ShieldCheck } from 'lucide-react';

export default function Billing() {

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1440px', margin: '0 auto', boxSizing: 'border-box' }}>
      <SEOHead title="Billing & Invoices | Originyx Client Portal" description="Billing statements, tax invoices, and payment management." robots="noindex, nofollow" />
      {/* ─── Header ─── */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
          Billing & Invoices
        </h1>
        <p style={{ fontSize: '14px', color: '#787875', margin: 0, maxWidth: '640px' }}>
          Inspect payment receipts, download tax invoices (GST compliant), and manage billing contacts for your organization.
        </p>
      </div>

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
          <Receipt size={24} color="#787875" />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 8px 0' }}>
          No Invoices Issued
        </h2>
        <p style={{ fontSize: '13px', color: '#787875', lineHeight: 1.6, margin: '0 0 24px 0' }}>
          Your organization has no pending or past invoices.
          Invoices are generated upon subscription confirmation or agreement execution and will appear here for audit and accounting records.
        </p>
        <div style={{
          backgroundColor: '#fbfbfa',
          border: '1px solid #f0f0ed',
          borderRadius: '10px',
          padding: '16px',
          textAlign: 'left',
          fontSize: '12px',
          color: '#4a4a4a',
          lineHeight: 1.5
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 600, color: '#1c1c1c' }}>
            <ShieldCheck size={16} color="#244235" /> Tax & Compliance Invoicing
          </div>
          All Originyx corporate invoices include GSTIN details, enterprise address, and reverse-charge declaration where applicable. For custom billing schedules or purchase order inquiries, contact <strong>sagar@originyx.in</strong>.
        </div>
      </div>
    </div>
  );
}
