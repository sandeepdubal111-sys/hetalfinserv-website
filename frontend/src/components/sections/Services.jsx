import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SERVICES } from "@/lib/data";

export default function Services({ compact = false }) {
  const [active, setActive] = useState(0);
  return (
    <section
      data-testid="services-section"
      className="on-dark bg-obsidian text-ivory relative overflow-hidden py-28 md:py-40"
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14">
        <div className="grid grid-cols-12 gap-6 md:gap-10 mb-16 md:mb-24">
          <div className="col-span-12 md:col-span-5">
            <p className="font-mono-label text-[color:var(--hf-gold)]">— Services</p>
            <h2
              className="font-display mt-6 text-ivory"
              style={{ fontSize: "clamp(2.6rem, 5.5vw, 5.5rem)", lineHeight: 0.95 }}
            >
              Six practices,<br />
              one plan.
            </h2>
          </div>
          <div className="col-span-12 md:col-span-6 md:col-start-7 flex md:items-end">
            <p className="text-lg md:text-xl text-on-dark-2 leading-[1.7] max-w-lg">
              Every family reaches us for a single reason and stays for the rest.
              Explore the six practices we run under one accountable roof.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 md:gap-10">
          {/* Left list */}
          <div className="col-span-12 lg:col-span-7">
            <ul className="border-t border-hair-light" data-testid="services-list">
              {SERVICES.map((s, i) => (
                <li
                  key={s.id}
                  className="border-b border-hair-light group"
                  onMouseEnter={() => setActive(i)}
                >
                  <Link
                    to={`/services#${s.id}`}
                    data-testid={`service-row-${s.id}`}
                    className="flex items-center justify-between gap-6 py-7 md:py-9 relative"
                  >
                    <div className="flex items-baseline gap-6 md:gap-10 min-w-0">
                      <span className="font-mono-label text-[color:var(--hf-gold)] shrink-0">
                        {s.number}
                      </span>
                      <span
                        className="font-display text-ivory transition-colors duration-500 truncate"
                        style={{ fontSize: "clamp(1.8rem, 3.8vw, 3.4rem)", lineHeight: 1 }}
                      >
                        {s.title}
                      </span>
                    </div>
                    <span className="shrink-0 h-11 w-11 border border-hair-light flex items-center justify-center text-ivory transition-colors duration-300 group-hover:bg-[color:var(--hf-gold)] group-hover:text-obsidian group-hover:border-[color:var(--hf-gold)]">
                      <ArrowUpRight size={16} strokeWidth={1.5} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right preview card */}
          <div className="hidden lg:block lg:col-span-5">
            <motion.div
              key={SERVICES[active].id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="sticky top-28"
            >
              <div className="framed-img aspect-[4/5] w-full overflow-hidden border border-hair-light">
                <img
                  src={SERVICES[active].img}
                  alt={SERVICES[active].title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(14,15,12,0.75)] via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-x-6 bottom-6 z-10">
                  <p className="font-mono-label text-[color:var(--hf-gold)]">
                    {SERVICES[active].number} · Practice
                  </p>
                  <p className="font-display text-ivory text-2xl md:text-3xl mt-2">
                    {SERVICES[active].tagline}
                  </p>
                </div>
              </div>
              <ul className="mt-6 space-y-3 text-on-dark-2">
                {SERVICES[active].bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 bg-[color:var(--hf-gold)] shrink-0" />
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
