import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, FolderKanban, Calendar, Clock,
  AlertCircle, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getOCEClient } from '../lib/sdk';
import { classifyDbError } from '../lib/dbErrors';

type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  due_date: string | null;
  owner_id: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<ProjectStatus, { bg: string; text: string }> = {
  Planning:   { bg: 'bg-blue-100',    text: 'text-blue-700' },
  Active:     { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'On Hold':  { bg: 'bg-amber-100',   text: 'text-amber-700' },
  Completed:  { bg: 'bg-gray-100',    text: 'text-gray-600' },
  Cancelled:  { bg: 'bg-gray-100',    text: 'text-gray-600' },
};

const PRIORITY_COLORS: Record<Priority, string> = {
  Critical: 'text-red-600 bg-red-50 border-red-200',
  High:     'text-orange-600 bg-orange-50 border-orange-200',
  Medium:   'text-amber-600 bg-amber-50 border-amber-200',
  Low:      'text-gray-500 bg-gray-50 border-gray-200',
};

export default function Projects() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const sdk = getOCEClient();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true); setError(null);
    try {
      const { data, error } = await sdk.supabase
        .from('projects')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProjects((data as Project[]) ?? []);
    } catch (e: any) {
      setError(classifyDbError(e).message);
    } finally { setLoading(false); }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  const filtered = projects.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full bg-[#f5f5f4] flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage large initiatives and operational projects.</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#244235] text-white rounded-lg text-sm font-medium hover:bg-[#1a3026] transition-colors"
          onClick={() => alert("Project creator coming soon.")}
        >
          <Plus size={15} /> New Project
        </button>
      </div>

      <div className="flex-1 p-6 w-full max-w-6xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative max-w-sm w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#244235]"
            />
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
            <FolderKanban size={32} className="mx-auto text-gray-200 mb-4" />
            <p className="font-medium text-gray-500 text-sm">No projects found</p>
            <p className="text-xs text-gray-400 mt-1">Create your first operational project.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(project => {
              const sc = STATUS_CONFIG[project.status] || STATUS_CONFIG.Planning;
              return (
                <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${sc.bg} ${sc.text}`}>
                      {project.status}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${PRIORITY_COLORS[project.priority] || PRIORITY_COLORS.Medium}`}>
                      {project.priority}
                    </span>
                  </div>
                  
                  <div className="flex-1 mb-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2 mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        <span>Due: {project.due_date ? new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}</span>
                      </div>
                      {project.status === 'Completed' ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : (
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-gray-400" />
                          <span>Active</span>
                        </div>
                      )}
                    </div>
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
