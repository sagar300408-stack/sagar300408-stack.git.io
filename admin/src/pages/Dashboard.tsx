import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getOCEClient } from '../lib/sdk'
import { FileText, Plus, Search, MoreVertical, Archive, Trash2, Edit, Copy, ChevronDown, CheckSquare, Square } from 'lucide-react'

export default function Dashboard() {
  const [nodes, setNodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadNodes()
  }, [])

  async function loadNodes() {
    try {
      setLoading(true)
      const sdk = getOCEClient()
      const data = await sdk.getNodes('insights')
      setNodes(data || [])
    } catch (e) {
      console.error('Failed to load nodes', e)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleAll = () => {
    if (selected.length === nodes.length) {
      setSelected([])
    } else {
      setSelected(nodes.map(n => n.id))
    }
  }

  const templates = [
    { id: 'blank', name: 'Blank Insight', desc: 'Start from scratch' },
    { id: 'ai', name: 'AI Insight', desc: 'AI generated draft' },
    { id: 'case-study', name: 'Case Study', desc: 'Customer success story' },
    { id: 'founder', name: 'Founder Letter', desc: 'Personal update' },
    { id: 'update', name: 'Product Update', desc: 'New features & releases' },
    { id: 'research', name: 'Research Report', desc: 'Deep dive analysis' },
  ]

  const handleCreateFromTemplate = (templateId: string) => {
    navigate('/editor/new', { state: { template: templateId } })
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-medium text-text-primary mb-1">Insights Dashboard</h1>
          <p className="text-text-secondary text-sm">Manage your content engine and publishing workflow.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-accent-light transition-colors font-medium shadow-sm"
          >
            <Plus size={18} />
            New Insight
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selected.length > 0 && (
        <div className="bg-surface border border-accent/20 rounded-md p-3 mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <span className="text-sm font-medium text-text-primary ml-2">{selected.length} insights selected</span>
          <div className="flex items-center gap-2">
            <button className="text-sm text-text-secondary hover:text-text-primary px-3 py-1.5 rounded bg-surface-hover">Publish</button>
            <button className="text-sm text-text-secondary hover:text-amber px-3 py-1.5 rounded bg-surface-hover">Archive</button>
            <button className="text-sm text-text-secondary hover:text-red px-3 py-1.5 rounded bg-surface-hover">Delete</button>
            <button className="text-sm text-text-secondary hover:text-text-primary px-3 py-1.5 rounded bg-surface-hover">Export</button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-secondary">
                <th className="py-3 px-4 w-12">
                  <button onClick={toggleAll} className="text-text-muted hover:text-text-primary transition-colors">
                    {selected.length === nodes.length && nodes.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Title</th>
                <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Updated</th>
                <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Views</th>
                <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Avg Read</th>
                <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted">Loading insights...</td>
                </tr>
              ) : nodes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    <FileText size={32} className="mx-auto mb-3 opacity-20" />
                    No insights found. Create your first one!
                  </td>
                </tr>
              ) : (
                nodes.map(node => (
                  <tr key={node.id} className="border-b border-border hover:bg-surface-hover transition-colors group">
                    <td className="py-3 px-4">
                      <button onClick={() => toggleSelect(node.id)} className={`${selected.includes(node.id) ? 'text-accent' : 'text-text-muted hover:text-text-secondary'} transition-colors`}>
                        {selected.includes(node.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <Link to={`/editor/${node.id}`} className="font-medium text-text-primary hover:text-accent truncate block max-w-xs">
                        {node.title || 'Untitled Insight'}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        node.status === 'Published' ? 'bg-green/10 text-green' :
                        node.status === 'Scheduled' ? 'bg-blue/10 text-blue' :
                        node.status === 'Archived' ? 'bg-text-muted/10 text-text-muted' :
                        'bg-amber/10 text-amber'
                      }`}>
                        {node.status || 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary">
                      {new Date(node.updated_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary">—</td>
                    <td className="py-3 px-4 text-sm text-text-secondary">—</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/editor/${node.id}`} className="text-text-muted hover:text-text-primary p-1">
                          <Edit size={16} />
                        </Link>
                        <button className="text-text-muted hover:text-text-primary p-1">
                          <Copy size={16} />
                        </button>
                        <button className="text-text-muted hover:text-text-primary p-1">
                          <Archive size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Templates Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl max-w-2xl w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-medium text-text-primary">Choose a Template</h2>
              <button onClick={() => setIsTemplateModalOpen(false)} className="text-text-muted hover:text-text-primary">✕</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {templates.map(tpl => (
                <button 
                  key={tpl.id}
                  onClick={() => handleCreateFromTemplate(tpl.id)}
                  className="text-left p-4 border border-border rounded-lg hover:border-accent hover:shadow-md transition-all group"
                >
                  <h3 className="font-medium text-text-primary group-hover:text-accent mb-1">{tpl.name}</h3>
                  <p className="text-xs text-text-secondary">{tpl.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
