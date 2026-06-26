import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase/client";
import logoAssetImg from "@/assets/logos/ca-logo.png";
const logoAsset = { url: logoAssetImg };

import InquiriesTab from "./components/InquiriesTab";
import AddClientTab from "./components/AddClientTab";
import BroadcastTab from "./components/BroadcastTab";
import EditDetailsTab from "./components/EditDetailsTab";

export default function Dashboard() {
  const [tab, setTab] = useState("inquiries");
  const [email, setEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));

    // Prevent accidental back swipe / back button navigation from Admin Dashboard
    const handlePopState = (e) => {
      if (window.ignoreNextPopState) {
        window.ignoreNextPopState = false;
        return;
      }
      if (window.isDrawerOpen) {
        return;
      }

      // Re-push state to keep the user on /admin
      window.history.pushState(null, "", window.location.href);
      if (confirm("Are you sure you want to log out?")) {
        supabase.auth.signOut().then(() => {
          window.location.reload();
        });
      }
    };

    // Push an extra history entry to catch the next popstate event
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="mobile-header" style={{
        display: "none",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        background: "var(--navy)",
        color: "#fff",
        padding: "1rem",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        width: "100%",
        boxSizing: "border-box"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <img src={logoAsset.url} alt="" style={{ height: 32, background: "#fff", borderRadius: 6, padding: 3 }} />
          <div className="font-serif" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
            CA Raju Koyyala &amp; Associates
          </div>
        </div>
        <button 
          onClick={() => setSidebarOpen(true)}
          style={{
            background: "rgba(212,175,55,0.15)",
            color: "var(--gold)",
            border: "1px solid rgba(212,175,55,0.4)",
            padding: "0.4rem 0.8rem",
            borderRadius: "6px",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            width: "fit-content"
          }}
        >
          ☰ Open Menu
        </button>
      </header>

      {/* Backdrop for mobile menu */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 999,
          }}
        />
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          height: "100vh",
          background: "var(--canvas-2)",
        }}
        className="dash-grid"
      >
        <aside
          style={{
            background: "var(--navy)",
            color: "#fff",
            padding: "1.4rem",
            display: "flex",
            flexDirection: "column",
          }}
          className={sidebarOpen ? "sidebar-open" : ""}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.8rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
              <img
                src={logoAsset.url}
                alt=""
                style={{ height: 40, background: "#fff", borderRadius: 8, padding: 4 }}
              />
              <div>
                <div className="font-serif" style={{ fontWeight: 700 }}>
                  CA Raju Koyyala &amp; Co.
                </div>
                <div
                  style={{
                    fontSize: ".7rem",
                    color: "rgba(255,255,255,.55)",
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                  }}
                >
                  Admin CRM
                </div>
              </div>
            </div>
            <button 
              className="close-menu-btn"
              onClick={() => setSidebarOpen(false)}
              style={{
                display: "none",
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: "1.8rem",
                cursor: "pointer",
                padding: "0.2rem 0.5rem"
              }}
            >
              ×
            </button>
          </div>
          <nav style={{ display: "grid", gap: ".3rem" }}>
            <SideTab id="inquiries" tab={tab} setTab={(t) => { setTab(t); setSidebarOpen(false); }} icon="📋">
              Client Info
            </SideTab>
            <SideTab id="add" tab={tab} setTab={(t) => { setTab(t); setSidebarOpen(false); }} icon="➕">
              Add Client
            </SideTab>
            <SideTab id="broadcast" tab={tab} setTab={(t) => { setTab(t); setSidebarOpen(false); }} icon="📣">
              Broadcast
            </SideTab>
            <SideTab id="settings" tab={tab} setTab={(t) => { setTab(t); setSidebarOpen(false); }} icon="⚙️">
              Edit Details
            </SideTab>
          </nav>
          <div
            style={{
              marginTop: "auto",
              paddingTop: "1.5rem",
              borderTop: "1px solid rgba(255,255,255,.1)",
            }}
          >
            <div style={{ fontSize: ".75rem", color: "rgba(255,255,255,.55)", marginBottom: ".4rem" }}>
              Signed in as
            </div>
            <div style={{ fontSize: ".85rem", fontWeight: 600, marginBottom: ".7rem", wordBreak: "break-all" }}>
              {email}
            </div>
            <button
              onClick={signOut}
              className="btn"
              style={{
                background: "transparent",
                color: "var(--gold)",
                border: "1px solid rgba(212,175,55,.5)",
                padding: ".5rem 1rem",
                fontSize: ".85rem",
                width: "100%",
              }}
            >
              Sign out
            </button>
          </div>
        </aside>
        <main style={{ padding: "2rem", overflow: "auto" }}>
          {tab === "inquiries" && <InquiriesTab />}
          {tab === "add" && <AddClientTab />}
          {tab === "broadcast" && <BroadcastTab />}
          {tab === "settings" && <EditDetailsTab />}
        </main>
        <style>{`
          @media (max-width: 880px) {
            .mobile-header {
              display: flex !important;
              flex-direction: row !important;
              justify-content: space-between !important;
              align-items: center !important;
            }
            .close-menu-btn {
              display: block !important;
            }
            .dash-grid { 
              grid-template-columns: 1fr !important; 
              height: auto !important;
              min-height: calc(100vh - 96px);
            }
            .dash-grid main {
              padding: 1rem !important;
            }
            .dash-grid > aside {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              bottom: 0 !important;
              width: 80% !important;
              max-width: 280px !important;
              z-index: 1000 !important;
              transform: translateX(-100%);
              transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
              box-shadow: 5px 0 25px rgba(0, 0, 0, 0.4);
              height: 100vh !important;
            }
            .dash-grid > aside.sidebar-open {
              transform: translateX(0) !important;
            }
            .dash-grid > aside nav {
              display: grid !important;
              grid-template-columns: 1fr !important;
              gap: 0.5rem !important;
              width: 100%;
              margin-bottom: 1.2rem !important;
            }
            .dash-grid > aside nav button {
              justify-content: flex-start !important;
              padding: 0.75rem 0.9rem !important;
              font-size: 0.95rem !important;
              border-radius: 10px !important;
              text-align: left !important;
            }
            .dash-grid > aside div:last-child {
              display: block !important;
              width: 100% !important;
              margin-top: auto !important;
              padding-top: 1.5rem !important;
            }
            .dash-grid > aside div:last-child button {
              width: 100% !important;
              margin-top: 0.7rem !important;
              padding: 0.5rem 1rem !important;
            }
          }
        `}</style>
      </div>
    </>
  );
}

function SideTab({ id, tab, setTab, children, icon }) {
  const active = tab === id;
  return (
    <button
      onClick={() => setTab(id)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: ".7rem",
        padding: ".75rem .9rem",
        borderRadius: 10,
        background: active ? "rgba(212,175,55,.15)" : "transparent",
        color: active ? "var(--gold)" : "rgba(255,255,255,.8)",
        border: "none",
        cursor: "pointer",
        fontSize: ".95rem",
        fontWeight: active ? 600 : 500,
        textAlign: "left",
        transition: "all .2s ease",
      }}
    >
      <span style={{ fontSize: "1.1rem" }}>{icon}</span> {children}
    </button>
  );
}
