import { NextRequest, NextResponse } from 'next/server';
import { insertSubmission } from '@/lib/db';
import products from '@/data/products.json';

// Only accept visors that are NOT flagged soldOut in products.json.
// The UI still shows sold-out cards with an X overlay, but we block
// forged submissions here so the DB never sees a disabled SKU.
const VALID_IDS = new Set(
  products
    .filter((p) => !(p as { soldOut?: boolean }).soldOut)
    .map((p) => p.id)
);
const VALID_LINES = new Set(['VIZU', 'VISION', 'REVO']);
const VALID_HELMETS = new Set([
  'SpeedFlex',
  'Schutt F7',
  'Axiom',
  'Speed Icon',
  'Other Brand',
  'Unknown',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const visor = typeof body?.visor === 'string' ? body.visor : '';
    const line = typeof body?.line === 'string' ? body.line : '';
    const team_name =
      typeof body?.team_name === 'string' ? body.team_name.trim() : '';
    const jersey_number_raw =
      typeof body?.jersey_number === 'string' ? body.jersey_number.trim() : '';
    const helmet_model =
      typeof body?.helmet_model === 'string' ? body.helmet_model.trim() : '';
    const contact_email_raw =
      typeof body?.contact_email === 'string' ? body.contact_email.trim() : '';

    if (!name || name.length > 120) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }
    if (!VALID_IDS.has(visor)) {
      return NextResponse.json({ error: 'Invalid visor' }, { status: 400 });
    }
    if (!VALID_LINES.has(line)) {
      return NextResponse.json({ error: 'Invalid line' }, { status: 400 });
    }
    if (!team_name || team_name.length > 80) {
      return NextResponse.json({ error: 'Invalid team name' }, { status: 400 });
    }
    if (jersey_number_raw.length > 10) {
      return NextResponse.json(
        { error: 'Jersey number too long' },
        { status: 400 }
      );
    }
    if (!VALID_HELMETS.has(helmet_model)) {
      return NextResponse.json(
        { error: 'Invalid helmet model' },
        { status: 400 }
      );
    }
    if (contact_email_raw && !EMAIL_RE.test(contact_email_raw)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    await insertSubmission({
      name,
      line,
      visor,
      team_name,
      jersey_number: jersey_number_raw || null,
      helmet_model,
      contact_email: contact_email_raw || null,
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('submit error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
