import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-serif font-medium text-text-primary mb-4">Dashboard</h1>
      <p className="text-text-secondary mb-6">Welcome to Originyx Content Engine.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/editor" className="p-4 border border-border rounded-md bg-surface hover:bg-surface-hover">
          <h3 className="font-medium text-text-primary">Editor</h3>
          <p className="text-text-muted text-sm">Open content editor</p>
        </Link>

        <Link to="/media" className="p-4 border border-border rounded-md bg-surface hover:bg-surface-hover">
          <h3 className="font-medium text-text-primary">Media Library</h3>
          <p className="text-text-muted text-sm">Manage assets</p>
        </Link>

        <Link to="/settings" className="p-4 border border-border rounded-md bg-surface hover:bg-surface-hover">
          <h3 className="font-medium text-text-primary">Settings</h3>
          <p className="text-text-muted text-sm">Manage site configuration</p>
        </Link>
      </div>
    </div>
  )
}
