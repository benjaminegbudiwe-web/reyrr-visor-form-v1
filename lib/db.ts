import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

export type Submission = {
  id?: number;
  name: string;
  line: string;
  visor: string; // visor ID (e.g., "vizu-chrome-mirror")
  team_name?: string | null;
  jersey_number?: string | null;
  helmet_model?: string | null;
  contact_email?: string | null;
  submitted_at?: string;
};

export type NewSubmission = {
  name: string;
  line: string;
  visor: string;
  team_name: string;
  jersey_number?: string | null;
  helmet_model: string;
  contact_email?: string | null;
};

const LOCAL_FILE = path.resolve(process.cwd(), 'data', 'submissions-local.json');

function hasNeon(): boolean {
  return !!process.env.DATABASE_URL;
}

function readLocal(): Submission[] {
  try {
    if (!fs.existsSync(LOCAL_FILE)) return [];
    return JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeLocal(rows: Submission[]) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'DATABASE_URL is not configured. Add it to Vercel env vars (via the Storage tab → Neon integration).'
    );
  }
  fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(rows, null, 2));
}

export async function ensureSchema(): Promise<void> {
  if (!hasNeon()) return;
  const sql = neon(process.env.DATABASE_URL!);
  // Create if missing, and ensure all columns exist even on older tables.
  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      line TEXT,
      visor TEXT NOT NULL,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS line TEXT`;
  await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS visor TEXT`;
  await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS team_name TEXT`;
  await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS jersey_number TEXT`;
  await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS helmet_model TEXT`;
  await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS contact_email TEXT`;
  await sql`CREATE INDEX IF NOT EXISTS idx_submissions_team ON submissions (team_name)`;
}

export async function insertSubmission(sub: NewSubmission): Promise<void> {
  if (hasNeon()) {
    await ensureSchema();
    const sql = neon(process.env.DATABASE_URL!);
    await sql`
      INSERT INTO submissions (name, line, visor, team_name, jersey_number, helmet_model, contact_email)
      VALUES (${sub.name}, ${sub.line}, ${sub.visor}, ${sub.team_name}, ${sub.jersey_number ?? null}, ${sub.helmet_model}, ${sub.contact_email ?? null})
    `;
    return;
  }
  const rows = readLocal();
  rows.push({
    id: rows.length + 1,
    name: sub.name,
    line: sub.line,
    visor: sub.visor,
    team_name: sub.team_name,
    jersey_number: sub.jersey_number ?? null,
    helmet_model: sub.helmet_model,
    contact_email: sub.contact_email ?? null,
    submitted_at: new Date().toISOString(),
  });
  writeLocal(rows);
}

export async function listSubmissions(): Promise<Submission[]> {
  if (hasNeon()) {
    await ensureSchema();
    const sql = neon(process.env.DATABASE_URL!);
    const rows = (await sql`
      SELECT id, name, line, visor, team_name, jersey_number, helmet_model, contact_email, submitted_at
      FROM submissions
      ORDER BY submitted_at ASC
    `) as Submission[];
    return rows;
  }
  return readLocal();
}

export async function deleteSubmission(id: number): Promise<boolean> {
  if (!Number.isFinite(id) || id <= 0) return false;
  if (hasNeon()) {
    await ensureSchema();
    const sql = neon(process.env.DATABASE_URL!);
    const rows = (await sql`
      DELETE FROM submissions WHERE id = ${id} RETURNING id
    `) as { id: number }[];
    return rows.length > 0;
  }
  const rows = readLocal();
  const next = rows.filter((r) => r.id !== id);
  if (next.length === rows.length) return false;
  writeLocal(next);
  return true;
}
