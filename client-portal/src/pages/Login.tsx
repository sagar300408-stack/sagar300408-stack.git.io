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
            width: '380px',
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
          {/* Eyebrow */}
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: '#787875',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            Client Portal
          </p>

          {/* Heading */}
          <h1
            style={{
              fontFamily: 'Lora, serif',
              fontSize: '2.75rem',
              fontWeight: 400,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: '#1c1c1c',
              marginBottom: '12px',
            }}
          >
            Welcome back.
          </h1>
          <p style={{ fontSize: '15px', color: '#4a4a4a', marginBottom: '28px', lineHeight: 1.5 }}>
            Sign in to access your Originyx workspace.
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

          {/* OR divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e8e8e5' }} />
            <span style={{ fontSize: '11px', color: '#787875' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e8e8e5' }} />
          </div>

          {/* Tab: Sign In */}
          <div style={{ borderBottom: '1px solid #e8e8e5', marginBottom: '20px' }}>
            <button
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#1c1c1c',
                paddingBottom: '10px',
                borderBottom: '2px solid #1c1c1c',
                marginBottom: '-1px',
                background: 'none',
                cursor: 'default',
              }}
            >
              Sign In
            </button>
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Email */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#1c1c1c',
                  marginBottom: '6px',
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
                  padding: '10px 12px',
                  fontSize: '14px',
                  color: '#1c1c1c',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d8d8d4',
                  borderRadius: '6px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#1c1c1c',
                  }}
                >
                  Password <span style={{ color: '#a32a3f' }}>*</span>
                </label>
                <button
                  type="button"
                  style={{
                    fontSize: '12px',
                    color: '#4a4a4a',
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
                    padding: '10px 50px 10px 12px',
                    fontSize: '14px',
                    color: '#1c1c1c',
                    backgroundColor: '#ffffff',
                    border: '1px solid #d8d8d4',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '12px',
                    color: '#787875',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
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
                marginTop: '4px',
                backgroundColor: '#244235',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '100px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.15s ease',
              }}
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
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          {/* Legal */}
          <p style={{ marginTop: '20px', fontSize: '11px', color: '#787875', lineHeight: 1.6 }}>
            By continuing, you agree to our{' '}
            <a href="#" style={{ textDecoration: 'underline', color: '#787875' }}>Terms of Service</a>{' '}
            and{' '}
            <a href="#" style={{ textDecoration: 'underline', color: '#787875' }}>Privacy Policy</a>.
          </p>
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
          {/* Hero area */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            {/* Subtle texture overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(59,102,83,0.6) 0%, transparent 70%), radial-gradient(ellipse at 80% 20%, rgba(36,66,53,0.8) 0%, transparent 60%)',
              }}
            />

            {/* Left text overlay — PARTNERING FOR A MORE EFFICIENT TOMORROW */}
            <div
              style={{
                position: 'absolute',
                left: '12%',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <p
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  color: 'rgba(255,255,255,0.45)',
                  textTransform: 'uppercase',
                  lineHeight: 2,
                }}
              >
                Partnering<br />for a more<br />efficient<br />tomorrow
              </p>
              <div style={{ marginTop: '12px', width: '28px', height: '2px', backgroundColor: 'rgba(255,255,255,0.25)' }} />
            </div>

            {/* Right text overlay — Smarter Operations Brighter Growth */}
            <div
              style={{
                position: 'absolute',
                right: '10%',
                top: '50%',
                transform: 'translateY(-50%)',
                textAlign: 'right',
              }}
            >
              <h2
                style={{
                  fontFamily: 'Lora, serif',
                  fontSize: '2.4rem',
                  fontWeight: 400,
                  lineHeight: 1.18,
                  letterSpacing: '-0.01em',
                  color: 'rgba(255,255,255,0.92)',
                }}
              >
                Smarter<br />Operations<br />Brighter<br />Growth
              </h2>
              <div style={{ marginTop: '12px', marginLeft: 'auto', width: '28px', height: '2px', backgroundColor: 'rgba(255,255,255,0.25)' }} />
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
