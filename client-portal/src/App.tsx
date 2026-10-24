import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ExploreProducts from './pages/ExploreProducts';
import MyProducts from './pages/MyProducts';
import Subscriptions from './pages/Subscriptions';
import Billing from './pages/Billing';
import NotFound from './pages/NotFound';
import PortalHome from './pages/PortalHome';
import ProductDetail from './pages/ProductDetail';
import Pricing from './pages/Pricing';
import Docs from './pages/Docs';
import SidebarLayout from './components/Layout/SidebarLayout';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ToastProvider } from './components/Layout/ToastProvider';
import './App.css';

const MAIN_SITE_SIGNIN =
  import.meta.env.VITE_MAIN_SITE_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://originyx.in');

function GlobalLoader({ message = 'Loading workspace…' }: { message?: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-bg-primary gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      <p className="text-text-muted text-sm">{message}</p>
    </div>
  );
}

/**
 * Route guard that requires a valid authenticated Supabase session.
 * If unauthenticated, safely redirects to the Originyx sign-in modal
 * with the intended return destination encoded.
 */
function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading, isLoggingOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Only redirect when initialization is complete, not logging out, and no user session exists
    if (!loading && !isLoggingOut && !user) {
      const intended = encodeURIComponent(
        window.location.origin + location.pathname + location.search
      );
      window.location.replace(`${MAIN_SITE_SIGNIN}?next=${intended}`);
    }
  }, [user, loading, isLoggingOut, location]);

  if (loading) {
    return <GlobalLoader message="Loading workspace…" />;
  }

  if (isLoggingOut) {
    return <GlobalLoader message="Signing out…" />;
  }

  if (!user) {
    return <GlobalLoader message="Redirecting to sign in…" />;
  }

  return <>{children}</>;
}

/**
 * Handles the OAuth callback from Supabase.
 * Supabase redirects back to the Client Portal after OAuth.
 * This component waits for the session to be established, then
 * sends the user to /dashboard (or a stored next destination).
 */
function AuthCallback() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user) {
      const stored = sessionStorage.getItem('cp_return_path');
      sessionStorage.removeItem('cp_return_path');
      navigate(stored || '/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  return <GlobalLoader message="Authenticating…" />;
}

function RootRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return <GlobalLoader message="Loading workspace…" />;
  }
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <PortalHome />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter basename="/">
          <Routes>
            {/* Local login page — used for OAuth callback (Supabase redirects here) */}
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Public routes — accessible without authentication */}
            <Route path="/" element={<RootRoute />} />

            {/* Public discovery routes — accessible without authentication */}
            <Route
              path="/explore"
              element={
                <SidebarLayout>
                  <ExploreProducts />
                </SidebarLayout>
              }
            />
            <Route
              path="/products"
              element={
                <SidebarLayout>
                  <ExploreProducts />
                </SidebarLayout>
              }
            />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/docs" element={<Docs />} />

            {/* Protected routes — require a valid Supabase session */}
            <Route
              path="/dashboard"
              element={
                <Protected>
                  <SidebarLayout>
                    <Dashboard />
                  </SidebarLayout>
                </Protected>
              }
            />

            <Route
              path="/my-products"
              element={
                <Protected>
                  <SidebarLayout>
                    <MyProducts />
                  </SidebarLayout>
                </Protected>
              }
            />
            
            <Route
              path="/subscriptions"
              element={
                <Protected>
                  <SidebarLayout>
                    <Subscriptions />
                  </SidebarLayout>
                </Protected>
              }
            />
            
            <Route
              path="/billing"
              element={
                <Protected>
                  <SidebarLayout>
                    <Billing />
                  </SidebarLayout>
                </Protected>
              }
            />

            <Route
              path="/account"
              element={
                <Protected>
                  <SidebarLayout>
                    <Profile />
                  </SidebarLayout>
                </Protected>
              }
            />

            {/* Default: redirect root to dashboard (Protected will handle auth) */}
            

            {/* 404 Not Found Page for unknown application routes */}
            <Route
              path="*"
              element={
                <SidebarLayout>
                  <NotFound />
                </SidebarLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
