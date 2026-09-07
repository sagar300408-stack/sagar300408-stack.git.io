import { useAuth } from '../lib/AuthContext';
import { PackageOpen, Lock, Zap, ShieldCheck } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  
  // Extract first name for the personalized greeting
  const firstName = user?.email 
    ? user.email.split('@')[0].split('.')[0].replace(/^\w/, c => c.toUpperCase())
    : 'Client';

  return (
    <div style={{ padding: '0 40px 60px 40px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* ─── Hero Section ─── */}
      <div 
        style={{ 
          display: 'flex', 
          height: '320px', 
          backgroundColor: '#f5f5f2', 
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}
      >
        {/* Left: Text Content */}
        <div 
          style={{ 
            flex: '1 1 45%', 
            padding: '50px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            backgroundColor: '#fbfbfa'
          }}
        >
          <p 
            style={{ 
              fontFamily: 'JetBrains Mono, monospace', 
              fontSize: '10px', 
              fontWeight: 700, 
              letterSpacing: '0.15em', 
              color: '#787875', 
              textTransform: 'uppercase', 
              marginBottom: '16px' 
            }}
          >
            Client Workspace
          </p>
          <h1 
            style={{ 
              fontFamily: 'Lora, serif', 
              fontSize: '3.2rem', 
              fontWeight: 400, 
              color: '#1c1c1c', 
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: '16px' 
            }}
          >
            Welcome back,<br />
            <span style={{ fontStyle: 'italic', color: '#244235' }}>{firstName}.</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#4a4a4a', lineHeight: 1.6, maxWidth: '400px' }}>
            Your private Originyx workspace. Access the tools, automation endpoints, and resources available to your organization.
          </p>
        </div>

        {/* Right: Hero Image & Overlays */}
        <div 
          style={{ 
            flex: '1 1 55%', 
            position: 'relative',
            backgroundImage: 'url("/client-dashboard.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Subtle gradient overlay to ensure text is readable but image remains bright */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(251,251,250,0.4) 0%, rgba(251,251,250,0) 20%), linear-gradient(to left, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 40%)',
            }}
          />

          {/* Left floating text */}
          <div style={{ position: 'absolute', left: '40px', top: '50px', zIndex: 2 }}>
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '8px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.8)',
                textTransform: 'uppercase',
                lineHeight: 1.8,
              }}
            >
              Partnering<br />for a more<br />efficient<br />tomorrow
            </p>
            <div style={{ marginTop: '8px', width: '20px', height: '1.5px', backgroundColor: 'rgba(255,255,255,0.5)' }} />
          </div>

          {/* Right floating text */}
          <div style={{ position: 'absolute', right: '40px', top: '50px', textAlign: 'right', zIndex: 2 }}>
            <h2
              style={{
                fontFamily: 'Lora, serif',
                fontSize: '2rem',
                fontWeight: 400,
                lineHeight: 1.15,
                letterSpacing: '-0.01em',
                color: '#ffffff',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)'
              }}
            >
              Smarter<br />Operations<br />Brighter<br />Growth
            </h2>
            <div style={{ marginTop: '12px', marginLeft: 'auto', width: '24px', height: '1.5px', backgroundColor: 'rgba(255,255,255,0.5)' }} />
          </div>
        </div>
      </div>

      {/* ─── Empty State Card ─── */}
      <div 
        style={{ 
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e8e8e5',
          padding: '60px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '40px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}
      >
        <div 
          style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            backgroundColor: '#f5f5f2', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '24px'
          }}
        >
          <PackageOpen size={20} color="#244235" strokeWidth={1.5} />
        </div>
        
        <h3 
          style={{ 
            fontFamily: 'Lora, serif', 
            fontSize: '1.75rem', 
            fontWeight: 400, 
            color: '#1c1c1c', 
            marginBottom: '12px' 
          }}
        >
          No active resources
        </h3>
        
        <p style={{ fontSize: '14px', color: '#4a4a4a', maxWidth: '380px', lineHeight: 1.6, marginBottom: '40px' }}>
          There are no applications, workflows, or automation endpoints currently assigned to this workspace.
        </p>

        {/* Divider with Crosshair icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', width: '100%', maxWidth: '320px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e8e8e5' }} />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#244235" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="22" y1="12" x2="18" y2="12"></line>
            <line x1="6" y1="12" x2="2" y2="12"></line>
            <line x1="12" y1="6" x2="12" y2="2"></line>
            <line x1="12" y1="22" x2="12" y2="18"></line>
          </svg>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e8e8e5' }} />
        </div>

        <p 
          style={{ 
            fontFamily: 'JetBrains Mono, monospace', 
            fontSize: '9px', 
            fontWeight: 700, 
            letterSpacing: '0.15em', 
            color: '#787875', 
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}
        >
          Your workspace is ready
        </p>
        <p style={{ fontSize: '12px', color: '#787875', maxWidth: '300px' }}>
          When Originyx assigns resources to your organization, they will appear here.
        </p>
      </div>

      {/* ─── Bottom Feature Strip ─── */}
      <div 
        style={{ 
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e8e8e5',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            {
              Icon: Lock,
              cat: 'Private',
              title: 'Client Access',
              desc: 'Your workspace is private and accessible only to your organization.',
            },
            {
              Icon: Zap,
              cat: 'Direct',
              title: 'Originyx Channel',
              desc: 'Work directly with Originyx to access your solutions and resources.',
            },
            {
              Icon: ShieldCheck,
              cat: 'Secure',
              title: 'Workspace Isolation',
              desc: 'Your data and resources are protected with enterprise-grade security.',
            },
          ].map((item, i) => (
            <div
              key={item.title}
              style={{
                padding: '32px 36px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                borderLeft: i > 0 ? '1px solid #e8e8e5' : 'none',
              }}
            >
              <div 
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  backgroundColor: '#f5f5f2', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <item.Icon size={16} color="#4a4a4a" strokeWidth={1.5} />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '9px',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: '#787875',
                    marginBottom: '4px',
                  }}
                >
                  {item.cat}
                </p>
                <h4
                  style={{
                    fontFamily: 'Lora, serif',
                    fontSize: '1.15rem',
                    fontWeight: 400,
                    color: '#1c1c1c',
                    marginBottom: '6px',
                  }}
                >
                  {item.title}
                </h4>
                <p style={{ fontSize: '13px', color: '#4a4a4a', lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 36px',
            borderTop: '1px solid #e8e8e5',
          }}
        >
          <p style={{ fontSize: '12px', color: '#787875' }}>© 2026 Originyx. All rights reserved.</p>
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#787875',
            }}
          >
            People + Process + Possibilities
          </p>
        </div>
      </div>
    </div>
  );
}
