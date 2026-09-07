import type { ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { Home, User, LogOut, ExternalLink } from 'lucide-react';

interface SidebarLayoutProps {
  children: ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (email: string) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  const isCurrent = (path: string) => location.pathname === path;

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
          width: 280px;
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
          padding: 0 32px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid #e8e8e5;
          height: 72px;
          flex-shrink: 0;
        }
        .sidebar-nav {
          flex: 1;
          padding: 32px 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 20px;
          border-radius: 8px;
          text-decoration: none;
          color: #4a4a4a;
          font-size: 16px;
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
        .sidebar-bottom {
          padding: 28px;
          border-top: 1px solid #e8e8e5;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background-color: #ffffff;
        }
        .layout-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .layout-header {
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0 60px;
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
          color: #787875;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: color 0.2s ease;
        }
        .go-website-link:hover {
          color: #1c1c1c;
        }
        
        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .layout-header { padding: 0 40px; }
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
          .sidebar-bottom {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 16px 24px;
            border-top: none;
          }
          .layout-header { display: none; /* Hide header on mobile, save space */ }
        }
      `}</style>
      
      <div className="layout-container">
        {/* ─── Sidebar ─── */}
        <aside className="layout-sidebar">
          {/* Logo Area */}
          <div className="sidebar-logo">
            <img src="/logo.png" alt="Logo" style={{ height: '22px', width: 'auto' }} />
            <img src="/brand.png" alt="Originyx" style={{ height: '16px', width: 'auto' }} />
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            <NavLink
              to="/dashboard"
              className={isCurrent('/dashboard') ? 'nav-item active' : 'nav-item'}
            >
              <Home size={18} color={isCurrent('/dashboard') ? '#244235' : '#787875'} strokeWidth={1.75} />
              Overview
            </NavLink>
            
            <NavLink
              to="/account"
              className={isCurrent('/account') ? 'nav-item active' : 'nav-item'}
            >
              <User size={18} color={isCurrent('/account') ? '#244235' : '#787875'} strokeWidth={1.75} />
              Account
            </NavLink>
          </nav>

          {/* Bottom User Area */}
          <div className="sidebar-bottom">
            {/* User Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#f5f5f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#244235',
                  flexShrink: 0,
                  border: '1px solid #e8e8e5'
                }}
              >
                {getInitials(user?.email || '')}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p
                  style={{
                    fontSize: '15px',
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
                    fontSize: '13px',
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

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#787875',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '8px',
                transition: 'all 0.2s',
                width: 'fit-content'
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#1c1c1c'; e.currentTarget.style.backgroundColor = '#f5f5f2'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = '#787875'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <LogOut size={16} strokeWidth={2} />
              Sign Out
            </button>
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
