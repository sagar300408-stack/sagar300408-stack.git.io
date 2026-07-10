import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOCEClient } from '../lib/sdk';
import { useAuth } from '../lib/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, role } = useAuth();
  
  // If already logged in and authorized, redirect to dashboard
  useEffect(() => {
    if (user && (role === 'owner' || role === 'admin')) {
      navigate('/dashboard');
    }
  }, [user, role, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !pass) return;
    
    setLoading(true);
    setError('');
    
    try {
      const sdk = getOCEClient();
      await sdk.signIn(email, pass);
      // AuthContext will automatically pick up the session change 
      // and redirect via the useEffect above.
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-sm p-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 text-accent mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <h1 className="text-2xl font-serif font-medium text-text-primary mb-2">Originyx Content Engine</h1>
          <p className="text-text-secondary text-sm">Sign in to your workspace</p>
        </div>
        
        {error && (
          <div className="mb-6 bg-red/10 border border-red/20 text-red px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Email Address</label>
            <input 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full px-3 py-2 bg-bg-primary border border-border rounded-md focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
            <input 
              type="password" 
              value={pass} 
              onChange={e => setPass(e.target.value)} 
              className="w-full px-3 py-2 bg-bg-primary border border-border rounded-md focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-accent text-white px-4 py-2 rounded-md font-medium hover:bg-accent-light transition-colors disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
