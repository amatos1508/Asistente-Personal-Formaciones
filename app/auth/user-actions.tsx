"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";

export function UserActions({ email }: { email: string }) {
  const [pending, setPending] = useState(false);
  async function signOut() {
    setPending(true);
    try {
      await authClient.signOut();
    } finally {
      window.location.replace("/auth/sign-in");
    }
  }
  return (
    <div className="user-actions">
      <span className="user-email" title={email}>{email}</span>
      <button className="logout-button" type="button" onClick={signOut} disabled={pending}>{pending ? "Saliendo…" : "Cerrar sesión"}</button>
    </div>
  );
}
