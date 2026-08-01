"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthPanel } from "../../../components/auth-panel";
import { createBrowserSupabaseClient } from "../../../lib/supabase/browser";

export default function AuthCallbackPage() {
  const [state, setState] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    const code = new URL(window.location.href).searchParams.get("code");
    if (!supabase || !code) {
      setState("error");
      return;
    }
    void supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      setState(error ? "error" : "success");
    });
  }, []);

  return (
    <main className="authPage">
      <section className="authCard">
        <p className="eyebrow">Connexion sécurisée</p>
        <h1>{state === "loading" ? "Connexion en cours…" : state === "success" ? "Compte connecté." : "Lien non valide."}</h1>
        <p>{state === "success" ? "Ta progression peut maintenant être synchronisée entre tes appareils." : state === "error" ? "Le lien a expiré ou a déjà été utilisé. Demande un nouveau lien depuis la page de connexion." : "Nous vérifions le lien envoyé par e-mail."}</p>
        {state === "success" && <Link className="button buttonPrimary" href="/">Ouvrir mon espace</Link>}
      </section>
      {state === "error" && <AuthPanel />}
    </main>
  );
}
