import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

const responseHeaders = { "Cache-Control": "no-store, max-age=0" };
const maxPayloadBytes = 1_000_000;

async function authorizedOwner() {
  const { data: session } = await auth.getSession();
  if (!session?.user) return { error: NextResponse.json({ error: "No autenticado." }, { status: 401, headers: responseHeaders }) };
  const allowedEmail = (process.env.AETHELTIME_ALLOWED_EMAIL || "").trim().toLowerCase();
  if (!allowedEmail || session.user.email.trim().toLowerCase() !== allowedEmail) {
    return { error: NextResponse.json({ error: "No autorizado." }, { status: 403, headers: responseHeaders }) };
  }
  return { ownerId: session.user.id };
}

function database() {
  const production = process.env.VERCEL_ENV === "production";
  const url = production ? process.env.AETHELTIME_DATABASE_URL : process.env.DATABASE_URL;
  if (!url) throw new Error(production ? "AETHELTIME_DATABASE_URL no está configurada." : "DATABASE_URL no está configurada.");
  return neon(url);
}

export async function GET() {
  const owner = await authorizedOwner();
  if ("error" in owner) return owner.error;
  try {
    const sql = database();
    const rows = await sql`WITH user_context AS MATERIALIZED (SELECT set_config('aethel.owner_id', ${owner.ownerId}, true) AS owner_id) SELECT payload FROM public.aethel_workspace, user_context WHERE public.aethel_workspace.owner_id = user_context.owner_id LIMIT 1`;
    return NextResponse.json({ workspace: rows[0]?.payload ?? null }, { headers: responseHeaders });
  } catch {
    return NextResponse.json({ error: "No se pudo leer el espacio de trabajo." }, { status: 503, headers: responseHeaders });
  }
}

export async function PUT(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Origen de solicitud no válido." }, { status: 403, headers: responseHeaders });
  }
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return NextResponse.json({ error: "Se requiere contenido JSON." }, { status: 415, headers: responseHeaders });
  }
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > maxPayloadBytes) {
    return NextResponse.json({ error: "El espacio de trabajo supera el tamaño permitido." }, { status: 413, headers: responseHeaders });
  }

  const owner = await authorizedOwner();
  if ("error" in owner) return owner.error;
  try {
    const body = await request.json() as { workspace?: unknown };
    const workspace = body?.workspace;
    if (!workspace || typeof workspace !== "object" || Array.isArray(workspace)) {
      return NextResponse.json({ error: "Formato de espacio de trabajo no válido." }, { status: 400, headers: responseHeaders });
    }
    const data = workspace as Record<string, unknown>;
    if (!Array.isArray(data.activities) || !Array.isArray(data.tasks) || !Array.isArray(data.trainings) ||
        !Array.isArray(data.offerings) || !data.incentiveTargets || typeof data.incentiveTargets !== "object" ||
        Array.isArray(data.incentiveTargets)) {
      return NextResponse.json({ error: "Faltan secciones válidas del espacio de trabajo." }, { status: 400, headers: responseHeaders });
    }
    const serialized = JSON.stringify(workspace);
    if (new TextEncoder().encode(serialized).byteLength > maxPayloadBytes) {
      return NextResponse.json({ error: "El espacio de trabajo supera el tamaño permitido." }, { status: 413, headers: responseHeaders });
    }
    const sql = database();
    await sql`WITH user_context AS MATERIALIZED (SELECT set_config('aethel.owner_id', ${owner.ownerId}, true) AS owner_id)
      INSERT INTO public.aethel_workspace (owner_id, payload, updated_at)
      SELECT user_context.owner_id, ${serialized}::jsonb, now() FROM user_context
      ON CONFLICT (owner_id) DO UPDATE
      SET payload = EXCLUDED.payload, updated_at = now()`;
    return NextResponse.json({ saved: true }, { headers: responseHeaders });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar el espacio de trabajo." }, { status: 503, headers: responseHeaders });
  }
}
