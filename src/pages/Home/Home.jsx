import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/services/supabase/client";
import { emailjsConfigured, sendEmail } from "@/services/email/emailService";
import { saveToGoogleSheets } from "@/services/sheets/sheetsService";
import logoAssetImg from "@/assets/logos/ca-logo.png";
import caRajuHeroImg from "@/assets/ca_raju_koyyala.jpg";
import whatsappLogoImg from "@/assets/whatsapp-logo.png";
import gallery1Img from "@/assets/gallery-1.jpg";
import gallery2Img from "@/assets/gallery-2.jpg";
import gallery3Img from "@/assets/gallery-3.jpg";
import gallery4Img from "@/assets/gallery-4.jpg";
import svcCompanyImg from "@/assets/svc-company.png";
import svcLlpImg from "@/assets/svc-llp.png";
import svcPartnershipImg from "@/assets/svc-partnership.png";
import svcGstImg from "@/assets/svc-gst.png";
import svcItrSalariedImg from "@/assets/svc-itr-salaried.png";
import svcItrBusinessImg from "@/assets/svc-itr-business.png";

const logoAsset = { url: logoAssetImg };

const SERVICES = [
  {
    icon: svcCompanyImg,
    title: "Company Registration (Private Limited)",
    desc: "Incorporate your Pvt Ltd company with complete DSC, DIN & MCA filings — hassle-free end-to-end setup.",
  },
  {
    icon: svcLlpImg,
    title: "LLP Registration",
    desc: "Register your Limited Liability Partnership with MCA compliance, LLP agreement drafting & filing.",
  },
  {
    icon: svcPartnershipImg,
    title: "Partnership Firm Registration",
    desc: "Set up your partnership firm with a legally sound partnership deed and all necessary registrations.",
  },
  {
    icon: svcGstImg,
    title: "GST Registration (New)",
    desc: "Get your GST number quickly with expert assistance in documentation, application & ARN tracking.",
  },
  {
    icon: svcItrSalariedImg,
    title: "Income Tax Return Filing (Salaried)",
    desc: "Accurate ITR-1/2 filing for salaried individuals with maximum legitimate refunds & timely submission.",
  },
  {
    icon: svcItrBusinessImg,
    title: "ITR for Business/Profession (ITR 3/4)",
    desc: "Comprehensive ITR 3 & ITR 4 filing for businesses and professionals with full P&L reconciliation.",
  },
  {
    icon: "🧾",
    title: "TDS Return Filing (Quarterly)",
    desc: "Timely quarterly TDS return filing (24Q, 26Q, 27Q) with challan reconciliation & Form 16 generation.",
  },
  {
    icon: "📅",
    title: "GST Return Filing (Monthly)",
    desc: "Monthly GSTR-1, GSTR-3B filing with input credit reconciliation and liability management.",
  },
  {
    icon: "🔍",
    title: "Annual GST Reconciliation (GSTR-9/9C)",
    desc: "Annual GST audit and reconciliation with GSTR-9 & certified GSTR-9C reconciliation statement.",
  },
  {
    icon: "✅",
    title: "Tax Audit (Sec 44AB)",
    desc: "Statutory tax audit under Section 44AB with Form 3CA/3CB & 3CD preparation and filing.",
  },
  {
    icon: "📜",
    title: "Turnover/Net Worth/Utilization Certificate",
    desc: "CA-certified certificates for turnover, net worth and fund utilization for tenders and compliance.",
  },
  {
    icon: "🏦",
    title: "Net Worth Certificate (for Visa, Loan)",
    desc: "Certified net worth certificates for visa applications, bank loans and financial institutions.",
  },
  {
    icon: "📈",
    title: "Projected Financial Statements",
    desc: "Professionally prepared projected P&L, balance sheet and cash flow for loans and business plans.",
  },
  {
    icon: "📚",
    title: "Bookkeeping (Monthly)",
    desc: "Cloud-based monthly bookkeeping in Tally / Zoho with MIS dashboards and financial summaries.",
  },
  {
    icon: "🔐",
    title: "Digital Signature Certificate (DSC)",
    desc: "Issuance and renewal of Class 2/3 DSC for MCA, GST, income tax and tender filings.",
  },
  {
    icon: "🪪",
    title: "PAN / TAN Application",
    desc: "PAN and TAN application and correction services for individuals, firms and companies.",
  },
  {
    icon: "💡",
    title: "Consultancy (Per Hour)",
    desc: "One-on-one expert CA consultancy on tax planning, compliance strategy and financial decisions.",
  },
  {
    icon: "🗂️",
    title: "ROC Annual Filing (AOC-4, MGT-7)",
    desc: "Timely ROC annual filing including AOC-4 (financial statements) and MGT-7 (annual return).",
  },
  {
    icon: "⚙️",
    title: "MCA Event-Based Filing (DIR KYC, etc.)",
    desc: "MCA event-based filings including DIR-3 KYC, director changes, charge registration and more.",
  },
];

