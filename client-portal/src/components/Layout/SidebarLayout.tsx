import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { 
  Home, 
  User, 
  LogOut, 
  ExternalLink, 
  Box, 
  Grid, 
  CreditCard, 
  Receipt, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react';

const MAIN_SITE_SIGNIN =
  import.meta.env.VITE_MAIN_SITE_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://originyx.in');

interface SidebarLayoutProps {
  children: ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('originyx_portal_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isCurrent = (path: string) => location.pathname === path;

  const getInitials = (email: string) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0].split('.').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') ||
    'User';

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('originyx_portal_sidebar_collapsed', String(next));
        } catch {
          // ignore localStorage error
        }
        return next;
      });
    }
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Handle ESC key to close mobile drawer & user dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const navItems = [
    { label: 'Overview', to: '/dashboard', icon: Home },
    { label: 'Explore Products', to: '/explore', icon: Box },
    { label: 'My Products', to: '/my-products', icon: Grid },
    { divider: true },
    { label: 'Subscriptions', to: '/subscriptions', icon: CreditCard },
    { label: 'Billing', to: '/billing', icon: Receipt },
    ...(user ? [{ divider: true }, { label: 'Account', to: '/account', icon: User }] : [])
  ];

  return (
    <>
      <style>{`
        .layout-container {
          display: flex;
          min-height: 100vh;
          font-family: Calibri, 'Segoe UI', sans-serif;
          background-color: #fbfbfa;
          position: relative;
        }

        /* ─── Desktop Sidebar ─── */
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
          transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: visible;
        }

        .layout-sidebar.collapsed {
          width: 72px;
        }

        .sidebar-logo {
          padding: 0 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #e8e8e5;
          height: 64px;
          flex-shrink: 0;
          box-sizing: border-box;
          overflow: hidden;
          transition: padding 0.25s ease;
        }

        .layout-sidebar.collapsed .sidebar-logo {
          padding: 0;
          justify-content: center;
        }

        .sidebar-logo-icon {
          height: 22px;
          width: auto;
          flex-shrink: 0;
        }

        .sidebar-logo-brand {
          height: 15px;
          width: auto;
          opacity: 1;
          transition: opacity 0.2s ease, width 0.2s ease;
        }

        .layout-sidebar.collapsed .sidebar-logo-brand {
          opacity: 0;
          width: 0;
          display: none;
        }

        .sidebar-close-btn-mobile {
          display: none;
        }

        .sidebar-nav {
          flex: 1;
          padding: 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .layout-sidebar.collapsed .sidebar-nav {
          padding: 20px 8px;
          align-items: center;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          text-decoration: none;
          color: #4a4a4a;
          font-size: 14px;
          font-weight: 500;
          transition: background-color 0.15s ease, color 0.15s ease;
          position: relative;
          white-space: nowrap;
          box-sizing: border-box;
          width: 100%;
        }

        .nav-item:hover {
          background-color: #f5f5f2;
          color: #1c1c1c;
        }

        .nav-item:focus-visible {
          outline: 2px solid #244235;
          outline-offset: 2px;
        }

        .nav-item.active {
          background-color: #f0f4f1;
          color: #244235;
          font-weight: 600;
        }

        .layout-sidebar.collapsed .nav-item {
          justify-content: center;
          padding: 10px;
          width: 44px;
          height: 44px;
          margin: 0 auto;
        }

        .nav-label {
          display: inline-block;
          opacity: 1;
          transition: opacity 0.2s ease;
        }

        .layout-sidebar.collapsed .nav-label {
          display: none;
        }

        /* Tooltip in collapsed mode */
        .layout-sidebar.collapsed .nav-item::after {
          content: attr(data-tooltip);
          position: absolute;
          left: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%);
          background-color: #1c1c1c;
          color: #ffffff;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 10px;
          border-radius: 6px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s ease, transform 0.15s ease;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
          z-index: 999;
        }

        .layout-sidebar.collapsed .nav-item:hover::after,
        .layout-sidebar.collapsed .nav-item:focus-visible::after {
          opacity: 1;
          transform: translateY(-50%) translateX(2px);
        }

        .nav-divider {
          height: 1px;
          background-color: #e8e8e5;
          margin: 10px 10px;
        }

        .layout-sidebar.collapsed .nav-divider {
          width: 32px;
          margin: 10px auto;
        }

        .sidebar-bottom {
          padding: 16px 18px;
          border-top: 1px solid #e8e8e5;
          display: flex;
          flex-direction: column;
          gap: 14px;
          background-color: #ffffff;
          box-sizing: border-box;
          overflow: hidden;
        }

        .layout-sidebar.collapsed .sidebar-bottom {
          padding: 16px 8px;
          align-items: center;
          gap: 12px;
        }

        .user-profile-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .layout-sidebar.collapsed .user-profile-badge {
          justify-content: center;
        }

        .user-avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #244235;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
          flex-shrink: 0;
          position: relative;
        }

        .layout-sidebar.collapsed .user-profile-badge::after {
          content: attr(data-tooltip);
          position: absolute;
          left: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%);
          background-color: #1c1c1c;
          color: #ffffff;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 10px;
          border-radius: 6px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s ease, transform 0.15s ease;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
          z-index: 999;
        }

        .layout-sidebar.collapsed .user-profile-badge:hover::after {
          opacity: 1;
          transform: translateY(-50%) translateX(2px);
        }

        .user-text-info {
          overflow: hidden;
          min-width: 0;
        }

        .layout-sidebar.collapsed .user-text-info {
          display: none;
        }

        .user-name-text {
          font-size: 13px;
          font-weight: 600;
          color: #1c1c1c;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email-text {
          font-size: 11.5px;
          color: #787875;
          margin: 2px 0 0 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .signout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 6px;
          background-color: transparent;
          border: none;
          cursor: pointer;
          color: #787875;
          font-size: 13px;
          font-weight: 500;
          transition: color 0.15s, background-color 0.15s;
          width: 100%;
          box-sizing: border-box;
          position: relative;
        }

        .signout-btn:hover {
          color: #b91c1c;
          background-color: #fef2f2;
        }

        .signout-btn:focus-visible {
          outline: 2px solid #b91c1c;
          outline-offset: 2px;
        }

        .layout-sidebar.collapsed .signout-btn {
          justify-content: center;
          width: 38px;
          height: 38px;
          padding: 0;
          margin: 0 auto;
        }

        .layout-sidebar.collapsed .signout-btn span {
          display: none;
        }

        .layout-sidebar.collapsed .signout-btn::after {
          content: "Sign Out";
          position: absolute;
          left: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%);
          background-color: #1c1c1c;
          color: #ffffff;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 10px;
          border-radius: 6px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s ease, transform 0.15s ease;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
          z-index: 999;
        }

        .layout-sidebar.collapsed .signout-btn:hover::after,
        .layout-sidebar.collapsed .signout-btn:focus-visible::after {
          opacity: 1;
          transform: translateY(-50%) translateX(2px);
        }

        /* ─── Main Content Area ─── */
        .layout-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow-x: hidden;
        }

        /* ─── Header ─── */
        .layout-header {
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          background-color: #ffffff;
          border-bottom: 1px solid #e8e8e5;
          position: sticky;
          top: 0;
          z-index: 40;
          box-sizing: border-box;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-toggle-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          border: 1px solid #e8e8e5;
          background-color: #ffffff;
          color: #4a4a4a;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .header-toggle-btn:hover {
          background-color: #f5f5f2;
          color: #1c1c1c;
          border-color: #d8d8d4;
        }

        .header-toggle-btn:focus-visible {
          outline: 2px solid #244235;
          outline-offset: 2px;
        }

        .header-mobile-brand {
          display: none;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .header-title-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #787875;
          background-color: #f5f5f2;
          padding: 4px 10px;
          border-radius: 100px;
          border: 1px solid #e8e8e5;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .go-website-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13.5px;
          font-weight: 500;
          color: #4a4a4a;
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 6px;
          transition: color 0.15s ease, background-color 0.15s ease;
        }

        .go-website-link:hover {
          color: #1c1c1c;
          background-color: #f5f5f2;
        }

        .go-website-link:focus-visible {
          outline: 2px solid #244235;
          outline-offset: 2px;
        }

        .header-user-menu-container {
          position: relative;
        }

        .header-avatar-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          border-radius: 50%;
        }

        .header-avatar-btn:focus-visible {
          outline: 2px solid #244235;
          outline-offset: 2px;
        }

        .header-dropdown-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 10px);
          width: 220px;
          background-color: #ffffff;
          border: 1px solid #e8e8e5;
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          padding: 6px;
          box-sizing: border-box;
          z-index: 60;
        }

        .header-dropdown-user {
          padding: 10px 12px;
          border-bottom: 1px solid #e8e8e5;
          margin-bottom: 4px;
        }

        .header-dropdown-user-name {
          font-size: 13.5px;
          font-weight: 600;
          color: #1c1c1c;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .header-dropdown-user-email {
          font-size: 11.5px;
          color: #787875;
          margin: 2px 0 0 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .header-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #4a4a4a;
          text-decoration: none;
          border: none;
          background: transparent;
          width: 100%;
          cursor: pointer;
          text-align: left;
          box-sizing: border-box;
          transition: background-color 0.15s, color 0.15s;
        }

        .header-dropdown-item:hover {
          background-color: #f5f5f2;
          color: #1c1c1c;
        }

        .header-dropdown-item.danger:hover {
          background-color: #fef2f2;
          color: #b91c1c;
        }

        /* ─── Mobile Overlay Drawer ─── */
        .mobile-backdrop {
          display: none;
        }

        @media (max-width: 767px) {
          .mobile-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background-color: rgba(0,0,0,0.4);
            z-index: 90;
            backdrop-filter: blur(2px);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.25s ease;
          }

          .mobile-backdrop.open {
            opacity: 1;
            pointer-events: auto;
          }

          .layout-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: 280px !important;
            height: 100vh;
            z-index: 100;
            transform: translateX(-100%);
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 4px 0 24px rgba(0,0,0,0.15);
          }

          .layout-sidebar.mobile-open {
            transform: translateX(0);
          }

          .sidebar-logo {
            justify-content: space-between !important;
            padding: 0 16px !important;
          }

          .sidebar-logo-brand {
            display: inline-block !important;
            opacity: 1 !important;
            width: auto !important;
          }

          .sidebar-close-btn-mobile {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            border: none;
            background-color: #f5f5f2;
            color: #4a4a4a;
            cursor: pointer;
          }

          .nav-label {
            display: inline-block !important;
          }

          .user-text-info {
            display: block !important;
          }

          .signout-btn span {
            display: inline !important;
          }

          .layout-header {
            padding: 0 16px;
          }

          .header-mobile-brand {
            display: flex;
          }

          .header-title-badge {
            display: none;
          }

          .go-website-link span {
            display: none;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .layout-sidebar,
          .mobile-backdrop,
          .header-toggle-btn,
          .nav-item,
          .sidebar-logo-brand {
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Mobile Drawer Backdrop */}
      <div 
        className={`mobile-backdrop ${isMobileOpen ? 'open' : ''}`}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      <div className="layout-container">
        {/* ─── Sidebar ─── */}
        <aside 
          id="portal-sidebar"
          aria-label="Portal Navigation"
          className={`layout-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
        >
          {/* Logo Area */}
          <div className="sidebar-logo">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/logo.png" alt="Logo" className="sidebar-logo-icon" />
              <img src="/brand.png" alt="Originyx" className="sidebar-logo-brand" />
            </div>

            {/* Mobile close button inside drawer */}
            <button
              type="button"
              className="sidebar-close-btn-mobile"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close navigation sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            {navItems.map((item, index) => {
              if (item.divider) {
                return <div key={`div-${index}`} className="nav-divider" />;
              }
              const IconComponent = item.icon!;
              const active = isCurrent(item.to!);
              return (
                <NavLink
                  key={item.to}
                  to={item.to!}
                  className={active ? 'nav-item active' : 'nav-item'}
                  data-tooltip={item.label}
                  title={item.label}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <IconComponent
                    size={18}
                    color={active ? '#244235' : '#787875'}
                    strokeWidth={active ? 2.2 : 1.75}
                    style={{ flexShrink: 0 }}
                  />
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom User Area */}
          <div className="sidebar-bottom">
            {user ? (
              <>
                <div 
                  className="user-profile-badge"
                  data-tooltip={`${userName} (${user.email})`}
                  title={`${userName} (${user.email})`}
                >
                  <div className="user-avatar-circle">
                    {getInitials(user?.email || '')}
                  </div>
                  <div className="user-text-info">
                    <p className="user-name-text">{userName}</p>
                    <p className="user-email-text">{user?.email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="signout-btn"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut size={16} strokeWidth={2} style={{ transform: 'rotate(180deg)', flexShrink: 0 }} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                {!isCollapsed && (
                  <p style={{ fontSize: '11px', color: '#787875', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Guest Explorer
                  </p>
                )}
                <a
                  href={`${MAIN_SITE_SIGNIN}?next=${encodeURIComponent(window.location.origin + '/dashboard')}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    padding: isCollapsed ? '10px 0' : '9px 12px',
                    backgroundColor: '#244235',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    textDecoration: 'none',
                    textAlign: 'center',
                    transition: 'background-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  title="Sign In with Originyx"
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1a3026'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#244235'}
                >
                  {isCollapsed ? <LogOut size={16} /> : 'Sign In with Originyx'}
                </a>
              </div>
            )}
          </div>
        </aside>

        {/* ─── Main Content Area ─── */}
        <main className="layout-main">
          {/* Top Header inside main area */}
          <header className="layout-header">
            <div className="header-left">
              {/* Sidebar toggle button */}
              <button
                type="button"
                className="header-toggle-btn"
                onClick={toggleSidebar}
                aria-label={
                  isMobileOpen
                    ? 'Close navigation sidebar'
                    : isCollapsed
                    ? 'Expand navigation sidebar'
                    : 'Collapse navigation sidebar'
                }
                aria-expanded={window.innerWidth < 768 ? isMobileOpen : !isCollapsed}
                aria-controls="portal-sidebar"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <Menu size={20} strokeWidth={2} />
              </button>

              {/* Mobile brand presentation */}
              <a href="/dashboard" className="header-mobile-brand">
                <img src="/logo.png" alt="Logo" style={{ height: '18px', width: 'auto' }} />
                <img src="/brand.png" alt="Originyx" style={{ height: '12px', width: 'auto' }} />
              </a>

              {/* Desktop Workspace badge */}
              <span className="header-title-badge">Client Portal</span>
            </div>

            <div className="header-right">
              {/* Go to Website */}
              <a
                href="https://originyx.in"
                target="_blank"
                rel="noopener noreferrer"
                className="go-website-link"
                title="Visit main website (opens in new tab)"
              >
                <span>Go to Website</span>
                <ExternalLink size={14} strokeWidth={2} />
              </a>

              {/* User Avatar dropdown */}
              {user && (
                <div className="header-user-menu-container" ref={userMenuRef}>
                  <button
                    type="button"
                    className="header-avatar-btn"
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    aria-label="User account menu"
                    aria-expanded={userMenuOpen}
                    title={`${userName} (${user.email})`}
                  >
                    <div className="user-avatar-circle" style={{ width: '34px', height: '34px', fontSize: '12px' }}>
                      {getInitials(user?.email || '')}
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="header-dropdown-menu" role="menu">
                      <div className="header-dropdown-user">
                        <p className="header-dropdown-user-name">{userName}</p>
                        <p className="header-dropdown-user-email">{user?.email}</p>
                      </div>
                      <NavLink
                        to="/account"
                        className="header-dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                        role="menuitem"
                      >
                        <User size={15} />
                        <span>Account Settings</span>
                        <ChevronRight size={13} style={{ marginLeft: 'auto', color: '#a0a09c' }} />
                      </NavLink>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="header-dropdown-item danger"
                        role="menuitem"
                      >
                        <LogOut size={15} style={{ transform: 'rotate(180deg)' }} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
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
