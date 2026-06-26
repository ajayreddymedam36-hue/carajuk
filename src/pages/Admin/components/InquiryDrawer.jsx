import { useState } from "react";
import { supabase } from "@/services/supabase/client";

export function InquiryDrawer({ inquiry, onClose, onSaved }) {
  const [form, setForm] = useState(inquiry);
  const [saving, setSaving] = useState(false);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    const patch = { ...form };
    delete patch.id;
    delete patch.created_at;
    delete patch.updated_at;
    const { error } = await supabase.from("inquiries").update(patch).eq("id", form.id);
    setSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    onSaved();
  };
  const remove = async () => {
    if (!confirm("Delete this inquiry permanently?")) return;
    const { error } = await supabase.from("inquiries").delete().eq("id", form.id);
    if (error) {
      alert(error.message);
      return;
    }
    onSaved();
  };

  const sendWhatsApp = () => {
    let cleanPhone = (form.phone || "").replace(/\D/g, "");
    if (cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
    }
    
    if (!cleanPhone) {
      alert("No valid phone number is available for this contact.");
      return;
    }

    const greetingText = `Dear ${form.name || "Client"},

Greetings from CA Raju Koyyala & Associates. We have received your inquiry regarding ${form.service || "our professional services"}. Our team is reviewing the details and we will get in touch with you shortly.

Best regards,
CA Raju Koyyala & Associates`;

    const encodedText = encodeURIComponent(greetingText);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer">
        <div
          style={{
            padding: "1.5rem 1.8rem",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 5,
          }}
        >
          <div>
            <div
              className="font-serif"
              style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--navy)" }}
            >
              {form.name}
            </div>
            <div style={{ fontSize: ".85rem", color: "var(--muted)" }}>
              Created {new Date(form.created_at).toLocaleString("en-IN")}
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ fontSize: "1.4rem", padding: ".3rem .7rem" }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "1.5rem 1.8rem", display: "grid", gap: "1.3rem" }}>
          <div>
            <div className="label" style={{ marginBottom: ".5rem" }}>
              Status
            </div>
            <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
              {["new", "contacted", "in-progress", "completed"].map((s) => (
                <button
                  key={s}
                  className={`pill ${form.status === s ? "active" : ""}`}
                  onClick={() => update("status", s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="label" style={{ marginBottom: ".5rem" }}>
              Payment
            </div>
            <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
              {[
                { v: "not paid", c: "" },
                { v: "partially paid", c: "orange" },
                { v: "fully paid", c: "green" },
              ].map((o) => (
                <button
                  key={o.v}
                  className={`pill ${form.payment_status === o.v ? `active ${o.c}` : ""}`}
                  onClick={() => update("payment_status", o.v)}
                >
                  {o.v}
                </button>
              ))}
            </div>
          </div>

          <div className="drawer-grid">
            <div className="field">
              <label className="label">Name</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>
            <div className="field">
              <label className="label">Phone</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
            <div className="field" style={{ gridColumn: "1/-1" }}>
              <label className="label">Email</label>
              <input
                className="input"
                value={form.email ?? ""}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
            <div className="field">
              <label className="label">Service</label>
              <input
                className="input"
                value={form.service ?? ""}
                onChange={(e) => update("service", e.target.value)}
              />
            </div>

            <div className="field">
              <label className="label">Deadline</label>
              <input
                type="date"
                className="input"
                value={form.deadline ?? ""}
                onChange={(e) => update("deadline", e.target.value || null)}
              />
            </div>
            <div className="field">
              <label className="label">Assigned to</label>
              <input
                className="input"
                value={form.assigned_to ?? ""}
                onChange={(e) => update("assigned_to", e.target.value)}
              />
            </div>
            {form.payment_status !== "not paid" && (
              <div className="field" style={{ gridColumn: "1/-1" }}>
                <label className="label">Amount received (₹)</label>
                <input
                  type="number"
                  className="input"
                  value={form.amount_received ?? 0}
                  onChange={(e) => update("amount_received", Number(e.target.value))}
                />
              </div>
            )}
            <div className="field" style={{ gridColumn: "1/-1" }}>
              <label className="label">Notes</label>
              <textarea
                className="textarea"
                rows={5}
                value={form.notes ?? ""}
                onChange={(e) => update("notes", e.target.value)}
              />
            </div>
          </div>
        </div>
        <div
          className="drawer-footer"
          style={{
            padding: "1.2rem 1.8rem",
            borderTop: "1px solid var(--line)",
            display: "flex",
            gap: ".7rem",
            position: "sticky",
            bottom: 0,
            background: "#fff",
          }}
        >
          <button className="btn btn-gold" onClick={save} disabled={saving} style={{ flex: 1 }}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button 
            type="button" 
            className="btn" 
            onClick={sendWhatsApp} 
            style={{ 
              background: "#25D366", 
              color: "#fff", 
              border: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: ".4rem" 
            }}
          >
            💬 Message
          </button>
          <button className="btn btn-danger" onClick={remove}>
            Delete
          </button>
        </div>
      </aside>
    </>
  );
}


