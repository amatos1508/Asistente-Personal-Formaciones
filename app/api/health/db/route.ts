import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return NextResponse.json(
      { ok: false, message: "La variable DATABASE_URL no está configurada." },
      { status: 503 },
    );
  }

  try {
    const sql = neon(connectionString);
    await sql`SELECT 1`;

    return NextResponse.json({ ok: true, database: "connected" });
  } catch {
    // Do not return connection details, SQL errors, or credentials to the client.
    return NextResponse.json(
      { ok: false, message: "No se pudo conectar con la base de datos." },
      { status: 503 },
    );
  }
}