const STATS = [
  { value: 500, suffix: "+", label: "Clients Served" },
  { value: 12, suffix: "+", label: "Years Experience" },
  { value: 98, suffix: "%", label: "Client Retention" },
];

function useReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, deps);
}

function Counter({ to, suffix }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const dur = 1600;
            const tick = (now) => {
              const t = Math.min(1, (now - start) / dur);
              const eased = 1 - Math.pow(1 - t, 3);
              setN(Math.round(to * eased));
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [to]);
  return (
    <span ref={ref} className="counter">
      {n}
      {suffix}
    </span>
  );
}


export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [phone, setPhone] = useState("+91 94946 66632");
  const [address, setAddress] = useState("Opposite Minority Welfare School, Shyampet, Hanamkonda, Telangana — 506001");
  const [email, setEmail] = useState("carajuk@gmail.com");
  const [gallery, setGallery] = useState([]);

  useReveal([gallery]);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // 1. Load from cache
    const cachedPhone = localStorage.getItem("firm_phone");
    const cachedAddress = localStorage.getItem("firm_address");
    const cachedEmail = localStorage.getItem("firm_email");
    const cachedGallery = localStorage.getItem("firm_gallery");
    if (cachedPhone) setPhone(cachedPhone);
    if (cachedAddress) setAddress(cachedAddress);
    if (cachedEmail) setEmail(cachedEmail);
    if (cachedGallery) {
      try {
        setGallery(JSON.parse(cachedGallery));
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Fetch from DB
    supabase
      .from("settings")
      .select("*")
      .then(({ data }) => {
        if (data && data.length > 0) {
          data.forEach((item) => {
            if (item.key === "phone") {
              setPhone(item.value);
              localStorage.setItem("firm_phone", item.value);
            }
            if (item.key === "address") {
              setAddress(item.value);
              localStorage.setItem("firm_address", item.value);
            }
            if (item.key === "email") {
              setEmail(item.value);
              localStorage.setItem("firm_email", item.value);
            }
            if (item.key === "gallery") {
              try {
                setGallery(JSON.parse(item.value));
                localStorage.setItem("firm_gallery", item.value);
              } catch (e) {
                console.error(e);
              }
            }
          });
        }
      })
      .catch((err) => console.warn("Failed to fetch settings from database:", err));
  }, []);

  return (
    <div>
      <Nav />
      <Hero scrollY={scrollY} />
      <StatsBar />
      <Services />
      <Approach />
      <Gallery gallery={gallery} />
      <InquirySection phone={phone} address={address} email={email} />
      <Footer phone={phone} address={address} email={email} />
      <WhatsAppButton phone={phone} />
    </div>
  );
}

