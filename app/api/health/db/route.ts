import { timingSafeEqual } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hasValidHealthToken(request: NextRequest, expected: string) {
  const authorization = request.headers.get("authorization");
  const prefix = "Bearer ";
  if (!authorization?.startsWith(prefix)) return false;

  const supplied = Buffer.from(authorization.slice(prefix.length));
  const configured = Buffer.from(expected);
  return supplied.length === configured.length && timingSafeEqual(supplied, configured);
}

export async function GET(request: NextRequest) {
  const healthToken = process.env.HEALTH_CHECK_TOKEN;
  if (!healthToken || !hasValidHealthToken(request, healthToken)) {
    return new NextResponse(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return NextResponse.json(
      { ok: false, message: "No se pudo conectar con la base de datos." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const sql = neon(connectionString);
    await sql`SELECT 1`;
    return NextResponse.json(
      { ok: true, database: "connected" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { ok: false, message: "No se pudo conectar con la base de datos." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
