import type { ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Image as ImageIcon, Tag, Hash, BarChart3, Settings, Users, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

interface SidebarLayoutProps {
  children: ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Insights', path: '/dashboard', icon: FileText, exact: true }, // Using dashboard as insights list for now
    { name: 'Media Library', path: '/media', icon: ImageIcon },
    { name: 'Categories', path: '#', icon: Tag, disabled: true },
    { name: 'Tags', path: '#', icon: Hash, disabled: true },
    { name: 'Analytics', path: '#', icon: BarChart3, disabled: true },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (role === 'owner') {
    navItems.push({ name: 'Users', path: '#', icon: Users, disabled: true });
  }

  // Create breadcrumbs based on location
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return ['Dashboard', 'Insights'];
    if (path.includes('/media')) return ['Media Library'];
    if (path.includes('/settings')) return ['Settings'];
    return ['Dashboard'];
  };

  return (
    <div className="h-screen flex bg-bg-secondary overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col flex-shrink-0 z-20">
        <div className="h-16 px-6 flex items-center border-b border-border">
          <span className="font-serif font-semibold text-xl text-text-primary tracking-tight">Originyx CMS</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              item.disabled ? (
                <div key={item.name} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-text-muted cursor-not-allowed opacity-60">
                  <item.icon size={18} />
                  {item.name}
                  <span className="ml-auto text-[10px] uppercase tracking-wider bg-bg-primary px-1.5 py-0.5 rounded border border-border">Soon</span>
                </div>
              ) : (
                <NavLink 
                  key={item.name} 
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive 
                        ? 'bg-accent/10 text-accent-dark' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }`
                  }
                >
                  <item.icon size={18} />
                  {item.name}
                </NavLink>
              )
            ))}
          </nav>
        </div>

        {/* User Profile / Logout */}
        <div className="p-4 border-t border-border bg-bg-primary/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 text-accent-dark flex items-center justify-center font-bold text-xs">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user?.email}</p>
              <p className="text-xs text-text-muted capitalize">{role || 'Unknown'} Role</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red hover:text-red-dark hover:bg-red/10 rounded-md transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-surface border-b border-border flex items-center px-8 z-10 flex-shrink-0">
          <div className="flex items-center text-sm font-medium text-text-secondary">
            {getBreadcrumbs().map((crumb, index, arr) => (
              <div key={crumb} className="flex items-center">
                <span className={index === arr.length - 1 ? 'text-text-primary' : ''}>
                  {crumb}
                </span>
                {index < arr.length - 1 && <ChevronRight size={16} className="mx-2 text-text-muted" />}
              </div>
            ))}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
