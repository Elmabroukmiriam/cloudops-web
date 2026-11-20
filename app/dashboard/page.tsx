'use client';

import { useEffect, useState } from 'react';
import { api, getToken, logout } from '@/lib/api';

type Summary = {
  totals: { projects: number; environments: number; servers: number; applications: number };
  serversByStatus: Record<string, number>;
  applicationsByStatus: Record<string, number>;
  openAlertsBySeverity: Record<string, number>;
  availabilityPercent: number;
  averageUsage24h: Record<string, number>;
};

export default function DashboardPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) {
      window.location.href = '/login';
      return;
    }
    api<Summary>('/dashboard')
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  const openAlerts = data ? Object.values(data.openAlertsBySeverity).reduce((a, b) => a + b, 0) : 0;

  const cards = data
    ? [
        { label: 'Projets', value: data.totals.projects },
        { label: 'Serveurs', value: data.totals.servers },
        { label: 'Applications', value: data.totals.applications },
        { label: 'Alertes ouvertes', value: openAlerts },
        { label: 'Disponibilité', value: `${data.availabilityPercent} %` },
        { label: 'CPU moyen 24 h', value: `${data.averageUsage24h.CPU ?? 0} %` },
        { label: 'RAM moyenne 24 h', value: `${data.averageUsage24h.RAM ?? 0} %` },
      ]
    : [];

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <button onClick={logout} className="rounded bg-slate-800 px-4 py-2 text-sm text-white">
            Déconnexion
          </button>
        </div>
        {error && <p className="text-red-600">{error}</p>}
        {!data && !error && <p className="text-slate-500">Chargement...</p>}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl bg-white p-5 shadow">
              <p className="text-sm text-slate-500">{c.label}</p>
              <p className="mt-1 text-3xl font-bold text-blue-800">{c.value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}