import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOCEClient } from '../lib/sdk';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOCEClient().getClientProfile().then(p => {
      setProfile(p);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-8 text-text-muted">Loading workspace...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-medium text-text-primary mb-1">Welcome, {profile?.name || 'Client'}</h1>
        <p className="text-text-secondary">Your Originyx workspace</p>
      </div>

      {!profile?.isComplete && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-medium text-text-primary mb-2">Complete your profile</h2>
          <div className="w-full bg-bg-secondary rounded-full h-2 mb-4">
            <div className="bg-accent h-2 rounded-full" style={{ width: '33%' }}></div>
          </div>
          <Link to="/account" className="text-accent hover:text-accent-hover font-medium flex items-center gap-1">
            Continue &rarr;
          </Link>
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl p-8 text-center">
        <h3 className="text-text-primary font-medium mb-2">Your Workspace</h3>
        <p className="text-text-muted">No resources are currently available.</p>
      </div>
    </div>
  );
}
