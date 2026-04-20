import { NextRequest } from 'next/server';
import { listSubmissions } from '@/lib/db';
import products from '@/data/products.json';
import * as XLSX from 'xlsx';

const VISOR_NAMES: Record<string, string> = Object.fromEntries(
  products.map((p) => [p.id, p.name])
);

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  const expected = process.env.EXPORT_KEY;

  if (!expected) {
    return new Response('EXPORT_KEY not configured', { status: 500 });
  }
  if (key !== expected) {
    return new Response('Unauthorized', { status: 401 });
  }

  const rows = await listSubmissions();

  const data = rows.map((r) => {
    const submittedAt = r.submitted_at ? new Date(r.submitted_at) : new Date();
    return {
      'Submitted At': formatDate(submittedAt),
      Team: r.team_name ?? '',
      '#': r.jersey_number ?? '',
      Name: r.name,
      Helmet: r.helmet_model ?? '',
      Line: r.line ?? '',
      Visor: VISOR_NAMES[r.visor] ?? r.visor,
      Email: r.contact_email ?? '',
    };
  });

  const header = ['Submitted At', 'Team', '#', 'Name', 'Helmet', 'Line', 'Visor', 'Email'];
  const worksheet = XLSX.utils.json_to_sheet(data, { header });

  worksheet['!cols'] = [
    { wch: 20 }, // Submitted At
    { wch: 24 }, // Team
    { wch: 6 },  // #
    { wch: 24 }, // Name
    { wch: 14 }, // Helmet
    { wch: 10 }, // Line
    { wch: 30 }, // Visor
    { wch: 28 }, // Email
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Visor Requests');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="reyrr-visor-requests.xlsx"',
      'Cache-Control': 'no-store',
    },
  });
}

function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
