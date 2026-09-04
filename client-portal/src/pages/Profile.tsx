import { useEffect, useState } from 'react';
import { getOCEClient } from '../lib/sdk';
import { useAuth } from '../lib/AuthContext';
import { useToast } from '../components/Layout/ToastProvider';
import { Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const { user, refreshStatus, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    getOCEClient().getClientProfile().then(p => {
      setProfile(p);
      setName(p?.name || '');
      setRole(p?.role || '');
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await getOCEClient().updateClientProfile({ name, role, company: profile?.company || '' });
      await refreshStatus();
      const updated = await getOCEClient().getClientProfile();
      setProfile(updated);
      showToast('Profile updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setResetting(true);
    try {
      const { error } = await getOCEClient().supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin + '/account',
      });
      if (error) throw error;
      showToast('Password reset email sent. Please check your inbox.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to send reset email.', 'error');
    } finally {
      setResetting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div className="animate-pulse space-y-16">
          <div className="space-y-4">
            <div className="h-3 bg-border rounded w-24"></div>
            <div className="h-12 bg-border/60 rounded w-1/3 max-w-xs"></div>
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-surface border border-border rounded-2xl"></div>
            <div className="h-40 bg-surface border border-border rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Hero */}
      <section className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 lg:py-20">
          <p className="text-xs font-mono font-bold tracking-[0.18em] text-accent uppercase mb-5">
            Account Settings
          </p>
          <h1 className="font-serif text-5xl lg:text-6xl text-text-primary leading-[1.1] tracking-tight mb-5">
            Your Account.
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed max-w-xl">
            Manage your personal information, company association, and security preferences.
          </p>
        </div>
      </section>

      {/* Settings Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div className="max-w-3xl space-y-16">

          {/* ─── Personal Information ─── */}
          <section>
            {/* Section eyebrow — "01 / PROCESS AUTOMATION" style */}
            <div className="flex items-center gap-3 mb-8 pb-5 border-b border-border">
              <span className="text-xs font-mono font-bold tracking-[0.15em] text-text-muted">01</span>
              <span className="text-text-muted font-mono text-xs">/</span>
              <span className="text-xs font-mono font-bold tracking-[0.15em] text-text-muted uppercase">Personal Information</span>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">Full Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">Job Title / Role</label>
                  <input
                    required
                    type="text"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="block text-sm font-medium text-text-primary">Email Address</label>
                  <input
                    disabled
                    type="email"
                    value={user?.email || ''}
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-text-muted text-sm font-mono cursor-not-allowed"
                  />
                  <p className="text-xs text-text-muted">Contact Originyx to change your email address.</p>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center px-8 py-2.5 bg-accent text-white text-sm font-medium rounded-full hover:bg-accent-light transition-colors disabled:opacity-60 min-w-[140px]"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>

          {/* ─── Company Association ─── */}
          <section>
            <div className="flex items-center gap-3 mb-8 pb-5 border-b border-border">
              <span className="text-xs font-mono font-bold tracking-[0.15em] text-text-muted">02</span>
              <span className="text-text-muted font-mono text-xs">/</span>
              <span className="text-xs font-mono font-bold tracking-[0.15em] text-text-muted uppercase">Company Association</span>
            </div>

            {/* Matches the "AI Summary" tinted card block from originyx.in */}
            <div className="bg-bg-secondary border border-border rounded-xl p-7">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center font-serif text-lg font-medium text-accent flex-shrink-0">
                  {profile?.company ? profile.company.charAt(0).toUpperCase() : 'O'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary font-semibold text-lg truncate">
                    {profile?.company || 'No company associated'}
                  </p>
                  <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                    This association is managed by Originyx. To update your linked organization, please contact your account manager.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ─── Security & Session ─── */}
          <section>
            <div className="flex items-center gap-3 mb-8 pb-5 border-b border-border">
              <span className="text-xs font-mono font-bold tracking-[0.15em] text-text-muted">03</span>
              <span className="text-text-muted font-mono text-xs">/</span>
              <span className="text-xs font-mono font-bold tracking-[0.15em] text-text-muted uppercase">Security &amp; Session</span>
            </div>

            <div className="space-y-5">
              {/* Password Reset row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 py-6 border-b border-border">
                <div>
                  <p className="font-medium text-text-primary">Password Reset</p>
                  <p className="text-sm text-text-secondary mt-1">
                    Send a secure reset link to <span className="font-mono text-text-primary">{user?.email}</span>.
                  </p>
                </div>
                <button
                  onClick={handleResetPassword}
                  disabled={resetting}
                  className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-2.5 border border-border bg-surface text-text-primary text-sm font-medium rounded-full hover:bg-bg-secondary transition-colors disabled:opacity-60 whitespace-nowrap"
                >
                  <Shield size={14} className="text-text-muted" />
                  {resetting ? 'Sending…' : 'Reset Password'}
                </button>
              </div>

              {/* Sign Out row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 py-6">
                <div>
                  <p className="font-medium text-text-primary">Sign Out</p>
                  <p className="text-sm text-text-secondary mt-1">
                    Securely end your current session.
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-2.5 border border-rose/25 text-rose text-sm font-medium rounded-full hover:bg-rose/5 transition-colors whitespace-nowrap"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
