import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LEADERSHIP } from "@/lib/data";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Editorial two-founder Leadership section.
 * Left: tabbed portrait (Sandeep / Tanuja) with framed treatment.
 * Right: bio + certifications + accolades for the active leader.
 * On mobile it stacks with an inline switcher above the portrait.
 */
export default function Leadership({ inline = false }) {
  const [active, setActive] = useState(0);
  const leader = LEADERSHIP[active];

  return (
    <section
      data-testid="leadership-section"
      className="on-dark bg-emerald-deep text-ivory py-28 md:py-40 relative overflow-hidden"
      style={{ background: "var(--hf-emerald-deep)" }}
    >
      {/* Section header */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 mb-14 md:mb-20">
        <div className="grid grid-cols-12 gap-6 md:gap-10 items-end">
          <div className="col-span-12 md:col-span-4">
            <p className="font-mono-label text-[color:var(--hf-gold)]">— Leadership</p>
          </div>
          <div className="col-span-12 md:col-span-8">
            <h2
              className="font-display text-ivory"
              style={{ fontSize: "clamp(2.4rem, 5vw, 5rem)", lineHeight: 0.95 }}
            >
              The two people<br />
              behind every plan.
            </h2>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14">
        {/* Selector tabs — desktop */}
        <div className="hidden md:flex items-center gap-10 border-b border-hair-light mb-16" data-testid="leadership-tabs">
          {LEADERSHIP.map((l, i) => {
            const isActive = i === active;
            return (
              <button
                key={l.id}
                onClick={() => setActive(i)}
                data-testid={`leadership-tab-${l.id}`}
                className={`pb-6 -mb-px flex items-baseline gap-4 border-b transition-colors duration-300 ${
                  isActive ? "border-[color:var(--hf-gold)]" : "border-transparent hover:border-[rgba(244,239,230,0.35)]"
                }`}
              >
                <span
                  className={`font-mono-label ${isActive ? "text-[color:var(--hf-gold)]" : "text-[color:rgba(244,239,230,0.55)]"}`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="text-left">
                  <div
                    className={`font-display transition-colors ${isActive ? "text-ivory" : "text-[color:rgba(244,239,230,0.7)]"}`}
                    style={{ fontSize: "clamp(1.6rem, 2.6vw, 2.4rem)", lineHeight: 1 }}
                  >
                    {l.name}
                  </div>
                  <div className="font-mono-label text-[color:rgba(244,239,230,0.55)] mt-2">
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
              className={`px-4 py-2 font-mono-label text-[0.65rem] border transition-colors ${
                i === active
                  ? "bg-[color:var(--hf-gold)] text-obsidian border-[color:var(--hf-gold)]"
                  : "text-ivory border-[rgba(244,239,230,0.3)]"
              }`}
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
              <div className="relative aspect-[3/4] w-full max-w-[540px] overflow-hidden framed-img border border-hair-light">
                <img
                  src={leader.portrait}
                  alt={`${leader.name}, ${leader.role}`}
                  className="absolute inset-0 h-full w-full object-cover object-[center_top]"
                  loading="lazy"
                  data-testid={`leadership-portrait-${leader.id}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,42,32,0.55)] via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 z-10">
                  <p className="font-mono-label text-[color:var(--hf-gold)]">
                    — At the practice
                  </p>
                  <p className="font-display text-2xl md:text-3xl mt-2 text-ivory">
                    {leader.name}
                  </p>
                  <p className="font-mono-label text-[color:rgba(244,239,230,0.75)] mt-1">
                    {leader.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Copy */}
            <div className="col-span-12 lg:col-span-7">
              <p className="font-mono-label text-[color:var(--hf-gold)]">— {leader.role}</p>
              <h3
                className="font-display text-ivory mt-6"
                style={{ fontSize: "clamp(2.2rem, 5vw, 4.8rem)", lineHeight: 0.95 }}
              >
                {leader.name}<span className="text-gold">.</span>
              </h3>
              <p className="font-mono-label text-[color:rgba(244,239,230,0.7)] mt-3">
                {leader.years}
              </p>
              <p className="mt-8 text-lg md:text-xl leading-[1.7] text-[color:rgba(244,239,230,0.9)] max-w-2xl">
                {leader.bio}
              </p>

              {/* Certifications */}
              <div className="mt-12">
                <p className="font-mono-label text-[color:var(--hf-gold)] mb-6">
                  — International & Professional Certifications
                </p>
                <ul
                  className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1"
                  data-testid={`certifications-${leader.id}`}
                >
                  {leader.certifications.map((c) => (
                    <li
                      key={c}
                      className="flex items-start gap-3 py-3 border-t border-hair-light"
                    >
                      <span className="mt-2 h-1.5 w-1.5 bg-[color:var(--hf-gold)] shrink-0" />
                      <span className="text-[color:rgba(244,239,230,0.92)] text-sm md:text-base">
                        {c}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Achievements */}
              {leader.achievements?.length > 0 && (
                <div className="mt-12">
                  <p className="font-mono-label text-[color:var(--hf-gold)] mb-6">
                    — Accolades & Achievements
                  </p>
                  <ul className="space-y-0" data-testid={`achievements-${leader.id}`}>
                    {leader.achievements.map((a) => (
                      <li
                        key={a.title}
                        className="grid grid-cols-12 gap-4 py-4 border-t border-hair-light"
                      >
                        <span className="col-span-3 md:col-span-2 font-mono-label text-[color:var(--hf-gold)]">
                          {a.year}
                        </span>
                        <span className="col-span-9 md:col-span-10 text-[color:rgba(244,239,230,0.92)]">
                          {a.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!inline && (
                <div className="mt-12">
                  <Link to="/about" className="hf-btn-outline" data-testid={`leadership-more-${leader.id}`}>
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
