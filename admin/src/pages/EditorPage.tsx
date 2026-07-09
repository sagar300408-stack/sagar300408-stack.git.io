import React, { useState } from 'react';
import OCEEditor from '../components/Editor/Editor';
import { History, Lock, ChevronLeft, Eye, Send } from 'lucide-react';

export default function EditorPage() {
  const [isLocked] = useState(false); // In reality, fetch from cms_locks
  const [lockedBy] = useState('Sagar');
  
  const [isRevisionsOpen, setIsRevisionsOpen] = useState(false);
  const [revisions] = useState([
    { id: '1', date: 'Today at 10:42 AM', author: 'Sagar', current: true },
    { id: '2', date: 'Yesterday at 4:15 PM', author: 'Sagar', current: false },
    { id: '3', date: 'Oct 12 at 9:00 AM', author: 'Alice', current: false },
  ]);

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      {/* Top Navbar */}
      <header className="h-14 border-b border-border bg-surface px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-surface-hover transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="h-4 w-px bg-border"></div>
          <span className="text-sm font-medium text-text-secondary">Insights</span>
          <span className="text-sm text-text-muted">/</span>
          <span className="text-sm font-medium text-text-primary truncate max-w-[200px]">The Future of AI Operations</span>
        </div>
        
        <div className="flex items-center gap-3">
          {isLocked && (
            <div className="flex items-center gap-2 text-xs font-medium bg-amber/10 text-amber px-3 py-1.5 rounded-full">
              <Lock size={12} />
              Locked by {lockedBy}
            </div>
          )}
          
          <button 
            onClick={() => setIsRevisionsOpen(!isRevisionsOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isRevisionsOpen ? 'bg-surface-hover text-text-primary border border-border' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <History size={16} />
            Revisions
          </button>
          
          <div className="h-4 w-px bg-border mx-1"></div>
          
          <button className="flex items-center gap-2 text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-surface-hover">
            <Eye size={16} />
            Preview
          </button>
          
          <button className="flex items-center gap-2 bg-accent text-white px-4 py-1.5 rounded-md hover:bg-accent-light transition-colors text-sm font-medium shadow-sm">
            <Send size={16} />
            Publish
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Editor Area */}
        <main className="flex-1 overflow-y-auto">
          <OCEEditor 
            title="The Future of AI Operations"
            status="Draft"
            lastSaved="2 mins ago"
          />
        </main>

        {/* Revisions Sidebar */}
        {isRevisionsOpen && (
          <aside className="w-80 border-l border-border bg-surface flex flex-col flex-shrink-0 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-medium text-text-primary">Version History</h2>
              <p className="text-xs text-text-muted mt-1">View and restore previous versions</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {revisions.map((rev, index) => (
                <div key={rev.id} className="relative pl-6">
                  {/* Timeline line */}
                  {index !== revisions.length - 1 && (
                    <div className="absolute left-[9px] top-6 bottom-[-24px] w-px bg-border"></div>
                  )}
                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-1.5 w-[19px] h-[19px] rounded-full border-4 border-surface ${rev.current ? 'bg-accent' : 'bg-border'}`}></div>
                  
                  <div className={`p-3 rounded-md border ${rev.current ? 'border-accent bg-accent/5' : 'border-border bg-bg-primary hover:border-border-hover cursor-pointer transition-colors'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-text-primary">{rev.date}</span>
                      {rev.current && <span className="text-[10px] uppercase tracking-wider font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">Current</span>}
                    </div>
                    <p className="text-xs text-text-secondary">Edited by {rev.author}</p>
                    
                    {!rev.current && (
                      <button className="mt-2 text-xs font-medium text-accent hover:text-accent-light transition-colors">
                        Restore this version
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
