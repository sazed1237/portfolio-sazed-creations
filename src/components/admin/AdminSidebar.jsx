"use client";

import { useEffect, useState } from 'react';

export default function AdminSidebar({ active, setActive }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let activeFlag = true;

    async function loadUnread() {
      try {
        const res = await fetch('/api/admin/messages?limit=50', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) return;
        if (!activeFlag) return;
        const items = data?.items ?? [];
        const unread = items.filter((m) => String(m.status).toLowerCase() === 'new').length;
        setUnreadCount(unread);
      } catch (e) {
        // ignore errors in sidebar
      }
    }

    loadUnread();

    return () => {
      activeFlag = false;
    };
  }, []);

  const items = [
    { id: 'overview', label: 'Overview' },
    { id: 'messages', label: 'Inbox' },
    { id: 'users', label: 'Clients' },
    { id: 'projects', label: 'Projects' },
    { id: 'blog', label: 'Blog' },
    { id: 'services', label: 'Services' },
    { id: 'stats', label: 'Stats' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <aside className="w-64 border-r bg-white min-h-screen">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Admin</h3>
        <p className="text-sm text-slate-500">Control panel</p>
      </div>

      <nav className="p-2 space-y-1">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => setActive(it.id)}
            className={`w-full text-left px-4 py-2 rounded-md hover:bg-slate-100 ${
              active === it.id ? 'bg-slate-100 font-medium' : 'text-slate-700'
            }`}
          >
            <span className="inline-flex items-center">
              <span>{it.label}</span>
              {it.id === 'messages' && unreadCount > 0 ? (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-600 text-white">
                  {unreadCount}
                </span>
              ) : null}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
