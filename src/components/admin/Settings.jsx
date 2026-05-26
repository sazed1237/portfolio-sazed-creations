"use client";

import { useEffect, useState } from 'react';

export default function Settings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/admin/settings', { cache: 'no-store' });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || 'Failed to load settings');
        }

        if (active) {
          setData(payload);
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load settings');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [security, setSecurity] = useState(null);

  useEffect(() => {
    if (!data) return;
    setProfile(data.profile);
    setNotifications(data.notifications);
    setSecurity(data.security);
  }, [data]);

  const actionLog = data?.actionLog ?? [];

  const quickSettings = [
    { label: 'Maintenance Mode', value: security?.maintenanceMode ? 'On' : 'Off' },
    { label: 'Public Contact Form', value: security?.publicContactForm ? 'Enabled' : 'Disabled' },
    { label: 'Portfolio Visibility', value: security?.portfolioVisibility ?? 'public' },
    { label: 'Backup Frequency', value: security?.backupFrequency ?? 'daily' },
  ];

  const sections = [
    {
      title: 'Profile & Branding',
      description: 'Update the public identity of the portfolio and admin metadata.',
      items: ['Site title', 'Meta description', 'Logo / avatar', 'Accent color'],
    },
    {
      title: 'Notifications',
      description: 'Choose what the dashboard alerts you about and how often.',
      items: ['New contact form submissions', 'Project draft changes', 'Weekly performance digest', 'Security alerts'],
    },
    {
      title: 'Security',
      description: 'Control session behavior and admin access policies.',
      items: ['Password rotation', 'Session timeout', '2FA ready', 'Activity logging'],
    },
  ];

  async function handleSave() {
    try {
      setSaving(true);
      setError('');

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, notifications, security }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to save settings');
      }

      setData((current) => current ? { ...current, ...payload, profile, notifications, security } : current);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  function updateProfileField(field, value) {
    setProfile((current) => ({ ...(current || {}), [field]: value }));
  }

  function updateNotificationField(field, value) {
    setNotifications((current) => ({ ...(current || {}), [field]: value }));
  }

  function updateSecurityField(field, value) {
    setSecurity((current) => ({ ...(current || {}), [field]: value }));
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-lg">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-300">System Preferences</p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Settings</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              Configure branding, notifications, and admin controls from a single streamlined workspace.
            </p>
          </div>

            <div className="flex flex-wrap gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Reset Changes
            </button>
            <button
              onClick={handleSave}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickSettings.map((setting) => (
          <article key={setting.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{setting.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{loading ? '...' : setting.value}</p>
          </article>
        ))}
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Configuration Panels</h3>
          <p className="mt-1 text-sm text-slate-500">The structure below is ready for real form controls and API persistence.</p>

          <div className="mt-5 space-y-4">
            {sections.map((section) => (
              <div key={section.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">{section.title}</h4>
                    <p className="mt-1 text-sm text-slate-500">{section.description}</p>
                  </div>
                </div>

                  {section.title === 'Profile & Branding' ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-600">
                        <span>Site title</span>
                        <input
                          value={profile?.siteTitle ?? ''}
                          onChange={(e) => updateProfileField('siteTitle', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-300"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-600">
                        <span>Accent color</span>
                        <input
                          value={profile?.accentColor ?? ''}
                          onChange={(e) => updateProfileField('accentColor', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-300"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-600 sm:col-span-2">
                        <span>Meta description</span>
                        <textarea
                          value={profile?.metaDescription ?? ''}
                          onChange={(e) => updateProfileField('metaDescription', e.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-300"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-600 sm:col-span-2">
                        <span>Logo / avatar URL</span>
                        <input
                          value={profile?.logoUrl ?? ''}
                          onChange={(e) => updateProfileField('logoUrl', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-300"
                        />
                      </label>
                    </div>
                  ) : null}

                  {section.title === 'Notifications' ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[
                        ['contactSubmissions', 'New contact form submissions'],
                        ['projectChanges', 'Project draft changes'],
                        ['weeklyDigest', 'Weekly performance digest'],
                        ['securityAlerts', 'Security alerts'],
                      ].map(([field, label]) => (
                        <label key={field} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                          <span>{label}</span>
                          <input
                            type="checkbox"
                            checked={Boolean(notifications?.[field])}
                            onChange={(e) => updateNotificationField(field, e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                        </label>
                      ))}
                    </div>
                  ) : null}

                  {section.title === 'Security' ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                        <span>Maintenance Mode</span>
                        <input
                          type="checkbox"
                          checked={Boolean(security?.maintenanceMode)}
                          onChange={(e) => updateSecurityField('maintenanceMode', e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                      </label>
                      <label className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                        <span>Public Contact Form</span>
                        <input
                          type="checkbox"
                          checked={Boolean(security?.publicContactForm)}
                          onChange={(e) => updateSecurityField('publicContactForm', e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-600">
                        <span>Portfolio Visibility</span>
                        <select
                          value={security?.portfolioVisibility ?? 'public'}
                          onChange={(e) => updateSecurityField('portfolioVisibility', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-300"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                          <option value="password">Password Protected</option>
                        </select>
                      </label>
                      <label className="space-y-2 text-sm text-slate-600">
                        <span>Backup Frequency</span>
                        <select
                          value={security?.backupFrequency ?? 'daily'}
                          onChange={(e) => updateSecurityField('backupFrequency', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-300"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </label>
                    </div>
                  ) : null}
              </div>
            ))}
          </div>
        </article>

        <aside className="space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Security Notes</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-xl bg-slate-50 p-4">
                Admin sessions expire after inactivity to reduce risk.
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                Password-based access can later be upgraded to role-based authentication.
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                Track changes here once the settings API is connected.
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Action Log</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {actionLog && actionLog.length > 0 ? (
                actionLog.map((entry, idx) => (
                  <li key={idx} className="rounded-xl bg-slate-50 px-4 py-3 break-words">{entry}</li>
                ))
              ) : (
                <li className="rounded-xl bg-slate-50 px-4 py-3">No actions recorded yet.</li>
              )}
            </ul>
          </article>
        </aside>
      </div>
    </section>
  );
}
