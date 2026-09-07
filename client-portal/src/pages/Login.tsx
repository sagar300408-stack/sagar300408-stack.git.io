import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOCEClient } from '../lib/sdk';
import { useAuth } from '../lib/AuthContext';
import { Lock, Zap, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !pass) return;
    setLoading(true);
    setError('');
    try {
      await getOCEClient().signIn(email, pass);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      setLoading(false);
    }
  }

  const handleOAuth = async (provider: 'google' | 'azure') => {
    try {
      setLoading(true);
      setError('');
      const { error } = await getOCEClient().supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}.`);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, sans-serif',
        backgroundColor: '#ffffff',
      }}
    >
      {/* ─── Header ─── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 32px',
          borderBottom: '1px solid #e8e8e5',
          backgroundColor: '#ffffff',
          flexShrink: 0,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/logo.png"
            alt="Originyx Logo"
            style={{ height: '22px', width: 'auto', display: 'block' }}
          />
          <img
            src="/brand.png"
            alt="Originyx"
            style={{ height: '16px', width: 'auto', display: 'block' }}
          />
        </div>
        <a
          href="https://originyx.in"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: '#4a4a4a',
            textDecoration: 'none',
          }}
        >
          Go to Website
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </header>

      {/* ─── Main body ─── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* ── LEFT: Form ── */}
        <div
          style={{
            width: '420px',
            minWidth: '340px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '40px 44px',
            backgroundColor: '#ffffff',
            overflowY: 'auto',
          }}
        >
          {/* Header row with Title and Close Icon (matching the modal look) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <h1
              style={{
                fontFamily: 'Lora, serif',
                fontSize: '2.25rem',
                fontWeight: 400,
                color: '#1c1c1c',
                margin: 0,
              }}
            >
              Sign In
            </h1>
          </div>
          
          <p style={{ fontSize: '14px', color: '#4a4a4a', marginBottom: '24px', lineHeight: 1.5 }}>
            Log in or create an account to start your project.
          </p>

          {/* Error */}
          {error && (
            <div
              style={{
                marginBottom: '16px',
                fontSize: '13px',
                color: '#a32a3f',
                border: '1px solid rgba(163,42,63,0.2)',
                backgroundColor: 'rgba(163,42,63,0.05)',
                borderRadius: '8px',
                padding: '12px 14px',
              }}
            >
              {error}
            </div>
          )}

          {/* Social Auth Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #e8e8e5',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#1c1c1c',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9f9f8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('azure')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #e8e8e5',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#1c1c1c',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9f9f8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
              </svg>
              Continue with Microsoft
            </button>
          </div>

          {/* OR divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e8e8e5' }} />
            <span style={{ fontSize: '11px', color: '#787875', fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e8e8e5' }} />
          </div>

          {/* Tab: Sign In / Create Account */}
          <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #e8e8e5', marginBottom: '24px' }}>
            <button
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#1c1c1c',
                paddingBottom: '12px',
                borderBottom: '2px solid #244235', // Match the dark green accent
                marginBottom: '-1px',
                background: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'default',
              }}
            >
              Sign In
            </button>
            <button
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#787875',
                paddingBottom: '12px',
                borderBottom: '2px solid transparent',
                marginBottom: '-1px',
                background: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'not-allowed',
                opacity: 0.8,
              }}
              title="Creation of accounts is managed by administrators."
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Email */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: '#4a4a4a',
                  marginBottom: '8px',
                }}
              >
                Email Address <span style={{ color: '#a32a3f' }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '14px',
                  color: '#1c1c1c',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e8e8e5',
                  borderRadius: '6px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#244235'}
                onBlur={(e) => e.target.style.borderColor = '#e8e8e5'}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#4a4a4a',
                  }}
                >
                  Password <span style={{ color: '#a32a3f' }}>*</span>
                </label>
                <button
                  type="button"
                  style={{
                    fontSize: '12px',
                    color: '#244235',
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 60px 12px 14px',
                    fontSize: '14px',
                    color: '#1c1c1c',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e8e8e5',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#244235'}
                  onBlur={(e) => e.target.style.borderColor = '#e8e8e5'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '13px',
                    color: '#787875',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {showPass ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                    {showPass ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" className={`${showPass ? 'hidden' : 'block'}`} />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 20px',
                marginTop: '12px',
                backgroundColor: '#2b3e34', // The dark green from the reference
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 500,
                borderRadius: '8px', // Different from pill, matches the reference image
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.8 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.15s ease',
              }}
              onMouseOver={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#1f2e26' }}
              onMouseOut={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#2b3e34' }}
            >
              {loading && (
                <svg
                  style={{ animation: 'spin 1s linear infinite', height: '16px', width: '16px' }}
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* ── RIGHT: Hero panel ── */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#244235',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Hero area with Background Image */}
          <div 
            style={{ 
              flex: 1, 
              position: 'relative', 
              display: 'flex', 
              alignItems: 'center',
              backgroundImage: 'url("/client-hero.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Subtle overlay to ensure text readability */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(36, 66, 53, 0.4)', // Slightly dark green overlay
              }}
            />

            {/* Left text overlay — PARTNERING FOR A MORE EFFICIENT TOMORROW */}
            <div
              style={{
                position: 'absolute',
                left: '12%',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
              }}
            >
              <p
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  color: 'rgba(255,255,255,0.7)',
                  textTransform: 'uppercase',
                  lineHeight: 2,
                }}
              >
                Partnering<br />for a more<br />efficient<br />tomorrow
              </p>
              <div style={{ marginTop: '12px', width: '28px', height: '2px', backgroundColor: 'rgba(0, 0, 0, 0.4)' }} />
            </div>

            {/* Right text overlay — Smarter Operations Brighter Growth */}
            <div
              style={{
                position: 'absolute',
                right: '10%',
                top: '50%',
                transform: 'translateY(-50%)',
                textAlign: 'right',
                zIndex: 2,
              }}
            >
              <h2
                style={{
                  fontFamily: 'Lora, serif',
                  fontSize: '2.4rem',
                  fontWeight: 400,
                  lineHeight: 1.18,
                  letterSpacing: '-0.01em',
                  color: '#ffffff',
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)', // Adding a shadow for better readability over photo
                }}
              >
                Smarter<br />Operations<br />Brighter<br />Growth
              </h2>
              <div style={{ marginTop: '12px', marginLeft: 'auto', width: '28px', height: '2px', backgroundColor: 'rgba(255,255,255,0.4)' }} />
            </div>
          </div>

          {/* Bottom feature strip */}
          <div
            style={{
              flexShrink: 0,
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e8e8e5',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: 'none' }}>
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
                    padding: '22px 24px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    borderLeft: i > 0 ? '1px solid #e8e8e5' : 'none',
                  }}
                >
                  <item.Icon size={16} color="#787875" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: '#787875',
                        marginBottom: '3px',
                      }}
                    >
                      {item.cat}
                    </p>
                    <p
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: '#1c1c1c',
                        marginBottom: '5px',
                      }}
                    >
                      {item.title}
                    </p>
                    <p style={{ fontSize: '11px', color: '#4a4a4a', lineHeight: 1.55 }}>
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
                padding: '10px 24px',
                borderTop: '1px solid #e8e8e5',
              }}
            >
              <p style={{ fontSize: '11px', color: '#787875' }}>© 2026 Originyx. All rights reserved.</p>
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
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
