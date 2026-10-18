import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getOCEClient } from './sdk';
import type { User } from '@supabase/supabase-js';
import type { SystemStatus } from './sdk';

type AuthContextType = {
  user: User | null;
  role: string | null;
  loading: boolean;
  isInitialized: boolean;
  systemStatus: SystemStatus | null;
  signOut: () => Promise<void>;
  refreshStatus: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  isInitialized: false,
  systemStatus: null,
  signOut: async () => {},
  refreshStatus: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  const sdk = getOCEClient();
  const supabase = sdk.supabase;

  /**
   * Full bootstrap sequence:
   * 1. Call get_system_status() RPC — single round trip.
   * 2. If initialized, attempt to fetch the user's role.
   * 3. If not initialized, set isInitialized=false.
   */
  async function bootstrap(currentUser: User | null) {
    try {
      const status = await sdk.getSystemStatus();
      setSystemStatus(status);
      setIsInitialized(status.initialized);

      if (!status.initialized || !currentUser) {
        setRole(null);
        return;
      }

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .limit(1)
        .maybeSingle();

      setRole(data?.role ?? null);
    } catch (e) {
      console.warn('Bootstrap check note:', e);
      setRole(null);
      setIsInitialized(false);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Re-runs the bootstrap sequence.
   */
  async function refreshStatus() {
    setLoading(true);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser ?? null);
    await bootstrap(currentUser ?? null);
  }

  useEffect(() => {
    async function init() {
      try {
        // 1. If tokens were forwarded in URL hash (e.g. from cross-origin handoff), capture and establish session
        if (window.location.hash && window.location.hash.includes('access_token')) {
          try {
            const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            if (accessToken && refreshToken) {
              const { error: setSessionErr } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (setSessionErr) {
                console.error('Failed to establish session from handoff tokens:', setSessionErr.message);
              }
            }
          } catch (err) {
            console.error('Error parsing auth tokens from URL hash:', err);
          } finally {
            // Clean up the URL hash cleanly without a full page reload to protect sensitive tokens
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }

        // 2. If authorization code is present in query parameters (e.g. PKCE OAuth or magic link callback)
        if (window.location.search && window.location.search.includes('code=')) {
          try {
            const searchParams = new URLSearchParams(window.location.search);
            const code = searchParams.get('code');
            if (code) {
              const { error: codeErr } = await supabase.auth.exchangeCodeForSession(code);
              if (codeErr) {
                console.error('Failed to exchange authorization code for session:', codeErr.message);
              }
              searchParams.delete('code');
              searchParams.delete('state');
              const cleanSearch = searchParams.toString() ? `?${searchParams.toString()}` : '';
              window.history.replaceState(null, '', window.location.pathname + cleanSearch + window.location.hash);
            }
          } catch (err) {
            console.error('Error processing authorization code:', err);
          }
        }

        // 3. Retrieve and validate the active session
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) {
          console.warn('Session verification issue:', sessionErr.message);
        }

        const currentUser = session?.user ?? null;
        setUser(currentUser);
        await bootstrap(currentUser);
      } catch (e) {
        console.error('Session initialization failed:', e);
        setLoading(false);
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setLoading(true);
          await bootstrap(currentUser);
        } else if (event === 'SIGNED_OUT') {
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('SignOut error:', e);
    }
    const mainSiteUrl =
      import.meta.env.VITE_MAIN_SITE_URL ||
      (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://originyx.in');
    window.location.href = `${mainSiteUrl}?auth=signout`;
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, isInitialized, systemStatus, signOut, refreshStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
