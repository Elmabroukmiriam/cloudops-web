'use client';

import { useCallback, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { api, getToken } from '@/lib/api';

type Server = {
  id: number;
  name: string;
  provider: string;
  region: string;
  cpu: number;
  ram: number;
  storage: number;
  ipAddress: string;
  status: string;
};

type Page = { data: Server[]; total: number; page: number; limit: number };

const statusColor: Record<string, string> = {
  ONLINE: 'bg-green-100 text-green-800',
  OFFLINE: 'bg-red-100 text-red-800',
  MAINTENANCE: 'bg-amber-100 text-amber-800',
};

export default function ServersPage() {
  const [result, setResult] = useState<Page | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '5' });
      if (query) params.set('search', query);
      setResult(await api<Page>(`/servers?${params}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    if (!getToken()) {
      window.location.href = '/login';
      return;
    }
    load();
  }, [load]);

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.limit)) : 1;

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">
        <Navbar />
        <h1 className="mb-4 text-2xl font-bold text-slate-900">Serveurs</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQuery(search);
          }}
          className="mb-4 flex gap-2"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom..."
            className="w-full max-w-xs rounded border border-slate-300 bg-white p-2 text-slate-900"
          />
          <button className="rounded bg-blue-700 px-4 py-2 text-white">Rechercher</button>
        </form>

        {error && <p className="mb-3 text-red-600">{error}</p>}
        {loading && <p className="text-slate-500">Chargement...</p>}

        {result && !loading && (
          <div className="overflow-x-auto rounded-xl bg-white shadow">
            <table className="w-full text-left text-sm text-slate-800">
              <thead className="bg-slate-800 text-white">
                <tr>
                  {['Nom', 'Fournisseur', 'Région', 'CPU', 'RAM (Go)', 'Stockage (Go)', 'IP', 'Statut'].map((h) => (
                    <th key={h} className="p-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-3 font-semibold">{s.name}</td>
                    <td className="p-3">{s.provider}</td>
                    <td className="p-3">{s.region}</td>
                    <td className="p-3">{s.cpu}</td>
                    <td className="p-3">{s.ram}</td>
                    <td className="p-3">{s.storage}</td>
                    <td className="p-3">{s.ipAddress}</td>
                    <td className="p-3">
                      <span className={`rounded px-2 py-0.5 ${statusColor[s.status] ?? ''}`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
                {result.data.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500">
                      Aucun serveur trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {result && (
          <div className="mt-4 flex items-center justify-between text-sm text-slate-700">
            <span>{result.total} serveur(s)</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded bg-slate-800 px-3 py-1.5 text-white disabled:opacity-40"
              >
                Précédent
              </button>
              <span>Page {page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded bg-slate-800 px-3 py-1.5 text-white disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}