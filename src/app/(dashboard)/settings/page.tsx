'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { Save, CheckCircle, Trash2, RefreshCw } from 'lucide-react';

const navItems = [
  'Organization',
  'Team & Roles',
  'Security',
  'Data & Privacy',
  'Notifications',
  'API / Webhooks',
] as const;

type NavItem = (typeof navItems)[number];

function SaveButton({ isSaved }: { isSaved: boolean }) {
  return (
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
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<NavItem>('Organization');
  const [isSaved, setIsSaved] = useState(false);

  // Organization
  const [companyName, setCompanyName] = useState('Acme Corporation');
  const [primaryDomain, setPrimaryDomain] = useState('acme.com');
  const [timezone, setTimezone] = useState('UTC (Coordinated Universal Time)');
  const [primaryContact, setPrimaryContact] = useState('john.doe@acme.com');
  const [dataRetention, setDataRetention] = useState('90 Days (Automated purge)');

  // Team & Roles
  const [teamMembers, setTeamMembers] = useState([
    { name: 'John Doe', email: 'john.doe@acme.com', role: 'Owner' },
    { name: 'Priya Shah', email: 'priya.shah@acme.com', role: 'Admin' },
    { name: 'Marcus Lee', email: 'marcus.lee@acme.com', role: 'Member' },
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');

  // Security
  const [require2fa, setRequire2fa] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [minPasswordLength, setMinPasswordLength] = useState(8);
  const [ssoEnabled, setSsoEnabled] = useState(false);

  // Data & Privacy
  const [anonymizeIps, setAnonymizeIps] = useState(true);
  const [complianceMode, setComplianceMode] = useState('GDPR');

  // Notifications
  const [notifyNewConversation, setNotifyNewConversation] = useState(true);
  const [notifyWeeklySummary, setNotifyWeeklySummary] = useState(true);
  const [notifyQueryLimit, setNotifyQueryLimit] = useState(true);
  const [queryLimitThreshold, setQueryLimitThreshold] = useState(80);
  const [notificationEmail, setNotificationEmail] = useState('john.doe@acme.com');

  // API / Webhooks
  const [apiKey] = useState('mw_live_sk_************************1a2b');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState({
    conversationCreated: true,
    conversationResolved: false,
    documentIndexed: false,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setTeamMembers((prev) => [
      ...prev,
      { name: inviteEmail.split('@')[0], email: inviteEmail.trim(), role: inviteRole },
    ]);
    setInviteEmail('');
  };

  const removeMember = (email: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.email !== email));
  };

  return (
    <div>
      <Header
        title="Settings"
        subtitle="Manage organization, team, security and data controls."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Sub-nav Sidebar */}
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

        {/* Form Container */}
        <div className="lg:col-span-3 card-panel p-6">
          {activeTab === 'Organization' && (
            <>
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
                <SaveButton isSaved={isSaved} />
              </form>
            </>
          )}

          {activeTab === 'Team & Roles' && (
            <>
              <h3 className="text-base font-bold text-white border-b border-[#1b2a47] pb-3 mb-6">
                Team & Roles
              </h3>

              <div className="max-w-xl space-y-4 mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="table-header">
                      <th className="py-2 px-3">Member</th>
                      <th className="py-2 px-3">Role</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-slate-300">
                    {teamMembers.map((m) => (
                      <tr key={m.email} className="table-row">
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-white">{m.name}</p>
                          <p className="text-[11px] text-slate-400">{m.email}</p>
                        </td>
                        <td className="py-2.5 px-3">{m.role}</td>
                        <td className="py-2.5 px-3 text-right">
                          {m.role !== 'Owner' && (
                            <button
                              type="button"
                              onClick={() => removeMember(m.email)}
                              className="p-1 hover:bg-[#1b2a47] text-slate-400 hover:text-rose-400 rounded transition cursor-pointer"
                              title="Remove member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <form onSubmit={handleInvite} className="max-w-xl space-y-3 border-t border-[#1b2a47] pt-4">
                <label className="block text-xs text-slate-300 mb-1">Invite Team Member</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="teammate@acme.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="input-dark flex-1 text-xs"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="input-dark text-xs"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Member">Member</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                  <button type="submit" className="btn-primary text-xs px-4">
                    Invite
                  </button>
                </div>
              </form>
            </>
          )}

          {activeTab === 'Security' && (
            <>
              <h3 className="text-base font-bold text-white border-b border-[#1b2a47] pb-3 mb-6">
                Security
              </h3>
              <form onSubmit={handleSave} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      min={5}
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(Number(e.target.value))}
                      className="input-dark w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Minimum Password Length
                    </label>
                    <input
                      type="number"
                      min={6}
                      value={minPasswordLength}
                      onChange={(e) => setMinPasswordLength(Number(e.target.value))}
                      className="input-dark w-full text-xs"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={require2fa}
                    onChange={(e) => setRequire2fa(e.target.checked)}
                    className="accent-blue-500"
                  />
                  Require two-factor authentication for all team members
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={ssoEnabled}
                    onChange={(e) => setSsoEnabled(e.target.checked)}
                    className="accent-blue-500"
                  />
                  Enable Single Sign-On (SSO)
                </label>
                <SaveButton isSaved={isSaved} />
              </form>
            </>
          )}

          {activeTab === 'Data & Privacy' && (
            <>
              <h3 className="text-base font-bold text-white border-b border-[#1b2a47] pb-3 mb-6">
                Data & Privacy
              </h3>
              <form onSubmit={handleSave} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Compliance Mode
                  </label>
                  <select
                    value={complianceMode}
                    onChange={(e) => setComplianceMode(e.target.value)}
                    className="input-dark w-full text-xs"
                  >
                    <option value="GDPR">GDPR (EU)</option>
                    <option value="CCPA">CCPA (California)</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={anonymizeIps}
                    onChange={(e) => setAnonymizeIps(e.target.checked)}
                    className="accent-blue-500"
                  />
                  Anonymize visitor IP addresses in conversation logs
                </label>
                <SaveButton isSaved={isSaved} />
              </form>

              <div className="max-w-xl mt-8 pt-6 border-t border-[#1b2a47]">
                <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-3">
                  Danger Zone
                </h4>
                <div className="flex items-center justify-between p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg">
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Delete all conversation history
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Permanently removes every stored conversation for this
                      workspace.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Notifications' && (
            <>
              <h3 className="text-base font-bold text-white border-b border-[#1b2a47] pb-3 mb-6">
                Notifications
              </h3>
              <form onSubmit={handleSave} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Notification Email
                  </label>
                  <input
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    className="input-dark w-full text-xs"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={notifyNewConversation}
                    onChange={(e) => setNotifyNewConversation(e.target.checked)}
                    className="accent-blue-500"
                  />
                  Email me when a new conversation starts
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={notifyWeeklySummary}
                    onChange={(e) => setNotifyWeeklySummary(e.target.checked)}
                    className="accent-blue-500"
                  />
                  Send a weekly usage summary
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={notifyQueryLimit}
                      onChange={(e) => setNotifyQueryLimit(e.target.checked)}
                      className="accent-blue-500"
                    />
                    Alert when query usage reaches
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    disabled={!notifyQueryLimit}
                    value={queryLimitThreshold}
                    onChange={(e) => setQueryLimitThreshold(Number(e.target.value))}
                    className="input-dark w-16 text-xs disabled:opacity-50"
                  />
                  <span className="text-xs text-slate-300">% of monthly limit</span>
                </div>
                <SaveButton isSaved={isSaved} />
              </form>
            </>
          )}

          {activeTab === 'API / Webhooks' && (
            <>
              <h3 className="text-base font-bold text-white border-b border-[#1b2a47] pb-3 mb-6">
                API / Webhooks
              </h3>
              <form onSubmit={handleSave} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">API Key</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKey}
                      readOnly
                      className="input-dark w-full text-xs text-slate-400"
                    />
                    <button
                      type="button"
                      className="btn-secondary text-xs flex items-center gap-1.5 px-3 shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Webhook URL</label>
                  <input
                    type="url"
                    placeholder="https://yourapp.com/webhooks/mediusware"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="input-dark w-full text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-2">
                    Events to Send
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={webhookEvents.conversationCreated}
                        onChange={(e) =>
                          setWebhookEvents((prev) => ({
                            ...prev,
                            conversationCreated: e.target.checked,
                          }))
                        }
                        className="accent-blue-500"
                      />
                      conversation.created
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={webhookEvents.conversationResolved}
                        onChange={(e) =>
                          setWebhookEvents((prev) => ({
                            ...prev,
                            conversationResolved: e.target.checked,
                          }))
                        }
                        className="accent-blue-500"
                      />
                      conversation.resolved
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={webhookEvents.documentIndexed}
                        onChange={(e) =>
                          setWebhookEvents((prev) => ({
                            ...prev,
                            documentIndexed: e.target.checked,
                          }))
                        }
                        className="accent-blue-500"
                      />
                      document.indexed
                    </label>
                  </div>
                </div>
                <SaveButton isSaved={isSaved} />
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
