import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOCEClient } from '../lib/sdk';
import { useAuth } from '../lib/AuthContext';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getOCEClient().getClientProfile().then(p => {
      setProfile(p);
      setLoading(false);
    });
  }, []);

  const getFirstName = () => {
    if (profile?.name) return profile.name.split(' ')[0];
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name.split(' ')[0];
    return 'Client';
  };

  const getInitials = () => {
    const name = profile?.name || user?.user_metadata?.full_name || user?.email || 'C';
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div className="animate-pulse space-y-16">
          <div className="space-y-4">
            <div className="h-3 bg-border rounded w-32"></div>
            <div className="h-14 bg-border/60 rounded-lg w-2/3 max-w-lg"></div>
            <div className="h-5 bg-border/40 rounded w-1/2 max-w-md"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-surface border border-border rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section — large editorial header like originyx.in sections */}
      <section className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            <div className="max-w-2xl">
              {/* Eyebrow — exactly matching the "01 / PROCESS AUTOMATION" pattern */}
              <p className="text-xs font-mono font-bold tracking-[0.18em] text-accent uppercase mb-6">
                Client Workspace
              </p>
              <h1 className="font-serif text-5xl lg:text-6xl text-text-primary leading-[1.1] tracking-tight mb-6">
                Welcome back,<br />
                <span className="italic">{getFirstName()}.</span>
              </h1>
              <p className="text-text-secondary text-lg leading-relaxed max-w-xl">
                Your private Originyx workspace. Access the tools, automation endpoints, and resources available to your organization.
              </p>
            </div>

            {/* Avatar card — right-side context block matching the "80% / REDUCTION" stat pattern */}
            <div className="lg:flex-shrink-0">
              <div className="inline-flex flex-col items-center bg-bg-secondary border border-border rounded-2xl px-10 py-8 gap-3">
                <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center text-2xl font-bold font-serif text-accent shadow-sm">
                  {getInitials()}
                </div>
                <div className="text-center">
                  <p className="font-medium text-text-primary text-lg">{profile?.name || user?.user_metadata?.full_name || 'Client'}</p>
                  <p className="text-xs font-mono text-text-muted mt-0.5 tracking-wide">{profile?.company || 'Originyx Client'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Completion Banner — using the AI SUMMARY left-border block pattern */}
      {!profile?.isComplete && (
        <section className="border-b border-border bg-bg-primary">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-surface border border-border border-l-[3px] border-l-accent rounded-xl px-7 py-5">
              <div>
                <p className="text-xs font-mono font-bold tracking-[0.15em] text-accent uppercase mb-1">
                  Action Required
                </p>
                <p className="text-text-primary font-medium">Complete your profile to activate your workspace.</p>
              </div>
              <Link
                to="/account"
                className="flex-shrink-0 inline-flex items-center justify-center px-6 py-2.5 bg-accent text-white text-sm font-medium rounded-full hover:bg-accent-light transition-colors whitespace-nowrap"
              >
                Complete Profile →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Workspace Content */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
        {/* Section heading — matches the "TRUSTED BY FOUNDERS..." block */}
        <div className="mb-12">
          <p className="text-xs font-mono font-bold tracking-[0.18em] text-text-muted uppercase mb-3">
            Active Resources
          </p>
          <div className="flex items-end gap-6 border-b border-border pb-6">
            <h2 className="font-serif text-3xl text-text-primary">Your Workspace</h2>
          </div>
        </div>

        {/* Empty State — editorial empty state, not a card with icon */}
        <div className="py-24 lg:py-36 flex flex-col items-center justify-center text-center">
          <div className="w-px h-16 bg-border mx-auto mb-10"></div>
          <p className="font-serif text-2xl lg:text-3xl text-text-primary mb-4">No active resources</p>
          <p className="text-text-muted max-w-sm mx-auto leading-relaxed">
            There are no applications, workflows, or automation endpoints currently assigned to this workspace.
          </p>
          <div className="w-px h-16 bg-border mx-auto mt-10"></div>
        </div>

        {/* Bottom context grid — matching the "7 / Agentic / Enterprise / Automation" stat blocks */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border border border-border rounded-xl overflow-hidden mt-0">
          {[
            { value: 'Private', label: 'Client Access' },
            { value: 'Secure', label: 'Workspace Isolation' },
            { value: 'Direct', label: 'Originyx Channel' },
          ].map(item => (
            <div key={item.label} className="bg-bg-primary px-8 py-10 text-center">
              <p className="font-serif text-2xl text-text-primary mb-2">{item.value}</p>
              <p className="text-xs font-mono font-bold tracking-[0.12em] text-text-muted uppercase">{item.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
