'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { logout } from '@/lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ fullName: string; role: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const links = [
    { href: '/dashboard', label: 'Tableau de bord' },
    { href: '/servers', label: 'Serveurs' },
  ];

  return (
    <nav className="mb-6 flex items-center justify-between rounded-xl bg-white p-4 shadow">
      <div className="flex items-center gap-6">
        <span className="font-bold text-blue-800">CloudOps</span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? 'font-semibold text-blue-700' : 'text-slate-600'}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3 text-sm">
        {user && (
          <span className="text-slate-600">
            {user.fullName} <span className="rounded bg-slate-200 px-2 py-0.5">{user.role}</span>
          </span>
        )}
        <button onClick={logout} className="rounded bg-slate-800 px-3 py-1.5 text-white">
          Déconnexion
        </button>
      </div>
    </nav>
  );
}