import Image from "next/image";
import LoginForm from "../login-form";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  const allowedEmail = process.env.AETHELTIME_ALLOWED_EMAIL || "";
  return (
    <main className="auth-screen">
      <section className="auth-visual" aria-label="Identidad visual de AethelTime">
        <Image
          src="/aethel-login.jpg"
          alt="Logo de AethelTime con un símbolo infinito luminoso sobre un fondo azul oscuro."
          width={540}
          height={816}
          priority
        />
      </section>
      <section className="auth-content">
        <div className="auth-content-inner">
          <div className="auth-brand">
            <Image src="/aethel-symbol.jpg" alt="" width={42} height={42} priority />
            <span>Aethel<strong>Time</strong></span>
          </div>
          <p className="auth-eyebrow">Tu espacio personal</p>
          <h1 className="auth-title">Inicia sesión</h1>
          <p className="auth-subtitle">Agenda, formaciones e incentivos, en un solo lugar.</p>
          <LoginForm allowedEmail={allowedEmail} />
          <p className="auth-footnote">Acceso personal protegido. No compartas tu contraseña.</p>
        </div>
      </section>
    </main>
  );
}
