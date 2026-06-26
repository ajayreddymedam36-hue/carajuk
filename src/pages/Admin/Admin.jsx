import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase/client";
import logoAssetImg from "@/assets/logos/ca-logo.png";
const logoAsset = { url: logoAssetImg };

import Login from "./Login";
import Dashboard from "./Dashboard";

export default function Admin() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    
    const sessionPromise = supabase.auth.getSession();
    const delayPromise = new Promise((resolve) => setTimeout(resolve, 1000));

    Promise.all([sessionPromise, delayPromise]).then(([{ data }]) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <img src={logoAsset.url} alt="" style={{ height: 64 }} />
        <div className="loader-ring" />
        <div style={{ color: "var(--muted)", letterSpacing: ".1em", textTransform:"uppercase", fontSize: ".8rem" }}>Loading admin…</div>
      </div>
    );
  }
  return session ? <Dashboard /> : <Login />;
}
