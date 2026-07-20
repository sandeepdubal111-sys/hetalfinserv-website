import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV, SITE } from "@/lib/data";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        data-testid="site-navbar"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className={`fixed top-0 inset-x-0 z-40 transition-colors duration-500 ${
          scrolled
            ? "bg-[color:var(--hf-ivory)]/85 backdrop-blur-xl border-b border-[rgba(14,15,12,0.08)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 h-20 flex items-center justify-between">
          <Link
            to="/"
            data-testid="brand-logo-link"
            className="flex items-baseline gap-2 group"
            aria-label="Hetal Finserv — Home"
          >
            <span className="font-display text-[1.75rem] leading-none text-obsidian">
              Hetal<span className="text-gold">.</span>
            </span>
            <span className="font-mono-label text-[0.6rem] text-mute pl-1 hidden sm:inline">
              FINSERV — EST. {SITE.founded}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-10"
            aria-label="Primary"
            data-testid="primary-nav"
          >
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                data-testid={`nav-link-${item.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `font-mono-label text-[0.68rem] link-underline transition-colors ${
                    isActive ? "text-gold" : "text-obsidian"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/contact"
              data-testid="nav-book-consultation-cta"
              className="hidden md:inline-flex hf-btn-gold"
            >
              Book Consultation
              <span aria-hidden="true">→</span>
            </Link>
            <button
              aria-label="Open menu"
              data-testid="mobile-menu-toggle"
              onClick={() => setOpen((v) => !v)}
              className="md:hidden h-11 w-11 border border-[rgba(14,15,12,0.25)] flex items-center justify-center text-obsidian"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="mobile-menu-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 md:hidden bg-[color:var(--hf-ivory)] pt-24 px-6"
          >
            <nav className="flex flex-col gap-6" aria-label="Mobile">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * i, duration: 0.5 }}
                >
                  <NavLink
                    to={item.to}
                    data-testid={`mobile-nav-link-${item.label.toLowerCase()}`}
                    className="font-display text-4xl text-obsidian"
                  >
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
              <div className="mt-6">
                <Link to="/contact" className="hf-btn-gold" data-testid="mobile-book-cta">
                  Book Consultation →
                </Link>
              </div>
              <div className="mt-8 pt-8 border-t border-[rgba(14,15,12,0.15)]">
                <p className="font-mono-label text-mute">Direct</p>
                <a
                  href={`tel:${SITE.phoneClean}`}
                  className="block font-display text-3xl mt-2 text-obsidian"
                >
                  {SITE.phone}
                </a>
                <a
                  href={`mailto:${SITE.email}`}
                  className="block text-obsidian mt-2 link-underline"
                >
                  {SITE.email}
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
