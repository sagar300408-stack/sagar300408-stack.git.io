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
   * 3. If not initialized, set isInitialized=false so routing sends to /setup.
   */
  async function bootstrap(currentUser: User | null) {
    try {
      // Single RPC call — replaces direct organization queries
      const status = await sdk.getSystemStatus();
      setSystemStatus(status);
      setIsInitialized(status.initialized);

      if (!status.initialized) {
        // CMS not set up yet. No role lookup needed.
        setRole(null);
        return;
      }

      if (!currentUser) {
        setRole(null);
        return;
      }

      // CMS is initialized — fetch this user's role
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .limit(1)
        .single();

      setRole(data?.role ?? null);
    } catch (e) {
      console.error('Bootstrap check failed', e);
      setRole(null);
      setIsInitialized(false);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Re-runs the bootstrap sequence. Called after Setup Wizard completes
   * so the context updates without a full page reload.
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
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        await bootstrap(currentUser);
      } catch (e) {
        console.error('Session fetch failed', e);
        setLoading(false);
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (event === 'SIGNED_IN') {
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
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, isInitialized, systemStatus, signOut, refreshStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
