"use client";

import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth/client";

export default function LoginForm({ allowedEmail }: { allowedEmail: string }) {
  const [isCreating, setIsCreating] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    setIsPending(true);
    try {
      if (isCreating) {
        const result = await authClient.signUp.email({
          email: allowedEmail,
          password,
          name: "AethelTime",
          callbackURL: "/",
        });
        if (result.error) throw new Error(result.error.message || "No se pudo crear la cuenta.");
        setIsCreating(false);
        setPassword("");
        setMessage("Solicitud enviada. Revisa tu correo y después inicia sesión.");
      } else {
        const result = await authClient.signIn.email({
          email: allowedEmail,
          password,
          callbackURL: "/",
        });
        if (result.error) throw new Error(result.error.message || "No se pudo iniciar sesión.");
        window.location.replace("/");
      }
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "No se pudo completar el acceso. Inténtalo de nuevo.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>
        Correo
        <input type="email" value={allowedEmail} readOnly autoComplete="username" required />
      </label>
      <label>
        Contraseña
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          autoComplete={isCreating ? "new-password" : "current-password"}
          required
        />
      </label>
      <button className="auth-submit" type="submit" disabled={isPending || !allowedEmail}>
        {isPending ? "Un momento…" : isCreating ? "Crear mi cuenta" : "Entrar"}
      </button>
      {message && <p className={isError ? "auth-message error" : "auth-message"} role={isError ? "alert" : "status"}>{message}</p>}
      <button className="auth-toggle" type="button" onClick={() => { setIsCreating(!isCreating); setMessage(""); setPassword(""); }}>
        {isCreating ? "Ya tengo una cuenta. Iniciar sesión" : "Es mi primer acceso. Crear cuenta"}
      </button>
    </form>
  );
}
