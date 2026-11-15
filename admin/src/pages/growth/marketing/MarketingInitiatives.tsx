import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Briefcase, Plus, Clock, DollarSign, Calendar,
  CheckSquare, Trash2, Edit2, Search, ChevronDown,
  ChevronUp, X, Check, ListTodo, User
} from 'lucide-react';
import { useAuth } from '../../../lib/AuthContext';
import {
  getOCEClient,
  type MarketingInitiative,
  type InitiativeStatus,
  type InitiativePriority,
  type MarketingObjective,
  type MarketingChannel,
  type MarketingExperiment,
} from '../../../lib/sdk';
import {
  GrowthPageHeader,
  MarketingNav,
  GrowthEmptyState,
} from '../../../components/growth';

const STATUS_CONFIG: Record<InitiativeStatus, { label: string; className: string }> = {
  planned:   { label: 'Planned',   className: 'bg-blue-50 text-blue-700 border-blue-200' },
  active:    { label: 'Active',    className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  on_hold:   { label: 'On Hold',   className: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed: { label: 'Completed', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  cancelled: { label: 'Cancelled', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const PRIORITY_CONFIG: Record<InitiativePriority, { label: string; className: string }> = {
  Critical: { label: 'Critical', className: 'bg-rose-100 text-rose-800 border-rose-200' },
  High:     { label: 'High',     className: 'bg-amber-100 text-amber-800 border-amber-200' },
  Medium:   { label: 'Medium',   className: 'bg-blue-100 text-blue-800 border-blue-200' },
  Low:      { label: 'Low',      className: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export default function MarketingInitiatives() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const sdk = getOCEClient();
  const [searchParams] = useSearchParams();

  const [initiatives, setInitiatives] = useState<MarketingInitiative[]>([]);
  const [objectives, setObjectives] = useState<MarketingObjective[]>([]);
  const [channels, setChannels] = useState<MarketingChannel[]>([]);
  const [experiments, setExperiments] = useState<MarketingExperiment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Expanded task drawer per initiative
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [tasksMap, setTasksMap] = useState<Record<string, any[]>>({});
  const [loadingTasks, setLoadingTasks] = useState<Record<string, boolean>>({});
  const [newTaskTitle, setNewTaskTitle] = useState<Record<string, string>>({});
  const [newTaskPriority, setNewTaskPriority] = useState<Record<string, string>>({});

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingInit, setEditingInit] = useState<MarketingInitiative | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    objective_id: '',
    channel_name: 'LinkedIn',
    owner_name: 'Growth Lead',
    priority: 'High' as InitiativePriority,
    start_date: new Date().toISOString().split('T')[0],
    target_completion_date: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    budget: 5000,
    spend: 0,
    status: 'planned' as InitiativeStatus,
    related_experiment_id: '',
    notes: '',
  });

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [initList, objList, chanList, expList] = await Promise.all([
        sdk.getMarketingInitiatives(orgId),
        sdk.getMarketingObjectives(orgId),
        sdk.getMarketingChannels(orgId),
        sdk.getMarketingExperiments(orgId),
      ]);

      if (initList.length === 0) {
        // Provide starter initiatives if none exist
        const seed1 = await sdk.createMarketingInitiative(orgId, {
          name: 'Q3 Founder Thought Leadership Push',
          description: 'Establish Originyx executive presence and organic reach on LinkedIn targeting tech leaders & founders.',
          channel_name: 'LinkedIn',
          priority: 'High',
          status: 'active',
          budget: 4500,
          spend: 1800,
          owner_name: 'Marketing Lead',
          start_date: new Date().toISOString().split('T')[0],
          target_completion_date: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
          notes: 'Publish 3 strategic pieces weekly; engage with top 50 ICP accounts.',
        });
        const seed2 = await sdk.createMarketingInitiative(orgId, {
          name: 'Enterprise AI Control Center Showcase',
          description: 'Interactive demo videos, landing page tear-downs, and whitepaper on unified autonomous agents.',
          channel_name: 'Website',
          priority: 'Critical',
          status: 'active',
          budget: 8000,
          spend: 3200,
          owner_name: 'Product Marketing',
          start_date: new Date().toISOString().split('T')[0],
          target_completion_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          notes: 'Deliverable: 3 video walkthroughs and dedicated solutions page.',
        });
        await sdk.createMarketingInitiative(orgId, {
          name: 'Vertical Outbound Sequence: Biotech & Life Sciences',
          description: 'Multi-touch outbound cadence highlighting specialized biomolecular and lab data pipelines.',
          channel_name: 'Cold Outreach',
          priority: 'Medium',
          status: 'planned',
          budget: 3500,
          spend: 0,
          owner_name: 'Outbound SDR Lead',
          start_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          target_completion_date: new Date(Date.now() + 75 * 86400000).toISOString().split('T')[0],
          notes: 'Target 150 VP-level accounts with customized research briefs.',
        });

        // Seed initial tasks for seed1
        await sdk.createInitiativeTask(orgId, seed1.id, 'Draft 10 founder perspective posts on agentic architecture', 'High');
        await sdk.createInitiativeTask(orgId, seed1.id, 'Identify target list of 100 enterprise CTOs', 'Medium');
        await sdk.createInitiativeTask(orgId, seed2.id, 'Record screen capture demos of Operations and Growth dashboards', 'Critical');

        const reloadedInits = await sdk.getMarketingInitiatives(orgId);
        setInitiatives(reloadedInits);
      } else {
        setInitiatives(initList);
      }

      setObjectives(objList);
      setChannels(chanList);
      setExperiments(expList);
    } catch (e) {
      console.error('[MarketingInitiatives] Load error:', e);
    } finally {
      setLoading(false);
    }
  }, [orgId, sdk]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open modal if ?new=true query param is present
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      openCreateModal();
    }
  }, [searchParams]);

  // Load tasks for a specific initiative
  const toggleTasks = async (initId: string) => {
    const isNowExpanded = !expandedTasks[initId];
    setExpandedTasks(prev => ({ ...prev, [initId]: isNowExpanded }));

    if (isNowExpanded && !tasksMap[initId]) {
      if (!orgId) return;
      setLoadingTasks(prev => ({ ...prev, [initId]: true }));
      try {
        const tasks = await sdk.getInitiativeTasks(orgId, initId);
        setTasksMap(prev => ({ ...prev, [initId]: tasks }));
      } finally {
        setLoadingTasks(prev => ({ ...prev, [initId]: false }));
      }
    }
  };

  const handleAddTask = async (initId: string) => {
    if (!orgId) return;
    const title = newTaskTitle[initId]?.trim();
    if (!title) return;
    const priority = newTaskPriority[initId] || 'Medium';

    try {
      const task = await sdk.createInitiativeTask(orgId, initId, title, priority);
      setTasksMap(prev => ({
        ...prev,
        [initId]: [task, ...(prev[initId] || [])],
      }));
      setNewTaskTitle(prev => ({ ...prev, [initId]: '' }));
      // Update task count in card
      setInitiatives(prev => prev.map(i => i.id === initId ? { ...i, taskCount: (i.taskCount || 0) + 1 } : i));
    } catch (e) {
      console.error('Failed to create task:', e);
    }
  };

  const handleToggleTaskStatus = async (initId: string, taskId: string, currentStatus: string) => {
    if (!orgId) return;
    const newStatus = currentStatus === 'Done' ? 'To Do' : 'Done';
    try {
      await sdk.updateInitiativeTaskStatus(orgId, taskId, newStatus);
      setTasksMap(prev => ({
        ...prev,
        [initId]: (prev[initId] || []).map(t => t.id === taskId ? { ...t, status: newStatus } : t),
      }));
    } catch (e) {
      console.error('Failed to toggle task status:', e);
    }
  };

  // Status transitions
  const handleStatusChange = async (init: MarketingInitiative, newStatus: InitiativeStatus) => {
    if (!orgId) return;
    try {
      const updated = await sdk.updateMarketingInitiative(orgId, init.id, { status: newStatus });
      if (updated) {
        setInitiatives(prev => prev.map(i => i.id === init.id ? updated : i));
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  // Delete
  const handleDelete = async (id: string, name: string) => {
    if (!orgId || !confirm(`Delete initiative "${name}"?`)) return;
    try {
      await sdk.deleteMarketingInitiative(orgId, id);
      setInitiatives(prev => prev.filter(i => i.id !== id));
    } catch (e) {
      console.error('Failed to delete initiative:', e);
    }
  };

  // Modal handlers
  const openCreateModal = () => {
    setEditingInit(null);
    setForm({
      name: '',
      description: '',
      objective_id: objectives[0]?.id || '',
      channel_name: channels[0]?.name || 'LinkedIn',
      owner_name: 'Growth Lead',
      priority: 'High',
      start_date: new Date().toISOString().split('T')[0],
      target_completion_date: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      budget: 5000,
      spend: 0,
      status: 'planned',
      related_experiment_id: '',
      notes: '',
    });
    setShowModal(true);
  };

  const openEditModal = (init: MarketingInitiative) => {
    setEditingInit(init);
    setForm({
      name: init.name,
      description: init.description || '',
      objective_id: init.objective_id || '',
      channel_name: init.channel_name || 'LinkedIn',
      owner_name: init.owner_name || 'Growth Lead',
      priority: init.priority || 'Medium',
      start_date: init.start_date || '',
      target_completion_date: init.target_completion_date || '',
      budget: init.budget || 0,
      spend: init.spend || 0,
      status: init.status,
      related_experiment_id: init.related_experiment_id || '',
      notes: init.notes || '',
    });
    setShowModal(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !form.name.trim()) return;

    try {
      if (editingInit) {
        const updated = await sdk.updateMarketingInitiative(orgId, editingInit.id, {
          name: form.name.trim(),
          description: form.description.trim(),
          objective_id: form.objective_id || null,
          channel_name: form.channel_name,
          owner_name: form.owner_name,
          priority: form.priority,
          start_date: form.start_date || null,
          target_completion_date: form.target_completion_date || null,
          budget: Number(form.budget) || 0,
          spend: Number(form.spend) || 0,
          status: form.status,
          related_experiment_id: form.related_experiment_id || null,
          notes: form.notes,
        });
        if (updated) {
          setInitiatives(prev => prev.map(i => i.id === editingInit.id ? updated : i));
        }
      } else {
        const created = await sdk.createMarketingInitiative(orgId, {
          name: form.name.trim(),
          description: form.description.trim(),
          objective_id: form.objective_id || null,
          channel_name: form.channel_name,
          owner_name: form.owner_name,
          priority: form.priority,
          start_date: form.start_date || null,
          target_completion_date: form.target_completion_date || null,
          budget: Number(form.budget) || 0,
          spend: Number(form.spend) || 0,
          status: form.status,
          related_experiment_id: form.related_experiment_id || null,
          notes: form.notes,
        });
        setInitiatives(prev => [created, ...prev]);
      }
      setShowModal(false);
    } catch (e) {
      console.error('Failed to save initiative:', e);
    }
  };

  // Filtered list
  const filteredInitiatives = initiatives.filter(init => {
    if (statusFilter !== 'all' && init.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && init.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = init.name.toLowerCase().includes(q);
      const matchDesc = init.description?.toLowerCase().includes(q) || false;
      const matchChan = init.channel_name?.toLowerCase().includes(q) || false;
      const matchOwner = init.owner_name?.toLowerCase().includes(q) || false;
      if (!matchName && !matchDesc && !matchChan && !matchOwner) return false;
    }
    return true;
  });

  // Aggregated KPIs
  const activeCount = initiatives.filter(i => i.status === 'active').length;
  const plannedCount = initiatives.filter(i => i.status === 'planned').length;
  const totalBudget = initiatives.reduce((sum, i) => sum + (Number(i.budget) || 0), 0);
  const totalSpend = initiatives.reduce((sum, i) => sum + (Number(i.spend) || 0), 0);
  const budgetUtilization = totalBudget > 0 ? Math.round((totalSpend / totalBudget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <GrowthPageHeader
        title="Marketing Initiatives"
        description="Plan, prioritize, and track high-impact strategic programs aligned with business objectives."
        actions={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#244235] text-white rounded-lg text-xs font-semibold hover:bg-[#182e25] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            New Initiative
          </button>
        }
      />

      {/* Sub-Navigation Bar */}
      <MarketingNav />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{activeCount}</p>
          <span className="text-xs text-gray-400">Programs currently executing</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Planned</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{plannedCount}</p>
          <span className="text-xs text-gray-400">In strategy queue</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Budget</span>
            <DollarSign className="w-4 h-4 text-[#244235]" />
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">
            ${totalBudget.toLocaleString()}
          </p>
          <span className="text-xs text-gray-400">Across all initiatives</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actual Spend</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">
            ${totalSpend.toLocaleString()}
          </p>
          <span className="text-xs text-gray-400">Recorded deployment</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilization</span>
            <span className="text-xs font-bold text-[#244235]">{budgetUtilization}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2 mb-1.5 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                budgetUtilization > 100 ? 'bg-rose-500' : 'bg-[#244235]'
              }`}
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">
            ${Math.max(0, totalBudget - totalSpend).toLocaleString()} balance remaining
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search initiatives, channels, or owners..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#244235]/20 focus:border-[#244235]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Select */}
          <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200 text-xs">
            <span className="px-2 font-medium text-gray-500">Status:</span>
            {(['all', 'active', 'planned', 'on_hold', 'completed', 'cancelled'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {st === 'all' ? 'All' : STATUS_CONFIG[st]?.label || st}
              </button>
            ))}
          </div>

          {/* Priority Select */}
          <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200 text-xs">
            <span className="px-2 font-medium text-gray-500">Priority:</span>
            {(['all', 'Critical', 'High', 'Medium', 'Low'] as const).map(pr => (
              <button
                key={pr}
                onClick={() => setPriorityFilter(pr)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  priorityFilter === pr
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {pr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Initiatives List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#244235] border-t-transparent mb-3" />
          <p className="text-sm font-medium text-gray-500">Loading marketing initiatives...</p>
        </div>
      ) : filteredInitiatives.length === 0 ? (
        <GrowthEmptyState
          icon={Briefcase}
          title={initiatives.length === 0 ? 'No marketing initiatives yet' : 'No matching initiatives'}
          description={
            initiatives.length === 0
              ? 'Organize high-impact marketing programs, map deliverables to Operations tasks, and track budget vs actual spend.'
              : 'Try clearing your filters or search terms to see all initiatives.'
          }
          action={
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#244235] text-white rounded-lg text-xs font-semibold hover:bg-[#182e25] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Initiative
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredInitiatives.map(init => {
            const statusCfg = STATUS_CONFIG[init.status] || STATUS_CONFIG.planned;
            const priorityCfg = PRIORITY_CONFIG[init.priority] || PRIORITY_CONFIG.Medium;
            const spend = Number(init.spend) || 0;
            const budget = Number(init.budget) || 0;
            const initUtilization = budget > 0 ? Math.round((spend / budget) * 100) : 0;
            const isTasksOpen = !!expandedTasks[init.id];
            const tasks = tasksMap[init.id] || [];
            const completedTasks = tasks.filter(t => t.status === 'Done').length;

            return (
              <div
                key={init.id}
                className="bg-white rounded-xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all overflow-hidden"
              >
                {/* Main Card Content */}
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left: Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${priorityCfg.className}`}>
                          {priorityCfg.label}
                        </span>
                        {init.channel_name && (
                          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                            Channel: {init.channel_name}
                          </span>
                        )}
                        {init.owner_name && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            {init.owner_name}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-gray-900 leading-snug">
                        {init.name}
                      </h3>

                      {init.description && (
                        <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
                          {init.description}
                        </p>
                      )}

                      {/* Dates and Deliverable Note */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                        {(init.start_date || init.target_completion_date) && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>
                              {init.start_date || 'TBD'} &rarr; {init.target_completion_date || 'Ongoing'}
                            </span>
                          </div>
                        )}
                        {init.notes && (
                          <div className="flex items-center gap-1.5 text-gray-500 italic">
                            <span>Note: {init.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Budget & Progress Metrics */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 min-w-[220px] bg-stone-50/80 p-3 rounded-xl border border-gray-100">
                      <div className="w-full">
                        <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-1">
                          <span>Spend / Budget</span>
                          <span className="font-bold text-gray-800">
                            ${spend.toLocaleString()} / ${budget.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              initUtilization > 100 ? 'bg-rose-500' : 'bg-[#244235]'
                            }`}
                            style={{ width: `${Math.min(initUtilization, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                          <span>{initUtilization}% spent</span>
                          <span>${Math.max(0, budget - spend).toLocaleString()} left</span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center gap-1.5 self-end pt-1">
                        {/* Status dropdown */}
                        <select
                          value={init.status}
                          onChange={e => handleStatusChange(init, e.target.value as InitiativeStatus)}
                          className="text-xs py-1 px-2 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#244235]"
                        >
                          <option value="planned">Planned</option>
                          <option value="active">Active</option>
                          <option value="on_hold">On Hold</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        <button
                          onClick={() => openEditModal(init)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                          title="Edit Initiative"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(init.id, init.name)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Initiative"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Task Toggle Button Bar */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => toggleTasks(init.id)}
                      className="flex items-center gap-2 text-xs font-semibold text-[#244235] hover:text-[#182e25] transition-colors"
                    >
                      <ListTodo className="w-4 h-4" />
                      <span>
                        Operations Tasks
                        {tasks.length > 0 ? (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {completedTasks}/{tasks.length} done
                          </span>
                        ) : init.taskCount ? (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">
                            {init.taskCount} tasks
                          </span>
                        ) : (
                          <span className="ml-1.5 text-gray-400 text-[10px] font-normal">(View & Add)</span>
                        )}
                      </span>
                      {isTasksOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                      )}
                    </button>

                    <div className="text-[11px] text-gray-400">
                      Linked to Originyx Operations Workstream
                    </div>
                  </div>
                </div>

                {/* Operations Tasks Accordion Drawer */}
                {isTasksOpen && (
                  <div className="bg-stone-50 border-t border-gray-100 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-[#244235]" />
                        Operations Tasks & Action Items
                      </span>
                      <span className="text-[11px] text-gray-400">
                        Tasks sync directly to <span className="font-semibold text-gray-600">internal_tasks</span>
                      </span>
                    </div>

                    {/* Inline Add Task Form */}
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200">
                      <input
                        type="text"
                        placeholder="Add a new action item or deliverable..."
                        value={newTaskTitle[init.id] || ''}
                        onChange={e => setNewTaskTitle(prev => ({ ...prev, [init.id]: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddTask(init.id);
                        }}
                        className="flex-1 text-xs border-0 focus:outline-none px-2 text-gray-800"
                      />
                      <select
                        value={newTaskPriority[init.id] || 'Medium'}
                        onChange={e => setNewTaskPriority(prev => ({ ...prev, [init.id]: e.target.value }))}
                        className="text-xs py-1 px-2 border border-gray-200 rounded text-gray-600 bg-gray-50 focus:outline-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                      <button
                        onClick={() => handleAddTask(init.id)}
                        disabled={!newTaskTitle[init.id]?.trim()}
                        className="px-3 py-1 bg-[#244235] text-white rounded text-xs font-medium hover:bg-[#182e25] disabled:opacity-50 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add Task
                      </button>
                    </div>

                    {/* Task List */}
                    {loadingTasks[init.id] ? (
                      <div className="py-4 text-center text-xs text-gray-400">Loading tasks...</div>
                    ) : tasks.length === 0 ? (
                      <div className="py-4 text-center text-xs text-gray-400 bg-white/60 rounded-lg border border-dashed border-gray-200">
                        No linked tasks yet. Add an action item above to delegate work.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {tasks.map((task: any) => {
                          const isDone = task.status === 'Done';
                          return (
                            <div
                              key={task.id}
                              className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 flex-1">
                                <button
                                  onClick={() => handleToggleTaskStatus(init.id, task.id, task.status)}
                                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                    isDone
                                      ? 'bg-[#244235] border-[#244235] text-white'
                                      : 'border-gray-300 hover:border-[#244235] text-transparent'
                                  }`}
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <span
                                  className={`text-xs ${
                                    isDone ? 'line-through text-gray-400' : 'text-gray-800 font-medium'
                                  }`}
                                >
                                  {task.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                    task.priority === 'Critical'
                                      ? 'bg-rose-50 text-rose-700'
                                      : task.priority === 'High'
                                      ? 'bg-amber-50 text-amber-700'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {task.priority || 'Medium'}
                                </span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                    isDone ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                                  }`}
                                >
                                  {task.status || 'To Do'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingInit ? 'Edit Marketing Initiative' : 'Create Marketing Initiative'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Initiative Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Founder-Led Thought Leadership Push"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#244235]/20 focus:border-[#244235]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Description & Strategic Scope
                </label>
                <textarea
                  rows={2}
                  placeholder="What is the objective, target outcome, and core deliverable?"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#244235]/20 focus:border-[#244235]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Primary Channel
                  </label>
                  <select
                    value={form.channel_name}
                    onChange={e => setForm(f => ({ ...f, channel_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#244235]/20 focus:border-[#244235]"
                  >
                    {channels.length > 0 ? (
                      channels.map(c => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Website">Website</option>
                        <option value="Cold Outreach">Cold Outreach</option>
                        <option value="Referral">Referral</option>
                        <option value="Event">Event</option>
                        <option value="Inbound">Inbound</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={form.owner_name}
                    onChange={e => setForm(f => ({ ...f, owner_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#244235]/20 focus:border-[#244235]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value as InitiativePriority }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#244235]/20 focus:border-[#244235]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as InitiativeStatus }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#244235]/20 focus:border-[#244235]"
                  >
                    <option value="planned">Planned</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Budget Allocated ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={form.budget}
                    onChange={e => setForm(f => ({ ...f, budget: Number(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#244235]/20 focus:border-[#244235]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Actual Spend ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={form.spend}
                    onChange={e => setForm(f => ({ ...f, spend: Number(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#244235]/20 focus:border-[#244235]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={form.target_completion_date}
                    onChange={e => setForm(f => ({ ...f, target_completion_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Deliverables / Key Notes
                </label>
                <input
                  type="text"
                  placeholder="Key milestones, deliverables, or checklist references..."
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#244235]/20 focus:border-[#244235]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Related Growth Experiment (Optional)
                </label>
                <select
                  value={form.related_experiment_id}
                  onChange={e => setForm(f => ({ ...f, related_experiment_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#244235]/20 focus:border-[#244235]"
                >
                  <option value="">None (Independent Initiative)</option>
                  {experiments.map(exp => (
                    <option key={exp.id} value={exp.id}>
                      {exp.name} ({exp.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#244235] text-white rounded-lg text-sm font-semibold hover:bg-[#182e25] transition-colors"
                >
                  {editingInit ? 'Save Changes' : 'Create Initiative'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
