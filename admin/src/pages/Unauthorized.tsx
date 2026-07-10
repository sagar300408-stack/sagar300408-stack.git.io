import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-sm p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red/10 text-red mb-6">
          <ShieldAlert size={32} />
        </div>
        
        <h1 className="text-2xl font-serif font-medium text-text-primary mb-2">Access Denied</h1>
        <p className="text-text-secondary mb-6 leading-relaxed">
          You do not have permission to access the CMS Dashboard. This area is restricted to Workspace Owners and Administrators.
        </p>
        
        <div className="bg-bg-primary border border-border rounded-lg p-4 mb-8 text-sm text-left">
          <p className="text-text-muted mb-1">Logged in as:</p>
          <p className="font-medium text-text-primary break-all">{user?.email}</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="w-full flex items-center justify-center gap-2 bg-bg-primary border border-border text-text-primary px-4 py-2.5 rounded-md font-medium hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft size={16} />
            Return to Site
          </button>
          
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 bg-red text-white px-4 py-2.5 rounded-md font-medium hover:bg-red-dark transition-colors"
          >
            <LogOut size={16} />
            Sign Out & Switch Account
          </button>
        </div>
      </div>
    </div>
  );
}