function Nav() {
  const [solid, setSolid] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const f = () => setSolid(window.scrollY > 10);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  return (
    <header
      className="nav-blur"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: solid ? "1px solid var(--line)" : "1px solid transparent",
        transition: "border-color .3s ease",
        background: "rgba(255, 255, 255, 0.85)",
      }}
    >
      <div
        className="container-x"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 72,
        }}
      >
        <a
          href="#top"
          style={{ display: "flex", alignItems: "center", gap: ".7rem", textDecoration: "none" }}
        >
          <img
            src={logoAsset.url}
            alt="CA Raju Koyyala & Associates"
            className="logo-mark"
            style={{ height: 44, width: "auto" }}
          />
          <div style={{ lineHeight: 1.1 }}>
            <div
              className="font-serif branding-title"
              style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--navy)" }}
            >
              CA Raju Koyyala &amp; Associates
            </div>
            <div
              className="branding-subtitle"
              style={{
                fontSize: ".7rem",
                color: "var(--muted)",
                letterSpacing: ".18em",
                textTransform: "uppercase",
              }}
            >
              Chartered Accountants · Hanamkonda
            </div>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "1.6rem" }}>
          <a href="#services" className="nav-link" style={navLink}>
            Services
          </a>
          <a href="#about" className="nav-link" style={navLink}>
            About
          </a>
          <a href="#gallery" className="nav-link" style={navLink}>
            Gallery
          </a>
          <a href="#approach" className="nav-link" style={navLink}>
            Approach
          </a>
          <Link
            to="/admin"
            className="btn btn-outline"
            style={{ padding: ".55rem 1rem", fontSize: ".85rem" }}
          >
            Admin Login
          </Link>
        </nav>

        {/* Mobile Toggle Button */}
        <button
          className="mobile-nav-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.8rem",
            color: "var(--navy)",
            cursor: "pointer",
            display: "none",
            padding: "0.5rem",
            lineHeight: 1,
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Nav Menu Dropdown */}
      {mobileOpen && (
        <nav
          className="mobile-nav-menu anim-fade-in"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.2rem",
            padding: "1.5rem",
            background: "#fff",
            borderBottom: "1px solid var(--line)",
            boxShadow: "0 8px 16px rgba(0,0,0,0.06)",
          }}
        >
          <a
            href="#services"
            className="nav-link"
            onClick={() => setMobileOpen(false)}
            style={{ ...navLink, padding: ".5rem 0" }}
          >
            Services
          </a>
          <a
            href="#about"
            className="nav-link"
            onClick={() => setMobileOpen(false)}
            style={{ ...navLink, padding: ".5rem 0" }}
          >
            About
          </a>
          <a
            href="#gallery"
            className="nav-link"
            onClick={() => setMobileOpen(false)}
            style={{ ...navLink, padding: ".5rem 0" }}
          >
            Gallery
          </a>
          <a
            href="#approach"
            className="nav-link"
            onClick={() => setMobileOpen(false)}
            style={{ ...navLink, padding: ".5rem 0" }}
          >
            Approach
          </a>
          <Link
            to="/admin"
            className="btn btn-outline"
            onClick={() => setMobileOpen(false)}
            style={{ padding: ".65rem 1rem", fontSize: ".9rem", textAlign: "center", display: "block" }}
          >
            Admin Login
          </Link>
        </nav>
      )}

      <style>{`
        @media (max-width: 820px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-nav-toggle {
            display: block !important;
          }
          .branding-subtitle {
            display: none !important;
          }
          .branding-title {
            font-size: 0.95rem !important;
          }
        }
      `}</style>
    </header>
  );
}
const navLink = {
  color: "var(--ink-2)",
  textDecoration: "none",
  fontSize: ".92rem",
  fontWeight: 500,
};

