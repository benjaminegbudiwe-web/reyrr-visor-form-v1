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
      Name: r.name,
      Line: r.line ?? '',
      Visor: VISOR_NAMES[r.visor] ?? r.visor,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data, {
    header: ['Submitted At', 'Name', 'Line', 'Visor'],
  });

  worksheet['!cols'] = [{ wch: 20 }, { wch: 28 }, { wch: 10 }, { wch: 30 }];

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
