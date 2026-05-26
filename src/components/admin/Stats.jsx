"use client";

import { useEffect, useState } from 'react';

export default function Stats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/admin/stats', { cache: 'no-store' });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || 'Failed to load stats');
        }

        if (active) {
          setData(payload);
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load stats');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      active = false;
    };
  }, []);

  const metricCards = data?.metricCards ?? [];
  const traffic = data?.traffic ?? [];
  const highlights = data?.highlights ?? [];
  const goals = data?.goals ?? [];

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-lg">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Insights & Analytics</p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Performance Statistics</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              Review traffic, conversion, and system performance from a clean executive-style analytics view.
            </p>
          </div>

          <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-slate-200">
            {loading ? 'Loading live stats...' : data?.source === 'd1' ? 'Live from D1' : 'Local fallback'}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-sm text-slate-500">{metric.label}</p>
              <div className="text-right">
                <p className="text-xs text-slate-400">{metric.delta}</p>
              </div>
            </div>

            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-3xl font-semibold text-slate-900">{metric.value}</p>
              <span className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium ${metric.tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : metric.tone === 'sky' ? 'bg-sky-50 text-sky-700' : metric.tone === 'violet' ? 'bg-violet-50 text-violet-700' : 'bg-amber-50 text-amber-700'}`}>
                {metric.tone === 'emerald' ? '▲' : metric.tone === 'amber' ? '◼' : '•'}
              </span>
            </div>
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
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Traffic Mix</h3>
              <p className="mt-1 text-sm text-slate-500">Channel distribution for the current reporting period.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Last 30 days</span>
          </div>

          <div className="mt-5 space-y-4">
            {traffic.map((item) => (
              <div key={item.channel}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-600">{item.channel}</span>
                  <span className="font-medium text-slate-800">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full bg-slate-900 ${item.bar}`} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">Conversion Trend</p>
            <div className="mt-4 flex items-end gap-3">
              {[32, 48, 44, 56, 68, 62, 74].map((height, index) => (
                <div key={height} className="flex-1">
                  <div
                    className="rounded-t-lg bg-slate-900"
                    style={{ height: `${height}px`, opacity: 0.55 + index * 0.06 }}
                  />
                </div>
              ))}
            </div>
          </div>
        </article>

        <aside className="space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Key Highlights</h3>
            <div className="mt-4 space-y-3">
              {highlights.map((item) => (
                <div key={item.title} className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Targets</h3>
            <div className="mt-4 space-y-4">
              {goals.map((goal) => (
                <div key={goal.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-600">{goal.label}</span>
                  <span className="font-medium text-slate-800">{goal.current} / {goal.target}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full ${goal.tone === 'emerald' ? 'bg-emerald-500' : 'bg-sky-500'}`} style={{ width: `${goal.percent}%` }} />
                </div>
              </div>
              ))}
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}
