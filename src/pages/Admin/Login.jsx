import { useState } from "react";
import { supabase } from "@/services/supabase/client";
import logoAssetImg from "@/assets/logos/ca-logo.png";
const logoAsset = { url: logoAssetImg };

/* =================== LOGIN =================== */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message);
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--canvas-3)",
        display: "grid",
        placeItems: "center",
        padding: "2rem 1rem",
      }}
    >
      <div
        className="card anim-scale-in"
        style={{ width: "100%", maxWidth: 440, padding: "2.4rem" }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: ".8rem", marginBottom: "1.4rem" }}
        >
          <img src={logoAsset.url} alt="" style={{ height: 48 }} />
          <div>
            <div
              className="font-serif"
              style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--navy)" }}
            >
              CA Raju Koyyala &amp; Associates
            </div>
            <div
              style={{
                fontSize: ".75rem",
                color: "var(--muted)",
                letterSpacing: ".12em",
                textTransform: "uppercase",
              }}
            >
              CRM · Internal access
            </div>
          </div>
        </div>
        <h1 className="font-serif" style={{ fontSize: "2rem", marginBottom: ".4rem" }}>
          Admin Access
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: "1.8rem", fontSize: ".95rem" }}>
          Sign in to manage client info &amp; broadcasts.
        </p>
        <form onSubmit={submit} style={{ display: "grid", gap: "1rem" }}>
          <div className="field">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                className="input"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingRight: "2.5rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  color: "var(--muted)",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>
          {err && (
            <div
              style={{
                padding: ".7rem .9rem",
                background: "#FEE2E2",
                color: "#991B1B",
                borderRadius: 8,
                fontSize: ".88rem",
              }}
            >
              {err}
            </div>
          )}
          <button type="submit" className="btn btn-gold" disabled={loading}>
            {loading ? "Please wait…" : "Sign in"}
          </button>
        </form>
        <div
          style={{
            marginTop: "1.2rem",
            textAlign: "center",
          }}
        >
          <a
            href="/"
            style={{
              color: "var(--navy)",
              fontSize: ".88rem",
              fontWeight: 500,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: ".4rem",
              transition: "color .2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold-dark)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--navy)")}
          >
            ← Back to website
          </a>
        </div>
      </div>
    </div>
  );
}
