import { useState } from 'react';
import { Settings as SettingsIcon, Globe, Palette, Shield } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [orgName, setOrgName] = useState('Originyx');
  const [timezone, setTimezone] = useState('UTC');
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: <SettingsIcon size={17} />, implemented: true },
    { id: 'seo', label: 'SEO & Metadata', icon: <Globe size={17} />, implemented: false },
    { id: 'branding', label: 'Branding', icon: <Palette size={17} />, implemented: false },
    { id: 'auth', label: 'Authentication', icon: <Shield size={17} />, implemented: false },
  ];

  const handleSave = () => {
    // In a real implementation, this would persist to Supabase
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-medium text-text-primary mb-1">Settings</h1>
        <p className="text-text-secondary text-sm">Manage your organization's configuration.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab Navigation */}
        <aside className="w-full md:w-52 flex-shrink-0">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => (
              tab.implemented ? (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ) : (
                <div
                  key={tab.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-text-muted opacity-50 cursor-not-allowed"
                  title={`${tab.label} — Coming Soon`}
                >
                  {tab.icon}
                  {tab.label}
                  <span className="ml-auto text-[9px] uppercase tracking-wider bg-bg-primary px-1.5 py-0.5 rounded border border-border font-semibold">
                    Soon
                  </span>
                </div>
              )
            ))}
          </nav>
        </aside>

        {/* Tab Content */}
        <main className="flex-1 bg-surface border border-border rounded-lg p-6 shadow-sm">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-text-primary mb-1">General Settings</h2>
                <p className="text-sm text-text-secondary">Basic configuration for your organization.</p>
              </div>
              <hr className="border-border" />
              
              <div className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:border-accent text-sm bg-bg-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:border-accent text-sm bg-bg-primary"
                  >
                    <option value="UTC">UTC — Coordinated Universal Time</option>
                    <option value="America/New_York">EST — Eastern Standard Time</option>
                    <option value="America/Los_Angeles">PST — Pacific Standard Time</option>
                    <option value="Europe/London">GMT — Greenwich Mean Time</option>
                    <option value="Asia/Kolkata">IST — Indian Standard Time</option>
                    <option value="Asia/Singapore">SGT — Singapore Time</option>
                    <option value="Asia/Tokyo">JST — Japan Standard Time</option>
                    <option value="Australia/Sydney">AEST — Australian Eastern Time</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSave}
                    className="bg-accent text-white px-5 py-2 rounded-md hover:bg-accent-light transition-colors text-sm font-medium shadow-sm"
                  >
                    {saved ? '✓ Saved' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
