import Image from "next/image";
import SignOutButton from "../sign-out-button";

export const dynamic = "force-dynamic";

export default function BlockedPage() {
  const allowedEmail = process.env.AETHELTIME_ALLOWED_EMAIL || "";
  return (
    <main className="auth-blocked">
      <section className="auth-blocked-card">
        <Image src="/aethel-symbol.jpg" alt="" width={64} height={64} />
        <h1>Esta cuenta no tiene acceso</h1>
        <p>Inicia sesión con la cuenta autorizada para AethelTime{allowedEmail ? `: ${allowedEmail}` : "."}</p>
        <SignOutButton />
      </section>
    </main>
  );
}
