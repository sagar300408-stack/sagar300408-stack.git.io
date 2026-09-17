import { useState, useEffect } from 'react';
import { getOCEClient } from '../lib/sdk';
import { useAuth } from '../lib/AuthContext';
import { PackageOpen, CreditCard, ChevronRight, ShieldCheck, User as UserIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  
  useEffect(() => {
    if (user) {
      getOCEClient().getClientProfile().then(data => {
        if (data) setProfile(data);
      }).catch(() => {});
    }
  }, [user]);

  const userName = user?.user_metadata?.full_name 
    || user?.email?.split('@')[0].split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') 
    || 'User';

  return (
    <>
      <style>{`
        .overview-container {
          padding: 60px 80px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          font-family: Calibri, 'Segoe UI', sans-serif;
        }

        /* Hero Section */
        .hero-banner {
          position: relative;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          background-color: #1a1a1a;
          margin-bottom: 48px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          display: flex;
          min-height: 280px;
        }
        .hero-banner-content {
          flex: 1;
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 10;
        }
        .hero-banner-image {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 60%;
          background-image: url('/client-dashboard.png');
          background-size: cover;
          background-position: right center;
          mask-image: linear-gradient(to right, transparent, black 40%);
          -webkit-mask-image: linear-gradient(to right, transparent, black 40%);
        }
        .hero-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          margin: 0 0 12px 0;
        }
        .hero-title {
          font-family: 'Lora', serif;
          font-size: 2.75rem;
          font-weight: 400;
          color: #ffffff;
          line-height: 1.1;
          margin: 0 0 16px 0;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .hero-desc {
          font-size: 17px;
          color: rgba(255, 255, 255, 0.85);
          max-width: 440px;
          line-height: 1.5;
          margin: 0;
        }

        /* Grid Layout */
        .overview-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 40px;
        }

        /* Cards */
        .o-card {
          background-color: #ffffff;
          border: 1px solid #e8e8e5;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.015);
          display: flex;
          flex-direction: column;
        }
        .o-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .o-card-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #f5f5f2;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .o-card-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #1c1c1c;
          margin: 0;
        }

        /* Explore Products Section */
        .explore-banner {
          background: linear-gradient(135deg, #244235 0%, #172a22 100%);
          border-radius: 12px;
          padding: 40px;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          margin-bottom: 40px;
          box-shadow: 0 4px 15px rgba(36, 66, 53, 0.1);
        }
        .explore-banner-content h3 {
          font-family: 'Lora', serif;
          font-size: 1.75rem;
          font-weight: 400;
          margin: 0 0 12px 0;
        }
        .explore-banner-content p {
          font-size: 16px;
          color: rgba(255,255,255,0.85);
          margin: 0;
          max-width: 500px;
          line-height: 1.5;
        }
        .btn-primary-white {
          background-color: #ffffff;
          color: #244235;
          font-family: Calibri, 'Segoe UI', sans-serif;
          font-size: 15px;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          white-space: nowrap;
          border: none;
          cursor: pointer;
        }
        .btn-primary-white:hover {
          background-color: #f5f5f2;
        }

        /* Empty States */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 32px 0 16px 0;
        }
        .empty-state-title {
          font-size: 16px;
          font-weight: 600;
          color: #1c1c1c;
          margin: 0 0 8px 0;
        }
        .empty-state-desc {
          font-size: 15px;
          color: #787875;
          margin: 0 0 24px 0;
          line-height: 1.5;
          max-width: 400px;
        }
        .btn-text {
          font-family: Calibri, 'Segoe UI', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #244235;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-text:hover {
          color: #1a3026;
          text-decoration: underline;
        }

        /* Account Snapshot */
        .snapshot-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #f5f5f2;
        }
        .snapshot-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .snapshot-label {
          font-size: 13px;
          color: #787875;
        }
        .snapshot-value {
          font-size: 15px;
          font-weight: 500;
          color: #1c1c1c;
        }

        @media (max-width: 1100px) {
          .overview-grid {
            grid-template-columns: 1fr;
          }
          .explore-banner {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 768px) {
          .overview-container {
            padding: 32px 24px;
          }
          .hero-banner {
            min-height: 220px;
          }
          .hero-banner-content {
            padding: 40px;
          }
          .hero-title {
            font-size: 2.25rem;
          }
          .hero-banner-image {
            width: 80%;
          }
        }
      `}</style>

      <div className="overview-container">
        {/* ─── Hero Banner ─── */}
        <div className="hero-banner">
          <div className="hero-banner-image" />
          <div className="hero-banner-content">
            <p className="hero-eyebrow">
              {user ? 'Client Workspace' : 'Originyx Workspace'}
            </p>
            <h1 className="hero-title">
              {user ? `Welcome back, ${userName}.` : 'Welcome to Originyx.'}
            </h1>
            <p className="hero-desc">
              {user 
                ? 'Your Originyx workspace for discovering products, managing your subscriptions, and accessing the tools available to your organization.'
                : 'Discover the tools and solutions built by Originyx for growing businesses.'}
            </p>
          </div>
        </div>

        {/* ─── Explore Products Entry Point ─── */}
        <div className="explore-banner">
          <div className="explore-banner-content">
            <h3>Explore Originyx Products</h3>
            <p>Discover tools designed to help businesses improve their operations, efficiency, and growth.</p>
          </div>
          {/* We use a button with onClick since the catalog route doesn't exist yet */}
          <button 
            className="btn-primary-white"
            onClick={() => alert("Product catalog coming soon.")}
          >
            Explore Products <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="overview-grid">
          {/* Main Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            {/* ─── My Products ─── */}
            <div className="o-card">
              <div className="o-card-header">
                <div className="o-card-icon">
                  <PackageOpen size={18} color="#4a4a4a" />
                </div>
                <h2 className="o-card-title">My Products</h2>
              </div>
              
              {user ? (
                <div className="empty-state">
                  <p className="empty-state-title">Your products will appear here.</p>
                  <p className="empty-state-desc">
                    You currently have no purchased or assigned products. Explore Originyx products to find the right tools for your business.
                  </p>
                  <button 
                    className="btn-text" 
                    onClick={() => alert("Product catalog coming soon.")}
                  >
                    Explore Products <ChevronRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="empty-state">
                  <p className="empty-state-title">Sign in to view your products.</p>
                  <p className="empty-state-desc">
                    Access your purchased applications and resources by signing into your organization's account.
                  </p>
                  <NavLink to="/login" className="btn-text">
                    Sign In <ChevronRight size={16} />
                  </NavLink>
                </div>
              )}
            </div>

            {/* ─── Subscription Summary ─── */}
            <div className="o-card">
              <div className="o-card-header">
                <div className="o-card-icon">
                  <CreditCard size={18} color="#4a4a4a" />
                </div>
                <h2 className="o-card-title">Subscriptions</h2>
              </div>
              
              {user ? (
                <div className="empty-state">
                  <p className="empty-state-title">No active subscriptions.</p>
                  <p className="empty-state-desc">
                    Your purchased plans and billing information will appear here once you subscribe to a product.
                  </p>
                  <button 
                    className="btn-text"
                    onClick={() => alert("Product catalog coming soon.")}
                  >
                    Explore Products <ChevronRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="empty-state">
                  <p className="empty-state-title">Manage your subscriptions.</p>
                  <p className="empty-state-desc">
                    Sign in to view and manage your active plans, billing details, and subscription renewals.
                  </p>
                  <NavLink to="/login" className="btn-text">
                    Sign In <ChevronRight size={16} />
                  </NavLink>
                </div>
              )}
            </div>

          </div>

          {/* Side Column (Account Snapshot) */}
          {user && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="o-card" style={{ padding: '32px' }}>
                <div className="o-card-header" style={{ marginBottom: '24px' }}>
                  <div className="o-card-icon">
                    <UserIcon size={18} color="#4a4a4a" />
                  </div>
                  <h2 className="o-card-title">Account Snapshot</h2>
                </div>
                
                <div>
                  <div className="snapshot-item">
                    <span className="snapshot-label">Organization</span>
                    <span className="snapshot-value">
                      {profile?.company || 'No organization linked'}
                    </span>
                  </div>
                  <div className="snapshot-item">
                    <span className="snapshot-label">Your Role</span>
                    <span className="snapshot-value">
                      {profile?.role || 'Member'}
                    </span>
                  </div>
                  <div className="snapshot-item">
                    <span className="snapshot-label">Purchased Products</span>
                    <span className="snapshot-value">0</span>
                  </div>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e8e8e5' }}>
                  <NavLink to="/account" className="btn-text" style={{ fontSize: '14px' }}>
                    Manage Account Settings <ChevronRight size={14} />
                  </NavLink>
                </div>
              </div>

              {/* Trust/Support block below snapshot */}
              <div 
                style={{ 
                  marginTop: '24px', 
                  padding: '24px', 
                  backgroundColor: '#f5f5f2', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <ShieldCheck size={18} color="#787875" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#4a4a4a', margin: '0 0 4px 0' }}>Secure Workspace</p>
                  <p style={{ fontSize: '13px', color: '#787875', margin: 0, lineHeight: 1.5 }}>
                    Your organization data and subscriptions are private and encrypted.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
