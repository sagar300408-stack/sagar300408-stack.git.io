import { useState, useEffect, useCallback } from 'react';
import {
  ListTodo, Search, CheckSquare, Clock, AlertCircle, Plus, Square
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getOCEClient } from '../lib/sdk';
import { classifyDbError } from '../lib/dbErrors';

type TaskStatus = 'To Do' | 'In Progress' | 'Blocked' | 'Completed' | 'Cancelled';
type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  area?: string;
  due_date?: string;
  assignee?: { email: string };
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; dot: string }> = {
  'To Do':      { label: 'To Do',      color: 'text-gray-600 bg-gray-100',   dot: 'bg-gray-400' },
  'In Progress':{ label: 'In Progress',color: 'text-blue-700 bg-blue-100',   dot: 'bg-blue-500' },
  'Blocked':    { label: 'Blocked',    color: 'text-red-700 bg-red-100',     dot: 'bg-red-500' },
  'Completed':  { label: 'Completed',  color: 'text-green-700 bg-green-100', dot: 'bg-green-500' },
  'Cancelled':  { label: 'Cancelled',  color: 'text-gray-400 bg-gray-50',   dot: 'bg-gray-300' },
};

export default function Tasks() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const sdk = getOCEClient();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('active');

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true); setError(null);
    try {
      let q = sdk.supabase
        .from('internal_tasks')
        .select(`
          id, title, status, priority, area, due_date,
          assignee:assignee_id(email)
        `)
        .eq('org_id', orgId)
        .order('due_date', { ascending: true, nullsFirst: false });

      if (filterStatus === 'active') {
        q = q.in('status', ['To Do', 'In Progress', 'Blocked']);
      } else if (filterStatus === 'completed') {
        q = q.in('status', ['Completed', 'Cancelled']);
      }

      const { data, error } = await q;
      if (error) throw error;
      setTasks((data as unknown as Task[]) ?? []); // Needs cast due to join
    } catch (e: any) {
      setError(classifyDbError(e).message);
    } finally { setLoading(false); }
  }, [orgId, filterStatus]);

  useEffect(() => { load(); }, [load]);

  const filtered = tasks.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full bg-[#f5f5f4] flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">All Tasks</h1>
          <p className="text-sm text-gray-400 mt-0.5">Team-wide operational task tracking.</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#244235] text-white rounded-lg text-sm font-medium hover:bg-[#1a3026] transition-colors"
          onClick={() => alert("Task creation from master view coming soon. Use My Work for personal tasks.")}
        >
          <Plus size={15} /> New Task
        </button>
      </div>

      <div className="flex-1 p-6 w-full max-w-5xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative max-w-sm w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search all tasks..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#244235]"
            />
          </div>
          <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden">
            {[
              { id: 'active', label: 'Active' },
              { id: 'completed', label: 'Completed' },
              { id: 'all', label: 'All' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`px-3 py-2 text-[12px] font-medium transition-colors ${
                  filterStatus === f.id ? 'bg-[#244235] text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#244235]" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
            <ListTodo size={32} className="mx-auto text-gray-200 mb-4" />
            <p className="font-medium text-gray-500 text-sm">No tasks found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Task</th>
                  <th className="px-5 py-3 font-medium">Assignee</th>
                  <th className="px-5 py-3 font-medium">Area</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(task => {
                  const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG['To Do'];
                  const overdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Completed';
                  return (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {task.status === 'Completed' ? (
                            <CheckSquare size={15} className="text-green-500 flex-shrink-0" />
                          ) : (
                            <Square size={15} className="text-gray-300 flex-shrink-0" />
                          )}
                          <span className={`text-sm font-medium ${task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {task.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {task.assignee ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-[#244235]/10 text-[#244235] flex items-center justify-center text-[9px] font-bold">
                              {task.assignee.email.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs text-gray-600 truncate max-w-[120px]">{task.assignee.email}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {task.area ? <span className="text-xs text-gray-500">{task.area}</span> : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${sc.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {task.due_date ? (
                          <div className={`flex items-center gap-1.5 text-xs ${overdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            <Clock size={12} className={overdue ? 'text-red-500' : 'text-gray-400'} />
                            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
