import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import Dashboard from "./dashboard/page";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  const allowedEmail = (process.env.AETHELTIME_ALLOWED_EMAIL || "").trim().toLowerCase();
  const userEmail = session.user.email.trim().toLowerCase();
  if (!allowedEmail || userEmail !== allowedEmail) redirect("/auth/blocked");

  return <Dashboard userEmail={session.user.email} />;
}
