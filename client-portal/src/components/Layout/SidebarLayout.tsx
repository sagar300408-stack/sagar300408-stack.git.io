import { useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User as UserIcon, Menu, X, Crosshair } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

interface SidebarLayoutProps {
  children: ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Account', path: '/account', icon: UserIcon },
  ];

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || 'U';
    return name.charAt(0).toUpperCase();
  };

  const userName = user?.user_metadata?.full_name || 'Client';

  const Logo = () => (
    <div className="flex items-center gap-2">
      <Crosshair className="text-accent" size={22} strokeWidth={2.5} />
      <span className="font-sans font-bold text-[1.1rem] tracking-[0.2em] text-accent-dark uppercase mt-0.5">
        Originyx
      </span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg-primary font-sans selection:bg-accent/20">
      {/* Mobile Top Navigation */}
      <div className="md:hidden flex items-center justify-between h-16 px-6 bg-surface border-b border-border z-30">
        <Logo />
        <button onClick={toggleMenu} className="p-2 text-text-secondary hover:text-accent rounded-full transition-colors">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-text-primary/10 backdrop-blur-sm z-20 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={
          "fixed md:static inset-y-0 left-0 z-30 " +
          "w-72 bg-surface border-r border-border " +
          "flex flex-col flex-shrink-0 transition-transform duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.02)] md:shadow-none " +
          (mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0')
        }
      >
        {/* Desktop Logo */}
        <div className="hidden md:flex h-24 px-8 items-center">
          <Logo />
        </div>
        
        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-2 px-6">
          <div className="font-mono text-[10px] font-bold tracking-[0.15em] text-text-muted uppercase mb-4 ml-2">
            Client Portal
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink 
                key={item.name} 
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => 
                  "group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-full transition-all duration-200 " +
                  (isActive 
                    ? "bg-accent text-white shadow-sm" 
                    : "text-text-secondary hover:text-accent hover:bg-bg-secondary")
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={18} className={isActive ? "text-white/90" : "text-text-muted group-hover:text-accent/70"} />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Profile */}
        <div className="p-6">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-bg-secondary border border-border/50">
            <div className="w-9 h-9 rounded-full bg-surface text-accent flex items-center justify-center font-bold text-sm flex-shrink-0 border border-border shadow-sm">
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{userName}</p>
              <p className="text-[11px] text-text-muted truncate font-mono">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-bg-primary">
        <main className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-16">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
