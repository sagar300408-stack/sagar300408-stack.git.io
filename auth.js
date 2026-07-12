/* ============================================
   ORIGINYX — Authentication & Session Manager
   ============================================ */

(function () {
  // Global auth state object
  window.originyxAuth = {
    client: null,
    configured: false,
    session: null,
    user: null,
    initPromise: null,

    // Initialize Supabase configuration
    async init() {
      if (this.initPromise) return this.initPromise;
      this.initPromise = this._initialize();
      return this.initPromise;
    },

    async _initialize() {
      try {
        const response = await fetch('/api/config');
        if (!response.ok) {
          throw new Error('Failed to fetch authentication config.');
        }
        const config = await response.json();

        if (!config.configured) {
          console.warn('Supabase authentication is not configured yet.');
          this.configured = false;
          this.dispatchStateChange();
          return;
        }

        // Initialize Supabase client using library loaded via CDN
        if (typeof window.supabase === 'undefined') {
          throw new Error('Supabase client library failed to load.');
        }

        this.client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
        this.configured = true;

        // Fetch initial session
        const { data: { session }, error } = await this.client.auth.getSession();
        
        if (error || !session) {
          if (this.session || this.user) {
            this.session = null;
            this.user = null;
            this.dispatchStateChange('SIGNED_OUT');
          } else {
            this.session = null;
            this.user = null;
          }
        } else {
          this.session = session;
          this.user = session ? session.user : null;
        }

        // Listen for session/auth state changes
        this.client.auth.onAuthStateChange((event, currentSession) => {
          this.session = currentSession;
          this.user = currentSession ? currentSession.user : null;
          this.dispatchStateChange(event);
        });
        
        if (!error && session) {
            this.dispatchStateChange('INITIAL');
        } else {
            this.dispatchStateChange(); // Just dispatch configured state
        }

      } catch (err) {
        console.error('Authentication Initialization Error:', err);
        this.configured = false;
        this.dispatchStateChange();
      }
    },

    // Cached state is for rendering only. Protected actions must use getCurrentSession().
    isAuthenticated() {
      return this.configured && !!this.user;
    },

    // Revalidate with Supabase on every protected action.
    async getCurrentSession() {
      await this.init();
      if (!this.configured || !this.client) return null;

      const { data: { session }, error } = await this.client.auth.getSession();
      if (error) {
        this.session = null;
        this.user = null;
        this.dispatchStateChange('SESSION_CHECK_FAILED');
        throw error;
      }

      this.session = session;
      this.user = session ? session.user : null;
      return session;
    },

    // Dispatch a custom event so other components can react
    dispatchStateChange(event = 'INITIAL') {
      const stateEvent = new CustomEvent('originyx-auth-state-change', {
        detail: {
          configured: this.configured,
          authenticated: this.isAuthenticated(),
          user: this.user,
          session: this.session,
          event: event
        }
      });
      window.dispatchEvent(stateEvent);
    },

    // Email + Password Sign Up
    async signUp(email, password, fullName, termsAccepted = true) {
      if (!this.configured) throw new Error('Auth system not configured.');
      
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            accepted_terms: termsAccepted,
            accepted_privacy: termsAccepted,
            terms_version: "2026-07-v1",
            privacy_version: "2026-07-v1",
            accepted_at: new Date().toISOString()
          }
        }
      });

      if (error) throw error;
      return data;
    },

    // Email + Password Sign In
    async signIn(email, password) {
      if (!this.configured) throw new Error('Auth system not configured.');

      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    },

    // OAuth Sign In (Google or Microsoft)
    async signInWithOAuth(provider) {
      if (!this.configured) throw new Error('Auth system not configured.');

      const { data, error } = await this.client.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
      return data;
    },

    // Reset Password Request
    async resetPassword(email) {
      if (!this.configured) throw new Error('Auth system not configured.');
      
      // Redirect to the dedicated reset password page
      const redirectUrl = 'https://originyx.in/reset-password/';

      const { data, error } = await this.client.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) throw error;
      return data;
    },

    // Update Password (used in Password Recovery flow)
    async updatePassword(newPassword) {
      if (!this.configured) throw new Error('Auth system not configured.');

      const { data, error } = await this.client.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return data;
    },

    // Sign Out
    async signOut() {
      await this.init();
      if (!this.configured) return;
      const { error } = await this.client.auth.signOut();
      if (error) throw error;
      
      this.session = null;
      this.user = null;
      localStorage.removeItem('originyx_pending_action');
      this.dispatchStateChange('SIGNED_OUT');
    }
  };

  // Auto-initialize when file is loaded
  document.addEventListener('DOMContentLoaded', () => {
    window.originyxAuth.init();
  });
})();
