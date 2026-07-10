import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { getOCEClient } from '../lib/sdk';
import {
  CheckCircle2,
  Loader2,
  Building2,
  Layers,
  Sparkles,
  ShieldCheck,
  Database,
  Tag,
} from 'lucide-react';

interface SetupStep {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  status: 'pending' | 'running' | 'done' | 'error';
}

const INITIAL_STEPS: SetupStep[] = [
  { id: 'org',        label: 'Creating Organization',           icon: Building2,     status: 'pending' },
  { id: 'workspace',  label: 'Creating Default Workspace',      icon: Layers,        status: 'pending' },
  { id: 'types',      label: 'Registering Content Types',       icon: Database,      status: 'pending' },
  { id: 'categories', label: 'Seeding Categories & Tags',       icon: Tag,           status: 'pending' },
  { id: 'ai',         label: 'Configuring AI Settings',         icon: Sparkles,      status: 'pending' },
  { id: 'owner',      label: 'Assigning Owner Role',            icon: ShieldCheck,   status: 'pending' },
];

export default function SetupWizard() {
  const { user, refreshStatus, isInitialized } = useAuth();
  const navigate = useNavigate();
  const sdk = getOCEClient();

  const [orgName, setOrgName] = useState('Originyx');
  const [orgSlug, setOrgSlug] = useState('originyx');
  const [workspaceName, setWorkspaceName] = useState('Default Workspace');
  const [workspaceSlug, setWorkspaceSlug] = useState('default');

  const [phase, setPhase] = useState<'form' | 'initializing' | 'done' | 'error'>('form');
  const [steps, setSteps] = useState<SetupStep[]>(INITIAL_STEPS);
  const [errorMessage, setErrorMessage] = useState('');

  // If already initialized, bounce back immediately
  if (isInitialized) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  function updateStep(id: string, status: SetupStep['status']) {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  }

  async function sleep(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }

  async function handleInitialize(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      setErrorMessage('You must be signed in to initialize the CMS.');
      setPhase('error');
      return;
    }

    setPhase('initializing');

    // Animate steps sequentially to give visual feedback,
    // then execute the single atomic RPC
    const stepIds = steps.map(s => s.id);

    try {
      // Animate each step as "running" to show progress
      for (const sid of stepIds) {
        updateStep(sid, 'running');
        await sleep(420);
      }

      // Execute the atomic RPC — server handles locking and all sub-steps
      await sdk.initializeCMS({
        orgName: orgName.trim(),
        orgSlug: orgSlug.trim().toLowerCase().replace(/\s+/g, '-'),
        workspaceName: workspaceName.trim(),
        workspaceSlug: workspaceSlug.trim().toLowerCase().replace(/\s+/g, '-'),
      });

      // Mark all steps done
      for (const sid of stepIds) {
        updateStep(sid, 'done');
        await sleep(120);
      }

      setPhase('done');

      // Refresh auth context (re-runs getSystemStatus + role fetch)
      await refreshStatus();

      // Navigate to dashboard after brief celebration pause
      await sleep(1200);
      navigate('/dashboard', { replace: true });

    } catch (err: any) {
      console.error('Initialization failed', err);
      // Mark currently-running step as error
      setSteps(prev =>
        prev.map(s => s.status === 'running' ? { ...s, status: 'error' } : s)
      );
      setErrorMessage(err.message || 'Initialization failed. Please try again.');
      setPhase('error');
    }
  }

  function resetToForm() {
    setPhase('form');
    setSteps(INITIAL_STEPS);
    setErrorMessage('');
  }

  // ── Step status icon ─────────────────────────────────────────
  function StepIcon({ step }: { step: SetupStep }) {
    if (step.status === 'done') {
      return <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />;
    }
    if (step.status === 'running') {
      return <Loader2 size={18} className="text-accent animate-spin flex-shrink-0" />;
    }
    if (step.status === 'error') {
      return <span className="text-red-400 flex-shrink-0 text-lg leading-none">✕</span>;
    }
    const Icon = step.icon;
    return <Icon size={18} className="text-text-muted flex-shrink-0" />;
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(225 30% 10%) 0%, hsl(225 20% 6%) 100%)' }}
    >
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 text-accent mb-5">
            <Sparkles size={28} />
          </div>
          <h1 className="text-3xl font-serif font-semibold text-text-primary mb-2">
            Welcome to Originyx CMS
          </h1>
          <p className="text-text-secondary">
            This is a fresh installation. Complete the setup to initialize your workspace.
          </p>
          {user && (
            <p className="mt-2 text-sm text-text-muted">
              Signed in as <span className="text-accent font-medium">{user.email}</span> — you will be assigned as <strong>Owner</strong>.
            </p>
          )}
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl shadow-xl overflow-hidden">

          {/* ── FORM PHASE ────────────────────────────────── */}
          {phase === 'form' && (
            <form onSubmit={handleInitialize} className="p-8 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-1">Organization</h2>
                <p className="text-sm text-text-muted mb-4">The top-level container for your CMS content.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={e => setOrgName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={orgSlug}
                      onChange={e => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      required
                      className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg text-text-primary font-mono text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h2 className="text-lg font-semibold text-text-primary mb-1">Workspace</h2>
                <p className="text-sm text-text-muted mb-4">A logical grouping of content within your organization.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={e => setWorkspaceName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={workspaceSlug}
                      onChange={e => setWorkspaceSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      required
                      className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg text-text-primary font-mono text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* What gets created */}
              <div className="bg-bg-primary rounded-xl border border-border p-4 space-y-2">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Will be created automatically:
                </p>
                {[
                  'Insights, Case Studies & Documentation content types',
                  '9 default categories (AI, Automation, Logistics…)',
                  '7 default tags (LLM, RAG, Agents…)',
                  'AI settings (GPT-4o, embeddings, vector search)',
                  'Owner role assigned to your account',
                ].map(item => (
                  <div key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                    <CheckCircle2 size={15} className="text-accent mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-accent text-white py-3 rounded-xl font-semibold text-base hover:bg-accent-light transition-colors flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
              >
                <Sparkles size={18} />
                Initialize Originyx CMS
              </button>
            </form>
          )}

          {/* ── INITIALIZING PHASE ────────────────────────── */}
          {(phase === 'initializing' || phase === 'done') && (
            <div className="p-8">
              <div className="text-center mb-8">
                {phase === 'done' ? (
                  <>
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 mb-4">
                      <CheckCircle2 size={28} />
                    </div>
                    <h2 className="text-xl font-semibold text-text-primary">CMS Initialized!</h2>
                    <p className="text-text-muted text-sm mt-1">Redirecting to your dashboard…</p>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 border border-accent/20 text-accent mb-4">
                      <Loader2 size={28} className="animate-spin" />
                    </div>
                    <h2 className="text-xl font-semibold text-text-primary">Initializing…</h2>
                    <p className="text-text-muted text-sm mt-1">Setting up your workspace, please wait.</p>
                  </>
                )}
              </div>

              <div className="space-y-3">
                {steps.map(step => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-300 ${
                      step.status === 'done'    ? 'border-green-500/20 bg-green-500/5' :
                      step.status === 'running' ? 'border-accent/30 bg-accent/5' :
                      step.status === 'error'   ? 'border-red-500/20 bg-red-500/5' :
                      'border-border bg-bg-primary opacity-50'
                    }`}
                  >
                    <StepIcon step={step} />
                    <span className={`text-sm font-medium ${
                      step.status === 'done'    ? 'text-green-300' :
                      step.status === 'running' ? 'text-text-primary' :
                      step.status === 'error'   ? 'text-red-300' :
                      'text-text-muted'
                    }`}>
                      {step.label}
                    </span>
                    {step.status === 'done' && (
                      <span className="ml-auto text-xs text-green-400 font-medium">Done</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ERROR PHASE ───────────────────────────────── */}
          {phase === 'error' && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
                <span className="text-2xl">✕</span>
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">Initialization Failed</h2>
              <p className="text-text-muted text-sm mb-6 leading-relaxed max-w-sm mx-auto">
                {errorMessage}
              </p>

              {/* Show which steps completed */}
              <div className="space-y-2 mb-6 text-left">
                {steps.filter(s => s.status !== 'pending').map(step => (
                  <div key={step.id} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                    step.status === 'done'  ? 'text-green-300' :
                    step.status === 'error' ? 'text-red-300' :
                    'text-text-muted'
                  }`}>
                    <StepIcon step={step} />
                    {step.label}
                  </div>
                ))}
              </div>

              <button
                onClick={resetToForm}
                className="w-full bg-surface border border-border text-text-primary py-2.5 rounded-xl font-medium hover:bg-surface-hover transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          Originyx CMS — First-Run Setup
        </p>
      </div>
    </div>
  );
}
