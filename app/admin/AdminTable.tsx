'use client';

import { useMemo, useState } from 'react';

export type AdminRow = {
  id: number;
  submittedAt: string;
  team: string;
  jersey: string;
  name: string;
  helmet: string;
  line: string;
  visorName: string;
  email: string;
};

const NO_TEAM_KEY = '(no team)';

export default function AdminTable({
  rows: initialRows,
  exportKey,
}: {
  rows: AdminRow[];
  exportKey: string;
}) {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<AdminRow[]>(initialRows);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (row: AdminRow) => {
    if (deletingId !== null) return;
    const label = `${row.name}${row.team ? ` (${row.team})` : ''}`;
    const ok = window.confirm(
      `Delete request from ${label}?\n\nThis cannot be undone.`
    );
    if (!ok) return;

    setDeletingId(row.id);
    try {
      const res = await fetch(
        `/api/submissions/${row.id}?key=${encodeURIComponent(exportKey)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Delete failed (${res.status})`);
      }
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (e: any) {
      window.alert(e?.message || 'Could not delete that request.');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => {
      const hay = [
        r.team,
        r.name,
        r.helmet,
        r.visorName,
        r.line,
        r.email,
        r.jersey,
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, q]);

  const grouped = useMemo(() => {
    const map = new Map<string, AdminRow[]>();
    for (const r of filtered) {
      const teamKey = r.team || NO_TEAM_KEY;
      const list = map.get(teamKey) ?? [];
      list.push(r);
      map.set(teamKey, list);
    }
    // Team names A–Z, but "(no team)" last
    const entries = Array.from(map.entries());
    entries.sort(([a], [b]) => {
      if (a === NO_TEAM_KEY) return 1;
      if (b === NO_TEAM_KEY) return -1;
      return a.localeCompare(b);
    });
    return entries;
  }, [filtered]);

  return (
    <>
      <div className="admin-actions">
        <span className="hud-sm">
          {filtered.length} / {rows.length} requests
        </span>
        <input
          className="admin-search"
          placeholder="Search team, player, helmet…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <a
          className="btn-ghost"
          href={`/api/export?key=${encodeURIComponent(exportKey)}`}
        >
          Export XLSX ↓
        </a>
      </div>

      <div style={{ width: '100%', marginTop: 8 }}>
        {rows.length === 0 ? (
          <div className="admin-empty">
            No requests yet. Share the intake link with your coaches.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Submitted</th>
                <th>#</th>
                <th>Player</th>
                <th>Helmet</th>
                <th>Line</th>
                <th>Visor</th>
                <th>Email</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {grouped.map(([teamName, teamRows]) => (
                <TeamGroup
                  key={teamName}
                  teamName={teamName}
                  teamRows={teamRows}
                  onDelete={handleDelete}
                  deletingId={deletingId}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function TeamGroup({
  teamName,
  teamRows,
  onDelete,
  deletingId,
}: {
  teamName: string;
  teamRows: AdminRow[];
  onDelete: (row: AdminRow) => void;
  deletingId: number | null;
}) {
  return (
    <>
      <tr className="team-row">
        <td colSpan={8}>
          {teamName}
          <span className="cnt">
            {teamRows.length} request{teamRows.length === 1 ? '' : 's'}
          </span>
        </td>
      </tr>
      {teamRows.map((r) => {
        const isDeleting = deletingId === r.id;
        return (
          <tr key={r.id} style={{ opacity: isDeleting ? 0.4 : 1 }}>
            <td>{r.submittedAt}</td>
            <td>{r.jersey || '—'}</td>
            <td>{r.name}</td>
            <td>{r.helmet || '—'}</td>
            <td>{r.line || '—'}</td>
            <td>{r.visorName}</td>
            <td>{r.email || '—'}</td>
            <td className="row-actions">
              <button
                type="button"
                className="row-delete"
                title="Delete request"
                aria-label={`Delete request from ${r.name}`}
                onClick={() => onDelete(r)}
                disabled={isDeleting || deletingId !== null}
              >
                {isDeleting ? '…' : '✕'}
              </button>
            </td>
          </tr>
        );
      })}
    </>
  );
}
