import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

export type Submission = {
  id?: number;
  name: string;
  line: string;
  visor: string; // visor ID (e.g., "vizu-chrome-mirror")
  submitted_at?: string;
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
  // Create if missing, and ensure line/visor columns exist even on older tables.
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
}

export async function insertSubmission(sub: {
  name: string;
  line: string;
  visor: string;
}): Promise<void> {
  if (hasNeon()) {
    await ensureSchema();
    const sql = neon(process.env.DATABASE_URL!);
    await sql`
      INSERT INTO submissions (name, line, visor)
      VALUES (${sub.name}, ${sub.line}, ${sub.visor})
    `;
    return;
  }
  const rows = readLocal();
  rows.push({
    id: rows.length + 1,
    name: sub.name,
    line: sub.line,
    visor: sub.visor,
    submitted_at: new Date().toISOString(),
  });
  writeLocal(rows);
}

export async function listSubmissions(): Promise<Submission[]> {
  if (hasNeon()) {
    await ensureSchema();
    const sql = neon(process.env.DATABASE_URL!);
    const rows = (await sql`
      SELECT id, name, line, visor, submitted_at
      FROM submissions
      ORDER BY submitted_at ASC
    `) as Submission[];
    return rows;
  }
  return readLocal();
}
