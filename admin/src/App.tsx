import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import EditorPage from './pages/EditorPage';
import MediaLibrary from './pages/MediaLibrary';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import SetupWizard from './pages/SetupWizard';
import SidebarLayout from './components/Layout/SidebarLayout';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ToastProvider } from './components/Layout/ToastProvider';
import './App.css';

/**
 * Full-screen loading spinner shown while the bootstrap check runs.
 */
function GlobalLoader() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-bg-primary gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      <p className="text-text-muted text-sm">Loading…</p>
    </div>
  );
}

function adminRedirectParam(location: ReturnType<typeof useLocation>) {
  return encodeURIComponent(`/admin${location.pathname}${location.search}${location.hash}`);
}

/**
 * Protected route wrapper.
 *
 * Flow after loading completes:
 *   not authenticated         → /login
 *   authenticated, not init   → /setup    (Setup Wizard)
 *   authenticated, no role    → /unauthorized
 *   authenticated, has role   → render children
 */
function Protected({ children }: { children: React.ReactNode }) {
  const { user, role, loading, isInitialized } = useAuth();
  const location = useLocation();

  if (loading) return <GlobalLoader />;

  // Step 1: Must be authenticated
  if (!user) {
    return <Navigate to={`/login?redirect=${adminRedirectParam(location)}`} replace />;
  }

  // Step 2: CMS must be initialized
  if (!isInitialized) {
    return <Navigate to="/setup" replace />;
  }

  // Step 3: Must have an authorized role
  if (role !== 'owner' && role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

/**
 * Setup route guard — only accessible when:
 *   - User is authenticated
 *   - CMS is NOT initialized
 * If already initialized → redirect to dashboard.
 */
function SetupGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isInitialized } = useAuth();
  const location = useLocation();

  if (loading) return <GlobalLoader />;

  // Must be signed in to run setup
  if (!user) {
    return <Navigate to={`/login?redirect=${adminRedirectParam(location)}`} replace />;
  }

  // Already initialized? Go to dashboard
  if (isInitialized) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter basename="/admin">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* First-run setup — only before initialization */}
            <Route
              path="/setup"
              element={
                <SetupGuard>
                  <SetupWizard />
                </SetupGuard>
              }
            />

            {/* Protected app routes */}
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
              path="/media"
              element={
                <Protected>
                  <SidebarLayout>
                    <MediaLibrary />
                  </SidebarLayout>
                </Protected>
              }
            />
            <Route
              path="/settings"
              element={
                <Protected>
                  <SidebarLayout>
                    <Settings />
                  </SidebarLayout>
                </Protected>
              }
            />

            {/* Full-screen editor (no sidebar) */}
            <Route
              path="/editor/new"
              element={
                <Protected>
                  <EditorPage />
                </Protected>
              }
            />
            <Route
              path="/editor/:id"
              element={
                <Protected>
                  <EditorPage />
                </Protected>
              }
            />
            <Route path="/editor" element={<Navigate to="/dashboard" replace />} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
