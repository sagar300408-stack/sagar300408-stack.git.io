import { useState } from 'react';
import { Settings as SettingsIcon, Globe, Palette, Mail, Shield, Zap, BarChart } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: <SettingsIcon size={18} /> },
    { id: 'seo', label: 'SEO & Metadata', icon: <Globe size={18} /> },
    { id: 'branding', label: 'Branding', icon: <Palette size={18} /> },
    { id: 'email', label: 'Email Configuration', icon: <Mail size={18} /> },
    { id: 'auth', label: 'Authentication', icon: <Shield size={18} /> },
    { id: 'integrations', label: 'Integrations', icon: <Zap size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart size={18} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-medium text-text-primary mb-2">Settings</h1>
        <p className="text-text-secondary">Manage your organization's configuration and integrations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-accent/10 text-accent-dark'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 bg-surface border border-border rounded-lg p-6 shadow-sm">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-text-primary border-b border-border pb-4">General Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Organization Name</label>
                  <input type="text" className="w-full max-w-md px-3 py-2 border border-border rounded-md focus:outline-none focus:border-accent" defaultValue="Originyx" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Timezone</label>
                  <select className="w-full max-w-md px-3 py-2 border border-border rounded-md focus:outline-none focus:border-accent">
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="IST">IST (Indian Standard Time)</option>
                  </select>
                </div>
                
                <div className="pt-4">
                  <button className="bg-accent text-white px-4 py-2 rounded-md hover:bg-accent-light transition-colors text-sm font-medium shadow-sm">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab !== 'general' && (
            <div className="flex items-center justify-center h-64 text-text-muted">
              <p>{tabs.find(t => t.id === activeTab)?.label} settings coming soon.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
