import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { Home, User, LogOut, ExternalLink, Box, Grid, CreditCard, Receipt } from 'lucide-react';

interface SidebarLayoutProps {
  children: ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isCurrent = (path: string) => location.pathname === path;
  
  const getInitials = (email: string) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <style>{`
        .layout-container {
          display: flex;
          min-height: 100vh;
          font-family: Calibri, 'Segoe UI', sans-serif;
          background-color: #fbfbfa;
        }
        .layout-sidebar {
          width: 260px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background-color: #ffffff;
          border-right: 1px solid #e8e8e5;
          height: 100vh;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .sidebar-logo {
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid #e8e8e5;
          height: 72px;
          flex-shrink: 0;
        }
        .sidebar-nav {
          flex: 1;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 6px;
          text-decoration: none;
          color: #4a4a4a;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .nav-item:hover {
          background-color: #f5f5f2;
          color: #1c1c1c;
        }
        .nav-item.active {
          background-color: #f5f5f2;
          color: #1c1c1c;
          font-weight: 600;
        }
        .nav-divider {
          height: 1px;
          background-color: #e8e8e5;
          margin: 12px 12px;
        }
        .sidebar-bottom {
          padding: 20px 24px;
          border-top: 1px solid #e8e8e5;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background-color: #ffffff;
        }
        .layout-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow-x: hidden;
        }
        .layout-header {
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0 40px;
          background-color: #fbfbfa;
          flex-shrink: 0;
          z-index: 40;
        }
        .go-website-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #4a4a4a;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .go-website-link:hover {
          color: #1c1c1c;
        }
        
        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .layout-header { padding: 0 24px; }
        }
        
        @media (max-width: 768px) {
          .layout-container { flex-direction: column; }
          .layout-sidebar {
            width: 100%;
            height: auto;
            position: relative;
            border-right: none;
            border-bottom: 1px solid #e8e8e5;
          }
          .sidebar-logo { height: 60px; padding: 0 24px; }
          .sidebar-nav {
            flex-direction: row;
            padding: 12px 16px;
            gap: 12px;
            overflow-x: auto;
            border-bottom: 1px solid #e8e8e5;
          }
          .nav-divider { display: none; }
          .sidebar-bottom {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 16px 24px;
            border-top: none;
          }
          .layout-header { display: none; }
        }
      `}</style>
      
      <div className="layout-container">
        {/* ─── Sidebar ─── */}
        <aside className="layout-sidebar">
          {/* Logo Area */}
          <div className="sidebar-logo">
            <img src="/logo.png" alt="Logo" style={{ height: '20px', width: 'auto' }} />
            <img src="/brand.png" alt="Originyx" style={{ height: '14px', width: 'auto' }} />
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            <NavLink to="/dashboard" className={isCurrent('/dashboard') ? 'nav-item active' : 'nav-item'}>
              <Home size={18} color={isCurrent('/dashboard') ? '#244235' : '#787875'} strokeWidth={1.75} />
              Overview
            </NavLink>
            <NavLink to="/explore" className={isCurrent('/explore') ? 'nav-item active' : 'nav-item'}>
              <Box size={18} color={isCurrent('/explore') ? '#244235' : '#787875'} strokeWidth={1.75} />
              Explore Products
            </NavLink>
            <NavLink to="/my-products" className={isCurrent('/my-products') ? 'nav-item active' : 'nav-item'}>
              <Grid size={18} color={isCurrent('/my-products') ? '#244235' : '#787875'} strokeWidth={1.75} />
              My Products
            </NavLink>
            
            <div className="nav-divider" />
            
            <NavLink to="/subscriptions" className={isCurrent('/subscriptions') ? 'nav-item active' : 'nav-item'}>
              <CreditCard size={18} color={isCurrent('/subscriptions') ? '#244235' : '#787875'} strokeWidth={1.75} />
              Subscriptions
            </NavLink>
            <NavLink to="/billing" className={isCurrent('/billing') ? 'nav-item active' : 'nav-item'}>
              <Receipt size={18} color={isCurrent('/billing') ? '#244235' : '#787875'} strokeWidth={1.75} />
              Billing
            </NavLink>

            <div className="nav-divider" />
            
            {user && (
              <NavLink to="/account" className={isCurrent('/account') ? 'nav-item active' : 'nav-item'}>
                <User size={18} color={isCurrent('/account') ? '#244235' : '#787875'} strokeWidth={1.75} />
                Account
              </NavLink>
            )}
          </nav>

          {/* Bottom User Area */}
          <div className="sidebar-bottom">
            {user ? (
              <>
                {/* User Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#f5f5f2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#1c1c1c',
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(user?.email || '')}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <p
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1c1c1c',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0].split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') || 'User'}
                    </p>
                    <p
                      style={{
                        fontSize: '12px',
                        color: '#787875',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user?.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#4a4a4a',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    width: 'fit-content'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#1c1c1c'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#4a4a4a'}
                >
                  <LogOut size={16} strokeWidth={2} style={{ transform: 'rotate(180deg)' }} />
                  Sign Out
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <NavLink
                  to="/login"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#244235',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 500,
                    borderRadius: '6px',
                    textDecoration: 'none',
                    textAlign: 'center',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1a3026'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#244235'}
                >
                  Sign In
                </NavLink>
              </div>
            )}
          </div>
        </aside>

        {/* ─── Main Content Area ─── */}
        <main className="layout-main">
          {/* Top Header inside main area */}
          <header className="layout-header">
            <a
              href="https://originyx.in"
              target="_blank"
              rel="noopener noreferrer"
              className="go-website-link"
            >
              Go to Website
              <ExternalLink size={14} strokeWidth={2} />
            </a>
          </header>

          {/* Page Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
