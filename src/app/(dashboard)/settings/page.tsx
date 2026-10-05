'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { Save, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Organization');

  const [companyName, setCompanyName] = useState('Acme Corporation');
  const [primaryDomain, setPrimaryDomain] = useState('acme.com');
  const [timezone, setTimezone] = useState('UTC (Coordinated Universal Time)');
  const [primaryContact, setPrimaryContact] = useState('john.doe@acme.com');
  const [dataRetention, setDataRetention] = useState('90 Days (Automated purge)');

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const navItems = [
    'Organization',
    'Team & Roles',
    'Security',
    'Data & Privacy',
    'Notifications',
    'API / Webhooks',
  ];

  return (
    <div>
      <Header
        title="Settings"
        subtitle="Manage organization, team, security and data controls."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Sub-nav Sidebar matching PDF Screenshot 15 */}
        <div className="card-panel p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Settings</h3>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition ${
                  activeTab === item
                    ? 'bg-[#121f38] text-blue-400 font-semibold border-l-2 border-blue-500'
                    : 'text-slate-300 hover:bg-[#121e36]'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        {/* Form Container matching Screenshot 15 */}
        <div className="lg:col-span-3 card-panel p-6">
          <h3 className="text-base font-bold text-white border-b border-[#1b2a47] pb-3 mb-6">
            Organization Profile
          </h3>

          <form onSubmit={handleSave} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input-dark w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Primary Domain</label>
              <input
                type="text"
                value={primaryDomain}
                onChange={(e) => setPrimaryDomain(e.target.value)}
                className="input-dark w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="input-dark w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Primary Contact</label>
              <input
                type="email"
                value={primaryContact}
                onChange={(e) => setPrimaryContact(e.target.value)}
                className="input-dark w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Data Retention</label>
              <input
                type="text"
                value={dataRetention}
                onChange={(e) => setDataRetention(e.target.value)}
                className="input-dark w-full text-xs"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button type="submit" className="btn-primary text-xs flex items-center gap-2">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
              {isSaved && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Saved!
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
