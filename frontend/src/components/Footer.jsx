import { Link } from "react-router-dom";
import { Instagram, Facebook, Linkedin, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { SITE, NAV, SERVICES } from "@/lib/data";
import VerifyUsButton from "@/components/VerifyUsButton";

const socials = [
  {
    key: "instagram",
    icon: Instagram,
    href: SITE.socials.instagram,
    label: "Instagram",
    handle: "@hetalfinservpvtltd",
  },
  {
    key: "facebook",
    icon: Facebook,
    href: SITE.socials.facebook,
    label: "Facebook",
    handle: "/hetalfinservpvtltd",
  },
  {
    key: "linkedin",
    icon: Linkedin,
    href: SITE.socials.linkedin,
    label: "LinkedIn",
    handle: "Sandeep Dubal",
  },
];

export default function Footer() {
  return (
    <footer
      data-testid="site-footer"
      className="on-dark relative overflow-hidden"
      style={{ background: "var(--hf-obsidian)", color: "var(--hf-on-dark-primary)" }}
    >
      {/* Giant CTA ribbon */}
      <div className="border-b border-hair-light overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 py-16 md:py-24">
          <p
            className="font-mono-label mb-6"
            style={{ color: "var(--hf-gold-soft)" }}
          >
            — It's Not Just a Strategy. It's Personal.
          </p>
          <h3
            className="font-display leading-[0.92]"
            style={{
              fontSize: "clamp(2.6rem, 6vw, 6rem)",
              color: "var(--hf-on-dark-primary)",
            }}
          >
            A conversation costs<br />
            nothing.{" "}
            <span style={{ color: "var(--hf-gold)" }} className="italic">
              Begin one.
            </span>
          </h3>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/contact" className="hf-btn-coral" data-testid="footer-book-cta">
              Book Free Consultation →
            </Link>
            <a
              href={`tel:${SITE.phoneClean}`}
              className="hf-btn-outline"
              data-testid="footer-call-cta"
            >
              Call {SITE.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Social handles — professional pill row */}
      <div className="border-b border-hair-light">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <p className="font-mono-label" style={{ color: "var(--hf-gold-soft)" }}>
              — Follow the practice
            </p>
            <VerifyUsButton />
          </div>
          <div className="flex flex-wrap items-center gap-4" data-testid="footer-socials">
            {socials.map((s) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                data-testid={`footer-social-${s.key}`}
                className="group inline-flex items-center gap-3 px-5 py-3 transition-colors duration-300"
                style={{
                  background: "rgba(253,249,238,0.06)",
                  border: "1px solid rgba(253,249,238,0.2)",
                  borderRadius: 999,
                }}
              >
                <span
                  className="h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-[color:var(--hf-gold)]"
                  style={{ background: "rgba(253,249,238,0.1)" }}
                >
                  <s.icon
                    size={15}
                    strokeWidth={1.6}
                    className="text-[color:var(--hf-on-dark-primary)] group-hover:text-[color:var(--hf-obsidian)] transition-colors"
                  />
                </span>
                <span className="flex flex-col">
                  <span className="font-mono-label text-[0.6rem]" style={{ color: "var(--hf-gold-soft)" }}>
                    {s.label}
                  </span>
                  <span
                    className="text-[0.9rem] leading-none mt-0.5"
                    style={{ color: "var(--hf-on-dark-primary)" }}
                  >
                    {s.handle}
                  </span>
                </span>
                <ArrowUpRight
                  size={14}
                  strokeWidth={1.5}
                  className="text-[color:var(--hf-gold-soft)] group-hover:text-[color:var(--hf-gold)] transition-colors"
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 py-16 grid grid-cols-2 md:grid-cols-12 gap-10">
        {/* Brand column */}
        <div className="col-span-2 md:col-span-4">
          <div className="flex items-center gap-4">
            <img
              src={SITE.logo}
              alt="Hetal Finserv Pvt Ltd logo"
              className="h-16 w-16 rounded-full object-cover shrink-0"
              style={{ background: "var(--hf-on-dark-primary)", padding: "2px" }}
              width="64"
              height="64"
            />
            <div className="font-display text-2xl md:text-3xl" style={{ color: "var(--hf-on-dark-primary)" }}>
              Hetal Finserv
              <div className="font-mono-label mt-1" style={{ color: "var(--hf-gold-soft)", fontSize: "0.55rem" }}>
                PVT LTD · MAKE YOUR MONEY GROW
              </div>
            </div>
          </div>
          <p className="mt-6 max-w-sm leading-relaxed" style={{ color: "var(--hf-on-dark-secondary)" }}>
            Your one-stop financial partner for Mutual Funds, PMS, Insurance, Loans and
            Real Estate — serving families across India from Pune.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {["AMFI ARN-254254", "MahaRERA A52100043460", "PMS APRN00234"].map((r) => (
              <span
                key={r}
                className="font-mono-label px-3 py-1.5"
                style={{
                  color: "var(--hf-gold-soft)",
                  background: "rgba(253,249,238,0.05)",
                  border: "1px solid rgba(253,249,238,0.15)",
                  fontSize: "0.58rem",
                }}
              >
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div className="col-span-1 md:col-span-2">
          <p className="font-mono-label mb-5" style={{ color: "var(--hf-gold-soft)" }}>
            Explore
          </p>
          <ul className="space-y-3">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  data-testid={`footer-nav-${n.label.toLowerCase()}`}
                  className="link-underline"
                  style={{ color: "var(--hf-on-dark-secondary)" }}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div className="col-span-1 md:col-span-3">
          <p className="font-mono-label mb-5" style={{ color: "var(--hf-gold-soft)" }}>
            Services
          </p>
          <ul className="space-y-3">
            {SERVICES.slice(0, 6).map((s) => (
              <li key={s.id}>
                <Link
                  to={`/services#${s.id}`}
                  className="link-underline"
                  style={{ color: "var(--hf-on-dark-secondary)" }}
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="col-span-2 md:col-span-3">
          <p className="font-mono-label mb-5" style={{ color: "var(--hf-gold-soft)" }}>
            Direct
          </p>
          <ul className="space-y-4" style={{ color: "var(--hf-on-dark-primary)" }}>
            <li className="flex items-start gap-3">
              <Phone size={16} strokeWidth={1.5} className="mt-1" style={{ color: "var(--hf-gold)" }} />
              <div>
                <a href={`tel:${SITE.phoneClean}`} data-testid="footer-phone" className="block">
                  {SITE.phone}
                </a>
                <a
                  href={`tel:${(SITE.phoneAlt || "").replace(/\D/g, "")}`}
                  className="block mt-1"
                  style={{ color: "var(--hf-on-dark-secondary)" }}
                >
                  {SITE.phoneAlt}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Mail size={16} strokeWidth={1.5} className="mt-1" style={{ color: "var(--hf-gold)" }} />
              <a href={`mailto:${SITE.email}`} data-testid="footer-email">
                {SITE.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={16} strokeWidth={1.5} className="mt-1" style={{ color: "var(--hf-gold)" }} />
              <span className="leading-relaxed">{SITE.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-hair-light">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="font-mono-label" style={{ color: "rgba(253,249,238,0.55)" }}>
            © {new Date().getFullYear()} Hetal Finserv Pvt. Ltd. · All rights reserved
          </p>
          <p className="font-mono-label" style={{ color: "rgba(253,249,238,0.55)" }}>
            AMFI · MahaRERA · IRDAI · PMS · Insurance Broker · Investments are subject to
            market risk
          </p>
        </div>
      </div>
    </footer>
  );
}
