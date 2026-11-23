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

          // For OAuth registrations: send a welcome email on first-time SIGNED_IN
          // The server-side idempotency guard prevents duplicate sends.
          if (event === 'SIGNED_IN' && currentSession?.user) {
            this._maybeWelcomeOAuthUser(currentSession.user);
          }
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

      // Send welcome email (fire-and-forget — do not block signup on delivery)
      if (data?.user?.id) {
        this._sendWelcomeEmail({
          userId: data.user.id,
          name:   fullName || '',
          email:  email,
          provider: 'email',
          needsVerification: !data.user.email_confirmed_at,
        }).catch(err => console.warn('[auth] Welcome email failed (non-fatal):', err));
      }

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

      const urlParams = new URLSearchParams(window.location.search);
      const nextParam = urlParams.get('next') || sessionStorage.getItem('originyx_auth_return_url');
      let redirectUrl = window.location.origin;
      if (nextParam) {
        redirectUrl = window.location.origin + '?next=' + encodeURIComponent(nextParam);
      }

      const { data, error } = await this.client.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl
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

    // Sign Out — sends logout notification email (fire-and-forget) then signs out
    async signOut({ skipNotification = false } = {}) {
      await this.init();
      if (!this.configured) return;

      // Capture user details and session token before the session is destroyed
      const userForEmail = (!skipNotification && this.user) ? {
        id:    this.user.id,
        name:  this.user.user_metadata?.full_name || this.user.email || '',
        email: this.user.email || '',
        token: this.session?.access_token || null,
      } : null;

      const { error } = await this.client.auth.signOut();
      if (error) throw error;
      
      this.session = null;
      this.user = null;
      localStorage.removeItem('originyx_pending_action');
      this.dispatchStateChange('SIGNED_OUT');

      // Send logout notification email (fire-and-forget — do NOT block logout)
      if (userForEmail && userForEmail.email) {
        this._sendLogoutEmail(userForEmail).catch(
          err => console.warn('[auth] Logout email failed (non-fatal):', err)
        );
      }
    },

    // -------------------------------------------------------------------------
    // Internal: Send welcome email via server-side API
    // -------------------------------------------------------------------------
    async _sendWelcomeEmail({ userId, name, email, provider = 'email', needsVerification = false }) {
      const response = await fetch('/api/auth/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:            userId,
          name:               name,
          email:              email,
          provider:           provider,
          needs_verification: needsVerification,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Welcome email API returned ${response.status}`);
      }
      return response.json();
    },

    // -------------------------------------------------------------------------
    // Internal: Send logout notification email via server-side API
    // -------------------------------------------------------------------------
    async _sendLogoutEmail({ id, name, email, token }) {
      // Generate a per-logout event UUID for idempotency
      const eventId = ([1e7]+-1e3+-4e3+-8e3+-1e11)
        .replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );

      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/auth/logout-notify', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id:     id,
          name:        name,
          email:       email,
          logout_time: new Date().toISOString(),
          event_id:    eventId,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Logout notify API returned ${response.status}`);
      }
      return response.json();
    },

    // -------------------------------------------------------------------------
    // Internal: Handle OAuth first-time registration welcome email
    // Called after a SIGNED_IN event when the provider is Google or Microsoft.
    // Sends welcome email only once using client and server-side idempotency guards.
    // -------------------------------------------------------------------------
    async _maybeWelcomeOAuthUser(user) {
      if (!user || !user.email) return;

      // Determine provider from app_metadata
      const provider = user.app_metadata?.provider;
      if (provider !== 'google' && provider !== 'azure') return;

      // Check whether this account was created recently (within last 10 minutes)
      // If the account was created earlier, this is a normal recurring login, NOT a new signup.
      if (user.created_at) {
        const createdAt = new Date(user.created_at).getTime();
        const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
        if (createdAt < tenMinutesAgo) {
          // Returning user login — do not send welcome email!
          return;
        }
      }

      // Use session storage as a lightweight client-side duplicate-prevention check
      // The server-side email_sent_log and account age check are the authoritative guards.
      const clientKey = `originyx_welcomed_${user.id}`;
      if (sessionStorage.getItem(clientKey)) return;
      sessionStorage.setItem(clientKey, '1');

      this._sendWelcomeEmail({
        userId:   user.id,
        name:     user.user_metadata?.full_name || user.user_metadata?.name || '',
        email:    user.email,
        provider: provider === 'azure' ? 'microsoft' : 'google',
        needsVerification: false, // OAuth emails are pre-verified
      }).catch(err => console.warn('[auth] OAuth welcome email failed (non-fatal):', err));
    },
  };

  // Auto-initialize when file is loaded
  document.addEventListener('DOMContentLoaded', () => {
    window.originyxAuth.init();
  });
})();
