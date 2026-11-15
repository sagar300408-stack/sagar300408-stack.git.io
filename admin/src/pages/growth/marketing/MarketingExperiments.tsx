import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FlaskConical, Plus, Edit2, Play, Check, X
} from 'lucide-react';
import { useAuth } from '../../../lib/AuthContext';
import {
  getOCEClient,
  type MarketingExperiment,
  type ExperimentStatus,
  type ExperimentVerdict,
} from '../../../lib/sdk';
import {
  GrowthPageHeader,
  MarketingNav,
  GrowthEmptyState,
} from '../../../components/growth';

const STATUS_CONFIG: Record<ExperimentStatus, { label: string; className: string }> = {
  draft:      { label: 'Draft',      className: 'bg-gray-100 text-gray-700 border-gray-200' },
  planned:    { label: 'Planned',    className: 'bg-blue-50 text-blue-700 border-blue-200' },
  running:    { label: 'Running',    className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  paused:     { label: 'Paused',     className: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed:  { label: 'Completed',  className: 'bg-purple-50 text-purple-700 border-purple-200' },
  analyzed:   { label: 'Analyzed',   className: 'bg-[#244235]/10 text-[#244235] border-[#244235]/20' },
  cancelled:  { label: 'Cancelled',  className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function MarketingExperiments() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const sdk = getOCEClient();
  const [searchParams] = useSearchParams();

  const [experiments, setExperiments] = useState<MarketingExperiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingExp, setEditingExp] = useState<MarketingExperiment | null>(null);
  const [form, setForm] = useState({
    name: '',
    hypothesis: '',
    target_audience: 'B2B Founders & CTOs',
    channel_name: 'LinkedIn',
    success_metric: 'Demo Bookings / Impression %',
    target_value: '3.5%',
    actual_result: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    owner_name: 'Growth Lead',
    status: 'planned' as ExperimentStatus,
    expected_outcome: '',
    actual_outcome: '',
    result_verdict: '' as ExperimentVerdict | '',
    observations: '',
    lessons_learned: '',
    recommendations: '',
    conclusion: '',
  });

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const data = await sdk.getMarketingExperiments(orgId);
      setExperiments(data);
    } catch (e) {
      console.warn('[MarketingExperiments] Error loading experiments:', e);
    } finally {
      setLoading(false);
    }
  }, [orgId, sdk]);

  useEffect(() => {
    loadData();
    if (searchParams.get('new') === '1') {
      setShowModal(true);
    }
  }, [loadData, searchParams]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !form.name.trim()) return;

    const payload = {
      ...form,
      result_verdict: form.result_verdict || null,
    };

    if (editingExp) {
      await sdk.updateMarketingExperiment(orgId, editingExp.id, payload);
    } else {
      await sdk.createMarketingExperiment(orgId, payload);
    }
    setShowModal(false);
    setEditingExp(null);
    loadData();
  };

  const handleStatusTransition = async (exp: MarketingExperiment, newStatus: ExperimentStatus) => {
    if (!orgId) return;
    await sdk.updateMarketingExperiment(orgId, exp.id, { status: newStatus });
    loadData();
  };

  const filtered = experiments.filter((e) => {
    if (statusFilter === 'all') return true;
    return e.status === statusFilter;
  });

  const runningCount = experiments.filter(e => e.status === 'running').length;
  const analyzedCount = experiments.filter(e => e.status === 'analyzed' || e.status === 'completed').length;
  const successCount = experiments.filter(e => e.result_verdict === 'success').length;

  return (
    <div className="min-h-full bg-[#f5f5f4] flex flex-col">
      <GrowthPageHeader
        title="Growth Experiments"
        description="Systematically formulate, execute, and evaluate marketing hypotheses to uncover scalable acquisition loops."
        breadcrumb={[
          { label: 'Growth', to: '/growth' },
          { label: 'Marketing', to: '/growth/marketing' },
          { label: 'Experiments' },
        ]}
        actions={
          <button
            onClick={() => {
              setEditingExp(null);
              setForm({
                name: '',
                hypothesis: '',
                target_audience: 'B2B Founders & CTOs',
                channel_name: 'LinkedIn',
                success_metric: 'Demo Bookings / Impression %',
                target_value: '3.5%',
                actual_result: '',
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                owner_name: 'Growth Lead',
                status: 'planned',
                expected_outcome: '',
                actual_outcome: '',
                result_verdict: '',
                observations: '',
                lessons_learned: '',
                recommendations: '',
                conclusion: '',
              });
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#244235] text-white hover:bg-[#1a3026] rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <Plus size={14} />
            <span>New Experiment</span>
          </button>
        }
      />

      <MarketingNav />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-6">

        {/* Pulse KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Active Running
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{runningCount}</span>
              <span className="text-xs text-gray-400">in live testing</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Evaluated Tests
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{analyzedCount}</span>
              <span className="text-xs text-gray-400">completed</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Validated Wins
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-emerald-700">{successCount}</span>
              <span className="text-xs text-gray-400">proven uplift</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Total Recorded
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{experiments.length}</span>
              <span className="text-xs text-gray-400">hypotheses</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', 'running', 'planned', 'draft', 'completed', 'analyzed', 'paused'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-[#244235] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? `All (${experiments.length})` : status}
            </button>
          ))}
        </div>

        {/* Experiments List */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-xs">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#244235] mr-2" />
              Loading growth experiments…
            </div>
          ) : filtered.length === 0 ? (
            <GrowthEmptyState
              icon={FlaskConical}
              title="No growth experiments found"
              description="Formulate your first growth experiment with a clear hypothesis, success metric, and target audience to run controlled marketing tests."
              action={
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-[#244235] text-white rounded-lg text-xs font-medium hover:bg-[#1a3026]"
                >
                  Create First Experiment
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              {filtered.map((exp) => {
                const statusCfg = STATUS_CONFIG[exp.status] || STATUS_CONFIG.draft;
                return (
                  <div
                    key={exp.id}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-all shadow-xs"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-4 mb-4 border-b border-gray-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${statusCfg.className}`}>
                            {statusCfg.label}
                          </span>
                          {exp.channel_name && (
                            <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-medium">
                              Channel: {exp.channel_name}
                            </span>
                          )}
                          {exp.result_verdict && (
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${
                                exp.result_verdict === 'success'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : exp.result_verdict === 'failure'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              Outcome: {exp.result_verdict}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {exp.name}
                        </h3>
                      </div>

                      {/* Lifecycle Controls */}
                      <div className="flex items-center gap-1.5 self-start">
                        {exp.status === 'draft' && (
                          <button
                            onClick={() => handleStatusTransition(exp, 'planned')}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-medium hover:bg-blue-100"
                          >
                            Mark Planned
                          </button>
                        )}
                        {exp.status === 'planned' && (
                          <button
                            onClick={() => handleStatusTransition(exp, 'running')}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-medium hover:bg-emerald-100 flex items-center gap-1"
                          >
                            <Play size={11} />
                            <span>Launch Test</span>
                          </button>
                        )}
                        {exp.status === 'running' && (
                          <>
                            <button
                              onClick={() => handleStatusTransition(exp, 'paused')}
                              className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-medium hover:bg-amber-100"
                            >
                              Pause
                            </button>
                            <button
                              onClick={() => handleStatusTransition(exp, 'completed')}
                              className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded text-xs font-medium hover:bg-purple-100 flex items-center gap-1"
                            >
                              <Check size={11} />
                              <span>Complete</span>
                            </button>
                          </>
                        )}
                        {exp.status === 'completed' && (
                          <button
                            onClick={() => handleStatusTransition(exp, 'analyzed')}
                            className="px-2.5 py-1 bg-[#244235] text-white rounded text-xs font-medium hover:bg-[#1a3026]"
                          >
                            Mark Analyzed
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditingExp(exp);
                            setForm({
                              name: exp.name,
                              hypothesis: exp.hypothesis,
                              target_audience: exp.target_audience || '',
                              channel_name: exp.channel_name || '',
                              success_metric: exp.success_metric,
                              target_value: exp.target_value,
                              actual_result: exp.actual_result || '',
                              start_date: exp.start_date || '',
                              end_date: exp.end_date || '',
                              owner_name: exp.owner_name || 'Growth Lead',
                              status: exp.status,
                              expected_outcome: exp.expected_outcome || '',
                              actual_outcome: exp.actual_outcome || '',
                              result_verdict: exp.result_verdict || '',
                              observations: exp.observations || '',
                              lessons_learned: exp.lessons_learned || '',
                              recommendations: exp.recommendations || '',
                              conclusion: exp.conclusion || '',
                            });
                            setShowModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-700"
                          title="Edit Details"
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Hypothesis & Metric */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs mb-4">
                      <div className="md:col-span-2">
                        <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px] block mb-1">
                          Hypothesis
                        </span>
                        <p className="text-gray-700 leading-relaxed bg-[#fbfbfa] p-3 rounded-lg border border-gray-100">
                          {exp.hypothesis}
                        </p>
                      </div>

                      <div>
                        <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px] block mb-1">
                          Success Metric & Goal
                        </span>
                        <div className="bg-[#fbfbfa] p-3 rounded-lg border border-gray-100">
                          <p className="font-medium text-gray-900">{exp.success_metric}</p>
                          <div className="flex items-center justify-between mt-1 text-[11px] text-gray-500">
                            <span>Target: <strong className="text-gray-900">{exp.target_value}</strong></span>
                            <span>Actual: <strong className={exp.actual_result ? 'text-[#244235]' : 'text-gray-400'}>{exp.actual_result || 'Pending'}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Observations / Evaluation (if present) */}
                    {(exp.observations || exp.conclusion) && (
                      <div className="pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-1">
                        {exp.observations && (
                          <p><strong>Observations:</strong> {exp.observations}</p>
                        )}
                        {exp.conclusion && (
                          <p><strong>Conclusion:</strong> {exp.conclusion}</p>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="pt-3 mt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-gray-400 gap-2">
                      <span>Owner: {exp.owner_name || 'Growth Lead'}</span>
                      <span>
                        Window: {exp.start_date ? new Date(exp.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'TBD'}
                        {' → '}
                        {exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Modal: Experiment Config */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">
                {editingExp ? 'Edit Growth Experiment' : 'New Growth Experiment'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Experiment Name *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Interactive AI ROI Calculator on Homepage"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Hypothesis *</label>
                <textarea
                  required
                  rows={2}
                  value={form.hypothesis}
                  onChange={(e) => setForm({ ...form, hypothesis: e.target.value })}
                  placeholder="If we [implement action] for [target audience], then [expected result] because [rationale]..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Acquisition Channel</label>
                  <input
                    type="text"
                    value={form.channel_name}
                    onChange={(e) => setForm({ ...form, channel_name: e.target.value })}
                    placeholder="Website, LinkedIn, Direct"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Target Audience</label>
                  <input
                    type="text"
                    value={form.target_audience}
                    onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Success Metric *</label>
                  <input
                    required
                    type="text"
                    value={form.success_metric}
                    onChange={(e) => setForm({ ...form, success_metric: e.target.value })}
                    placeholder="e.g. Lead Conversion Rate"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Target Value *</label>
                  <input
                    required
                    type="text"
                    value={form.target_value}
                    onChange={(e) => setForm({ ...form, target_value: e.target.value })}
                    placeholder="e.g. 4.5%"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Lifecycle Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ExperimentStatus })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  >
                    <option value="draft">Draft</option>
                    <option value="planned">Planned</option>
                    <option value="running">Running</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="analyzed">Analyzed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Outcome Verdict</label>
                  <select
                    value={form.result_verdict}
                    onChange={(e) => setForm({ ...form, result_verdict: e.target.value as ExperimentVerdict | '' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  >
                    <option value="">Pending / In Progress</option>
                    <option value="success">Success (Validated Uplift)</option>
                    <option value="failure">Failure (No Impact)</option>
                    <option value="inconclusive">Inconclusive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Actual Measured Result</label>
                <input
                  type="text"
                  value={form.actual_result}
                  onChange={(e) => setForm({ ...form, actual_result: e.target.value })}
                  placeholder="e.g. 5.1% demo conversion rate"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Observations & Conclusion</label>
                <textarea
                  rows={2}
                  value={form.conclusion}
                  onChange={(e) => setForm({ ...form, conclusion: e.target.value })}
                  placeholder="Key learnings, next steps, or decision whether to scale..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#244235] text-white rounded-lg hover:bg-[#1a3026] font-medium"
                >
                  {editingExp ? 'Save Changes' : 'Create Experiment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
