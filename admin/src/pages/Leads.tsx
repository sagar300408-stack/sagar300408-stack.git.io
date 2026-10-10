import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Filter, X, Edit2, Trash2,
  AlertCircle, Users, Phone, Mail, Building2
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getOCEClient } from '../lib/sdk';
import { classifyDbError } from '../lib/dbErrors';

type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Disqualified' | 'Converted';
type LeadSource = 'Website' | 'LinkedIn' | 'Referral' | 'Cold Outreach' | 'Event' | 'Inbound' | 'Other';

interface Lead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  notes?: string;
  next_action?: string;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<LeadStatus, { color: string; bg: string }> = {
  New:          { color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  Contacted:    { color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  Qualified:    { color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  Disqualified: { color: 'text-gray-500',   bg: 'bg-gray-50 border-gray-200' },
  Converted:    { color: 'text-[#244235]',  bg: 'bg-emerald-50 border-emerald-200' },
};

const SOURCES: LeadSource[] = ['Website', 'LinkedIn', 'Referral', 'Cold Outreach', 'Event', 'Inbound', 'Other'];
const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Disqualified', 'Converted'];

interface FormData {
  name: string; company: string; email: string; phone: string;
  source: LeadSource; status: LeadStatus; notes: string; next_action: string;
}
const EMPTY: FormData = {
  name: '', company: '', email: '', phone: '',
  source: 'Other', status: 'New', notes: '', next_action: '',
};

export default function Leads() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const sdk = getOCEClient();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true); setError(null);
    try {
      let q = sdk.supabase
        .from('leads')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });
      if (filterStatus) q = q.eq('status', filterStatus);
      const { data, error } = await q;
      if (error) throw error;
      setLeads((data as Lead[]) ?? []);
    } catch (e: any) {
      setError(classifyDbError(e).message);
    } finally { setLoading(false); }
  }, [orgId, filterStatus]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.name.trim() || !orgId) return;
    setSaving(true);
    try {
      const payload = {
        org_id: orgId,
        name: form.name.trim(),
        company: form.company.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        source: form.source,
        status: form.status,
        notes: form.notes.trim() || null,
        next_action: form.next_action.trim() || null,
      };
      if (editingId) {
        const { error } = await sdk.supabase.from('leads')
          .update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await sdk.supabase.from('leads').insert(payload);
        if (error) throw error;
      }
      setForm(EMPTY); setShowForm(false); setEditingId(null);
      setSelectedLead(null); await load();
    } catch (e: any) { alert('Save failed: ' + e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    try {
      const { error } = await sdk.supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      if (selectedLead?.id === id) setSelectedLead(null);
      await load();
    } catch (e: any) { alert('Delete failed: ' + e.message); }
  };

  const openEdit = (lead: Lead) => {
    setEditingId(lead.id);
    setForm({ name: lead.name, company: lead.company || '', email: lead.email || '',
      phone: lead.phone || '', source: lead.source, status: lead.status,
      notes: lead.notes || '', next_action: lead.next_action || '' });
    setShowForm(true); setSelectedLead(null);
  };

  const filtered = leads.filter(l =>
    !search || [l.name, l.company, l.email].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-full bg-[#f5f5f4] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-400 mt-0.5">Track and manage incoming business leads.</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY); setEditingId(null); setShowForm(true); setSelectedLead(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#244235] text-white rounded-lg text-sm font-medium hover:bg-[#1a3026] transition-colors"
        >
          <Plus size={15} /> Add Lead
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* List Panel */}
        <div className={`flex flex-col bg-white border-r border-gray-200 ${selectedLead ? 'hidden lg:flex lg:w-80' : 'flex-1'}`}>
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search leads..."
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[13px] bg-gray-50 focus:outline-none focus:border-[#244235] focus:bg-white"
              />
            </div>
            <select
              value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-2 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 bg-gray-50 focus:outline-none"
            >
              <option value="">All Status</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="m-3 bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
              <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-[12px] text-amber-800">{error}</p>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#244235]" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={24} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm font-medium text-gray-500">{search || filterStatus ? 'No matching leads' : 'No leads yet'}</p>
              {!search && !filterStatus && (
                <button onClick={() => { setForm(EMPTY); setEditingId(null); setShowForm(true); }}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#244235] hover:underline font-medium">
                  <Plus size={13} /> Add your first lead
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {filtered.map(lead => {
                const sc = STATUS_CONFIG[lead.status] || STATUS_CONFIG.New;
                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors group ${selectedLead?.id === lead.id ? 'bg-[#244235]/5' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-900 truncate">{lead.name}</p>
                        {lead.company && <p className="text-[12px] text-gray-500 truncate">{lead.company}</p>}
                        {lead.email && <p className="text-[11px] text-gray-400 truncate">{lead.email}</p>}
                      </div>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded border flex-shrink-0 ${sc.bg} ${sc.color}`}>
                        {lead.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[11px] text-gray-400">{lead.source}</span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="px-4 py-2 border-t border-gray-100 text-[11px] text-gray-400">
            {filtered.length} lead{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Detail / Form Panel */}
        {(showForm || selectedLead) && (
          <div className="flex-1 bg-[#f5f5f4] overflow-y-auto">
            {showForm ? (
              <div className="p-6 max-w-2xl">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold text-gray-900">{editingId ? 'Edit Lead' : 'New Lead'}</h2>
                    <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY); }}
                      className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Name *</label>
                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                          placeholder="John Smith"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#244235]" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Company</label>
                        <input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                          placeholder="Acme Industries"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#244235]" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                          placeholder="john@acme.com"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#244235]" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Phone</label>
                        <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#244235]" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Source</label>
                        <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value as LeadSource })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#244235]">
                          {SOURCES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as LeadStatus })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#244235]">
                          {STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Next Action</label>
                      <input type="text" value={form.next_action} onChange={e => setForm({ ...form, next_action: e.target.value })}
                        placeholder="Schedule a demo call"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#244235]" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Notes</label>
                      <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                        rows={3} placeholder="Notes about this lead..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#244235] resize-none" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY); }}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                      <button onClick={handleSave} disabled={!form.name.trim() || saving}
                        className="px-4 py-2 text-sm font-medium bg-[#244235] text-white rounded-lg hover:bg-[#1a3026] disabled:opacity-50">
                        {saving ? 'Saving...' : editingId ? 'Update Lead' : 'Create Lead'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedLead ? (
              <div className="p-6 max-w-2xl">
                {/* Lead Detail */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedLead.name}</h2>
                      {selectedLead.company && <p className="text-gray-500 text-sm mt-0.5">{selectedLead.company}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(selectedLead)}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(selectedLead.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                      <button onClick={() => setSelectedLead(null)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    {[
                      { icon: Mail, label: 'Email', value: selectedLead.email },
                      { icon: Phone, label: 'Phone', value: selectedLead.phone },
                      { icon: Filter, label: 'Source', value: selectedLead.source },
                      { icon: Building2, label: 'Status', value: selectedLead.status },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-2.5">
                        <Icon size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[11px] text-gray-400 font-medium">{label}</p>
                          <p className="text-[13px] text-gray-700">{value || '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedLead.next_action && (
                    <div className="bg-[#244235]/5 rounded-lg p-3 mb-4">
                      <p className="text-[11px] font-semibold text-[#244235] uppercase tracking-wide mb-1">Next Action</p>
                      <p className="text-[13px] text-gray-700">{selectedLead.next_action}</p>
                    </div>
                  )}

                  {selectedLead.notes && (
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Notes</p>
                      <p className="text-[13px] text-gray-600 whitespace-pre-wrap">{selectedLead.notes}</p>
                    </div>
                  )}

                  <div className="mt-5 pt-4 border-t border-gray-100 text-[11px] text-gray-400">
                    Created {new Date(selectedLead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