function Hero({ scrollY }) {
  const parallaxY = `translate3d(0, ${scrollY * 0.3}px, 0)`;
  return (
    <section
      id="top"
      style={{
        position: "relative",
        minHeight: "calc(100vh - 72px)",
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-end",
        boxSizing: "border-box",
      }}
    >
      {/* ── Full-bleed background photo with parallax ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: parallaxY,
          zIndex: 0,
        }}
      >
        <img
          src={caRajuHeroImg}
          alt="CA Raju Koyyala at ICAI"
          className="hero-bg-image"
          style={{
            width: "100%",
            height: "115%",
            objectFit: "cover",
            objectPosition: "center 25%",
            display: "block",
          }}
        />
        {/* Subtle vignette – only darkens edges/bottom so photo stays vivid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.08) 45%, rgba(0,0,0,0.70) 100%)",
          }}
        />
        {/* Left-side darkening so text panel is readable */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.30) 55%, transparent 100%)",
          }}
        />
      </div>
      {/* ── Text content – bottom-left, slides up after image appears ── */}
      <div
        className="hero-text-wrap"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "none",
          margin: 0,
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          paddingBottom: "4rem",
          paddingTop: "2rem",
          boxSizing: "border-box",
        }}
      >
        <div
          className="hero-text-inner"
          style={{
            maxWidth: "620px",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <span
            className="hero-trusted-badge"
            style={{
              display: "inline-block",
              fontSize: ".82rem",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.88)",
              background: "rgba(180,140,60,0.28)",
              border: "1px solid rgba(240,192,96,0.55)",
              borderRadius: "100px",
              padding: ".35rem 1rem",
              marginBottom: "1.4rem",
              fontWeight: 600,
            }}
          >
            Trusted since 2012 · Hanamkonda
          </span>

          <h1
            style={{
              fontSize: "clamp(2.4rem, 5.2vw, 4rem)",
              fontWeight: 800,
              lineHeight: 1.12,
              color: "#ffffff",
              margin: "0 0 1.2rem",
              textShadow: "0 3px 28px rgba(0,0,0,0.55)",
            }}
          >
            Behind every successful business
            <br />
            there is a <span style={{ color: "#f0c060", fontStyle: "italic" }}>chartered accountant</span>
          </h1>

          <div
            style={{
              height: 4,
              width: 72,
              background: "linear-gradient(90deg, #f0c060, #c8922a)",
              borderRadius: 4,
              marginBottom: "1.6rem",
            }}
          />

          <p
            style={{
              fontSize: "1.1rem",
              color: "rgba(255,255,255,0.82)",
              lineHeight: 1.7,
              margin: "0 0 2rem",
              textShadow: "0 1px 8px rgba(0,0,0,0.45)",
              maxWidth: "520px",
            }}
          >
            Learn today. Lead tomorrow. Build the businesses that shape the future.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <a
              href="#approach"
              className="btn btn-gold"
              style={{ padding: ".8rem 1.8rem", fontSize: "1rem" }}
            >
              Approach Us →
            </a>
            <a
              href="#services"
              className="btn btn-outline"
              style={{
                padding: ".8rem 1.8rem",
                fontSize: "1rem",
                color: "#fff",
                borderColor: "rgba(255,255,255,0.5)",
                background: "rgba(255,255,255,0.08)",
              }}
            >
              Our Services
            </a>
          </div>
        </div>
      </div>

      {/* ── Keyframe animation styles ── */}
      <style>{`
        @keyframes heroImageFadeIn {
          from {
            opacity: 0;
            transform: scale(1.08);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .hero-bg-image {
          animation: heroImageFadeIn 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes heroSlideLeft {
          from {
            opacity: 0;
            transform: translateX(-80px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .hero-text-inner {
          animation: heroSlideLeft 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.8s both;
        }
        @media (max-width: 640px) {
          .hero-trusted-badge {
            display: none !important;
          }
          .hero-text-inner h1 {
            font-size: 1.75rem !important;
            line-height: 1.18 !important;
          }
          .hero-text-inner p {
            font-size: 0.92rem !important;
            line-height: 1.6 !important;
          }
        }
      `}</style>
    </section>
  );
}

