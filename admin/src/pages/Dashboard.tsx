import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getOCEClient } from '../lib/sdk'
import { FileText, Plus, Archive, Edit, Copy, CheckSquare, Square, Search, X, Clock, Eye } from 'lucide-react'
import { useToast } from '../components/Layout/ToastProvider'

const TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Insight',
    desc: 'Start from scratch with an empty canvas.',
    emoji: '📄',
  },
  {
    id: 'ai',
    name: 'AI Insight',
    desc: 'Deep dive into AI trends and strategies.',
    emoji: '🤖',
  },
  {
    id: 'case-study',
    name: 'Case Study',
    desc: 'Customer success stories and results.',
    emoji: '📊',
  },
  {
    id: 'founder',
    name: 'Founder Letter',
    desc: 'Personal updates and reflections.',
    emoji: '✉️',
  },
  {
    id: 'update',
    name: 'Product Update',
    desc: 'Announce new features and improvements.',
    emoji: '🚀',
  },
  {
    id: 'research',
    name: 'Research Report',
    desc: 'In-depth analysis and findings.',
    emoji: '🔬',
  },
]

const STATUS_STYLES: Record<string, string> = {
  Published: 'bg-green-50 text-green-700 border border-green-200',
  Scheduled: 'bg-blue-50 text-blue-700 border border-blue-200',
  Draft: 'bg-amber-50 text-amber-700 border border-amber-200',
  Archived: 'bg-gray-100 text-gray-500 border border-gray-200',
}

