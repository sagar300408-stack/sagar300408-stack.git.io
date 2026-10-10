import type { ReactNode } from 'react';
import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Inbox, Calendar,
  Users, TrendingUp, Target, Handshake, DollarSign,
  Megaphone, FileText, Share2, Radio, BarChart2,
  Package, Layers, GitBranch, Box,
  FolderKanban, ListTodo, Network, Archive, Activity,
  PieChart, Receipt, Wallet, CreditCard,
  Building2, UserCheck, Truck, Plug, Settings,
  ShieldCheck, Lock, Eye, Terminal,
  LogOut, ChevronDown, Search, Bell, Menu, X,
  ImageIcon, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { getOCEClient } from '../../lib/sdk';

interface SidebarLayoutProps {
  children: ReactNode;
}

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  items: NavItem[];
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  badge?: string;
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'COMMAND',
    icon: LayoutDashboard,
    items: [
      { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
      { name: 'My Work', path: '/my-work', icon: CheckSquare },
      { name: 'Inbox', path: '/inbox', icon: Inbox },
      { name: 'Calendar', path: '/calendar', icon: Calendar },
    ],
  },
  {
    label: 'BUSINESS',
    icon: TrendingUp,
    items: [
      { name: 'Leads', path: '/leads', icon: Users },
      { name: 'Prospects', path: '/prospects', icon: Target },
      { name: 'Customers', path: '/customers', icon: Building2 },
      { name: 'Opportunities', path: '/opportunities', icon: TrendingUp },
      { name: 'Partnerships', path: '/partnerships', icon: Handshake },
      { name: 'Revenue', path: '/revenue', icon: DollarSign },
    ],
  },
  {
    label: 'GROWTH',
    icon: Megaphone,
    items: [
      { name: 'Marketing', path: '/marketing', icon: Megaphone },
      { name: 'Content', path: '/content', icon: FileText },
      { name: 'Social', path: '/social', icon: Share2 },
      { name: 'Campaigns', path: '/campaigns', icon: Radio },
      { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    ],
  },
  {
    label: 'PRODUCTS',
    icon: Package,
    items: [
      { name: 'Product Portfolio', path: '/products', icon: Package },
      { name: 'Subscriptions', path: '/subscriptions', icon: Layers },
      { name: 'Roadmaps', path: '/roadmaps', icon: GitBranch },
      { name: 'Releases', path: '/releases', icon: Box },
    ],
  },
  {
    label: 'OPERATIONS',
    icon: FolderKanban,
    items: [
      { name: 'Projects', path: '/projects', icon: FolderKanban },
      { name: 'Tasks', path: '/tasks', icon: ListTodo },
      { name: 'Processes', path: '/processes', icon: Network },
      { name: 'Documents', path: '/documents', icon: Archive },
      { name: 'Insights (CMS)', path: '/insights', icon: FileText },
      { name: 'Media Library', path: '/media', icon: ImageIcon },
    ],
  },
  {
    label: 'FINANCE',
    icon: PieChart,
    items: [
      { name: 'Financial Overview', path: '/finance', icon: PieChart },
      { name: 'Invoices', path: '/invoices', icon: Receipt },
      { name: 'Expenses', path: '/expenses', icon: Wallet },
      { name: 'Payments', path: '/payments', icon: CreditCard },
    ],
  },
  {
    label: 'COMPANY',
    icon: Building2,
    items: [
      { name: 'Company Profile', path: '/company', icon: Building2 },
      { name: 'Team', path: '/team', icon: UserCheck },
      { name: 'Vendors', path: '/vendors', icon: Truck },
      { name: 'Integrations', path: '/integrations', icon: Plug },
      { name: 'Settings', path: '/settings', icon: Settings },
    ],
  },
  {
    label: 'ADMINISTRATION',
    icon: ShieldCheck,
    items: [
      { name: 'Admin Users', path: '/admin-users', icon: ShieldCheck },
      { name: 'Roles & Permissions', path: '/roles', icon: Lock },
      { name: 'Security', path: '/security', icon: Eye },
      { name: 'Audit Log', path: '/audit', icon: Activity },
      { name: 'System', path: '/system', icon: Terminal },
    ],
  },
];

