import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase/client";
import { emailjsConfigured, sendEmail } from "@/services/email/emailService";

const FIRM_NAME = "CA Raju Koyyala and Associates";

const TEMPLATES = [
  {
    name: "Diwali greetings",
    subject: "Wishing you a prosperous Diwali ✨",
    body: `Dear {name},\n\nOn the auspicious occasion of Diwali, we extend our warmest wishes to you and your family. May the festival of lights illuminate your life with happiness, prosperity and success in all your endeavours.\n\nThank you for your continued trust and partnership with us. We look forward to supporting your financial journey in the coming year.\n\nWith warm regards,\n${FIRM_NAME}`,
  },
  {
    name: "GST filing reminder",
    subject: "Friendly reminder — GST filing deadline approaching",
    body: `Hi {name},\n\nThis is a gentle reminder that your monthly GST filing deadline is approaching. To ensure timely compliance and avoid any penalties, we kindly request you to share the required invoices and documents at your earliest convenience.\n\nOur team is ready to assist you with the filing process. Please feel free to reach out if you have any questions.\n\nBest regards,\n${FIRM_NAME}`,
  },
  {
    name: "ITR season opens",
    subject: "ITR filing season is open — let's plan early",
    body: `Hi {name},\n\nWe are pleased to inform you that the Income Tax Return (ITR) filing season has officially begun. Early filing helps avoid the last-minute rush and gives us adequate time to maximise your legitimate tax savings.\n\nPlease share your Form 16, bank statements, investment proofs and other relevant financial documents so we can get started promptly.\n\nLooking forward to assisting you.\n\nWarm regards,\n${FIRM_NAME}`,
  },
];


