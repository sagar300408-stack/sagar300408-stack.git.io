import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users, TrendingUp, Target, Package, Layers,
  CheckSquare, ArrowRight, Plus, AlertCircle,
  FileText, BarChart2, Clock,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getOCEClient } from '../lib/sdk';

interface DashboardStats {
  leads: number;
  customers: number;
  opportunities: number;
  activeTasks: number;
  products: number;
  subscriptions: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  details: any;
}

interface Task {
  id: string;
  title: string;
  priority: string;
  area: string;
  status: string;
  due_date: string | null;
}

const PRIORITY_COLORS: Record<string, string> = {
  Critical: 'text-red-600 bg-red-50 border-red-100',
  High: 'text-orange-600 bg-orange-50 border-orange-100',
  Medium: 'text-amber-600 bg-amber-50 border-amber-100',
  Low: 'text-gray-500 bg-gray-50 border-gray-100',
};

function Stat({ label, value, icon: Icon, to, color = '#244235' }: {
  label: string; value: number | string; icon: any; to: string; color?: string;
}) {
  return (
    <NavLink to={to} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}12` }}>
          <Icon size={17} style={{ color }} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-[12px] text-gray-400 group-hover:text-[#244235] transition-colors">
        View all <ArrowRight size={11} />
      </div>
    </NavLink>
  );
}

export default function Overview() {
  const { user, systemStatus } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    leads: 0, customers: 0, opportunities: 0, activeTasks: 0,
    products: 0, subscriptions: 0, recentActivity: [],
  });
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orgId = systemStatus?.organization?.id;

  const displayName = user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'there';

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    async function fetchStats() {
      try {
        const sdk = getOCEClient();

        // Helper: run a count query; return 0 on error and surface the error code
        async function safeCount(query: any): Promise<number> {
          const { count, error } = await query;
          if (error) {
            // Log for debugging, but don't crash the dashboard
            console.warn('[Overview] Count query error:', error.code, error.message);
            return 0;
          }
          return count ?? 0;
        }

        // Helper: run a select query; return [] on error
        async function safeSelect<T>(query: any): Promise<T[]> {
          const { data, error } = await query;
          if (error) {
            console.warn('[Overview] Select query error:', error.code, error.message);
            return [];
          }
          return (data as T[]) ?? [];
        }

        const [
          leadCount,
          custCount,
          oppCount,
          taskCount,
          prodCount,
          subCount,
          activity,
          tasks,
        ] = await Promise.all([
          safeCount(sdk.supabase.from('leads').select('id', { count: 'exact', head: true }).eq('org_id', orgId!)),
          safeCount(sdk.supabase.from('organizations').select('id', { count: 'exact', head: true }).neq('id', orgId!)),
          safeCount(sdk.supabase.from('opportunities').select('id', { count: 'exact', head: true }).eq('org_id', orgId!)),
          safeCount(sdk.supabase.from('internal_tasks').select('id', { count: 'exact', head: true }).eq('org_id', orgId!).in('status', ['To Do', 'In Progress', 'Blocked'])),
          safeCount(sdk.supabase.from('cc_products').select('id', { count: 'exact', head: true }).eq('org_id', orgId!)),
          safeCount(sdk.supabase.from('cc_subscriptions').select('id', { count: 'exact', head: true }).eq('org_id', orgId!).eq('status', 'Active')),
          safeSelect<ActivityItem>(sdk.supabase.from('cms_activity_log').select('id, action, entity_type, created_at, details').eq('org_id', orgId!).order('created_at', { ascending: false }).limit(8)),
          safeSelect<Task>(sdk.supabase.from('internal_tasks').select('id, title, priority, area, status, due_date').eq('org_id', orgId!).eq('assignee_id', user!.id).in('status', ['To Do', 'In Progress', 'Blocked']).order('due_date', { ascending: true, nullsFirst: false }).limit(5)),
        ]);

        setStats({
          leads: leadCount,
          customers: custCount,
          opportunities: oppCount,
          activeTasks: taskCount,
          products: prodCount,
          subscriptions: subCount,
          recentActivity: activity,
        });
        setMyTasks(tasks);
      } catch (e: any) {
        console.error('Dashboard stats error', e);
        setError(e.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [orgId, user]);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffM = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffM < 1) return 'just now';
    if (diffM < 60) return `${diffM}m ago`;
    if (diffM < 1440) return `${Math.floor(diffM / 60)}h ago`;
    return d.toLocaleDateString();
  };

  const formatAction = (action: string, entityType: string) => {
    const verb = action.replace(/_/g, ' ').toLowerCase();
    return `${verb} · ${entityType.replace(/_/g, ' ')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#244235]" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f5f5f4]">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            {getGreeting()}, {displayName.split(' ')[0]}.
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Setup required</p>
              <p className="text-xs text-amber-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Business Pulse Stats */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Business Pulse</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <Stat label="Leads" value={stats.leads} icon={Users} to="/leads" color="#6366f1" />
            <Stat label="Customers" value={stats.customers} icon={Target} to="/customers" color="#244235" />
            <Stat label="Opportunities" value={stats.opportunities} icon={TrendingUp} to="/opportunities" color="#f59e0b" />
            <Stat label="Active Tasks" value={stats.activeTasks} icon={CheckSquare} to="/tasks" color="#10b981" />
            <Stat label="Products" value={stats.products} icon={Package} to="/products" color="#8b5cf6" />
            <Stat label="Subscriptions" value={stats.subscriptions} icon={Layers} to="/subscriptions" color="#3b82f6" />
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* My Work (Left Column - 3 units wide) */}
          <section className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <CheckSquare size={15} className="text-gray-500" />
                  <h2 className="font-semibold text-gray-900 text-sm">My Work</h2>
                  {myTasks.length > 0 && (
                    <span className="text-[11px] font-medium text-white bg-[#244235] rounded-full w-5 h-5 flex items-center justify-center">
                      {myTasks.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <NavLink to="/my-work" className="text-[12px] text-[#244235] hover:underline font-medium">View all</NavLink>
                  <NavLink
                    to="/my-work?new=1"
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#244235] text-white rounded-lg text-[12px] font-medium hover:bg-[#1a3026] transition-colors"
                  >
                    <Plus size={12} />
                    Add task
                  </NavLink>
                </div>
              </div>

              {myTasks.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckSquare size={24} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-sm font-medium text-gray-500">No tasks assigned to you</p>
                  <p className="text-xs text-gray-400 mt-1">Tasks assigned to you will appear here.</p>
                  <NavLink
                    to="/my-work?new=1"
                    className="inline-flex items-center gap-1.5 mt-4 text-sm text-[#244235] hover:underline font-medium"
                  >
                    <Plus size={13} />
                    Create your first task
                  </NavLink>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {myTasks.map(task => (
                    <NavLink
                      key={task.id}
                      to={`/tasks/${task.id}`}
                      className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                    >
                      <CheckSquare size={15} className="text-gray-300 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-gray-900 truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {task.area && <span className="text-[11px] text-gray-400">{task.area}</span>}
                          {task.due_date && (
                            <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                              <Clock size={10} />
                              {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium}`}>
                        {task.priority}
                      </span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Recent Activity (Right Column - 2 units wide) */}
          <section className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <BarChart2 size={15} className="text-gray-500" />
                  <h2 className="font-semibold text-gray-900 text-sm">Recent Activity</h2>
                </div>
              </div>

              {stats.recentActivity.length === 0 ? (
                <div className="py-12 text-center">
                  <BarChart2 size={24} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-sm font-medium text-gray-500">No recent activity</p>
                  <p className="text-xs text-gray-400 mt-1">Actions across the platform will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {stats.recentActivity.map(item => (
                    <div key={item.id} className="px-5 py-3.5 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#244235] mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-gray-700 truncate">
                          {formatAction(item.action, item.entity_type)}
                        </p>
                        {item.details?.title && (
                          <p className="text-[11px] text-gray-400 truncate">{item.details.title}</p>
                        )}
                        <p className="text-[11px] text-gray-400 mt-0.5">{formatTime(item.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: 'Add Lead', to: '/leads?new=1', icon: Users },
                  { label: 'New Opportunity', to: '/opportunities?new=1', icon: TrendingUp },
                  { label: 'Create Task', to: '/my-work?new=1', icon: CheckSquare },
                  { label: 'Write Insight', to: '/editor/new', icon: FileText },
                ].map(({ label, to, icon: Icon }) => (
                  <NavLink
                    key={label}
                    to={to}
                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-[#244235] rounded-lg transition-colors"
                  >
                    <Icon size={14} className="text-gray-400" />
                    {label}
                    <ArrowRight size={12} className="ml-auto text-gray-300" />
                  </NavLink>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
