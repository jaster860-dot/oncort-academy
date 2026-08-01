"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "../lib/supabase/browser";

export function AuthPanel() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "unconfigured" | "error">("idle");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = createBrowserSupabaseClient();
    if (!supabase) { setState("unconfigured"); return; }
    setState("loading");
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}${basePath}/auth/callback/` },
    });
    setState(error ? "error" : "sent");
  };
  return <section className="authCard"><p className="eyebrow">Compte facultatif</p><h1>Retrouve ta progression partout.</h1><p>L’application fonctionne immédiatement sans compte. La connexion par lien sécurisé synchronise ensuite les leçons, checkpoints et cas entre tes appareils.</p><form onSubmit={submit}><label><span>Adresse e-mail</span><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="sami@exemple.fr" /></label><button className="button buttonPrimary" disabled={state === "loading"}>{state === "loading" ? "Envoi…" : "Recevoir le lien de connexion"}</button></form>{state === "sent" && <div className="authMessage success">Lien envoyé. Vérifie ta boîte mail.</div>}{state === "unconfigured" && <div className="authMessage">Supabase n’est pas encore relié à cet environnement. Ta progression locale continue de fonctionner.</div>}{state === "error" && <div className="authMessage error">L’envoi a échoué. Réessaie dans quelques instants.</div>}<small>Aucun mot de passe. Les données pédagogiques sont isolées par RLS dans Supabase.</small></section>;
}
