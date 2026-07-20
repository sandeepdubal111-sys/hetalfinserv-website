import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV, SITE } from "@/lib/data";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Pages with a dark hero — navbar needs inverted (ivory) text at top
  const darkHero = pathname.startsWith("/calculators");

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Text color tokens — switch to ivory over dark hero when not scrolled
  const brandTextClass = scrolled || !darkHero ? "text-obsidian" : "text-[color:var(--hf-on-dark-primary)]";
  const inactiveTabClass = scrolled || !darkHero ? "text-obsidian" : "text-[color:var(--hf-on-dark-primary)]";
  const activePillBg = scrolled || !darkHero ? "var(--hf-obsidian)" : "var(--hf-gold)";
  const activePillText = scrolled || !darkHero ? "text-white" : "text-obsidian";

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
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 h-16 md:h-[76px] flex items-center justify-between gap-6">
          <Link
            to="/"
            data-testid="brand-logo-link"
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label="Hetal Finserv — Home"
          >
            <img
              src={SITE.logo}
              alt="Hetal Finserv Pvt Ltd logo"
              className="h-9 w-9 md:h-10 md:w-10 rounded-full object-cover shrink-0"
              width="40"
              height="40"
            />
            <span className="font-display text-[1.25rem] md:text-[1.4rem] leading-none text-obsidian">
              Hetal Finserv
            </span>
          </Link>

          {/* Desktop nav — bold display type, animated pill highlight for active */}
          <nav
            className="hidden md:flex items-center gap-1 lg:gap-2 relative"
            aria-label="Primary"
            data-testid="primary-nav"
          >
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                data-testid={`nav-link-${item.label.toLowerCase()}`}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `relative px-4 lg:px-5 py-2.5 rounded-full transition-colors duration-300 font-display leading-none ${
                    isActive
                      ? "text-white"
                      : "text-obsidian hover:text-[color:var(--hf-coral)]"
                  }`
                }
                style={{ fontSize: "1.0625rem", letterSpacing: "-0.005em" }}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-full -z-0"
                        style={{ background: "var(--hf-obsidian)" }}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/contact"
              data-testid="nav-book-consultation-cta"
              className="hidden md:inline-flex hf-btn-coral"
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
                <Link to="/contact" className="hf-btn-coral" data-testid="mobile-book-cta">
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
