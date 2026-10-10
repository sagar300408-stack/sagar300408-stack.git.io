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

// Control Center modules
import Overview from './pages/Overview';
import MyWork from './pages/MyWork';
import Leads from './pages/Leads';
import Customers from './pages/Customers';
import Opportunities from './pages/Opportunities';
import Products from './pages/Products';
import Subscriptions from './pages/Subscriptions';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import ComingSoonPage from './pages/ComingSoonPage';

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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Step 2: CMS must be initialized
  if (!isInitialized) {
    return <Navigate to="/setup" replace />;
  }

  // Step 3: Must have an authorized role
  if (role !== 'owner' && role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <SidebarLayout>{children}</SidebarLayout>;
}

/**
 * Protected route for full screen mode (no sidebar).
 */
function ProtectedFullScreen({ children }: { children: React.ReactNode }) {
  const { user, role, loading, isInitialized } = useAuth();
  const location = useLocation();

  if (loading) return <GlobalLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isInitialized) return <Navigate to="/setup" replace />;
  if (role !== 'owner' && role !== 'admin') return <Navigate to="/unauthorized" replace />;

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
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (isInitialized) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* First-run setup */}
            <Route path="/setup" element={<SetupGuard><SetupWizard /></SetupGuard>} />

            {/* --- Command Center --- */}
            <Route path="/dashboard" element={<Protected><Overview /></Protected>} />
            <Route path="/my-work" element={<Protected><MyWork /></Protected>} />
            <Route path="/inbox" element={<Protected><ComingSoonPage title="Inbox" description="Unified communications and notifications center is coming soon." /></Protected>} />
            <Route path="/calendar" element={<Protected><ComingSoonPage title="Calendar" description="Team calendar and schedule views are coming soon." /></Protected>} />

            {/* --- Business --- */}
            <Route path="/leads" element={<Protected><Leads /></Protected>} />
            <Route path="/prospects" element={<Protected><ComingSoonPage title="Prospects" description="Account-based prospecting and enrichment coming soon." /></Protected>} />
            <Route path="/customers" element={<Protected><Customers /></Protected>} />
            <Route path="/opportunities" element={<Protected><Opportunities /></Protected>} />
            <Route path="/partnerships" element={<Protected><ComingSoonPage title="Partnerships" description="Partner and channel management coming soon." /></Protected>} />
            <Route path="/revenue" element={<Protected><ComingSoonPage title="Revenue" description="Revenue forecasting and financial pipeline coming soon." /></Protected>} />

            {/* --- Growth --- */}
            <Route path="/marketing" element={<Protected><ComingSoonPage title="Marketing" description="Marketing dashboard and campaign oversight coming soon." /></Protected>} />
            <Route path="/content" element={<Protected><ComingSoonPage title="Content Engine" description="Content distribution and publishing engine coming soon." /></Protected>} />
            <Route path="/linkedin" element={<Protected><ComingSoonPage title="LinkedIn" description="LinkedIn automation and engagement tracking coming soon." /></Protected>} />
            <Route path="/campaigns" element={<Protected><ComingSoonPage title="Campaigns" description="Outreach and marketing campaigns coming soon." /></Protected>} />
            <Route path="/analytics" element={<Protected><ComingSoonPage title="Analytics" description="Web and growth analytics coming soon." /></Protected>} />

            {/* --- Products --- */}
            <Route path="/products" element={<Protected><Products /></Protected>} />
            <Route path="/subscriptions" element={<Protected><Subscriptions /></Protected>} />
            <Route path="/roadmaps" element={<Protected><ComingSoonPage title="Roadmaps" description="Product roadmaps and feature planning coming soon." /></Protected>} />
            <Route path="/releases" element={<Protected><ComingSoonPage title="Releases" description="Release notes and changelog management coming soon." /></Protected>} />

            {/* --- Operations --- */}
            <Route path="/projects" element={<Protected><Projects /></Protected>} />
            <Route path="/tasks" element={<Protected><Tasks /></Protected>} />
            <Route path="/processes" element={<Protected><ComingSoonPage title="Processes" description="Standard operating procedures (SOPs) coming soon." /></Protected>} />
            <Route path="/documents" element={<Protected><ComingSoonPage title="Documents" description="Internal document management coming soon." /></Protected>} />
            
            {/* Legacy CMS mapping */}
            <Route path="/insights" element={<Protected><Dashboard /></Protected>} />
            <Route path="/media" element={<Protected><MediaLibrary /></Protected>} />
            
            {/* Full-screen editor (no sidebar) */}
            <Route path="/editor/new" element={<ProtectedFullScreen><EditorPage /></ProtectedFullScreen>} />
            <Route path="/editor/:id" element={<ProtectedFullScreen><EditorPage /></ProtectedFullScreen>} />
            <Route path="/editor" element={<Navigate to="/insights" replace />} />

            {/* --- Finance --- */}
            <Route path="/finance" element={<Protected><ComingSoonPage title="Finance" description="Financial dashboard and reporting coming soon." /></Protected>} />
            <Route path="/invoices" element={<Protected><ComingSoonPage title="Invoices" description="Invoice management and generation coming soon." /></Protected>} />
            <Route path="/expenses" element={<Protected><ComingSoonPage title="Expenses" description="Expense tracking and approval coming soon." /></Protected>} />
            <Route path="/payments" element={<Protected><ComingSoonPage title="Payments" description="Payment reconciliation and gateways coming soon." /></Protected>} />

            {/* --- Company --- */}
            <Route path="/company" element={<Protected><ComingSoonPage title="Company Profile" description="Organization details and branding coming soon." /></Protected>} />
            <Route path="/team" element={<Protected><ComingSoonPage title="Team" description="Employee directory and org chart coming soon." /></Protected>} />
            <Route path="/vendors" element={<Protected><ComingSoonPage title="Vendors" description="Vendor and supplier management coming soon." /></Protected>} />
            <Route path="/integrations" element={<Protected><ComingSoonPage title="Integrations" description="API keys and third-party integrations coming soon." /></Protected>} />
            <Route path="/settings" element={<Protected><Settings /></Protected>} />

            {/* --- Administration --- */}
            <Route path="/admin-users" element={<Protected><ComingSoonPage title="Admin Users" description="User management and invites coming soon." /></Protected>} />
            <Route path="/roles" element={<Protected><ComingSoonPage title="Roles & Permissions" description="RBAC and custom roles coming soon." /></Protected>} />
            <Route path="/security" element={<Protected><ComingSoonPage title="Security" description="Security policies and 2FA settings coming soon." /></Protected>} />
            <Route path="/audit" element={<Protected><ComingSoonPage title="Audit Log" description="System audit logs coming soon." /></Protected>} />
            <Route path="/system" element={<Protected><ComingSoonPage title="System" description="System health and maintenance coming soon." /></Protected>} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
