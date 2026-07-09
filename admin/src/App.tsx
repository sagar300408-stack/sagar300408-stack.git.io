import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import EditorPage from './pages/EditorPage'
import MediaLibrary from './pages/MediaLibrary'
import Settings from './pages/Settings'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import './App.css'

function requireAuth() {
  return !!localStorage.getItem('oc_auth')
}

function Protected({ children }: { children: any }) {
  if (!requireAuth()) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter basename="/admin">
      <div className="h-screen flex flex-col">
        <header className="h-14 border-b border-border bg-surface px-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="font-serif font-medium text-text-primary">Originyx CMS</Link>
          </div>
          <nav className="flex items-center gap-3">
            <Link to="/dashboard" className="text-text-secondary hover:text-text-primary">Dashboard</Link>
            <Link to="/editor" className="text-text-secondary hover:text-text-primary">Editor</Link>
            <Link to="/media" className="text-text-secondary hover:text-text-primary">Media</Link>
            <Link to="/settings" className="text-text-secondary hover:text-text-primary">Settings</Link>
          </nav>
        </header>

        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/editor" element={<Protected><EditorPage /></Protected>} />
            <Route path="/insights" element={<Protected><EditorPage /></Protected>} />
            <Route path="/media" element={<Protected><MediaLibrary /></Protected>} />
            <Route path="/settings" element={<Protected><Settings /></Protected>} />
            <Route path="*" element={<div className="p-8">Not Found</div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
