import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Target, Users, Building2, Plus, Edit2, Archive,
  CheckCircle2, X
} from 'lucide-react';
import { useAuth } from '../../../lib/AuthContext';
import {
  getOCEClient,
  type MarketingObjective,
  type MarketingAudience,
  type MarketingICPProfile,
  type ObjectiveStatus,
  type AudienceIntent,
} from '../../../lib/sdk';
import {
  GrowthPageHeader,
  MarketingNav,
  GrowthEmptyState,
} from '../../../components/growth';

type TabType = 'objectives' | 'audiences' | 'icp';

export default function MarketingStrategy() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const sdk = getOCEClient();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabType>('objectives');
  const [objectives, setObjectives] = useState<MarketingObjective[]>([]);
  const [audiences, setAudiences] = useState<MarketingAudience[]>([]);
  const [icps, setIcps] = useState<MarketingICPProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showObjModal, setShowObjModal] = useState(false);
  const [editingObj, setEditingObj] = useState<MarketingObjective | null>(null);
  const [objForm, setObjForm] = useState({
    title: '',
    description: '',
    target_metric: 'Qualified Leads / Month',
    current_value: 0,
    target_value: 50,
    unit: 'count',
    start_date: new Date().toISOString().split('T')[0],
    target_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    status: 'active' as ObjectiveStatus,
    owner_name: 'Marketing Lead',
  });

  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [editingAudience, setEditingAudience] = useState<MarketingAudience | null>(null);
  const [audForm, setAudForm] = useState({
    name: '',
    industry: 'B2B SaaS & AI',
    company_size: '20-500 employees',
    geographic_market: 'India & North America',
    business_type: 'High Growth Technology',
    target_roles: 'Founder, CTO, VP Engineering',
    pain_points: 'Slow development velocity, AI model integration complexity, scaling architecture',
    buying_intent: 'high' as AudienceIntent,
    description: '',
  });

  const [showIcpModal, setShowIcpModal] = useState(false);
  const [editingIcp, setEditingIcp] = useState<MarketingICPProfile | null>(null);
  const [icpForm, setIcpForm] = useState({
    name: '',
    industry: 'AI & Enterprise SaaS',
    company_size: '50-1000 employees',
    revenue_range: '$2M - $20M ARR',
    geography: 'North America, Europe, India',
    technology_maturity: 'Modern Cloud Native (Kubernetes, Python, TypeScript)',
    business_challenges: 'Deploying autonomous agents, enterprise RAG governance, custom model optimization',
    decision_maker_roles: 'VP of AI, Chief Technology Officer, Head of Product',
    qualification_criteria: 'Active budget for AI consulting, executive sponsor, clear deployment timeline',
    is_primary: false,
    notes: '',
  });

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [objs, auds, icpList] = await Promise.all([
        sdk.getMarketingObjectives(orgId),
        sdk.getMarketingAudiences(orgId),
        sdk.getMarketingICPProfiles(orgId),
      ]);
      setObjectives(objs);
      setAudiences(auds);
      setIcps(icpList);
    } catch (e) {
      console.warn('[MarketingStrategy] Error loading data:', e);
    } finally {
      setLoading(false);
    }
  }, [orgId, sdk]);

  useEffect(() => {
    loadData();
    if (searchParams.get('new') === '1') {
      setShowObjModal(true);
    }
  }, [loadData, searchParams]);

  // Objective handlers
  const handleSaveObjective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !objForm.title.trim()) return;

    if (editingObj) {
      await sdk.updateMarketingObjective(orgId, editingObj.id, objForm);
    } else {
      await sdk.createMarketingObjective(orgId, objForm);
    }
    setShowObjModal(false);
    setEditingObj(null);
    loadData();
  };

  const handleArchiveObjective = async (id: string) => {
    if (!orgId) return;
    await sdk.archiveMarketingObjective(orgId, id);
    loadData();
  };

  // Audience handlers
  const handleSaveAudience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !audForm.name.trim()) return;

    const payload = {
      ...audForm,
      target_roles: audForm.target_roles.split(',').map(s => s.trim()).filter(Boolean),
      pain_points: audForm.pain_points.split(',').map(s => s.trim()).filter(Boolean),
    };

    if (editingAudience) {
      await sdk.updateMarketingAudience(orgId, editingAudience.id, payload);
    } else {
      await sdk.createMarketingAudience(orgId, payload);
    }
    setShowAudienceModal(false);
    setEditingAudience(null);
    loadData();
  };

  // ICP handlers
  const handleSaveIcp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !icpForm.name.trim()) return;

    const payload = {
      ...icpForm,
      business_challenges: icpForm.business_challenges.split(',').map(s => s.trim()).filter(Boolean),
      decision_maker_roles: icpForm.decision_maker_roles.split(',').map(s => s.trim()).filter(Boolean),
      qualification_criteria: icpForm.qualification_criteria.split(',').map(s => s.trim()).filter(Boolean),
    };

    if (editingIcp) {
      await sdk.updateMarketingICPProfile(orgId, editingIcp.id, payload);
    } else {
      await sdk.createMarketingICPProfile(orgId, payload);
    }
    setShowIcpModal(false);
    setEditingIcp(null);
    loadData();
  };

  return (
    <div className="min-h-full bg-[#f5f5f4] flex flex-col">
      <GrowthPageHeader
        title="Strategy & Planning"
        description="Define Originyx's customer acquisition goals, target audience segments, and ideal customer profiles."
        breadcrumb={[
          { label: 'Growth', to: '/growth' },
          { label: 'Marketing', to: '/growth/marketing' },
          { label: 'Strategy & Planning' },
        ]}
        actions={
          activeTab === 'objectives' ? (
            <button
              onClick={() => {
                setEditingObj(null);
                setObjForm({
                  title: '',
                  description: '',
                  target_metric: 'Qualified Leads / Month',
                  current_value: 0,
                  target_value: 50,
                  unit: 'count',
                  start_date: new Date().toISOString().split('T')[0],
                  target_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
                  status: 'active',
                  owner_name: 'Marketing Lead',
                });
                setShowObjModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#244235] text-white hover:bg-[#1a3026] rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <Plus size={14} />
              <span>New Objective</span>
            </button>
          ) : activeTab === 'audiences' ? (
            <button
              onClick={() => {
                setEditingAudience(null);
                setAudForm({
                  name: '',
                  industry: 'B2B SaaS & AI',
                  company_size: '20-500 employees',
                  geographic_market: 'India & North America',
                  business_type: 'High Growth Technology',
                  target_roles: 'Founder, CTO, VP Engineering',
                  pain_points: 'Development velocity, AI model complexity, scaling',
                  buying_intent: 'high',
                  description: '',
                });
                setShowAudienceModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#244235] text-white hover:bg-[#1a3026] rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <Plus size={14} />
              <span>New Audience</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingIcp(null);
                setIcpForm({
                  name: '',
                  industry: 'AI & Enterprise SaaS',
                  company_size: '50-1000 employees',
                  revenue_range: '$2M - $20M ARR',
                  geography: 'North America, Europe, India',
                  technology_maturity: 'Modern Cloud Native',
                  business_challenges: 'Deploying autonomous agents, enterprise RAG, custom models',
                  decision_maker_roles: 'VP of AI, Chief Technology Officer, Head of Product',
                  qualification_criteria: 'Active budget for AI consulting, executive sponsor, clear timeline',
                  is_primary: false,
                  notes: '',
                });
                setShowIcpModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#244235] text-white hover:bg-[#1a3026] rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <Plus size={14} />
              <span>New ICP Profile</span>
            </button>
          )
        }
      />

      <MarketingNav />

      {/* Internal Strategy Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {[
            { id: 'objectives', label: 'Marketing Objectives', count: objectives.length, icon: Target },
            { id: 'audiences', label: 'Target Audiences', count: audiences.length, icon: Users },
            { id: 'icp', label: 'Ideal Customer Profiles (ICP)', count: icps.length, icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#244235] text-[#244235] font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-gray-100 rounded-full text-gray-600">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400 text-xs">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#244235] mr-2" />
            Loading strategic foundation…
          </div>
        ) : activeTab === 'objectives' ? (
          /* ── Objectives Tab ── */
          <div>
            {objectives.length === 0 ? (
              <GrowthEmptyState
                icon={Target}
                title="No Marketing Objectives defined yet"
                description="Set your first strategic acquisition target (e.g. increase qualified inbound leads or boost conversion rate) to guide your team's programs."
                action={
                  <button
                    onClick={() => setShowObjModal(true)}
                    className="px-4 py-2 bg-[#244235] text-white rounded-lg text-xs font-medium hover:bg-[#1a3026]"
                  >
                    Create First Objective
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {objectives.map((obj) => {
                  const pct = obj.target_value > 0
                    ? Math.min(100, Math.round((obj.current_value / obj.target_value) * 100))
                    : 0;
                  return (
                    <div
                      key={obj.id}
                      className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <span
                            className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${
                              obj.status === 'achieved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : obj.status === 'behind'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : obj.status === 'paused'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {obj.status}
                          </span>
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <button
                              onClick={() => {
                                setEditingObj(obj);
                                setObjForm({
                                  title: obj.title,
                                  description: obj.description || '',
                                  target_metric: obj.target_metric,
                                  current_value: obj.current_value,
                                  target_value: obj.target_value,
                                  unit: obj.unit,
                                  start_date: obj.start_date,
                                  target_date: obj.target_date,
                                  status: obj.status,
                                  owner_name: obj.owner_name || 'Marketing Lead',
                                });
                                setShowObjModal(true);
                              }}
                              className="p-1 hover:text-gray-700 rounded"
                              title="Edit Objective"
                            >
                              <Edit2 size={13} />
                            </button>
                            {obj.status !== 'archived' && (
                              <button
                                onClick={() => handleArchiveObjective(obj.id)}
                                className="p-1 hover:text-red-600 rounded"
                                title="Archive Objective"
                              >
                                <Archive size={13} />
                              </button>
                            )}
                          </div>
                        </div>

                        <h3 className="text-sm font-semibold text-gray-900 mb-1">
                          {obj.title}
                        </h3>
                        {obj.description && (
                          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                            {obj.description}
                          </p>
                        )}

                        {/* Metric & Progress */}
                        <div className="bg-[#fbfbfa] rounded-lg p-3.5 border border-gray-100 mb-4">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-gray-500 font-medium">{obj.target_metric}</span>
                            <span className="font-semibold text-gray-900">
                              {obj.current_value} / {obj.target_value} {obj.unit !== 'count' ? obj.unit : ''}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#244235] rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1.5">
                            <span>{pct}% progress</span>
                            <span>Target: {new Date(obj.target_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                        <span>Owner: {obj.owner_name || 'Marketing Lead'}</span>
                        <span>Since {new Date(obj.start_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'audiences' ? (
          /* ── Target Audiences Tab ── */
          <div>
            {audiences.length === 0 ? (
              <GrowthEmptyState
                icon={Users}
                title="No Target Audiences defined yet"
                description="Profile your target market segments, company sizes, decision-maker roles, and pain points to align messaging and outreach."
                action={
                  <button
                    onClick={() => setShowAudienceModal(true)}
                    className="px-4 py-2 bg-[#244235] text-white rounded-lg text-xs font-medium hover:bg-[#1a3026]"
                  >
                    Define First Audience
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {audiences.map((aud) => (
                  <div
                    key={aud.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#244235]/10 text-[#244235] border border-[#244235]/20">
                          {aud.industry}
                        </span>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <button
                            onClick={() => {
                              setEditingAudience(aud);
                              setAudForm({
                                name: aud.name,
                                industry: aud.industry,
                                company_size: aud.company_size,
                                geographic_market: aud.geographic_market,
                                business_type: aud.business_type,
                                target_roles: aud.target_roles.join(', '),
                                pain_points: aud.pain_points.join(', '),
                                buying_intent: aud.buying_intent,
                                description: aud.description || '',
                              });
                              setShowAudienceModal(true);
                            }}
                            className="p-1 hover:text-gray-700"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {aud.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-3">
                        {aud.business_type} · {aud.company_size} · {aud.geographic_market}
                      </p>

                      {aud.target_roles.length > 0 && (
                        <div className="mb-3">
                          <span className="text-[11px] font-medium text-gray-400 block mb-1">Target Roles:</span>
                          <div className="flex flex-wrap gap-1">
                            {aud.target_roles.map((r) => (
                              <span key={r} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {aud.pain_points.length > 0 && (
                        <div className="mb-3">
                          <span className="text-[11px] font-medium text-gray-400 block mb-1">Key Pain Points:</span>
                          <ul className="text-[11px] text-gray-600 space-y-0.5 list-disc list-inside">
                            {aud.pain_points.map((p) => (
                              <li key={p}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">Buying Intent:</span>
                      <span className="font-semibold text-gray-800 uppercase tracking-wide">
                        {aud.buying_intent}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── Ideal Customer Profiles (ICP) Tab ── */
          <div>
            {icps.length === 0 ? (
              <GrowthEmptyState
                icon={Building2}
                title="No Ideal Customer Profiles defined yet"
                description="Structure the exact company characteristics, revenue criteria, and decision-maker requirements for high-converting Originyx clients."
                action={
                  <button
                    onClick={() => setShowIcpModal(true)}
                    className="px-4 py-2 bg-[#244235] text-white rounded-lg text-xs font-medium hover:bg-[#1a3026]"
                  >
                    Define First ICP
                  </button>
                }
              />
            ) : (
              <div className="space-y-4">
                {icps.map((icp) => (
                  <div
                    key={icp.id}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-all shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#244235]/10 text-[#244235] flex items-center justify-center font-semibold text-sm">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-gray-900">
                              {icp.name}
                            </h3>
                            {icp.is_primary && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Primary ICP
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {icp.industry} · {icp.company_size} · {icp.revenue_range || 'All stages'} · {icp.geography}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingIcp(icp);
                            setIcpForm({
                              name: icp.name,
                              industry: icp.industry,
                              company_size: icp.company_size,
                              revenue_range: icp.revenue_range || '',
                              geography: icp.geography,
                              technology_maturity: icp.technology_maturity,
                              business_challenges: icp.business_challenges.join(', '),
                              decision_maker_roles: icp.decision_maker_roles.join(', '),
                              qualification_criteria: icp.qualification_criteria.join(', '),
                              is_primary: icp.is_primary,
                              notes: icp.notes || '',
                            });
                            setShowIcpModal(true);
                          }}
                          className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium"
                        >
                          Edit Profile
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                      <div>
                        <span className="font-semibold text-gray-700 uppercase tracking-wider text-[10px] block mb-2">
                          Decision Makers
                        </span>
                        <div className="space-y-1">
                          {icp.decision_maker_roles.map((dm) => (
                            <div key={dm} className="flex items-center gap-1.5 text-gray-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#244235]" />
                              <span>{dm}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="font-semibold text-gray-700 uppercase tracking-wider text-[10px] block mb-2">
                          Critical Challenges
                        </span>
                        <div className="space-y-1">
                          {icp.business_challenges.map((bc) => (
                            <div key={bc} className="flex items-center gap-1.5 text-gray-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>{bc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="font-semibold text-gray-700 uppercase tracking-wider text-[10px] block mb-2">
                          Qualification Criteria
                        </span>
                        <div className="space-y-1">
                          {icp.qualification_criteria.map((qc) => (
                            <div key={qc} className="flex items-center gap-1.5 text-gray-600">
                              <CheckCircle2 size={13} className="text-[#244235] flex-shrink-0" />
                              <span>{qc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal: Objective ── */}
      {showObjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">
                {editingObj ? 'Edit Marketing Objective' : 'New Marketing Objective'}
              </h3>
              <button onClick={() => setShowObjModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveObjective} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Objective Title *</label>
                <input
                  required
                  type="text"
                  value={objForm.title}
                  onChange={(e) => setObjForm({ ...objForm, title: e.target.value })}
                  placeholder="e.g. Accelerate Qualified Inbound Pipeline"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Target Metric *</label>
                <input
                  required
                  type="text"
                  value={objForm.target_metric}
                  onChange={(e) => setObjForm({ ...objForm, target_metric: e.target.value })}
                  placeholder="e.g. Inbound Qualified Leads"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Current Value</label>
                  <input
                    type="number"
                    value={objForm.current_value}
                    onChange={(e) => setObjForm({ ...objForm, current_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Target Value *</label>
                  <input
                    required
                    type="number"
                    value={objForm.target_value}
                    onChange={(e) => setObjForm({ ...objForm, target_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Target Date *</label>
                  <input
                    required
                    type="date"
                    value={objForm.target_date}
                    onChange={(e) => setObjForm({ ...objForm, target_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={objForm.status}
                    onChange={(e) => setObjForm({ ...objForm, status: e.target.value as ObjectiveStatus })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  >
                    <option value="active">Active</option>
                    <option value="behind">Behind Schedule</option>
                    <option value="achieved">Achieved</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={objForm.description}
                  onChange={(e) => setObjForm({ ...objForm, description: e.target.value })}
                  placeholder="Strategic purpose and tactical context..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                />
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowObjModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#244235] text-white rounded-lg hover:bg-[#1a3026] font-medium"
                >
                  {editingObj ? 'Save Changes' : 'Create Objective'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Audience ── */}
      {showAudienceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">
                {editingAudience ? 'Edit Target Audience' : 'New Target Audience'}
              </h3>
              <button onClick={() => setShowAudienceModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveAudience} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Audience Name *</label>
                <input
                  required
                  type="text"
                  value={audForm.name}
                  onChange={(e) => setAudForm({ ...audForm, name: e.target.value })}
                  placeholder="e.g. AI-First Tech Founders"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={audForm.industry}
                    onChange={(e) => setAudForm({ ...audForm, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Company Size</label>
                  <input
                    type="text"
                    value={audForm.company_size}
                    onChange={(e) => setAudForm({ ...audForm, company_size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Geographic Market</label>
                  <input
                    type="text"
                    value={audForm.geographic_market}
                    onChange={(e) => setAudForm({ ...audForm, geographic_market: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Buying Intent</label>
                  <select
                    value={audForm.buying_intent}
                    onChange={(e) => setAudForm({ ...audForm, buying_intent: e.target.value as AudienceIntent })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Target Roles (comma-separated)</label>
                <input
                  type="text"
                  value={audForm.target_roles}
                  onChange={(e) => setAudForm({ ...audForm, target_roles: e.target.value })}
                  placeholder="Founder, CTO, VP Engineering"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Pain Points (comma-separated)</label>
                <textarea
                  rows={2}
                  value={audForm.pain_points}
                  onChange={(e) => setAudForm({ ...audForm, pain_points: e.target.value })}
                  placeholder="Agent reliability, custom model cost, RAG precision"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                />
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAudienceModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#244235] text-white rounded-lg hover:bg-[#1a3026] font-medium"
                >
                  {editingAudience ? 'Save Audience' : 'Create Audience'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: ICP ── */}
      {showIcpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">
                {editingIcp ? 'Edit ICP Profile' : 'New Ideal Customer Profile'}
              </h3>
              <button onClick={() => setShowIcpModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveIcp} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Profile Name *</label>
                <input
                  required
                  type="text"
                  value={icpForm.name}
                  onChange={(e) => setIcpForm({ ...icpForm, name: e.target.value })}
                  placeholder="e.g. Scaling Series-A/B Tech Companies"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={icpForm.industry}
                    onChange={(e) => setIcpForm({ ...icpForm, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Revenue Range</label>
                  <input
                    type="text"
                    value={icpForm.revenue_range}
                    onChange={(e) => setIcpForm({ ...icpForm, revenue_range: e.target.value })}
                    placeholder="$2M - $20M ARR"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Geography</label>
                  <input
                    type="text"
                    value={icpForm.geography}
                    onChange={(e) => setIcpForm({ ...icpForm, geography: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Technology Maturity</label>
                  <input
                    type="text"
                    value={icpForm.technology_maturity}
                    onChange={(e) => setIcpForm({ ...icpForm, technology_maturity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Decision Maker Roles (comma-separated)</label>
                <input
                  type="text"
                  value={icpForm.decision_maker_roles}
                  onChange={(e) => setIcpForm({ ...icpForm, decision_maker_roles: e.target.value })}
                  placeholder="CTO, VP AI, Head of Engineering"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Business Challenges (comma-separated)</label>
                <input
                  type="text"
                  value={icpForm.business_challenges}
                  onChange={(e) => setIcpForm({ ...icpForm, business_challenges: e.target.value })}
                  placeholder="Autonomous agents, RAG governance, custom model fine-tuning"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Qualification Criteria (comma-separated)</label>
                <textarea
                  rows={2}
                  value={icpForm.qualification_criteria}
                  onChange={(e) => setIcpForm({ ...icpForm, qualification_criteria: e.target.value })}
                  placeholder="Budget available, executive sponsorship, 30-day decision horizon"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#244235]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={icpForm.is_primary}
                  onChange={(e) => setIcpForm({ ...icpForm, is_primary: e.target.checked })}
                  className="rounded text-[#244235] focus:ring-[#244235]"
                />
                <label htmlFor="is_primary" className="text-gray-700 font-medium">
                  Set as Primary ICP for campaign targeting
                </label>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowIcpModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#244235] text-white rounded-lg hover:bg-[#1a3026] font-medium"
                >
                  {editingIcp ? 'Save Profile' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