// Pages that are fully built vs. coming soon
const BUILT_PATHS = new Set([
  '/dashboard', '/insights', '/media', '/settings',
  '/leads', '/customers', '/opportunities', '/products', '/subscriptions',
  '/projects', '/tasks', '/my-work',
]);

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(NAV_GROUPS.map(g => g.label)) // All expanded by default
  );
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Keyboard shortcut Ctrl+K for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Click outside to close search
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };
    if (searchOpen) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [searchOpen]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const sdk = getOCEClient();
        const q = searchQuery.toLowerCase();

        // Search leads
        const { data: leadData } = await sdk.supabase
          .from('leads')
          .select('id, name, company, status')
          .or(`name.ilike.%${q}%,company.ilike.%${q}%,email.ilike.%${q}%`)
          .limit(4);

        // Search contacts
        const { data: contactData } = await sdk.supabase
          .from('contacts')
          .select('id, name, company, email')
          .or(`name.ilike.%${q}%,company.ilike.%${q}%,email.ilike.%${q}%`)
          .limit(4);

        // Search opportunities
        const { data: oppData } = await sdk.supabase
          .from('opportunities')
          .select('id, name, company, stage')
          .or(`name.ilike.%${q}%,company.ilike.%${q}%`)
          .limit(4);

        // Search customers (organizations)
        const { data: custData } = await sdk.supabase
          .from('organizations')
          .select('id, name, slug')
          .ilike('name', `%${q}%`)
          .limit(4);

        const results: any[] = [];
        if (leadData?.length) results.push({ type: 'Leads', items: leadData.map(l => ({ ...l, path: `/leads/${l.id}`, label: l.name, sub: l.company || l.status })) });
        if (contactData?.length) results.push({ type: 'Contacts', items: contactData.map(c => ({ ...c, path: `/contacts/${c.id}`, label: c.name, sub: c.company || c.email })) });
        if (oppData?.length) results.push({ type: 'Opportunities', items: oppData.map(o => ({ ...o, path: `/opportunities/${o.id}`, label: o.name, sub: o.company || o.stage })) });
        if (custData?.length) results.push({ type: 'Customers', items: custData.map(c => ({ ...c, path: `/customers/${c.id}`, label: c.name, sub: c.slug })) });

        setSearchResults(results);
      } catch (e) {
        console.error('Search error', e);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={`h-14 flex items-center border-b border-gray-200 flex-shrink-0 ${collapsed ? 'px-3 justify-center' : 'px-5'}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
              <img src="/admin/logo.png" alt="Originyx Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-900 leading-tight">Originyx</p>
              <p className="text-[10px] text-gray-400 leading-tight tracking-wide">Control Center</p>
            </div>
          </div>
        ) : (
          <div className="w-7 h-7 flex items-center justify-center">
            <img src="/admin/logo.png" alt="Originyx Logo" className="w-full h-full object-contain" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {NAV_GROUPS.map((group) => {
          const isExpanded = expandedGroups.has(group.label);
          return (
            <div key={group.label} className="mb-1">
              {/* Group Header */}
              {!collapsed ? (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-4 py-1.5 text-[10px] font-semibold text-gray-400 tracking-wider hover:text-gray-600 transition-colors"
                >
                  {group.label}
                  <ChevronRight
                    size={11}
                    className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>
              ) : (
                <div className="h-px bg-gray-100 mx-2 my-2" />
              )}

              {/* Group Items */}
              {(isExpanded || collapsed) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isBuilt = BUILT_PATHS.has(item.path);
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        title={collapsed ? item.name : undefined}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 transition-colors text-[13px] font-medium mx-1.5 rounded-md
                          ${collapsed ? 'px-2.5 py-2.5 justify-center' : 'px-3 py-2'}
                          ${isActive
                            ? 'bg-[#244235]/10 text-[#244235]'
                            : isBuilt
                              ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              : 'text-gray-400 hover:bg-gray-50 hover:text-gray-500'
                          }`
                        }
                      >
                        <Icon size={15} strokeWidth={1.75} className="flex-shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">{item.name}</span>
                            {!isBuilt && (
                              <span className="text-[9px] uppercase tracking-wider text-gray-300 font-semibold">Soon</span>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="border-t border-gray-200 p-3 flex-shrink-0">
        <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-[#244235]/15 text-[#244235] flex items-center justify-center font-semibold text-xs flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-gray-900 truncate">{displayName}</p>
              <p className="text-[11px] text-gray-400 capitalize">{role || 'member'}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen flex bg-[#f5f5f4] overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-200 z-20
          ${collapsed ? 'w-14' : 'w-56'}`}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ───────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-56 bg-white flex flex-col h-full shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main Content Area ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top Header ─────────────────────────────────────────────── */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center gap-3 px-4 flex-shrink-0 z-10">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
          >
            <Menu size={18} />
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu size={17} />
          </button>

          {/* Search */}
          <div className="flex-1 relative" ref={searchRef}>
            <button
              onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-500 text-[13px] transition-colors w-full max-w-sm"
            >
              <Search size={14} />
              <span className="flex-1 text-left">Search Originyx...</span>
              <kbd className="text-[10px] text-gray-400 border border-gray-300 rounded px-1 py-0.5 hidden sm:inline">⌘K</kbd>
            </button>

            {/* Search Modal */}
            {searchOpen && (
              <div className="absolute top-0 left-0 right-0 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-full max-w-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                  <Search size={16} className="text-gray-400 flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search leads, customers, opportunities..."
                    className="flex-1 text-[14px] text-gray-900 outline-none placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="text-gray-400 hover:text-gray-600">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {searchLoading && (
                    <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#244235] mr-2" />
                      Searching...
                    </div>
                  )}
                  {!searchLoading && searchQuery && searchResults.length === 0 && (
                    <div className="py-8 text-center text-gray-400 text-sm">No results for "{searchQuery}"</div>
                  )}
                  {!searchLoading && searchResults.map(group => (
                    <div key={group.type}>
                      <div className="px-4 py-2 text-[11px] font-semibold text-gray-400 tracking-wider uppercase bg-gray-50">
                        {group.type}
                      </div>
                      {group.items.map((item: any) => (
                        <button
                          key={item.id}
                          onClick={() => { navigate(item.path); setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors"
                        >
                          <div className="flex-1">
                            <p className="text-[13px] font-medium text-gray-900">{item.label}</p>
                            {item.sub && <p className="text-[11px] text-gray-400">{item.sub}</p>}
                          </div>
                          <ChevronRight size={12} className="text-gray-300" />
                        </button>
                      ))}
                    </div>
                  ))}
                  {!searchQuery && (
                    <div className="py-6 text-center text-gray-400 text-sm">
                      <Search size={20} className="mx-auto mb-2 opacity-30" />
                      Type to search across leads, customers, opportunities...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <Bell size={17} />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-semibold text-[13px] text-gray-900">Notifications</span>
                  <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                </div>
                <div className="py-8 text-center text-gray-400 text-sm">
                  <Bell size={20} className="mx-auto mb-2 opacity-30" />
                  No new notifications
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#244235]/15 text-[#244235] flex items-center justify-center font-semibold text-[11px]">
                {initials}
              </div>
              <ChevronDown size={13} className="text-gray-400 hidden sm:block" />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-[13px] font-medium text-gray-900 truncate">{displayName}</p>
                  <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Settings size={14} />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ── Page Content ─────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
