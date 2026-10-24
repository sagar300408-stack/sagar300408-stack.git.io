import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Box } from 'lucide-react';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page Not Found | Originyx Client Portal';
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex, nofollow';
  }, []);


  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        padding: '40px 24px',
        textAlign: 'center',
        fontFamily: 'Calibri, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.15em',
          color: '#244235',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}
      >
        404 — Page Not Found
      </div>
      <h1
        style={{
          fontFamily: "'Lora', serif",
          fontSize: 'clamp(2rem, 4vw, 2.75rem)',
          fontWeight: 400,
          color: '#1c1c1c',
          margin: '0 0 16px 0',
          lineHeight: 1.2,
        }}
      >
        Looking for a workspace page?
      </h1>
      <p
        style={{
          fontSize: '15px',
          color: '#787875',
          maxWidth: '460px',
          lineHeight: 1.6,
          margin: '0 0 32px 0',
        }}
      >
        The page you are looking for does not exist or may have been moved. You can return to your overview or explore available products.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <NavLink
          to="/dashboard"
          style={{
            backgroundColor: '#244235',
            color: '#ffffff',
            padding: '11px 22px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Home size={16} />
          Go to Overview
        </NavLink>
        <NavLink
          to="/explore"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e8e8e5',
            color: '#1c1c1c',
            padding: '11px 22px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Box size={16} />
          Explore Products
        </NavLink>
      </div>
    </div>
  );
}
