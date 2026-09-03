import { useEffect, useState } from 'react';
import { getOCEClient } from '../lib/sdk';
import { useAuth } from '../lib/AuthContext';
import { useToast } from '../components/Layout/ToastProvider';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const { refreshStatus } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    getOCEClient().getClientProfile().then(p => {
      setProfile(p);
      setName(p?.name || '');
      setRole(p?.role || '');
      setCompany(p?.company || '');
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await getOCEClient().updateClientProfile({ name, role, company });
      await refreshStatus();
      const updated = await getOCEClient().getClientProfile();
      setProfile(updated);
      setCompany(updated?.company || '');
      showToast('Profile updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-text-muted">Loading profile...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-medium text-text-primary mb-1">Account</h1>
        <p className="text-text-secondary">Manage your personal information and company association.</p>
      </div>

      <form onSubmit={handleSave} className="bg-surface border border-border rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-lg font-medium text-text-primary mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Job Title / Role</label>
              <input required type="text" value={role} onChange={e => setRole(e.target.value)} className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
              <input disabled type="text" value={profile?.email || ''} className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-2 text-text-muted cursor-not-allowed" />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h2 className="text-lg font-medium text-text-primary mb-4">Company Association</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Company Name</label>
              <input 
                required 
                type="text" 
                value={company} 
                onChange={e => setCompany(e.target.value)} 
                disabled={!!profile?.company} 
                title={profile?.company ? 'Contact support to change your company association' : ''}
                className={`w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-accent ${profile?.company ? 'bg-bg-secondary text-text-muted cursor-not-allowed' : 'bg-bg-primary text-text-primary'}`} 
              />
              {profile?.company && (
                <p className="text-xs text-text-muted mt-2">
                  Your account is linked to {profile.company}. To change your company association, please contact support.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" disabled={saving} className="bg-text-primary text-bg-primary px-6 py-2 rounded-lg font-medium hover:bg-text-secondary transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
