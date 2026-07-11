import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Image as ImageIcon, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

interface SidebarLayoutProps {
  children: ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Media Library', path: '/media', icon: ImageIcon },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const disabledItems = [
    { name: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="h-screen flex bg-bg-secondary overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col flex-shrink-0 z-20">
        {/* Logo */}
        <div className="h-16 px-6 flex items-center border-b border-border">
          <span className="font-serif font-semibold text-xl text-text-primary tracking-tight">Originyx CMS</span>
        </div>
        
        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink 
                key={item.name} 
                to={item.path}
                end
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? 'bg-accent/10 text-accent' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`
                }
              >
                <item.icon size={18} />
                {item.name}
              </NavLink>
            ))}
            
            {/* Disabled nav items */}
            {disabledItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-text-muted cursor-not-allowed opacity-50"
                title={`${item.name} — Coming Soon`}
              >
                <item.icon size={18} />
                {item.name}
                <span className="ml-auto text-[9px] uppercase tracking-wider bg-bg-primary px-1.5 py-0.5 rounded border border-border font-semibold">
                  Soon
                </span>
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile / Logout */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user?.email}</p>
              <p className="text-xs text-text-muted capitalize">{role || 'member'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
