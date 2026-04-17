import { NextRequest, NextResponse } from 'next/server';
import { insertSubmission } from '@/lib/db';
import products from '@/data/products.json';

const VALID_IDS = new Set(products.map((p) => p.id));
const VALID_LINES = new Set(['VIZU', 'VISION', 'REVO']);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const visor = typeof body?.visor === 'string' ? body.visor : '';
    const line = typeof body?.line === 'string' ? body.line : '';

    if (!name || name.length > 120) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }
    if (!VALID_IDS.has(visor)) {
      return NextResponse.json({ error: 'Invalid visor' }, { status: 400 });
    }
    if (!VALID_LINES.has(line)) {
      return NextResponse.json({ error: 'Invalid line' }, { status: 400 });
    }

    await insertSubmission({ name, line, visor });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('submit error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
