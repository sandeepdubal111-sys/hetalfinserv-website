import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LEADERSHIP } from "@/lib/data";
import { ArrowUpRight, Award } from "lucide-react";
import { Link } from "react-router-dom";

const PORTRAIT_POS = {
  "sandeep-dubal": "center 22%",
  "tanuja-dubal": "center 18%",
};

/**
 * Two-founder Leadership section — tabbed switcher, high-contrast on emerald.
 */
export default function Leadership({ inline = false }) {
  const [active, setActive] = useState(0);
  const leader = LEADERSHIP[active];

  return (
    <section
      data-testid="leadership-section"
      className="on-dark text-on-dark py-28 md:py-40 relative overflow-hidden"
      style={{ background: "var(--hf-emerald-deep)" }}
    >
      {/* Section header */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 mb-14 md:mb-20">
        <div className="grid grid-cols-12 gap-6 md:gap-10 items-end">
          <div className="col-span-12 md:col-span-4">
            <p className="font-mono-label" style={{ color: "var(--hf-gold-soft)" }}>
              — Leadership
            </p>
          </div>
          <div className="col-span-12 md:col-span-8">
            <h2
              className="font-display text-on-dark"
              style={{ fontSize: "clamp(2.4rem, 5vw, 5rem)", lineHeight: 0.95 }}
            >
              The two people<br />
              behind every plan.
            </h2>
            <p
              className="mt-6 max-w-2xl text-on-dark-2"
              style={{ fontSize: "1.05rem", lineHeight: 1.75 }}
            >
              Unlike large corporate firms, at Hetal Finserv you get direct access to our
              founders — certified, experienced and personally involved with every client
              relationship.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14">
        {/* Selector tabs — desktop */}
        <div
          className="hidden md:flex items-center gap-10 mb-16"
          data-testid="leadership-tabs"
          style={{ borderBottom: "1px solid rgba(253,249,238,0.25)" }}
        >
          {LEADERSHIP.map((l, i) => {
            const isActive = i === active;
            return (
              <button
                key={l.id}
                onClick={() => setActive(i)}
                data-testid={`leadership-tab-${l.id}`}
                className="pb-6 -mb-px flex items-baseline gap-4 transition-colors duration-300"
                style={{
                  borderBottom: isActive
                    ? "1px solid var(--hf-gold)"
                    : "1px solid transparent",
                }}
              >
                <span
                  className="font-mono-label"
                  style={{ color: isActive ? "var(--hf-gold)" : "rgba(253,249,238,0.6)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="text-left">
                  <div
                    className="font-display transition-colors"
                    style={{
                      fontSize: "clamp(1.6rem, 2.6vw, 2.4rem)",
                      lineHeight: 1,
                      color: isActive ? "var(--hf-on-dark-primary)" : "rgba(253,249,238,0.75)",
                    }}
                  >
                    {l.name}
                  </div>
                  <div className="font-mono-label mt-2" style={{ color: "rgba(253,249,238,0.6)" }}>
                    {l.role}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile selector */}
        <div className="md:hidden flex gap-3 mb-8 flex-wrap">
          {LEADERSHIP.map((l, i) => (
            <button
              key={l.id}
              onClick={() => setActive(i)}
              data-testid={`leadership-tab-mobile-${l.id}`}
              className="px-4 py-2 font-mono-label text-[0.65rem] border transition-colors"
              style={
                i === active
                  ? {
                      background: "var(--hf-gold)",
                      color: "var(--hf-obsidian)",
                      borderColor: "var(--hf-gold)",
                    }
                  : {
                      color: "var(--hf-on-dark-primary)",
                      borderColor: "rgba(253,249,238,0.35)",
                    }
              }
            >
              {l.name.split(" ")[0]}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={leader.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-12 gap-6 md:gap-12 items-start"
          >
            {/* Portrait */}
            <div className="col-span-12 lg:col-span-5">
              <div
                className="relative aspect-[3/4] w-full max-w-[540px] overflow-hidden framed-img"
                style={{ border: "1px solid rgba(253,249,238,0.22)" }}
              >
                <img
                  src={leader.portrait}
                  alt={`${leader.name}, ${leader.role}`}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: PORTRAIT_POS[leader.id] || "center 20%" }}
                  loading="lazy"
                  data-testid={`leadership-portrait-${leader.id}`}
                />
                {/* Subtle bottom gradient for legibility only */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 55%, rgba(10,70,51,0.75) 100%)",
                  }}
                />
                <div className="absolute bottom-6 left-6 right-6 z-10">
                  <p className="font-mono-label" style={{ color: "var(--hf-gold-soft)" }}>
                    — At the practice
                  </p>
                  <p
                    className="font-display mt-2"
                    style={{ fontSize: "1.6rem", color: "var(--hf-on-dark-primary)" }}
                  >
                    {leader.name}
                  </p>
                  <p className="font-mono-label mt-1" style={{ color: "rgba(253,249,238,0.85)" }}>
                    {leader.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Copy */}
            <div className="col-span-12 lg:col-span-7">
              <p className="font-mono-label" style={{ color: "var(--hf-gold-soft)" }}>
                — {leader.role}
              </p>
              <h3
                className="font-display mt-6"
                style={{
                  fontSize: "clamp(2.2rem, 5vw, 4.8rem)",
                  lineHeight: 0.95,
                  color: "var(--hf-on-dark-primary)",
                }}
              >
                {leader.name}
                <span style={{ color: "var(--hf-gold)" }}>.</span>
              </h3>
              <p className="font-mono-label mt-3" style={{ color: "rgba(253,249,238,0.72)" }}>
                {leader.years}
              </p>
              <p
                className="mt-8 max-w-2xl"
                style={{
                  fontSize: "1.1rem",
                  lineHeight: 1.75,
                  color: "var(--hf-on-dark-primary)",
                }}
              >
                {leader.bio}
              </p>

              {/* Certifications — badge grid */}
              <div className="mt-14">
                <div className="flex items-baseline gap-4 mb-8">
                  <Award
                    size={20}
                    strokeWidth={1.4}
                    style={{ color: "var(--hf-gold-soft)" }}
                  />
                  <p className="font-mono-label" style={{ color: "var(--hf-gold-soft)" }}>
                    International & Professional Certifications
                  </p>
                </div>
                <ul
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  data-testid={`certifications-${leader.id}`}
                >
                  {leader.certifications.map((c, k) => (
                    <li
                      key={c}
                      className="flex items-start gap-4 px-5 py-4"
                      style={{
                        background: "rgba(253,249,238,0.06)",
                        border: "1px solid rgba(253,249,238,0.14)",
                      }}
                    >
                      <span
                        className="font-mono-label shrink-0 mt-0.5"
                        style={{ color: "var(--hf-gold)", fontSize: "0.6rem" }}
                      >
                        {String(k + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="leading-snug"
                        style={{
                          color: "var(--hf-on-dark-primary)",
                          fontSize: "0.95rem",
                        }}
                      >
                        {c}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Achievements */}
              {leader.achievements?.length > 0 && (
                <div className="mt-14">
                  <p className="font-mono-label mb-6" style={{ color: "var(--hf-gold-soft)" }}>
                    — Accolades & Achievements
                  </p>
                  <ul className="space-y-0" data-testid={`achievements-${leader.id}`}>
                    {leader.achievements.map((a) => (
                      <li
                        key={a.title}
                        className="grid grid-cols-12 gap-4 py-4"
                        style={{ borderTop: "1px solid rgba(253,249,238,0.18)" }}
                      >
                        <span
                          className="col-span-4 md:col-span-3 font-mono-label"
                          style={{ color: "var(--hf-gold)" }}
                        >
                          {a.year}
                        </span>
                        <span
                          className="col-span-8 md:col-span-9"
                          style={{ color: "var(--hf-on-dark-primary)" }}
                        >
                          {a.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!inline && (
                <div className="mt-12">
                  <Link
                    to="/about"
                    className="hf-btn-outline"
                    data-testid={`leadership-more-${leader.id}`}
                  >
                    Read the full story
                    <ArrowUpRight size={16} strokeWidth={1.5} />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
