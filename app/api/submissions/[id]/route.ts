import { NextRequest, NextResponse } from 'next/server';
import { deleteSubmission } from '@/lib/db';

// DELETE /api/submissions/:id?key=EXPORT_KEY
// Reuses the same URL secret as /admin and /api/export. Same 1-admin tool,
// same guard. Rejects without a body read.
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const expected = process.env.EXPORT_KEY;
  const key = req.nextUrl.searchParams.get('key') ?? '';
  if (!expected || key !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number.parseInt(params.id, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    const ok = await deleteSubmission(id);
    if (!ok) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('delete submission error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
