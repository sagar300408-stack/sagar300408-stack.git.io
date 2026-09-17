import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ExploreProducts from './pages/ExploreProducts';
import MyProducts from './pages/MyProducts';
import Subscriptions from './pages/Subscriptions';
import Billing from './pages/Billing';
import SidebarLayout from './components/Layout/SidebarLayout';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ToastProvider } from './components/Layout/ToastProvider';
import './App.css';

function GlobalLoader() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-bg-primary gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      <p className="text-text-muted text-sm">Loading workspace…</p>
    </div>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <GlobalLoader />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter basename="/">
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/dashboard"
              element={
                <SidebarLayout>
                  <Dashboard />
                </SidebarLayout>
              }
            />
            
            <Route
              path="/explore"
              element={
                <SidebarLayout>
                  <ExploreProducts />
                </SidebarLayout>
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

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