function StatsBar() {
  return (
    <section id="about" className="section bg-canvas3" style={{ padding: "3.5rem 0" }}>
      <div className="container-x">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "1.5rem",
            textAlign: "center",
          }}
          className="stats-grid"
        >
          {STATS.map((s, i) => (
            <div key={i} className={`reveal`}>
              <Counter to={s.value} suffix={s.suffix} />
              <div
                style={{
                  marginTop: ".4rem",
                  color: "var(--muted)",
                  fontWeight: 500,
                  letterSpacing: ".04em",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="section">
      <div className="container-x">
        <div style={{ textAlign: "center", marginBottom: "3rem" }} className="reveal">
          <span className="section-tag">What we do</span>
          <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", marginTop: "1rem" }}>
            End-to-end services for modern businesses
          </h2>
          <div className="gold-bar" style={{ margin: "1rem auto 0" }} />
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.25rem" }}
          className="services-grid"
        >
          {SERVICES.slice(0, 6).map((s, i) => (
            <div
              key={s.title}
              className={`card card-hover reveal`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div
                style={{
                  width: "100%",
                  height: "90px",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  borderRadius: 8,
                  background: "#f8f9fc",
                  transition: "transform .35s ease",
                }}
                className="svc-logo-wrap"
              >
                <img
                  src={s.icon}
                  alt={s.title}
                  style={{
                    maxHeight: "80px",
                    maxWidth: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: ".5rem" }}>{s.title}</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.55 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .card-hover:hover .svc-logo-wrap { transform: scale(1.05); }
        @media (max-width: 900px) { .services-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 600px) { .services-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

function Approach() {
  const steps = [
    {
      n: "01",
      t: "Discovery call",
      d: "We understand your business, current pain points and goals.",
    },
    {
      n: "02",
      t: "Tailored proposal",
      d: "A clear scope, timeline and transparent fee — no surprises.",
    },
    {
      n: "03",
      t: "Onboard & execute",
      d: "Document collection, compliance setup, and ongoing reporting.",
    },
    {
      n: "04",
      t: "Quarterly review",
      d: "We meet to review numbers, optimise tax, and plan ahead.",
    },
  ];
  return (
    <section className="section bg-canvas2">
      <div className="container-x">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3rem",
            alignItems: "center",
          }}
          className="approach-grid"
        >
          <div className="reveal">
            <span className="section-tag">Our approach</span>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", margin: "1rem 0" }}>
              Niche attention. Unlimited potential.
            </h2>
            <div className="gold-bar" />
            <p style={{ color: "var(--muted)", margin: "1.2rem 0", lineHeight: 1.6 }}>
              Every engagement is led by a partner. You get the responsiveness of a small firm with
              the discipline, processes and bench strength of a much larger practice.
            </p>
          </div>
          <div style={{ display: "grid", gap: "1rem" }}>
            {steps.map((s, i) => (
              <div
                key={s.n}
                className={`card reveal`}
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "flex-start",
                  transitionDelay: `${i * 80}ms`,
                }}
              >
                <div
                  className="font-serif"
                  style={{
                    fontSize: "2rem",
                    color: "var(--gold-dark)",
                    lineHeight: 1,
                    fontWeight: 700,
                  }}
                >
                  {s.n}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: ".25rem" }}>{s.t}</h3>
                  <p style={{ color: "var(--muted)", fontSize: ".92rem" }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 880px) { .approach-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

function Gallery({ gallery }) {
  const [activeImg, setActiveImg] = useState(null);

  useEffect(() => {
    if (!activeImg) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setActiveImg(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeImg]);

  const displayImages = (gallery && gallery.length > 0) ? gallery : [
    {
      url: gallery1Img,
      title: "ICAI Committee Contribution",
      desc: "CA Raju Koyyala's dedication to industry leadership recognized with co-opt membership in ICAI's committee for members in practice."
    },
    {
      url: gallery2Img,
      title: "Independent Directorship Appointment",
      desc: "CA Raju Koyyala & Associates' CA Raju Koyyala appointed independent Director at Source Industries Ltd, demonstrating expertise and industry recognition."
    },
    {
      url: gallery3Img,
      title: "Recognition & Leadership Engagement",
      desc: "CA Raju Koyyala participating in a distinguished public event, demonstrating leadership, collaboration, and commitment to professional development."
    },
    {
      url: gallery4Img,
      title: "Established Chartered Accounting Firm",
      desc: "CA Raju Koyyala & Associates, a renowned self-employed chartered accounting firm, delivering exceptional services."
    }
  ];

  return (
    <section id="gallery" className="section bg-canvas-2" style={{ padding: "5rem 0", background: "var(--canvas-3)" }}>
      <div className="container-x">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="section-tag">Gallery</span>
          <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.6rem)", margin: "1rem 0 1.2rem", color: "var(--navy)" }}>
            Our Workspace &amp; Interactions
          </h2>
          <div className="gold-bar" style={{ margin: "0 auto" }} />
          <p style={{ color: "var(--muted)", marginTop: "1.2rem", maxWidth: "600px", margin: "1.2rem auto 0", lineHeight: 1.6 }}>
            A glimpse inside our premium practice, collaboration rooms, and professional consulting environment.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }} className="gallery-grid">
          {displayImages.map((img, i) => (
            <div 
              key={i} 
              className="card reveal" 
              onClick={() => setActiveImg(img)}
              style={{ 
                padding: 0, 
                overflow: "hidden", 
                borderRadius: 16,
                background: "#fff",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                border: "1px solid var(--line)",
                cursor: "pointer"
              }}
            >
              <div style={{ overflow: "hidden", height: "240px", position: "relative" }}>
                <img 
                  src={img.url} 
                  alt={img.title} 
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "cover",
                    transition: "transform 0.5s ease"
                  }} 
                  className="gallery-img"
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.06)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                />
              </div>
              <div style={{ padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--navy)", marginBottom: ".5rem" }}>
                  {img.title}
                </h3>
                <p style={{ color: "var(--muted)", fontSize: ".9rem", lineHeight: 1.5, margin: 0 }}>
                  {img.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeImg && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(15, 41, 66, 0.88)",
            backdropFilter: "blur(12px)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            color: "#fff",
            animation: "fadeIn 0.25s ease-out"
          }}
          onClick={() => setActiveImg(null)}
        >
          <button 
            onClick={() => setActiveImg(null)}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#fff",
              fontSize: "2rem",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
          >
            &times;
          </button>

          <div 
            style={{
              maxWidth: "1000px",
              width: "90%",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              animation: "zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <img 
              src={activeImg.url} 
              alt={activeImg.title} 
              style={{ 
                maxWidth: "100%", 
                maxHeight: "65vh", 
                objectFit: "contain",
                borderRadius: "12px",
                boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.15)"
              }} 
            />
            <div style={{ marginTop: "1.5rem", textAlign: "center", maxWidth: "700px" }}>
              <h3 style={{ fontSize: "1.5rem", color: "var(--gold)", marginBottom: "0.5rem", fontWeight: 600 }}>
                {activeImg.title}
              </h3>
              <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.9)", lineHeight: 1.6, margin: 0 }}>
                {activeImg.desc}
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @media (max-width: 960px) {
          .gallery-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.25rem !important;
          }
        }
        @media (max-width: 560px) {
          .gallery-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .gallery-grid .card > div:first-child {
            height: 200px !important;
          }
        }
      `}</style>
    </section>
  );
}

function InquirySection({ phone, address, email }) {
  return (
    <section id="approach" className="section">
      <div className="container-x">
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "2.5rem" }}
          className="inq-grid"
        >
          <div className="reveal">
            <span className="section-tag">Approach us</span>
            <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.6rem)", margin: "1rem 0 1.2rem" }}>
              Let's talk numbers.
            </h2>
            <div className="gold-bar" />
            <p style={{ color: "var(--muted)", margin: "1.2rem 0 2rem", lineHeight: 1.6 }}>
              Share a few details and a partner will reach out within one working day. All
              conversations are confidential.
            </p>
            <ContactItem
              icon="📍"
              label="Office"
              value={address}
            />
            <ContactItem icon="📞" label="Call Now" value={phone} />
            <ContactItem icon="✉️" label="Gmail" value={email} />
            <ContactItem icon="🕘" label="Hours" value="Mon — Sat · 10am to 7pm" />
          </div>
          <div className="reveal" style={{ animationDelay: ".15s" }}>
            <InquiryForm />
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 880px) {
          .inq-grid {
            display: flex !important;
            flex-direction: column-reverse !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </section>
  );
}

function ContactItem({ icon, label, value }) {
  let href = null;
  let target = undefined;
  let rel = undefined;

  if (label === "Office") {
    href = "https://maps.app.goo.gl/Ggoih8QJCCg8Zp817?g_st=ac";
    target = "_blank";
    rel = "noopener noreferrer";
  } else if (label === "Phone" || label === "Call Now") {
    href = `tel:${value.replace(/[^+\d]/g, "")}`;
  } else if (label === "Email" || label === "Gmail") {
    href = `mailto:${value}`;
  }

  const Component = href ? "a" : "div";

  return (
    <Component
      href={href}
      target={target}
      rel={rel}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "1rem",
        borderRadius: 12,
        marginBottom: ".7rem",
        transition: "all .25s ease",
        border: "1px solid transparent",
        cursor: href ? "pointer" : "default",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--canvas-3)";
        e.currentTarget.style.transform = "translateX(6px)";
        e.currentTarget.style.borderColor = "var(--line)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.borderColor = "transparent";
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: "var(--canvas-3)",
          display: "grid",
          placeItems: "center",
          fontSize: "1.2rem",
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: ".75rem",
            color: "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: ".1em",
            fontWeight: 600,
          }}
        >
          {label}
        </div>
        <div style={{ fontWeight: 600, color: "var(--navy)" }}>{value}</div>
      </div>
    </Component>
  );
}

function InquiryForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    deadline: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const update = (k) => (e) => {
    let val = e.target.value;
    if (k === "name") {
      val = val.replace(/[^a-zA-Z\s]/g, "");
    } else if (k === "phone") {
      val = val.replace(/\D/g, "").slice(0, 10);
    } else if (k === "email") {
      val = val.replace(/\s/g, "");
    }
    setForm((f) => ({ ...f, [k]: val }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    if (form.phone.replace(/\D/g, "").length !== 10) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid Gmail / Email address.");
      return;
    }
    setLoading(true);
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      status: "new",
      source: "website",
    };
    ["email", "service", "notes"].forEach((k) => {
      if (form[k].trim()) payload[k] = form[k].trim();
    });
    if (form.deadline) payload.deadline = form.deadline;

    const { error: err } = await supabase.from("inquiries").insert(payload);
    if (err) {
      setError(err.message);
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

    if (emailjsConfigured && form.email.trim()) {
      try {
        await sendEmail({
          to_name: form.name,
          name: form.name,
          to_email: form.email,
          email: form.email,
          subject: "We've received your inquiry — CA Raju Koyyala & Associates",
          message: `Hi ${form.name},\n\nThanks for reaching out to CA Raju Koyyala & Associates. We've logged your inquiry for ${form.service || "our services"}.\nA partner will get back to you within one working day.\n\nWarm regards,\nCA Raju Koyyala & Associates`,
        });
      } catch (e) {
        console.error("Confirmation email failed to send:", e);
      }
    }

    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="card anim-scale-in" style={{ padding: "3rem 2rem", textAlign: "center" }}>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: "50%",
            background: "#D1FAE5",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 1.2rem",
            fontSize: "2.4rem",
          }}
        >
          ✓
        </div>
        <h3 style={{ fontSize: "1.6rem" }}>Thanks, we've got your details.</h3>
        <p style={{ color: "var(--muted)", marginTop: ".5rem" }}>
          A partner from CA Raju Koyyala &amp; Associates will reach out within one working day.
        </p>
        <button
          className="btn btn-outline"
          style={{ marginTop: "1.5rem" }}
          onClick={() => {
            setForm({
              name: "",
              phone: "",
              email: "",
              service: "",
              deadline: "",
              notes: "",
            });
            setDone(false);
          }}
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card" style={{ padding: "1.8rem" }}>
      <h3 style={{ fontSize: "1.3rem", fontWeight: 600, color: "var(--navy)", marginBottom: "1.2rem" }}>
        Submit Inquiry
      </h3>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
        className="form-grid"
      >
        <div className="field">
          <label className="label">Name *</label>
          <input
            className="input"
            required
            value={form.name}
            onChange={update("name")}
            placeholder="Your full name"
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
            onChange={update("phone")}
            placeholder="e.g. 9876543210"
            type="tel"
            pattern="[0-9]{10}"
            maxLength={10}
            title="Phone number must be exactly 10 digits"
          />
        </div>
        <div className="field" style={{ gridColumn: "1/-1" }}>
          <label className="label">Gmail</label>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="you@gmail.com"
          />
        </div>
        <div className="field">
          <label className="label">Service</label>
          <select className="select" value={form.service} onChange={update("service")}>
            <option value="">Select a service…</option>
            {SERVICES.map((s) => (
              <option key={s.title} value={s.title}>
                {s.title}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="field">
          <label className="label">Target date</label>
          <input
            className="input"
            type="date"
            value={form.deadline}
            onChange={update("deadline")}
          />
        </div>
        <div className="field" style={{ gridColumn: "1/-1" }}>
          <label className="label">Notes</label>
          <textarea
            className="textarea"
            value={form.notes}
            onChange={update("notes")}
            placeholder="Briefly describe what you need…"
          />
        </div>
      </div>
      {error && (
        <div
          style={{
            marginTop: "1rem",
            padding: ".75rem 1rem",
            background: "#FEE2E2",
            color: "#991B1B",
            borderRadius: 8,
            fontSize: ".9rem",
          }}
        >
          {error}
        </div>
      )}
      <button
        type="submit"
        className="btn btn-gold"
        style={{ marginTop: "1.4rem", width: "100%" }}
        disabled={loading}
      >
        {loading ? "Submitting…" : "Submit inquiry →"}
      </button>
      <style>{`@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr !important; } }`}</style>
    </form>
  );
}

function Footer({ phone, address, email }) {
  return (
    <footer
      style={{
        background: "var(--navy)",
        color: "#fff",
        padding: "3rem 0 2rem",
        marginTop: "2rem",
      }}
    >
      <div className="container-x footer-grid">
        <div>
          <div
            style={{ display: "flex", alignItems: "center", gap: ".7rem", marginBottom: "1rem" }}
          >
            <img
              src={logoAsset.url}
              alt=""
              style={{ height: 40, background: "#fff", padding: 4, borderRadius: 8 }}
            />
            <div className="font-serif" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              CA Raju Koyyala &amp; Associates
            </div>
          </div>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: ".92rem", maxWidth: 360 }}>
            Boutique chartered accountancy practice based in Hanamkonda. Trusted by founders,
            professionals and growing businesses since 2012.
          </p>
        </div>
        <div>
          <h4
            style={{
              color: "var(--gold)",
              fontSize: ".82rem",
              textTransform: "uppercase",
              letterSpacing: ".15em",
              marginBottom: "1rem",
            }}
          >
            Services
          </h4>
          {SERVICES.slice(0, 5).map((s) => (
            <div
              key={s.title}
              style={{ fontSize: ".92rem", color: "rgba(255,255,255,.8)", marginBottom: ".4rem" }}
            >
              {s.title}
            </div>
          ))}
        </div>
        <div>
          <h4
            style={{
              color: "var(--gold)",
              fontSize: ".82rem",
              textTransform: "uppercase",
              letterSpacing: ".15em",
              marginBottom: "1rem",
            }}
          >
            Reach us
          </h4>
          <div style={{ color: "rgba(255,255,255,.8)", fontSize: ".92rem", lineHeight: 1.7 }}>
            <a
              href="https://maps.app.goo.gl/Ggoih8QJCCg8Zp817?g_st=ac"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              {address}
            </a>
            <br />
            <a
              href={`tel:${phone.replace(/[^+\d]/g, "")}`}
              style={{ color: "inherit", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              {phone}
            </a>
            <br />
            <a
              href={`mailto:${email}`}
              style={{ color: "inherit", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              {email}
            </a>
          </div>
        </div>
      </div>
      <div
        className="container-x"
        style={{
          marginTop: "2.5rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid rgba(255,255,255,.12)",
          textAlign: "center",
          color: "rgba(255,255,255,.6)",
          fontSize: ".85rem",
        }}
      >
        <span>© {new Date().getFullYear()} CA Raju Koyyala &amp; Associates. All rights reserved.</span>
      </div>
    </footer>
  );
}

const WhatsAppIcon = () => (
  <img
    src={whatsappLogoImg}
    alt="WhatsApp"
    style={{
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      objectFit: "cover",
      display: "block",
    }}
  />
);

function WhatsAppButton({ phone }) {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";
  const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const waUrl = `https://wa.me/${waNumber}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 1000,
        backgroundColor: "transparent",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1) translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1) translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)";
      }}
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon />
    </a>
  );
}

