import { useState, useEffect } from 'react';
import { getOCEClient } from '../lib/sdk';
import { useAuth } from '../lib/AuthContext';
import { useToast } from '../components/Layout/ToastProvider';
import { CreditCard, ChevronRight, User as UserIcon, Headset, Box, Grid } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Dashboard() {
  useEffect(() => {
    document.title = 'Overview | Originyx Client Portal';
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex, nofollow';
  }, []);


  const { user } = useAuth();
  const { showToast } = useToast();
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

  const handleSupportClick = () => {
    window.location.href = 'mailto:support@originyx.in?subject=Client%20Portal%20Inquiry';
    showToast('Opening support email (support@originyx.in)', 'info');
  };

  return (
    <>
      <style>{`
        .overview-container {
          padding: 32px 40px;
          max-width: 1440px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
          font-family: Calibri, 'Segoe UI', sans-serif;
        }

        /* ─── Hero Card ─── */
        .hero-card {
          position: relative;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          background-color: #ffffff;
          border: 1px solid #e8e8e5;
          margin-bottom: 28px;
          box-shadow: 0 2px 14px rgba(0,0,0,0.02);
          display: flex;
          min-height: 330px;
        }

        .hero-left {
          flex: 1.1;
          padding: 40px 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 10;
          min-width: 0;
        }

        .hero-right {
          flex: 0.9;
          position: relative;
          background-image: url('/hero-client-account.png');
          background-size: cover;
          background-position: center 30%;
          border-radius: 0 16px 16px 0;
          overflow: hidden;
          min-height: 280px;
        }

        .hero-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #787875;
          text-transform: uppercase;
          margin: 0 0 14px 0;
        }

        .hero-title-greeting {
          font-family: 'Lora', serif;
          font-size: clamp(1.85rem, 3.2vw, 2.75rem);
          font-weight: 400;
          color: #1c1c1c;
          line-height: 1.1;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .hero-title-name {
          font-family: 'Lora', serif;
          font-size: clamp(2.25rem, 4vw, 3.25rem);
          font-weight: 400;
          font-style: italic;
          color: #244235;
          line-height: 1.1;
          margin: 0 0 16px 0;
          letter-spacing: -0.01em;
        }

        .hero-desc {
          font-size: 15px;
          color: #4a4a4a;
          max-width: 480px;
          line-height: 1.55;
          margin: 0 0 28px 0;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 18px;
        }

        .btn-primary {
          background-color: #244235;
          color: #ffffff;
          font-family: inherit;
          font-size: 14.5px;
          font-weight: 600;
          padding: 11px 22px;
          border-radius: 8px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background-color 0.15s ease, transform 0.15s ease;
          border: none;
          cursor: pointer;
        }

        .btn-primary:hover {
          background-color: #1a3026;
        }

        .btn-primary:focus-visible {
          outline: 2px solid #244235;
          outline-offset: 2px;
        }

        .btn-text-dark {
          font-family: inherit;
          font-size: 14.5px;
          font-weight: 600;
          color: #244235;
          background: none;
          border: none;
          padding: 4px 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          border-radius: 6px;
          transition: color 0.15s ease, background-color 0.15s ease;
        }

        .btn-text-dark:hover {
          color: #1a3026;
          background-color: #f0f4f1;
        }

        .btn-text-dark:focus-visible {
          outline: 2px solid #244235;
          outline-offset: 2px;
        }

        /* ─── Main Grid ─── */
        .dashboard-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 320px;
          gap: 24px;
        }

        /* ─── Standard Card ─── */
        .o-card {
          background-color: #ffffff;
          border: 1px solid #e8e8e5;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.015);
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .o-card:hover {
          border-color: #d8d8d4;
        }

        .o-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 12px;
        }

        .o-card-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
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
          transition: color 0.15s ease;
        }

        .card-view-all:hover {
          color: #1c1c1c;
        }

        .card-view-all:focus-visible {
          outline: 2px solid #244235;
          outline-offset: 2px;
        }

        /* ─── Empty States ─── */
        .empty-centered {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 28px 16px;
          margin: auto 0;
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
          font-size: 16px;
          font-weight: 600;
          color: #1c1c1c;
          margin: 0 0 6px 0;
        }

        .empty-desc {
          font-size: 13.5px;
          color: #787875;
          margin: 0 0 20px 0;
          line-height: 1.5;
          max-width: 280px;
        }

        .btn-outline {
          background-color: #ffffff;
          border: 1px solid #e8e8e5;
          color: #244235;
          font-family: inherit;
          font-size: 13.5px;
          font-weight: 600;
          padding: 9px 18px;
          border-radius: 100px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
        }

        .btn-outline:hover {
          background-color: #fbfbfa;
          border-color: #d0d0cd;
        }

        .btn-outline:focus-visible {
          outline: 2px solid #244235;
          outline-offset: 2px;
        }

        /* ─── Left-aligned Empty State (Subscription) ─── */
        .sub-empty {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 8px 0;
          margin: auto 0;
        }

        /* ─── Account Snapshot ─── */
        .snapshot-table {
          width: 100%;
          font-size: 13.5px;
          border-collapse: collapse;
          margin: auto 0;
        }

        .snapshot-table tr {
          border-bottom: 1px solid #f5f5f2;
        }

        .snapshot-table tr:last-child {
          border-bottom: none;
        }

        .snapshot-table td {
          padding: 10px 0;
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

        /* ─── Quick Actions ─── */
        .qa-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .qa-item {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: inherit;
          padding: 8px 10px;
          border-radius: 8px;
          transition: background-color 0.15s ease;
          box-sizing: border-box;
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .qa-item:hover {
          background-color: #f5f5f2;
        }

        .qa-item:focus-visible {
          outline: 2px solid #244235;
          outline-offset: 2px;
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
          transition: background-color 0.15s, color 0.15s;
        }

        .qa-item:hover .qa-icon-wrap {
          background-color: #e8e8e5;
          color: #1c1c1c;
        }

        .qa-text h4 {
          font-size: 13.5px;
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
          color: #a0a09c;
          flex-shrink: 0;
        }

        /* ─── Help Box ─── */
        .help-box {
          background-color: #f0f4f1;
          border-radius: 12px;
          padding: 20px;
          margin-top: 18px;
          box-sizing: border-box;
        }

        .help-title {
          font-size: 13.5px;
          font-weight: 600;
          color: #1c1c1c;
          margin: 0 0 6px 0;
        }

        .help-desc {
          font-size: 12.5px;
          color: #4a4a4a;
          line-height: 1.5;
          margin: 0 0 14px 0;
        }

        /* ─── Responsive Breakpoints ─── */
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
          .help-box { 
            margin-top: 0; 
            height: 100%; 
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
        }

        @media (max-width: 900px) {
          .overview-container { padding: 24px; }
          .hero-card { flex-direction: column; }
          .hero-left { padding: 32px 28px; }
          .hero-right {
            min-height: 220px;
            border-radius: 0 0 16px 16px;
            background-position: center 25%;
          }
        }

        @media (max-width: 640px) {
          .overview-container { padding: 16px; }
          .hero-left { padding: 24px 18px; }
          .hero-actions { flex-direction: column; align-items: flex-start; gap: 12px; }
          .btn-primary { width: 100%; justify-content: center; }
          .dashboard-grid { grid-template-columns: 1fr; }
          .col-quick-actions { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="overview-container">
        
        {/* ─── Hero Card ─── */}
        <section className="hero-card" aria-label="Welcome banner">
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
                Explore Products <ChevronRight size={17} strokeWidth={2.5} />
              </NavLink>
              {user && (
                <NavLink to="/account" className="btn-text-dark">
                  View Account <ChevronRight size={15} strokeWidth={2.5} />
                </NavLink>
              )}
            </div>
          </div>
          
          <div className="hero-right" role="img" aria-label="Originyx workspace view" />
        </section>

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
                <h3 className="empty-title">No products available yet</h3>
                <p className="empty-desc">Our products will appear here once they are published.</p>
                <NavLink to="/explore" className="btn-outline">
                  Explore Catalogue <ChevronRight size={14} />
                </NavLink>
              </div>
            </div>

            {/* Subscription Overview */}
            <div className="o-card" style={{ flex: 1 }}>
              <div className="o-card-header">
                <h2 className="o-card-title">Subscription Overview</h2>
                <NavLink to="/subscriptions" className="card-view-all">
                  Manage <ChevronRight size={14} />
                </NavLink>
              </div>
              
              <div className="sub-empty">
                <div className="empty-icon" style={{ width: '40px', height: '40px', margin: 0, flexShrink: 0 }}>
                  <CreditCard size={18} color="#4a4a4a" />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1c1c1c', margin: '0 0 4px 0' }}>No active subscriptions</h3>
                  <p style={{ fontSize: '13px', color: '#787875', margin: '0 0 16px 0', lineHeight: 1.5 }}>Your purchased plans and entitlements will appear here.</p>
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
                  <Grid size={20} color="#244235" />
                </div>
                <h3 className="empty-title">Your products will appear here</h3>
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
                {user && (
                  <NavLink to="/account" className="card-view-all">
                    Edit <ChevronRight size={14} />
                  </NavLink>
                )}
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
                <NavLink to="/explore" className="qa-item">
                  <div className="qa-icon-wrap"><Box size={16} /></div>
                  <div className="qa-text">
                    <h4>Explore Products</h4>
                    <p>Discover our solutions</p>
                  </div>
                  <ChevronRight size={15} className="qa-arrow" />
                </NavLink>
                
                <NavLink to="/subscriptions" className="qa-item">
                  <div className="qa-icon-wrap"><CreditCard size={16} /></div>
                  <div className="qa-text">
                    <h4>Manage Subscriptions</h4>
                    <p>View your plans and billing</p>
                  </div>
                  <ChevronRight size={15} className="qa-arrow" />
                </NavLink>
                
                {user && (
                  <NavLink to="/account" className="qa-item">
                    <div className="qa-icon-wrap"><UserIcon size={16} /></div>
                    <div className="qa-text">
                      <h4>Account Settings</h4>
                      <p>Update your information</p>
                    </div>
                    <ChevronRight size={15} className="qa-arrow" />
                  </NavLink>
                )}
                
                <button 
                  type="button" 
                  onClick={handleSupportClick} 
                  className="qa-item"
                  title="Contact Support"
                >
                  <div className="qa-icon-wrap"><Headset size={16} /></div>
                  <div className="qa-text">
                    <h4>Help & Support</h4>
                    <p>Get assistance</p>
                  </div>
                  <ChevronRight size={15} className="qa-arrow" />
                </button>
              </div>

              <div className="help-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Headset size={16} color="#244235" />
                  <h4 className="help-title" style={{ margin: 0 }}>Need help getting started?</h4>
                </div>
                <p className="help-desc">Our team is here to help you find the right solution for your business.</p>
                <button 
                  type="button" 
                  className="btn-text-dark" 
                  onClick={handleSupportClick}
                  style={{ padding: '0', display: 'inline-flex' }}
                >
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
