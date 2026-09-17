import { useState, useEffect } from 'react';
import { getOCEClient } from '../lib/sdk';
import { useAuth } from '../lib/AuthContext';
import { CreditCard, ChevronRight, User as UserIcon, Headset, Box } from 'lucide-react';
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

  const rawName = user?.user_metadata?.full_name 
    || user?.email?.split('@')[0].split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  const firstName = rawName ? rawName.split(' ')[0] : 'User';

  return (
    <>
      <style>{`
        .overview-container {
          padding: 40px;
          max-width: 1440px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
          font-family: Calibri, 'Segoe UI', sans-serif;
        }

        /* Hero Card */
        .hero-card {
          position: relative;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          background-color: #ffffff;
          border: 1px solid #e8e8e5;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.015);
          display: flex;
          min-height: 380px;
        }
        .hero-left {
          flex: 1;
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 10;
        }
        .hero-right {
          flex: 1.2;
          position: relative;
          background-image: url('/hero-client-account.png');
          background-size: cover;
          background-position: center;
          border-radius: 0 16px 16px 0;
          overflow: hidden;
        }
        /* Mask for smooth blending if desired, though screenshot has a hard line. We will just use a hard flex layout. */
        
        .hero-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #787875;
          text-transform: uppercase;
          margin: 0 0 20px 0;
        }
        .hero-title-greeting {
          font-family: 'Lora', serif;
          font-size: 3.5rem;
          font-weight: 400;
          color: #1c1c1c;
          line-height: 1;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .hero-title-name {
          font-family: 'Lora', serif;
          font-size: 4.25rem;
          font-weight: 400;
          font-style: italic;
          color: #244235;
          line-height: 1.1;
          margin: 0 0 20px 0;
          letter-spacing: -0.01em;
        }
        .hero-desc {
          font-size: 16px;
          color: #4a4a4a;
          max-width: 440px;
          line-height: 1.6;
          margin: 0 0 32px 0;
        }
        
        .hero-actions {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .btn-primary {
          background-color: #244235;
          color: #ffffff;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }
        .btn-primary:hover {
          background-color: #1a3026;
        }
        .btn-text-dark {
          font-family: inherit;
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
          text-decoration: none;
        }
        .btn-text-dark:hover {
          color: #1a3026;
        }

        /* Hero Image Overlays */
        .overlay-left-text {
          position: absolute;
          left: 40px;
          top: 60px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #ffffff;
          text-transform: uppercase;
          line-height: 1.8;
          opacity: 0.9;
        }
        .overlay-left-text::after {
          content: "";
          display: block;
          width: 24px;
          height: 1px;
          background-color: rgba(255,255,255,0.6);
          margin-top: 12px;
        }
        .overlay-right-text {
          position: absolute;
          right: 40px;
          top: 60px;
          font-family: 'Lora', serif;
          font-size: 2.5rem;
          font-weight: 400;
          line-height: 1.15;
          color: #ffffff;
          text-align: right;
          text-shadow: 0 2px 10px rgba(0,0,0,0.15);
        }

        /* Main Grid */
        .dashboard-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 300px;
          gap: 24px;
        }

        /* Standard Card */
        .o-card {
          background-color: #ffffff;
          border: 1px solid #e8e8e5;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.015);
          display: flex;
          flex-direction: column;
        }
        .o-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .o-card-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #787875;
          margin: 0;
        }
        .card-view-all {
          font-size: 13px;
          font-weight: 600;
          color: #4a4a4a;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .card-view-all:hover {
          color: #1c1c1c;
        }

        /* Featured Product Content */
        .fp-container {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .fp-image {
          width: 96px;
          height: 96px;
          border-radius: 8px;
          background: linear-gradient(135deg, #1a3026 0%, #2a4f3f 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.9);
          font-family: 'Lora', serif;
          font-size: 14px;
          text-align: center;
          line-height: 1.2;
          padding: 8px;
          flex-shrink: 0;
        }
        .fp-details {
          flex: 1;
        }
        .fp-name {
          font-size: 15px;
          font-weight: 600;
          color: #1c1c1c;
          margin: 0 0 4px 0;
        }
        .fp-desc {
          font-size: 13px;
          color: #787875;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }
        .fp-tags {
          display: flex;
          gap: 8px;
        }
        .fp-tag {
          font-size: 11px;
          font-weight: 500;
          color: #4a4a4a;
          background-color: #f5f5f2;
          padding: 4px 10px;
          border-radius: 100px;
        }
        .fp-arrow {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #fbfbfa;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid #e8e8e5;
          color: #4a4a4a;
          transition: all 0.2s;
        }
        .fp-container:hover .fp-arrow {
          background-color: #ffffff;
          border-color: #d0d0cd;
          color: #1c1c1c;
        }

        /* Empty States */
        .empty-centered {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 24px 0;
        }
        .empty-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: #f5f5f2;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .empty-title {
          font-size: 17px;
          font-weight: 600;
          color: #1c1c1c;
          margin: 0 0 8px 0;
        }
        .empty-desc {
          font-size: 14px;
          color: #787875;
          margin: 0 0 20px 0;
          line-height: 1.5;
          max-width: 240px;
        }
        .btn-outline {
          background-color: #ffffff;
          border: 1px solid #e8e8e5;
          color: #244235;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 100px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .btn-outline:hover {
          background-color: #fbfbfa;
          border-color: #d0d0cd;
        }

        /* Left-aligned empty state (Subscription) */
        .sub-empty {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 12px 0;
        }
        
        /* Account Snapshot */
        .snapshot-table {
          width: 100%;
          font-size: 13px;
        }
        .snapshot-table td {
          padding: 8px 0;
        }
        .snapshot-label {
          color: #787875;
          width: 50%;
        }
        .snapshot-value {
          font-weight: 500;
          color: #1c1c1c;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #2a7e4b;
        }

        /* Quick Actions */
        .qa-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .qa-item {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: inherit;
        }
        .qa-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #f5f5f2;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4a4a4a;
          flex-shrink: 0;
          transition: background-color 0.2s;
        }
        .qa-item:hover .qa-icon-wrap {
          background-color: #e8e8e5;
          color: #1c1c1c;
        }
        .qa-text h4 {
          font-size: 14px;
          font-weight: 600;
          color: #1c1c1c;
          margin: 0 0 2px 0;
        }
        .qa-text p {
          font-size: 12px;
          color: #787875;
          margin: 0;
        }
        .qa-arrow {
          margin-left: auto;
          color: #787875;
        }

        /* Help Box */
        .help-box {
          background-color: #f0f4f1;
          border-radius: 12px;
          padding: 24px;
          margin-top: 16px;
        }
        .help-title {
          font-size: 14px;
          font-weight: 600;
          color: #1c1c1c;
          margin: 0 0 6px 0;
        }
        .help-desc {
          font-size: 13px;
          color: #4a4a4a;
          line-height: 1.5;
          margin: 0 0 16px 0;
        }

        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          }
          .col-quick-actions {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }
          .help-box { margin-top: 0; height: 100%; box-sizing: border-box; }
        }

        @media (max-width: 768px) {
          .overview-container { padding: 24px; }
          .hero-card { flex-direction: column; }
          .hero-left { padding: 40px 24px; }
          .hero-right { min-height: 240px; }
          .dashboard-grid { grid-template-columns: 1fr; }
          .col-quick-actions { grid-template-columns: 1fr; }
          .hero-title-greeting { font-size: 2.5rem; }
          .hero-title-name { font-size: 3rem; }
        }
      `}</style>

      <div className="overview-container">
        
        {/* ─── Hero Card ─── */}
        <div className="hero-card">
          <div className="hero-left">
            <p className="hero-eyebrow">
              {user ? 'Client Workspace' : 'Originyx Workspace'}
            </p>
            <h1 className="hero-title-greeting">Welcome back,</h1>
            <h1 className="hero-title-name">{firstName}.</h1>
            <p className="hero-desc">
              Your Originyx workspace for discovering products, managing your subscriptions, and accessing the tools available to your organization.
            </p>
            <div className="hero-actions">
              <NavLink to="/explore" className="btn-primary">
                Explore Products <ChevronRight size={18} strokeWidth={2.5} />
              </NavLink>
              {user && (
                <NavLink to="/account" className="btn-text-dark">
                  View Account <ChevronRight size={16} strokeWidth={2.5} />
                </NavLink>
              )}
            </div>
          </div>
          
          <div className="hero-right">
            <div className="overlay-left-text">
              Partnering<br />for a more<br />efficient<br />tomorrow
            </div>
            <div className="overlay-right-text">
              Smarter<br />Operations<br />Brighter<br />Growth
            </div>
          </div>
        </div>

        {/* ─── Main Grid ─── */}
        <div className="dashboard-grid">
          
          {/* Column 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Featured Products */}
            <div className="o-card" style={{ flex: 1 }}>
              <div className="o-card-header">
                <h2 className="o-card-title">Featured Products</h2>
                <NavLink to="/explore" className="card-view-all">
                  View all products <ChevronRight size={14} />
                </NavLink>
              </div>
              
              <div className="empty-centered">
                <div className="empty-icon" style={{ backgroundColor: 'transparent', border: '1px dashed #e8e8e5' }}>
                  <Box size={20} color="#787875" />
                </div>
                <h3 className="empty-title">No products available yet.</h3>
                <p className="empty-desc">Our products will appear here once they are published.</p>
              </div>
            </div>

            {/* Subscription Overview */}
            <div className="o-card" style={{ flex: 1 }}>
              <div className="o-card-header">
                <h2 className="o-card-title">Subscription Overview</h2>
              </div>
              
              <div className="sub-empty">
                <div className="empty-icon" style={{ width: '40px', height: '40px', margin: 0 }}>
                  <CreditCard size={18} color="#4a4a4a" />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1c1c1c', margin: '0 0 4px 0' }}>No active subscriptions</h3>
                  <p style={{ fontSize: '13px', color: '#787875', margin: '0 0 16px 0' }}>Your purchased plans will appear here.</p>
                  <NavLink to="/explore" className="btn-outline">
                    Explore Products <ChevronRight size={14} />
                  </NavLink>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Your Products */}
            <div className="o-card" style={{ flex: 1 }}>
              <div className="o-card-header">
                <h2 className="o-card-title">Your Products</h2>
                <NavLink to="/my-products" className="card-view-all">
                  View all <ChevronRight size={14} />
                </NavLink>
              </div>
              
              <div className="empty-centered">
                <div className="empty-icon">
                  <Box size={20} color="#244235" />
                </div>
                <h3 className="empty-title">Your products will appear here.</h3>
                <p className="empty-desc">Explore Originyx products to find the right tools for your business.</p>
                <NavLink to="/explore" className="btn-outline">
                  Explore Products <ChevronRight size={14} />
                </NavLink>
              </div>
            </div>

            {/* Account Snapshot */}
            <div className="o-card" style={{ flex: 1 }}>
              <div className="o-card-header">
                <h2 className="o-card-title">Account Snapshot</h2>
              </div>
              
              <table className="snapshot-table">
                <tbody>
                  <tr>
                    <td className="snapshot-label">Organization</td>
                    <td className="snapshot-value">{profile?.company || '—'}</td>
                  </tr>
                  <tr>
                    <td className="snapshot-label">Your Role</td>
                    <td className="snapshot-value">{profile?.role || '—'}</td>
                  </tr>
                  <tr>
                    <td className="snapshot-label">Active Products</td>
                    <td className="snapshot-value">0</td>
                  </tr>
                  <tr>
                    <td className="snapshot-label">Account Status</td>
                    <td className="snapshot-value">
                      <div className="status-dot" /> Active
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Column 3 - Quick Actions */}
          <div className="col-quick-actions">
            <div className="o-card" style={{ height: '100%', marginBottom: 0 }}>
              <div className="o-card-header">
                <h2 className="o-card-title">Quick Actions</h2>
              </div>
              
              <div className="qa-list">
                <NavLink to="/explore" style={{ textDecoration: 'none' }} className="qa-item">
                  <div className="qa-icon-wrap"><Box size={16} /></div>
                  <div className="qa-text">
                    <h4>Explore Products</h4>
                    <p>Discover our solutions</p>
                  </div>
                  <ChevronRight size={16} className="qa-arrow" />
                </NavLink>
                
                <NavLink to="/subscriptions" style={{ textDecoration: 'none' }} className="qa-item">
                  <div className="qa-icon-wrap"><CreditCard size={16} /></div>
                  <div className="qa-text">
                    <h4>Manage Subscriptions</h4>
                    <p>View your plans and billing</p>
                  </div>
                  <ChevronRight size={16} className="qa-arrow" />
                </NavLink>
                
                {user && (
                  <NavLink to="/account" className="qa-item">
                    <div className="qa-icon-wrap"><UserIcon size={16} /></div>
                    <div className="qa-text">
                      <h4>Account Settings</h4>
                      <p>Update your information</p>
                    </div>
                    <ChevronRight size={16} className="qa-arrow" />
                  </NavLink>
                )}
                
                <button onClick={() => alert("Coming soon")} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }} className="qa-item">
                  <div className="qa-icon-wrap"><Headset size={16} /></div>
                  <div className="qa-text">
                    <h4>Help & Support</h4>
                    <p>Get assistance</p>
                  </div>
                  <ChevronRight size={16} className="qa-arrow" />
                </button>
              </div>

              <div className="help-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Headset size={16} color="#244235" />
                  <h4 className="help-title" style={{ margin: 0 }}>Need help getting started?</h4>
                </div>
                <p className="help-desc">Our team is here to help you find the right solution for your business.</p>
                <button className="btn-text-dark" onClick={() => alert("Support coming soon")}>
                  Contact Support <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
