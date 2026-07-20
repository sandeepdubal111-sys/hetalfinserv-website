import { Link } from "react-router-dom";
import { Instagram, Linkedin, Youtube, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { SITE, NAV, SERVICES } from "@/lib/data";

const socials = [
  { icon: Instagram, href: SITE.socials.instagram, label: "Instagram", key: "instagram" },
  { icon: Linkedin, href: SITE.socials.linkedin, label: "LinkedIn", key: "linkedin" },
  { icon: Youtube, href: SITE.socials.youtube, label: "YouTube", key: "youtube" },
  { icon: Facebook, href: SITE.socials.facebook, label: "Facebook", key: "facebook" },
  { icon: Twitter, href: SITE.socials.twitter, label: "X (Twitter)", key: "twitter" },
];

export default function Footer() {
  return (
    <footer
      data-testid="site-footer"
      className="on-dark bg-obsidian text-ivory relative overflow-hidden"
    >
      {/* Giant ribbon */}
      <div className="border-b border-hair-light overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 py-16 md:py-24">
          <p className="font-mono-label text-[color:var(--hf-gold)] mb-6">
            — Take the first step
          </p>
          <h3 className="font-display text-5xl md:text-7xl lg:text-8xl text-ivory leading-[0.92]">
            A conversation costs<br />
            nothing.<span className="text-gold"> Begin one.</span>
          </h3>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/contact" className="hf-btn-gold" data-testid="footer-book-cta">
              Book Consultation →
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

      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 py-16 grid grid-cols-2 md:grid-cols-12 gap-10">
        {/* Brand column */}
        <div className="col-span-2 md:col-span-4">
          <div className="font-display text-3xl">
            Hetal<span className="text-gold">.</span> Finserv
          </div>
          <p className="mt-6 text-[color:rgba(244,239,230,0.7)] max-w-sm leading-relaxed">
            {SITE.tagline} A boutique financial advisory practice serving Indian families since {SITE.founded}.
          </p>

          <div className="mt-8 flex items-center gap-3" data-testid="footer-socials">
            {socials.map((s) => (
              <a
                key={s.key}
                href={s.href}
                aria-label={s.label}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`footer-social-${s.key}`}
                className="h-10 w-10 border border-hair-light flex items-center justify-center text-ivory hover:bg-[color:var(--hf-gold)] hover:text-obsidian hover:border-[color:var(--hf-gold)] transition-colors"
              >
                <s.icon size={16} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div className="col-span-1 md:col-span-2">
          <p className="font-mono-label text-[color:var(--hf-gold)] mb-5">Explore</p>
          <ul className="space-y-3">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  data-testid={`footer-nav-${n.label.toLowerCase()}`}
                  className="text-[color:rgba(244,239,230,0.8)] hover:text-ivory link-underline"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div className="col-span-1 md:col-span-3">
          <p className="font-mono-label text-[color:var(--hf-gold)] mb-5">Services</p>
          <ul className="space-y-3">
            {SERVICES.slice(0, 6).map((s) => (
              <li key={s.id}>
                <Link
                  to={`/services#${s.id}`}
                  className="text-[color:rgba(244,239,230,0.8)] hover:text-ivory link-underline"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="col-span-2 md:col-span-3">
          <p className="font-mono-label text-[color:var(--hf-gold)] mb-5">Direct</p>
          <ul className="space-y-4 text-[color:rgba(244,239,230,0.85)]">
            <li className="flex items-start gap-3">
              <Phone size={16} strokeWidth={1.5} className="mt-1 text-[color:var(--hf-gold)]" />
              <a href={`tel:${SITE.phoneClean}`} data-testid="footer-phone">{SITE.phone}</a>
            </li>
            <li className="flex items-start gap-3">
              <Mail size={16} strokeWidth={1.5} className="mt-1 text-[color:var(--hf-gold)]" />
              <a href={`mailto:${SITE.email}`} data-testid="footer-email">{SITE.email}</a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={16} strokeWidth={1.5} className="mt-1 text-[color:var(--hf-gold)]" />
              <span className="leading-relaxed">{SITE.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-hair-light">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="font-mono-label text-[color:rgba(244,239,230,0.55)]">
            © {new Date().getFullYear()} Hetal Finserv · All rights reserved
          </p>
          <p className="font-mono-label text-[color:rgba(244,239,230,0.55)]">
            AMFI · IRDAI · SEBI compliant · Investments are subject to market risk
          </p>
        </div>
      </div>
    </footer>
  );
}
