"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";

export default function SignOutButton() {
  const [pending, setPending] = useState(false);
  async function signOut() {
    setPending(true);
    try {
      await authClient.signOut();
    } finally {
      window.location.replace("/auth/sign-in");
    }
  }
  return <button className="button-primary" type="button" onClick={signOut} disabled={pending}>{pending ? "Cerrando…" : "Cerrar sesión"}</button>;
}