export default function BroadcastTab() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, failed: 0, total: 0 });
  const [errors, setErrors] = useState([]);

  // AI Greeting generator state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("inquiries").select("*").not("email", "is", null);
      setRecipients(data ?? []);
    })();
  }, []);

  const applyTemplate = (t) => {
    setSubject(t.subject);
    setBody(t.body);
  };

  const dispatch = async () => {
    if (!emailjsConfigured) {
      alert(
        "EmailJS isn't configured. Add VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID and VITE_EMAILJS_PUBLIC_KEY to your environment.",
      );
      return;
    }
    if (!subject.trim() || !body.trim()) {
      alert("Subject and body required.");
      return;
    }
    setSending(true);
    setErrors([]);
    const total = recipients.length;
    setProgress({ sent: 0, failed: 0, total });
    let sent = 0,
      failed = 0;
    for (const r of recipients) {
      try {
        await sendEmail({
          to_name: r.name,
          name: r.name,
          to_email: r.email,
          email: r.email,
          subject: subject.replaceAll("{name}", r.name),
          message: body.replaceAll("{name}", r.name),
        });
        sent++;
      } catch (e) {
        failed++;
        setErrors((prev) => [...prev, `${r.email}: ${e.message}`]);
      }
      setProgress({ sent, failed, total });
      await new Promise((res) => setTimeout(res, 500));
    }
    await supabase
      .from("broadcasts")
      .insert({ subject, body, type: "email", recipient_count: sent });
    setSending(false);
  };

  // Pre-built greeting templates keyed by occasion
  const greetingTemplates = {
    pongal: `Dear {name},\n\nOn the joyous occasion of Pongal, we extend our heartfelt wishes to you and your family. May this harvest festival bring abundant prosperity, good health and happiness into your life.\n\nAs we celebrate the spirit of gratitude and new beginnings, we want to express our sincere appreciation for the trust you have placed in us. It has been a privilege to be your financial partner, and we remain committed to helping you achieve your goals.\n\nMay the sweetness of Pongal fill your life with joy and may the coming year bring you great success in all your endeavours.\n\nWith warm regards,\nCA Raju Koyyala & Associates`,

    diwali: `Dear {name},\n\nOn this auspicious occasion of Diwali, we extend our warmest wishes to you and your loved ones. May the festival of lights illuminate your path with prosperity, joy and success in every aspect of life.\n\nWe are deeply grateful for your continued trust and partnership with us. Your confidence in our services motivates us to deliver excellence, and we look forward to continuing this wonderful association in the years ahead.\n\nMay the glow of diyas and the sparkle of fireworks bring endless happiness and new opportunities your way.\n\nWith warm regards,\nCA Raju Koyyala & Associates`,

    "new year": `Dear {name},\n\nWishing you a very Happy New Year! As we step into a new year filled with fresh possibilities, we hope it brings you abundant success, good health and happiness.\n\nReflecting on the past year, we feel truly grateful for the trust and confidence you have placed in us. It has been an honour to serve as your financial partner, and we are excited to continue supporting your journey towards greater financial success.\n\nMay this new year open doors to exciting opportunities and may all your aspirations be fulfilled.\n\nWith warm regards,\nCA Raju Koyyala & Associates`,

    sankranti: `Dear {name},\n\nWishing you a very Happy Makar Sankranti! May the warmth of this festival and the sweetness of til-gul bring joy, prosperity and positivity into your life.\n\nWe sincerely appreciate the trust you have placed in our firm. Your association means a great deal to us, and we remain dedicated to providing you with the best financial guidance and support.\n\nMay this harvest season mark the beginning of a prosperous and successful phase in your personal and professional life.\n\nWith warm regards,\nCA Raju Koyyala & Associates`,

    ugadi: `Dear {name},\n\nWishing you a very Happy Ugadi! As we celebrate the Telugu New Year, may it bring a perfect blend of all flavours of life — joy, success, prosperity and good health.\n\nWe are thankful for the wonderful relationship we share with you. Your trust in our services has been the cornerstone of our growth, and we look forward to continuing this partnership with renewed energy and commitment.\n\nMay this Ugadi mark the start of a year filled with achievements and new milestones for you and your family.\n\nWith warm regards,\nCA Raju Koyyala & Associates`,

    christmas: `Dear {name},\n\nWishing you a Merry Christmas and a wonderful holiday season! May this festive time bring you peace, joy and cherished moments with your loved ones.\n\nAs we reflect on the year gone by, we want to express our heartfelt gratitude for your continued trust and support. It has been a pleasure working with you, and we look forward to another year of successful partnership.\n\nMay the spirit of Christmas fill your heart with warmth and your life with blessings.\n\nWith warm regards,\nCA Raju Koyyala & Associates`,

    eid: `Dear {name},\n\nEid Mubarak! On this blessed occasion, we extend our warmest wishes to you and your family. May this Eid bring you happiness, peace and prosperity in abundance.\n\nWe deeply value the trust and confidence you have placed in our firm. Your association has been truly meaningful, and we remain committed to providing you with exceptional financial services.\n\nMay the blessings of this holy occasion guide you towards success and fulfilment in all your endeavours.\n\nWith warm regards,\nCA Raju Koyyala & Associates`,

    holi: `Dear {name},\n\nWishing you a very Happy Holi! May this festival of colours paint your life with vibrant shades of happiness, love and success.\n\nWe are grateful for the wonderful bond we share with you. Your trust in our expertise has been instrumental in our journey, and we look forward to adding more colours of success to our partnership.\n\nMay this Holi bring fresh energy and positive beginnings into your life.\n\nWith warm regards,\nCA Raju Koyyala & Associates`,

    default: `Dear {name},\n\nWe hope this message finds you in good health and high spirits. On behalf of our entire team, we would like to extend our warm greetings and best wishes to you and your family.\n\nYour trust and confidence in our services have been the foundation of our long-standing relationship. We are truly grateful for the opportunity to serve as your financial partner, and we remain committed to delivering excellence in everything we do.\n\nWe look forward to continuing this valued association and supporting you in achieving your financial goals. Please do not hesitate to reach out to us for any assistance.\n\nWith warm regards,\nCA Raju Koyyala & Associates`,
  };

  const getLocalGreeting = (prompt) => {
    const p = prompt.toLowerCase();
    for (const key of Object.keys(greetingTemplates)) {
      if (key !== "default" && p.includes(key)) return greetingTemplates[key];
    }
    return greetingTemplates.default;
  };

  const getSubjectForPrompt = (prompt) => {
    const p = prompt.toLowerCase();
    if (p.includes("pongal")) return "Warm Pongal Greetings ✨";
    if (p.includes("diwali")) return "Happy Diwali Greetings ✨";
    if (p.includes("new year")) return "Happy New Year Wishes ✨";
    if (p.includes("sankranti")) return "Happy Sankranti Greetings ✨";
    if (p.includes("ugadi")) return "Happy Ugadi Wishes ✨";
    if (p.includes("christmas")) return "Merry Christmas Greetings 🎄";
    if (p.includes("eid")) return "Eid Mubarak Greetings ✨";
    if (p.includes("holi")) return "Happy Holi Greetings 🎨";
    return "Special Greetings from CA Raju Koyyala & Associates";
  };

  const generateAiGreeting = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const detailedPrompt = `Write a professional greeting email about: ${aiPrompt}

Requirements:
- Start with "Dear {name}," (use exactly {name} as a placeholder, do not replace it)
- Write a warm, professional and medium-length greeting (3-4 paragraphs)
- The tone should be respectful, heartfelt and professional
- Include wishes related to the occasion/topic mentioned
- Thank the client for their trust and partnership
- End with "With warm regards," followed by "CA Raju Koyyala & Associates" on the next line
- Do NOT use markdown formatting, bold, headers or bullet points
- Keep it as clean plain text ready to be sent as an email`;

      let text = "";

      // Try Edge Function first
      try {
        const { data, error } = await supabase.functions.invoke("dynamic-endpoint", {
          body: { prompt: detailedPrompt, message: detailedPrompt }
        });

        if (!error && data) {
          if (typeof data === "string") text = data;
          else if (typeof data === "object") {
            text = data.text || data.message || data.generatedText || data.reply || "";
          }
          // Clean up markdown
          text = text.replace(/^```[a-z]*\n/i, "").replace(/\n```$/, "").trim();
        }
      } catch (fnErr) {
        console.warn("Edge Function failed, using local template:", fnErr.message);
      }

      // If Edge Function returned bad/short content, use local template
      if (!text || text.length < 80 || text.includes("undefined")) {
        text = getLocalGreeting(aiPrompt);
      }

      setBody(text);
      setSubject(getSubjectForPrompt(aiPrompt));

    } catch (e) {
      console.error(e);
      // Even on total failure, provide a local greeting
      setBody(getLocalGreeting(aiPrompt));
      setSubject(getSubjectForPrompt(aiPrompt));
    } finally {
      setAiLoading(false);
    }
  };

  const pct = progress.total
    ? Math.round(((progress.sent + progress.failed) / progress.total) * 100)
    : 0;

  return (
    <div className="anim-fade-up">
      <h1 className="font-serif" style={{ fontSize: "1.9rem", marginBottom: ".3rem" }}>
        Broadcast
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        Send a personalised email to all clients with an email on file ({recipients.length}{" "}
        recipients).
      </p>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}
        className="bc-grid"
      >
        {/* Column 1: AI Greeting & Templates (now first) */}
        <div>
          <div className="card" style={{ padding: "1.2rem", marginBottom: "1.5rem", background: "#fff" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: ".4rem", display: "flex", alignItems: "center", gap: ".4rem", color: "var(--navy)" }}>
              <span>✨</span> Gemini AI Greeting
            </h3>
            <p style={{ fontSize: ".82rem", color: "var(--muted)", marginBottom: "1rem" }}>
              Generate custom professional greetings using AI.
            </p>
            <div className="field" style={{ marginBottom: "1rem" }}>
              <input
                className="input"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. greetings on Pongal"
                style={{ fontSize: ".88rem" }}
              />
            </div>
            <button
              type="button"
              className="btn btn-gold"
              style={{ width: "100%", padding: ".6rem 1rem", fontSize: ".88rem" }}
              onClick={generateAiGreeting}
              disabled={aiLoading || !aiPrompt.trim()}
            >
              {aiLoading ? "Generating..." : "Generate ✨"}
            </button>
            {aiError && (
              <div
                style={{
                  marginTop: ".8rem",
                  padding: ".5rem .7rem",
                  background: "#FEE2E2",
                  color: "#991B1B",
                  borderRadius: 8,
                  fontSize: ".78rem",
                }}
              >
                {aiError}
              </div>
            )}
          </div>

          <h3 style={{ fontSize: "1rem", marginBottom: ".7rem" }}>Quick templates</h3>
          <div style={{ display: "grid", gap: ".6rem" }}>
            {TEMPLATES.map((t) => (
              <button
                key={t.name}
                className="card card-hover"
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  padding: "1rem",
                  border: "1px solid var(--line)",
                  background: "#fff",
                }}
                onClick={() => applyTemplate(t)}
              >
                <div style={{ fontWeight: 600, color: "var(--navy)" }}>{t.name}</div>
                <div
                  style={{
                    fontSize: ".82rem",
                    color: "var(--muted)",
                    marginTop: ".25rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.subject}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Column 2: Subject & Body (now second/last) */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div className="field" style={{ marginBottom: "1rem" }}>
            <label className="label">Subject</label>
            <input
              className="input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Use {name} for personalisation"
            />
          </div>
          <div className="field">
            <label className="label">Body</label>
            <textarea
              className="textarea"
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hi {name}, ..."
            />
          </div>

          {sending || progress.total > 0 ? (
            <div style={{ marginTop: "1.2rem" }}>
              <div className="progress">
                <span style={{ width: `${pct}%` }} />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: ".6rem",
                  fontSize: ".88rem",
                  color: "var(--muted)",
                }}
              >
                <span>
                  {pct}% ({progress.sent + progress.failed}/{progress.total})
                </span>
                <span>
                  ✓ {progress.sent} sent · ✗ {progress.failed} failed
                </span>
              </div>
              {errors.length > 0 && (
                <div
                  style={{
                    marginTop: ".8rem",
                    maxHeight: 120,
                    overflow: "auto",
                    padding: ".7rem",
                    background: "#FEE2E2",
                    color: "#991B1B",
                    borderRadius: 8,
                    fontSize: ".82rem",
                  }}
                >
                  {errors.map((e, i) => (
                    <div key={i}>{e}</div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          <button
            className="btn btn-gold"
            style={{ marginTop: "1.4rem", width: "100%" }}
            onClick={dispatch}
            disabled={sending || recipients.length === 0}
          >
            {sending
              ? "Sending…"
              : `Send to ${recipients.length} recipient${recipients.length === 1 ? "" : "s"}`}
          </button>
          {!emailjsConfigured && (
            <div style={{ marginTop: ".8rem", fontSize: ".82rem", color: "var(--warn)" }}>
              ⚠ EmailJS not configured. Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID,
              VITE_EMAILJS_PUBLIC_KEY.
            </div>
          )}
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .bc-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

