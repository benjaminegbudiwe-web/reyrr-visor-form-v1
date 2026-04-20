import { redirect } from 'next/navigation';
import { listSubmissions } from '@/lib/db';
import products from '@/data/products.json';
import AdminTable, { AdminRow } from './AdminTable';

// Never prerender — always server-eval with fresh DB read
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const VISOR_NAMES: Record<string, string> = Object.fromEntries(
  products.map((p) => [p.id, p.name])
);

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { key?: string };
}) {
  const expected = process.env.EXPORT_KEY;
  const key = searchParams?.key ?? '';

  if (!expected || key !== expected) {
    redirect('/');
  }

  const rows = await listSubmissions();

  const mapped: AdminRow[] = rows.map((r) => ({
    id: r.id ?? 0,
    submittedAt: formatDate(r.submitted_at),
    team: r.team_name ?? '',
    jersey: r.jersey_number ?? '',
    name: r.name,
    helmet: r.helmet_model ?? '',
    line: r.line ?? '',
    visorName: VISOR_NAMES[r.visor] ?? r.visor,
    email: r.contact_email ?? '',
  }));

  // Newest first for admin view
  mapped.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  return (
    <main className="admin-wrap">
      <div className="admin-head">
        <div>
          <p className="hud">Admin · Team visor intake</p>
          <h1>Requests</h1>
        </div>
        <AdminTable rows={mapped} exportKey={expected} />
      </div>
    </main>
  );
}
