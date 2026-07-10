import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getOCEClient } from '../lib/sdk'
import { FileText, Plus, Archive, Edit, Copy, CheckSquare, Square, Search } from 'lucide-react'
import { useToast } from '../components/Layout/ToastProvider'

export default function Dashboard() {
  const [nodes, setNodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const navigate = useNavigate()
  const { showToast } = useToast()

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
      showToast('Failed to load insights', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAction = async (action: 'Publish' | 'Archive' | 'Delete') => {
    if (selected.length === 0) return
    if (action === 'Delete' && !confirm('Are you sure you want to delete the selected insights?')) return
    
    try {
      setLoading(true)
      const sdk = getOCEClient()
      
      for (const id of selected) {
        if (action === 'Delete') {
          await sdk.deleteNode(id)
        } else {
          await sdk.updateNode(id, { status: action === 'Archive' ? 'Archived' : 'Published' })
        }
      }
      
      showToast(`Successfully applied ${action} to ${selected.length} insights`, 'success')
      setSelected([])
      await loadNodes()
    } catch (e) {
      console.error(e)
      showToast(`Failed to perform bulk action`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicate = async (node: any) => {
    try {
      setLoading(true)
      const sdk = getOCEClient()
      const base = await sdk.getBaseMetadata()
      const copy = {
        org_id: base.orgId,
        type_id: base.typeId,
        title: `${node.title} (Copy)`,
        content: node.content,
        excerpt: node.excerpt,
        category: node.category,
        tags: node.tags,
        status: 'Draft'
      }
      const newNode = await sdk.createNode(copy)
      showToast('Insight duplicated successfully', 'success')
      navigate(`/editor/${newNode.id}`)
    } catch (e) {
      console.error(e)
      showToast('Failed to duplicate insight', 'error')
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
          <h1 className="text-2xl font-serif font-medium text-text-primary mb-1">Insights Dashboard</h1>
          <p className="text-text-secondary text-sm">Manage your content engine and publishing workflow.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search insights..." 
              className="pl-9 pr-4 py-2 bg-surface border border-border rounded-md focus:outline-none focus:border-accent text-sm w-64"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-surface border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent text-text-primary"
          >
            <option value="">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Archived">Archived</option>
          </select>
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
            <button onClick={() => handleBulkAction('Publish')} className="text-sm text-text-secondary hover:text-text-primary px-3 py-1.5 rounded bg-surface-hover transition-colors">Publish</button>
            <button onClick={() => handleBulkAction('Archive')} className="text-sm text-text-secondary hover:text-amber px-3 py-1.5 rounded bg-surface-hover transition-colors">Archive</button>
            <button onClick={() => handleBulkAction('Delete')} className="text-sm text-text-secondary hover:text-red px-3 py-1.5 rounded bg-surface-hover transition-colors">Delete</button>
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
                  <td colSpan={7} className="py-8 text-center text-text-muted">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto mb-2"></div>
                    Loading insights...
                  </td>
                </tr>
              ) : nodes.filter(n => (!filter || n.status === filter) && (!search || n.title?.toLowerCase().includes(search.toLowerCase()))).length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    <FileText size={32} className="mx-auto mb-3 opacity-20" />
                    No insights found matching your criteria.
                  </td>
                </tr>
              ) : (
                nodes
                  .filter(n => (!filter || n.status === filter) && (!search || n.title?.toLowerCase().includes(search.toLowerCase())))
                  .map(node => (
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
                        <Link to={`/editor/${node.id}`} title="Edit" className="text-text-muted hover:text-text-primary p-1">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDuplicate(node)} title="Duplicate" className="text-text-muted hover:text-text-primary p-1">
                          <Copy size={16} />
                        </button>
                        <button 
                          onClick={() => { setSelected([node.id]); setTimeout(() => handleBulkAction('Archive'), 0); }} 
                          title="Archive" 
                          className="text-text-muted hover:text-amber p-1"
                        >
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
