import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus, Search, CheckSquare, Square, Clock, AlertCircle,
  X, Trash2, Edit2
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getOCEClient } from '../lib/sdk';
import { classifyDbError } from '../lib/dbErrors';

type TaskStatus = 'To Do' | 'In Progress' | 'Blocked' | 'Completed' | 'Cancelled';
type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  area?: string;
  due_date?: string;
  assignee_id?: string;
  org_id: string;
  created_at: string;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; dot: string }> = {
  'To Do':      { label: 'To Do',      color: 'text-gray-600 bg-gray-100',   dot: 'bg-gray-400' },
  'In Progress':{ label: 'In Progress',color: 'text-blue-700 bg-blue-100',   dot: 'bg-blue-500' },
  'Blocked':    { label: 'Blocked',    color: 'text-red-700 bg-red-100',     dot: 'bg-red-500' },
  'Completed':  { label: 'Completed',  color: 'text-green-700 bg-green-100', dot: 'bg-green-500' },
  'Cancelled':  { label: 'Cancelled',  color: 'text-gray-400 bg-gray-50',   dot: 'bg-gray-300' },
};

const PRIORITY_CONFIG: Record<TaskPriority, { color: string }> = {
  Critical: { color: 'text-red-600 bg-red-50 border-red-200' },
  High:     { color: 'text-orange-600 bg-orange-50 border-orange-200' },
  Medium:   { color: 'text-amber-600 bg-amber-50 border-amber-200' },
  Low:      { color: 'text-gray-500 bg-gray-50 border-gray-200' },
};

const AREAS = ['Sales', 'Growth', 'Product', 'Operations', 'Finance', 'Admin', 'HR', 'Legal', 'Other'];

interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  area: string;
  due_date: string;
}

const EMPTY_FORM: TaskFormData = {
  title: '', description: '', status: 'To Do',
  priority: 'Medium', area: '', due_date: '',
};

export default function MyWork() {
  const { user, systemStatus } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [showForm, setShowForm] = useState(searchParams.get('new') === '1');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TaskFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const orgId = systemStatus?.organization?.id;
  const sdk = getOCEClient();

  const loadTasks = useCallback(async () => {
    if (!orgId || !user) return;
    setLoading(true);
    setError(null);
    try {
      let query = sdk.supabase
        .from('internal_tasks')
        .select('*')
        .eq('org_id', orgId)
        .eq('assignee_id', user.id)
        .order('due_date', { ascending: true, nullsFirst: false });

      if (filterStatus === 'active') {
        query = query.in('status', ['To Do', 'In Progress', 'Blocked']);
      } else if (filterStatus === 'completed') {
        query = query.in('status', ['Completed', 'Cancelled']);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTasks((data as Task[]) ?? []);
    } catch (e: any) {
      setError(classifyDbError(e).message);
    } finally {
      setLoading(false);
    }
  }, [orgId, user, filterStatus]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleSave = async () => {
    if (!form.title.trim() || !orgId || !user) return;
    setSaving(true);
    try {
      const payload = {
        org_id: orgId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        priority: form.priority,
        area: form.area || null,
        due_date: form.due_date || null,
        assignee_id: user.id,
        created_by: user.id,
      };

      if (editingId) {
        const { error } = await sdk.supabase
          .from('internal_tasks')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await sdk.supabase
          .from('internal_tasks')
          .insert(payload);
        if (error) throw error;
      }

      setForm(EMPTY_FORM);
      setShowForm(false);
      setEditingId(null);
      setSearchParams({});
      await loadTasks();
    } catch (e: any) {
      alert('Failed to save task: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (task: Task) => {
    const newStatus: TaskStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    try {
      const { error } = await sdk.supabase
        .from('internal_tasks')
        .update({
          status: newStatus,
          completed_at: newStatus === 'Completed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', task.id);
      if (error) throw error;
      await loadTasks();
    } catch (e: any) {
      alert('Failed to update task: ' + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      const { error } = await sdk.supabase
        .from('internal_tasks')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await loadTasks();
    } catch (e: any) {
      alert('Failed to delete task: ' + e.message);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      area: task.area || '',
      due_date: task.due_date || '',
    });
    setShowForm(true);
  };

  const filtered = tasks.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  );

  const today = new Date().toISOString().split('T')[0];
  const isOverdue = (task: Task) => task.due_date && task.due_date < today && task.status !== 'Completed';

  return (
    <div className="min-h-full bg-[#f5f5f4]">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Work</h1>
            <p className="text-sm text-gray-500 mt-0.5">Your tasks and personal work queue.</p>
          </div>
          <button
            onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#244235] text-white rounded-lg text-sm font-medium hover:bg-[#1a3026] transition-colors"
          >
            <Plus size={15} />
            New Task
          </button>
        </div>

        {/* Add/Edit Task Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 text-sm">{editingId ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }}
                className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Task title *"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#244235] focus:ring-1 focus:ring-[#244235]/20"
                autoFocus
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#244235] focus:ring-1 focus:ring-[#244235]/20 resize-none"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value as TaskStatus })}
                    className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#244235]"
                  >
                    {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value as TaskPriority })}
                    className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#244235]"
                  >
                    {Object.keys(PRIORITY_CONFIG).map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Area</label>
                  <select
                    value={form.area}
                    onChange={e => setForm({ ...form, area: e.target.value })}
                    className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#244235]"
                  >
                    <option value="">— None —</option>
                    {AREAS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Due date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={e => setForm({ ...form, due_date: e.target.value })}
                    className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#244235]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.title.trim() || saving}
                  className="px-4 py-2 text-sm font-medium bg-[#244235] text-white rounded-lg hover:bg-[#1a3026] disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
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

        {/* Error */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-start gap-3">
            <AlertCircle size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">{error}</p>
          </div>
        )}

        {/* Task List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#244235]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
            <CheckSquare size={28} className="mx-auto text-gray-200 mb-3" />
            <p className="font-medium text-gray-500 text-sm">
              {search ? `No tasks matching "${search}"` : filterStatus === 'active' ? 'All caught up! No active tasks.' : 'No tasks here.'}
            </p>
            {!search && filterStatus === 'active' && (
              <button
                onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }}
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#244235] hover:underline font-medium"
              >
                <Plus size={13} /> Create a task
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
            {filtered.map(task => {
              const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG['To Do'];
              const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium;
              const overdue = isOverdue(task);
              return (
                <div key={task.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors group">
                  <button
                    onClick={() => handleStatusToggle(task)}
                    className="mt-0.5 flex-shrink-0 text-gray-300 hover:text-[#244235] transition-colors"
                  >
                    {task.status === 'Completed'
                      ? <CheckSquare size={16} className="text-green-500" />
                      : <Square size={16} />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-medium ${task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${sc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${pc.color}`}>
                        {task.priority}
                      </span>
                      {task.area && <span className="text-[11px] text-gray-400">{task.area}</span>}
                      {task.due_date && (
                        <span className={`flex items-center gap-0.5 text-[11px] ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                          <Clock size={10} />
                          {overdue ? 'Overdue · ' : ''}
                          {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-[12px] text-gray-400 mt-1 truncate">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
