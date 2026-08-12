import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MaskLine } from "@/components/MaskedReveal";
import { CALCULATORS, CALC_GROUPS, getCalculator } from "@/lib/calculators";
import CalcRunner from "@/components/calculators/CalcRunner";
import SEO from "@/components/SEO";

export default function CalculatorsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const active = useMemo(() => getCalculator(slug), [slug]);

  // Auto-scroll top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  // Redirect if the URL slug is invalid
  useEffect(() => {
    if (slug && !CALCULATORS.some((c) => c.slug === slug)) {
      navigate("/calculators/sip", { replace: true });
    }
  }, [slug, navigate]);

  // Mobile drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <main data-testid="calculators-page" className="bg-obsidian on-dark text-ivory min-h-screen">
      <SEO
        title={active ? `${active.title} — Free Online Calculator` : "Financial Calculators"}
        description={
          active
            ? `Use our free ${active.title} to plan your finances — instant, accurate results with no signup required.`
            : "15 free financial calculators — SIP, PPF, EMI, retirement planning and more — from Hetal Finserv."
        }
        path={active ? `/calculators/${active.slug}` : "/calculators"}
      />
      {/* Hero */}
      <section className="pt-40 pb-16 md:pt-52 md:pb-24 border-b border-hair-light">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-3">
            <p className="font-mono-label text-[color:var(--hf-gold-soft)]">— 15 calculators</p>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h1
              className="font-display"
              style={{ fontSize: "clamp(2.6rem, 7vw, 7.5rem)", lineHeight: 0.92, color: "#f4efe6" }}
            >
              <span className="block"><MaskLine delay={0.15}>The full</MaskLine></span>
              <span className="block italic" style={{ color: "var(--hf-gold)" }}>
                <MaskLine delay={0.35}>calculator suite.</MaskLine>
              </span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.9 }}
              className="mt-8 max-w-2xl text-on-dark-2 text-lg leading-[1.7]"
            >
              Model any financial decision — SIP, EMI, retirement, education, insurance need.
              Every projection is inflation-aware, and can be sent directly to a senior advisor
              for a personalised plan.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Layout: sidebar + main */}
      <section className="py-14 md:py-24">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 grid grid-cols-12 gap-10 md:gap-14">
          {/* Sidebar (desktop) */}
          <aside
            className="hidden md:block md:col-span-4 lg:col-span-3"
            data-testid="calc-sidebar"
          >
            <div className="sticky top-28 space-y-10">
              {CALC_GROUPS.map((grp) => (
                <div key={grp.key}>
                  <p className="font-mono-label text-[color:var(--hf-gold-soft)] mb-4">
                    — {grp.label}
                  </p>
                  <ul className="space-y-1">
                    {CALCULATORS.filter((c) => c.group === grp.key).map((c) => {
                      const isActive = c.slug === active.slug;
                      return (
                        <li key={c.slug}>
                          <button
                            onClick={() => navigate(`/calculators/${c.slug}`)}
                            data-testid={`calc-nav-${c.slug}`}
                            className={`relative w-full text-left py-2.5 pr-3 pl-4 transition-colors group ${
                              isActive ? "text-on-dark" : "text-on-dark-mute hover:text-on-dark"
                            }`}
                          >
                            {isActive && (
                              <motion.span
                                layoutId="calc-side-marker"
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px]"
                                style={{ background: "var(--hf-gold)" }}
                                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                              />
                            )}
                            <span
                              className={`font-display transition-transform ${
                                isActive ? "italic" : ""
                              }`}
                              style={{ fontSize: "1.05rem", lineHeight: 1.2 }}
                            >
                              {c.title}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          {/* Mobile chip nav */}
          <div className="col-span-12 md:hidden -mx-6 px-6" data-testid="calc-mobile-nav">
            <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
              {CALCULATORS.map((c) => {
                const isActive = c.slug === active.slug;
                return (
                  <button
                    key={c.slug}
                    onClick={() => navigate(`/calculators/${c.slug}`)}
                    className={`shrink-0 px-4 py-2 rounded-full font-mono-label transition-colors text-[0.7rem] ${
                      isActive
                        ? "bg-[color:var(--hf-gold)] text-obsidian"
                        : "border border-hair-light text-on-dark-2"
                    }`}
                  >
                    {c.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main pane */}
          <div className="col-span-12 md:col-span-8 lg:col-span-9" data-testid="calc-main">
            <motion.div
              key={active.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <CalcRunner config={active} />
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
