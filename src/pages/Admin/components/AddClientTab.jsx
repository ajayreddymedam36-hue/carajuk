import { useState } from "react";
import { supabase } from "@/services/supabase/client";
import { emailjsConfigured, sendEmail } from "@/services/email/emailService";
import { saveToGoogleSheets } from "@/services/sheets/sheetsService";

const SERVICES = [
  "Company Registration (Private Limited)",
  "LLP Registration",
  "Partnership Firm Registration",
  "GST Registration (New)",
  "Income Tax Return Filing (Salaried)",
  "ITR for Business/Profession (ITR 3/4)",
  "TDS Return Filing (Quarterly)",
  "GST Return Filing (Monthly)",
  "Annual GST Reconciliation (GSTR-9/9C)",
  "Tax Audit (Sec 44AB)",
  "Turnover/Net Worth/Utilization Certificate",
  "Net Worth Certificate (for Visa, Loan)",
  "Projected Financial Statements",
  "Bookkeeping (Monthly)",
  "Digital Signature Certificate (DSC)",
  "PAN / TAN Application",
  "Consultancy (Per Hour)",
  "ROC Annual Filing (AOC-4, MGT-7)",
  "MCA Event-Based Filing (DIR KYC, etc.)",
  "Other",
];

/* ============ ADD CLIENT TAB ============ */
export default function AddClientTab() {
  const empty = {
    name: "",
    phone: "",
    email: "",
    service: "",
    deadline: "",
    notes: "",
    source: "walk-in",
    payment_status: "not paid",
    amount_received: 0,
  };
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const upd = (k) => (e) => {
    let val = e.target.value;
    if (k === "name") {
      val = val.replace(/[^a-zA-Z\s]/g, "");
    } else if (k === "phone") {
      val = val.replace(/\D/g, "").slice(0, 10);
    } else if (k === "email") {
      val = val.replace(/\s/g, "");
    }
    setForm((f) => ({
      ...f,
      [k]: k === "amount_received" ? Number(val) : val,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!form.name.trim() || !form.phone.trim()) {
      setMsg("Error: Name and phone are required.");
      return;
    }
    if (form.phone.replace(/\D/g, "").length !== 10) {
      setMsg("Error: Phone number must be exactly 10 digits.");
      return;
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setMsg("Error: Please enter a valid Gmail / Email address.");
      return;
    }
    setLoading(true);
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      source: form.source,
      status: "new",
      payment_status: form.payment_status,
    };
    ["email", "service", "notes"].forEach((k) => {
      if (form[k].trim()) payload[k] = form[k].trim();
    });
    if (form.deadline) payload.deadline = form.deadline;
    if (form.payment_status !== "not paid") payload.amount_received = form.amount_received;
    const { error } = await supabase.from("inquiries").insert(payload);
    if (error) {
      setMsg(`Error: ${error.message}`);
      setLoading(false);
      return;
    }
    // Save to Google Sheets (non-blocking)
    saveToGoogleSheets({
      name: payload.name,
      phone: payload.phone,
      email: payload.email || "",
      service: payload.service || "",
      deadline: payload.deadline || "",
      notes: payload.notes || "",
      status: payload.status,
      source: payload.source,
    }).catch((e) => console.error("Google Sheets save failed:", e));

    // EmailJS notifications
    if (emailjsConfigured && form.email.trim()) {
      try {
        await sendEmail({
          to_name: form.name,
          name: form.name,
          to_email: form.email,
          email: form.email,
          subject: "We've received your inquiry — CA Raju Koyyala & Associates",
          message: `Hi ${form.name},\n\nThanks for reaching out to CA Raju Koyyala & Associates. We've logged your inquiry for ${form.service || "our services"} and timeline ${form.deadline || "TBD"}.\nA partner will get back to you within one working day.\n\nWarm regards,\nCA Raju Koyyala & Associates`,
        });
        setMsg("✓ Client added and confirmation email sent.");
      } catch (e) {
        setMsg(`Client added. Email failed: ${e.message}`);
      }
    } else {
      setMsg(
        emailjsConfigured
          ? "✓ Client added."
          : "✓ Client added. (EmailJS not configured — set VITE_EMAILJS_* env vars to enable email notifications.)",
      );
    }
    setForm(empty);
    setLoading(false);
  };

  return (
    <div className="anim-fade-up" style={{ maxWidth: 720 }}>
      <h1 className="font-serif" style={{ fontSize: "1.9rem", marginBottom: ".3rem" }}>
        Add a client
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        Manually log a walk-in, phone or referral inquiry.
      </p>
      <form
        onSubmit={submit}
        className="card add-client-form"
        style={{ padding: "1.8rem", display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}
      >
        <div className="field">
          <label className="label">Name *</label>
          <input
            className="input"
            required
            value={form.name}
            onChange={upd("name")}
            pattern="[a-zA-Z\s]+"
            title="Name must only contain alphabets and spaces"
          />
        </div>
        <div className="field">
          <label className="label">Phone *</label>
          <input
            className="input"
            required
            value={form.phone}
            onChange={upd("phone")}
            type="tel"
            pattern="[0-9]{10}"
            maxLength={10}
            title="Phone number must be exactly 10 digits"
          />
        </div>
        <div className="field" style={{ gridColumn: "1/-1" }}>
          <label className="label">Gmail</label>
          <input className="input" type="email" value={form.email} onChange={upd("email")} placeholder="you@gmail.com" />
        </div>
        <div className="field">
          <label className="label">Service</label>
          <select className="select" value={form.service} onChange={upd("service")}>
            <option value="">Select a service…</option>
            {SERVICES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="label">Deadline</label>
          <input type="date" className="input" value={form.deadline} onChange={upd("deadline")} />
        </div>
        <div className="field">
          <label className="label">Source</label>
          <select className="select" value={form.source} onChange={upd("source")}>
            <option value="walk-in">Walk-in</option>
            <option value="phone">Phone</option>
            <option value="referral">Referral</option>
            <option value="website">Website</option>
          </select>
        </div>
        <div className="field">
          <label className="label">Payment status</label>
          <select className="select" value={form.payment_status} onChange={upd("payment_status")}>
            <option value="not paid">Not paid</option>
            <option value="partially paid">Partially paid</option>
            <option value="fully paid">Fully paid</option>
          </select>
        </div>
        {form.payment_status !== "not paid" && (
          <div className="field">
            <label className="label">Amount received (₹)</label>
            <input
              type="number"
              className="input"
              value={form.amount_received}
              onChange={upd("amount_received")}
            />
          </div>
        )}
        <div className="field" style={{ gridColumn: "1/-1" }}>
          <label className="label">Notes</label>
          <textarea className="textarea" rows={4} value={form.notes} onChange={upd("notes")} />
        </div>
        {msg && (
          <div
            style={{
              gridColumn: "1/-1",
              padding: ".75rem 1rem",
              background: msg.startsWith("Error") ? "#FEE2E2" : "#D1FAE5",
              color: msg.startsWith("Error") ? "#991B1B" : "#065F46",
              borderRadius: 8,
              fontSize: ".9rem",
            }}
          >
            {msg}
          </div>
        )}
        <button
          type="submit"
          className="btn btn-gold"
          disabled={loading}
          style={{ gridColumn: "1/-1" }}
        >
          {loading ? "Adding…" : "Add client"}
        </button>
      </form>
      <style>{`
        @media (max-width: 580px) {
          .add-client-form {
            grid-template-columns: 1fr !important;
            padding: 1.2rem !important;
          }
        }
      `}</style>
    </div>
  );
}


