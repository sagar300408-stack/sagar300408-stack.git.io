import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import EditorPage from './pages/EditorPage';
import MediaLibrary from './pages/MediaLibrary';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import SidebarLayout from './components/Layout/SidebarLayout';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ToastProvider } from './components/Layout/ToastProvider';
import './App.css';

function Protected({ children, requireRole }: { children: any, requireRole?: boolean }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!user) {
    // Preserve the intended destination (could be used later)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && role !== 'owner' && role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter basename="/admin">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Dashboard routes wrapped in SidebarLayout */}
            <Route path="/dashboard" element={
              <Protected requireRole={true}>
                <SidebarLayout><Dashboard /></SidebarLayout>
              </Protected>
            } />
            <Route path="/media" element={
              <Protected requireRole={true}>
                <SidebarLayout><MediaLibrary /></SidebarLayout>
              </Protected>
            } />
            <Route path="/settings" element={
              <Protected requireRole={true}>
                <SidebarLayout><Settings /></SidebarLayout>
              </Protected>
            } />
            
            {/* Full-screen Editor Route (No Sidebar) */}
            <Route path="/editor/new" element={
              <Protected requireRole={true}>
                <EditorPage />
              </Protected>
            } />
            <Route path="/editor/:id" element={
              <Protected requireRole={true}>
                <EditorPage />
              </Protected>
            } />
            <Route path="/editor" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="*" element={<div className="p-8 text-center">404 - Not Found</div>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
