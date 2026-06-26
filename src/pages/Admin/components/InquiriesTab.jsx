import { useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/services/supabase/client";
import { InquiryDrawer } from "./InquiryDrawer";

/* ============ INQUIRIES TAB ============ */
export default function InquiriesTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null);
  const [copied, setCopied] = useState(false);
  const wasClosedByPopState = useRef(false);

  useEffect(() => {
    window.isDrawerOpen = !!active;

    if (active) {
      wasClosedByPopState.current = false;
      window.history.pushState({ drawerOpen: true }, "", window.location.href);

      const handleDrawerPopState = (e) => {
        wasClosedByPopState.current = true;
        setActive(null);
      };

      window.addEventListener("popstate", handleDrawerPopState);
      return () => {
        window.removeEventListener("popstate", handleDrawerPopState);
        if (!wasClosedByPopState.current) {
          window.ignoreNextPopState = true;
          window.history.back();
        }
        window.isDrawerOpen = false;
      };
    }
  }, [active]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (filterStatus && r.status !== filterStatus) return false;
        if (filterService && r.service !== filterService) return false;
        if (filterPayment && r.payment_status !== filterPayment) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!`${r.name} ${r.phone} ${r.email ?? ""}`.toLowerCase().includes(q)) return false;
        }
        return true;
      }),
    [rows, filterStatus, filterService, filterPayment, search],
  );

  const stats = useMemo(() => {
    const total = rows.length;
    const fresh = rows.filter((r) => r.status === "new").length;
    const active = rows.filter(
      (r) => r.status === "in-progress" || r.status === "contacted",
    ).length;
    const paid = rows.filter((r) => r.payment_status !== "not paid").length;
    const revenue = rows.reduce((sum, r) => sum + Number(r.amount_received || 0), 0);
    return { total, fresh, active, paid, revenue };
  }, [rows]);

  const services = useMemo(
    () => Array.from(new Set(rows.map((r) => r.service).filter(Boolean))),
    [rows],
  );

  const copyNumbers = async () => {
    const nums = filtered
      .map((r) => r.phone)
      .filter(Boolean)
      .join(", ");
    await navigator.clipboard.writeText(nums);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="anim-fade-up">
      <h1 className="font-serif" style={{ fontSize: "1.9rem", marginBottom: ".3rem" }}>
        Client Info
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        All client leads, filtered and editable.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: "1rem",
          marginBottom: "2rem",
        }}
        className="stats-cards"
      >
        <StatCard label="Total clients" value={stats.total} />
        <StatCard label="New" value={stats.fresh} color="var(--orange)" />
        <StatCard label="Active projects" value={stats.active} color="var(--navy-500)" />
        <StatCard label="Paid clients" value={stats.paid} color="var(--green)" />
        <StatCard
          label="Total revenue"
          value={`₹${stats.revenue.toLocaleString("en-IN")}`}
          color="var(--gold-dark)"
        />
      </div>

      <div
        className="card filters-grid"
        style={{
          padding: "1rem",
          marginBottom: "1rem",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
          gap: ".7rem",
          alignItems: "end",
        }}
      >
        <div className="field">
          <label className="label">Search</label>
          <input
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, phone or email…"
          />
        </div>
        <div className="field">
          <label className="label">Status</label>
          <select
            className="select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="field">
          <label className="label">Service</label>
          <select
            className="select"
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
          >
            <option value="">All</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="label">Payment</label>
          <select
            className="select"
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
          >
            <option value="">All</option>
            <option value="not paid">Not paid</option>
            <option value="partially paid">Partial</option>
            <option value="fully paid">Fully paid</option>
          </select>
        </div>
        <button
          className="btn btn-outline"
          onClick={copyNumbers}
          style={{ padding: ".7rem 1rem", fontSize: ".85rem" }}
        >
          {copied ? "✓ Copied!" : "Copy Numbers"}
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>
            No clients match those filters.
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} onClick={() => setActive(r)}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--navy)" }}>{r.name}</div>
                    <div style={{ fontSize: ".82rem", color: "var(--muted)" }}>
                      {r.phone}
                      {r.email ? ` · ${r.email}` : ""}
                    </div>
                  </td>
                  <td>{r.service || <span style={{ color: "var(--muted)" }}>—</span>}</td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td>
                    <PaymentBadge p={r.payment_status} />
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: ".88rem" }}>
                    {new Date(r.created_at).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {active && createPortal(
        <InquiryDrawer
          inquiry={active}
          onClose={() => setActive(null)}
          onSaved={() => {
            setActive(null);
            load();
          }}
        />,
        document.body
      )}

      <style>{`
        @media (max-width: 1100px) { 
          .stats-cards { grid-template-columns: repeat(2,1fr) !important; } 
        }
        @media (max-width: 640px) {
          .stats-cards {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.6rem !important;
            margin-bottom: 1.2rem !important;
          }
          .stats-cards > div:last-child {
            grid-column: 1 / -1 !important;
          }
          .stats-cards .card {
            padding: 0.8rem 1rem !important;
          }
          .stats-cards .font-serif {
            font-size: 1.4rem !important;
          }
          .filters-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .filters-grid .field:first-child {
            grid-column: 1 / -1 !important;
          }
          .filters-grid button {
            grid-column: 1 / -1 !important;
            width: 100% !important;
            justify-content: center !important;
          }
        }
        @media (max-width: 420px) {
          .filters-grid {
            grid-template-columns: 1fr !important;
          }
          .filters-grid .field:first-child {
            grid-column: auto !important;
          }
          .filters-grid button {
            grid-column: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="card" style={{ padding: "1.1rem" }}>
      <div
        style={{
          fontSize: ".72rem",
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: ".1em",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        className="font-serif"
        style={{
          fontSize: "1.9rem",
          fontWeight: 700,
          color: color || "var(--navy)",
          marginTop: ".4rem",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    new: "badge-new",
    contacted: "badge-contacted",
    "in-progress": "badge-progress",
    completed: "badge-done",
  };
  return <span className={`badge ${map[status]}`}>{status}</span>;
}
function PaymentBadge({ p }) {
  const color =
    p === "fully paid" ? "#065F46" : p === "partially paid" ? "#92400E" : "var(--muted)";
  const bg = p === "fully paid" ? "#D1FAE5" : p === "partially paid" ? "#FEF3C7" : "#F3F4F6";
  return (
    <span className="badge" style={{ background: bg, color }}>
      {p}
    </span>
  );
}