export default function Dashboard() {
  const [nodes, setNodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { showToast } = useToast()

  // Click outside and keyboard handling
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDropdownOpen])

  useEffect(() => {
    if (!isDropdownOpen) {
      setFocusedIndex(-1)
      return
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false)
        return
      }

      if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
        e.preventDefault()
      } else {
        return
      }

      setFocusedIndex(prev => {
        let next = prev === -1 ? 0 : prev
        const cols = 2
        const total = TEMPLATES.length

        if (e.key === 'ArrowRight') next = prev + 1
        if (e.key === 'ArrowLeft') next = prev - 1
        if (e.key === 'ArrowDown') next = prev + cols
        if (e.key === 'ArrowUp') next = prev - cols

        if (next < 0) next = 0
        if (next >= total) next = total - 1

        if (e.key === 'Enter' && prev >= 0 && prev < total) {
           setIsDropdownOpen(false)
           navigate('/editor/new', { state: { template: TEMPLATES[prev].id } })
        }
        return next
      })
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDropdownOpen, navigate])

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
    if (action === 'Delete' && !confirm(`Delete ${selected.length} insight(s)? This cannot be undone.`)) return
    
    try {
      setBulkLoading(true)
      const sdk = getOCEClient()
      
      for (const id of selected) {
        if (action === 'Delete') {
          await sdk.deleteNode(id)
        } else {
          await sdk.updateNode(id, { status: action === 'Archive' ? 'Archived' : 'Published' })
        }
      }
      
      showToast(`${action} applied to ${selected.length} insight${selected.length !== 1 ? 's' : ''}`, 'success')
      setSelected([])
      await loadNodes()
    } catch (e) {
      console.error(e)
      showToast(`Failed to ${action.toLowerCase()} insights`, 'error')
    } finally {
      setBulkLoading(false)
    }
  }

  const handleArchiveSingle = async (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const sdk = getOCEClient()
      await sdk.updateNode(nodeId, { status: 'Archived' })
      showToast('Insight archived', 'success')
      await loadNodes()
    } catch {
      showToast('Failed to archive insight', 'error')
    }
  }

  const handleDuplicate = async (node: any, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const sdk = getOCEClient()
      const base = await sdk.getBaseMetadata()
      const newNode = await sdk.createNode({
        org_id: base.orgId,
        type_id: base.typeId,
        title: `${node.title} (Copy)`,
        content: node.content,
        excerpt: node.excerpt,
        category: node.category,
        tags: node.tags,
        status: 'Draft'
      })
      showToast('Insight duplicated', 'success')
      navigate(`/editor/${newNode.id}`)
    } catch (e) {
      console.error(e)
      showToast('Failed to duplicate insight', 'error')
    }
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleAll = () => {
    const visible = filteredNodes.map(n => n.id)
    if (visible.every(id => selected.includes(id))) {
      setSelected(prev => prev.filter(id => !visible.includes(id)))
    } else {
      setSelected(prev => Array.from(new Set([...prev, ...visible])))
    }
  }

  const filteredNodes = nodes.filter(n =>
    (!filter || n.status === filter) &&
    (!search || n.title?.toLowerCase().includes(search.toLowerCase()))
  )

  const allVisibleSelected = filteredNodes.length > 0 && filteredNodes.every(n => selected.includes(n.id))

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-serif font-medium text-text-primary mb-1">Insights</h1>
          <p className="text-text-secondary text-sm">
            {nodes.length > 0 ? `${nodes.length} insight${nodes.length !== 1 ? 's' : ''} total` : 'Your content engine'}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search insights..."
              className="pl-9 pr-4 py-2 w-full sm:w-56 bg-surface border border-border rounded-md focus:outline-none focus:border-accent text-sm"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-surface border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent text-text-primary"
          >
            <option value="">All</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Archived">Archived</option>
          </select>
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-accent-light transition-colors font-medium shadow-sm text-sm"
            >
              <Plus size={17} />
              New Insight
            </button>
            {isDropdownOpen && (
              <div 
                className="absolute top-full mt-2 right-0 w-[calc(100vw-48px)] sm:w-[320px] lg:w-[380px] bg-white border border-[#E5E7EB] rounded-[10px] shadow-[0_12px_30px_rgba(0,0,0,0.12)] p-4 z-50 animate-dropdown"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">New Insight</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Choose a template to get started</p>
                  </div>
                  <button 
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map((tpl, idx) => (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        setIsDropdownOpen(false)
                        navigate('/editor/new', { state: { template: tpl.id } })
                      }}
                      onMouseEnter={() => setFocusedIndex(idx)}
                      className={`text-left p-[14px] rounded-lg border transition-all duration-[180ms] ease-out flex flex-col gap-1 ${
                        focusedIndex === idx 
                          ? 'bg-blue-50 border-blue-500' 
                          : 'border-transparent hover:bg-[#F8FAFC] hover:border-[#D1D5DB]'
                      }`}
                    >
                      <span className="text-[1.25rem] leading-none mb-1">{tpl.emoji}</span>
                      <span className="text-[13px] font-medium text-gray-900 leading-tight">{tpl.name}</span>
                      <span className="text-[11px] text-gray-500 leading-snug line-clamp-1">{tpl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selected.length > 0 && (
        <div className="bg-surface border border-accent/20 rounded-md p-3 mb-5 flex items-center justify-between">
          <span className="text-sm font-medium text-text-primary">
            {selected.length} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('Publish')}
              disabled={bulkLoading}
              className="text-sm px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-light transition-colors disabled:opacity-50"
            >
              Publish
            </button>
            <button
              onClick={() => handleBulkAction('Archive')}
              disabled={bulkLoading}
              className="text-sm px-3 py-1.5 rounded bg-surface-hover text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
            >
              Archive
            </button>
            <button
              onClick={() => handleBulkAction('Delete')}
              disabled={bulkLoading}
              className="text-sm px-3 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
            <button
              onClick={() => setSelected([])}
              className="p-1 text-text-muted hover:text-text-primary"
              title="Clear selection"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-secondary">
                <th className="py-3 px-4 w-10">
                  <button
                    onClick={toggleAll}
                    className="text-text-muted hover:text-text-primary transition-colors"
                    title={allVisibleSelected ? 'Deselect all' : 'Select all'}
                    disabled={filteredNodes.length === 0}
                  >
                    {allVisibleSelected
                      ? <CheckSquare size={17} className="text-accent" />
                      : <Square size={17} />
                    }
                  </button>
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Title</th>
                <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">Updated</th>
                <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto mb-2" />
                    Loading insights...
                  </td>
                </tr>
              ) : filteredNodes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-text-muted">
                    <FileText size={32} className="mx-auto mb-3 opacity-20" />
                    <p className="font-medium text-text-secondary mb-1">
                      {search || filter ? 'No insights match your filters' : 'No insights yet'}
                    </p>
                    <p className="text-sm">
                      {search || filter
                        ? 'Try adjusting your search or filter'
                        : 'Click "New Insight" to create your first one'
                      }
                    </p>
                  </td>
                </tr>
              ) : (
                filteredNodes.map(node => (
                  <tr
                    key={node.id}
                    className={`border-b border-border hover:bg-surface-hover transition-colors group ${selected.includes(node.id) ? 'bg-accent/5' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleSelect(node.id)}
                        className={`transition-colors ${selected.includes(node.id) ? 'text-accent' : 'text-text-muted hover:text-text-secondary'}`}
                      >
                        {selected.includes(node.id)
                          ? <CheckSquare size={17} />
                          : <Square size={17} />
                        }
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/editor/${node.id}`}
                        className="font-medium text-text-primary hover:text-accent transition-colors truncate block max-w-xs"
                        title={node.title || 'Untitled Insight'}
                      >
                        {node.title || 'Untitled Insight'}
                      </Link>
                      {node.excerpt && (
                        <p className="text-xs text-text-muted truncate max-w-xs mt-0.5">{node.excerpt}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[node.status] || STATUS_STYLES['Draft']}`}>
                        {node.status || 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary hidden md:table-cell">
                      {node.category || <span className="text-text-muted">—</span>}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary hidden lg:table-cell">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-text-muted" />
                        {new Date(node.updated_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {node.status === 'Published' && (
                          <a
                            href={`/insights/article.html?id=${node.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View Live"
                            className="p-1.5 text-text-muted hover:text-accent transition-colors rounded hover:bg-surface-hover"
                          >
                            <Eye size={15} />
                          </a>
                        )}
                        <Link
                          to={`/editor/${node.id}`}
                          title="Edit"
                          className="p-1.5 text-text-muted hover:text-text-primary transition-colors rounded hover:bg-surface-hover"
                        >
                          <Edit size={15} />
                        </Link>
                        <button
                          onClick={(e) => handleDuplicate(node, e)}
                          title="Duplicate"
                          className="p-1.5 text-text-muted hover:text-text-primary transition-colors rounded hover:bg-surface-hover"
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          onClick={(e) => handleArchiveSingle(node.id, e)}
                          title="Archive"
                          className="p-1.5 text-text-muted hover:text-amber-600 transition-colors rounded hover:bg-surface-hover"
                        >
                          <Archive size={15} />
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

      <style>{`
        @keyframes slideDownFade {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-dropdown {
          animation: slideDownFade 180ms ease-out forwards;
        }
      `}</style>
    </div>
  )
}

