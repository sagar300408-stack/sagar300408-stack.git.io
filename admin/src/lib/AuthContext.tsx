import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getOCEClient } from './sdk';
import type { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  role: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const sdk = getOCEClient();
    const supabase = (sdk as any).supabase;

    async function fetchSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserRole(session.user.id);
        } else {
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      } catch (e) {
        console.error('Session fetch failed', e);
        setLoading(false);
      }
    }

    async function fetchUserRole(userId: string) {
      try {
        // Find role directly from public.user_roles
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single();
          
        if (data) {
          setRole(data.role);
        } else {
          setRole(null);
        }
      } catch (e) {
        console.error('Role fetch failed', e);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        if (session?.user) {
          setUser(session.user);
          if (event === 'SIGNED_IN') {
            setLoading(true);
            await fetchUserRole(session.user.id);
          }
        } else {
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const sdk = getOCEClient();
    await (sdk as any).supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
