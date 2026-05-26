"use client";

import { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import Overview from './Overview';
import Messages from './Messages';
import Users from './Users';
import Projects from './Projects';
import Services from './Services';
import Stats from './Stats';
import Settings from './Settings';
import Blog from './Blog';

const DASHBOARD_TABS = [
  'overview',
  'messages',
  'users',
    'projects',
  'services',
    'blog',
  'stats',
  'settings',
];

function isValidDashboardTab(tab) {
  return DASHBOARD_TABS.includes(String(tab || '').toLowerCase());
}

function LoginForm({ onLogin }) {
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const ok = onLogin(pass);
    if (!ok) {
      setError('Incorrect password. Please try again.');
      return;
    }

    setError('');
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#071426] via-[#061325] to-[#08121a] px-4 py-10">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="mx-auto mt-14 w-full max-w-md rounded-2xl border border-white/10 bg-[#0c1826]/80 p-6 shadow-[0_22px_60px_rgba(2,6,23,0.6)] backdrop-blur-sm sm:p-8">
        <div className="mb-6">
          <p className="mb-2 inline-block rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Secure Access
          </p>
          <h3 className="text-2xl font-bold text-white">Admin Login</h3>
          <p className="mt-2 text-sm text-white/70">
            Enter your admin password to access the dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-white/80" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            value={pass}
            onChange={(e) => {
              setPass(e.target.value);
              if (error) {
                setError('');
              }
            }}
            type="password"
            placeholder="Enter password"
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-white placeholder:text-white/40 outline-none transition-colors focus:border-accent/60"
          />

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <div className="pt-1">
            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-accent to-[#43c6ad] px-4 py-2.5 font-semibold text-[#06111c] transition-opacity hover:opacity-90"
            >
              Sign in
            </button>
          </div>
        </form>

        <div className="mt-5 border-t border-white/10 pt-4 text-xs text-white/50">
          Protected area for portfolio administration.
        </div>
      </div>
    </div>
  );
}

function AuthLoader() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#071426] via-[#061325] to-[#08121a] px-4 py-10">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="mx-auto mt-20 w-full max-w-md rounded-2xl border border-white/10 bg-[#0c1826]/80 p-8 text-center shadow-[0_22px_60px_rgba(2,6,23,0.6)] backdrop-blur-sm">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
        <h3 className="text-xl font-semibold text-white">Loading Dashboard</h3>
        <p className="mt-2 text-sm text-white/65">Restoring your admin session...</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [active, setActive] = useState('overview');
  const [authenticated, setAuthenticated] = useState(false);
  const [tabHydrated, setTabHydrated] = useState(false);

  useEffect(() => {
    try {
      setAuthenticated(sessionStorage.getItem('isAdmin') === 'true');

      const hashTab = String(window.location.hash || '').replace('#', '').toLowerCase();
      const savedTab = String(sessionStorage.getItem('adminActiveTab') || '').toLowerCase();
      const nextTab = isValidDashboardTab(hashTab)
        ? hashTab
        : isValidDashboardTab(savedTab)
          ? savedTab
          : 'overview';

      setActive(nextTab);
    } catch (e) {
      setAuthenticated(false);
      setActive('overview');
    } finally {
      setTabHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!tabHydrated) {
      return;
    }

    try {
      sessionStorage.setItem('adminActiveTab', active);
    } catch (e) {
      console.warn('sessionStorage.setItem failed', e);
    }

    try {
      const url = new URL(window.location.href);
      url.hash = active;
      window.history.replaceState(window.history.state, '', url);
    } catch (e) {
      console.warn('history.replaceState failed', e);
    }
  }, [active, tabHydrated]);

  const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS || 'admin';

  function handleLogin(pass) {
    if (pass === ADMIN_PASS) {
      try { sessionStorage.setItem('isAdmin', 'true'); } catch (e) { console.warn('sessionStorage.setItem failed', e); }
      setAuthenticated(true);
      return true;
    } else {
      return false;
    }
  }

  function handleLogout() {
    try { sessionStorage.removeItem('isAdmin'); } catch (e) { console.warn('sessionStorage.removeItem failed', e); }
    setAuthenticated(false);
  }

  if (!tabHydrated) return <AuthLoader />;

  if (!authenticated) return <LoginForm onLogin={handleLogin} />;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar active={active} setActive={setActive} />

      <main className="flex-1 p-8 bg-slate-50">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <div>
            <button onClick={handleLogout} className="px-3 py-1 bg-white border rounded">Logout</button>
          </div>
        </div>

        <div className="bg-transparent">
          {active === 'overview' && <Overview onNavigate={setActive} />}
          {active === 'messages' && <Messages />}
          {active === 'users' && <Users />}
          {active === 'projects' && <Projects />}
          {active === 'services' && <Services />}
          {active === 'blog' && <Blog />}
          {active === 'stats' && <Stats />}
          {active === 'settings' && <Settings />}
        </div>
      </main>
    </div>
  );
}
