import { useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { Menu, X } from 'lucide-react';

interface TopNavLayoutProps {
  children: ReactNode;
}

export default function TopNavLayout({ children }: TopNavLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || 'U';
    return name.charAt(0).toUpperCase();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Workspace', to: '/dashboard' },
    { label: 'Account', to: '/account' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary font-sans">
      {/* Top Navigation — mirrors originyx.in header */}
      <header className="sticky top-0 z-40 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[68px] flex items-center justify-between gap-8">
          {/* Logo */}
          <NavLink to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Originyx Logo" className="h-6 w-auto" />
              <img src="/brand.png" alt="Originyx" className="h-4 w-auto" />
            </div>
          </NavLink>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  'text-[0.9rem] font-medium transition-colors duration-150 relative pb-0.5 ' +
                  (isActive
                    ? 'text-text-primary after:absolute after:bottom-[-22px] after:left-0 after:right-0 after:h-[2px] after:bg-accent'
                    : 'text-text-secondary hover:text-text-primary')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: User avatar + dropdown */}
          <div className="hidden md:flex items-center gap-4 relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold border border-accent/20 transition-colors group-hover:bg-accent/15">
                {getInitials()}
              </div>
              <svg
                className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-12 z-40 w-56 bg-surface border border-border rounded-xl shadow-lg overflow-hidden">
                  <div className="px-4 py-3.5 border-b border-border">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {user?.user_metadata?.full_name || 'Client'}
                    </p>
                    <p className="text-xs text-text-muted truncate mt-0.5 font-mono">{user?.email}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/account'); }}
                      className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
                    >
                      Account Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-sm text-rose hover:bg-rose/5 rounded-lg transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-surface">
            <nav className="px-6 py-4 space-y-1">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    'block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ' +
                    (isActive
                      ? 'bg-accent text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary')
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="px-6 py-4 border-t border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold border border-accent/20">
                  {getInitials()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {user?.user_metadata?.full_name || 'Client'}
                  </p>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-rose font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main>
        {children}
      </main>
    </div>
  );
}
