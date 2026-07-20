import { REGULATORS } from "@/lib/data";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

function LogoBadge({ domain, name }) {
  const [broken, setBroken] = useState(false);
  return (
    <span
      className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0"
      style={{
        border: "1px solid rgba(14,15,12,0.12)",
        boxShadow: "0 6px 18px -8px rgba(14,15,12,0.25)",
      }}
    >
      {broken ? (
        <span
          className="font-mono-label"
          style={{ color: "var(--hf-obsidian)", fontSize: "0.7rem" }}
        >
          {name.slice(0, 4)}
        </span>
      ) : (
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
          alt={`${name} logo`}
          className="h-10 w-10 md:h-11 md:w-11 object-contain"
          loading="lazy"
          onError={() => setBroken(true)}
        />
      )}
    </span>
  );
}

export default function Regulators() {
  return (
    <section
      data-testid="regulators-section"
      className="bg-bone py-20 md:py-28 border-t border-b border-hair"
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14">
        <div className="grid grid-cols-12 gap-6 md:gap-10 items-end mb-14 md:mb-20">
          <div className="col-span-12 md:col-span-6">
            <p className="font-mono-label text-mute">— Regulatory authorities & affiliations</p>
            <h2
              className="font-display text-obsidian mt-6"
              style={{ fontSize: "clamp(2rem, 4vw, 3.6rem)", lineHeight: 0.98 }}
            >
              Backed by the<br />
              regulators that matter.
            </h2>
          </div>
          <div className="col-span-12 md:col-span-6">
            <p className="text-obsidian max-w-lg leading-relaxed">
              Five separate regulatory registrations — AMFI, SEBI, IRDAI, MahaRERA and
              NISM certification. Every recommendation is backed by the correct license
              and disclosed in full.
            </p>
          </div>
        </div>

        <ul
          className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4"
          data-testid="regulators-grid"
        >
          {REGULATORS.map((r, i) => (
            <motion.li
              key={r.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group"
              data-testid={`regulator-${r.key}`}
            >
              <a
                href={r.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-5 py-7 md:px-6 md:py-8 h-full bg-white transition-all duration-300"
                style={{
                  border: "1px solid rgba(14,15,12,0.12)",
                }}
                aria-label={`Verify ${r.name} registration`}
              >
                <div className="flex items-start justify-between gap-4">
                  <LogoBadge domain={r.domain} name={r.name} />
                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.5}
                    className="text-mute group-hover:text-[color:var(--hf-coral)] transition-colors mt-1"
                  />
                </div>
                <p
                  className="font-display text-obsidian mt-6"
                  style={{ fontSize: "1.5rem", lineHeight: 1 }}
                >
                  {r.name}
                </p>
                <p className="font-mono-label text-mute mt-2 leading-relaxed">
                  {r.full}
                </p>
                <p
                  className="text-[0.78rem] mt-4 pt-3 leading-relaxed"
                  style={{
                    color: "var(--hf-obsidian)",
                    borderTop: "1px solid rgba(14,15,12,0.1)",
                  }}
                >
                  {r.regNo}
                </p>
              </a>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
