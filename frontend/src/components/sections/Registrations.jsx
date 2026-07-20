import { REGISTRATIONS } from "@/lib/data";

/**
 * Editorial regulatory-badge marquee for trust. Runs slowly, pauses on hover.
 * Sits directly under the hero — the first thing that anchors credibility.
 */
export default function Registrations() {
  const items = [...REGISTRATIONS, ...REGISTRATIONS];
  return (
    <section
      data-testid="registrations-section"
      className="bg-obsidian text-ivory border-t border-b border-hair-light overflow-hidden"
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 pt-10 md:pt-12 flex items-baseline justify-between gap-6 flex-wrap">
        <p className="font-mono-label text-[color:var(--hf-gold)]">
          — Regulatory registrations & certifications
        </p>
        <p className="font-mono-label text-[color:rgba(244,239,230,0.55)]">
          AMFI · MahaRERA · IRDAI · PMS · Insurance Broker
        </p>
      </div>

      <div className="relative py-10 md:py-14">
        <div className="marquee-track">
          {items.map((r, i) => (
            <div
              key={`${r.tag}-${i}`}
              className="flex items-center gap-8 pr-14 md:pr-24 shrink-0"
              aria-hidden={i >= REGISTRATIONS.length}
            >
              <div className="flex items-baseline gap-6 shrink-0">
                <span className="font-mono-label text-[color:var(--hf-gold)]">{r.tag}</span>
                <span
                  className="font-display italic text-ivory shrink-0"
                  style={{ fontSize: "clamp(1.8rem, 3.4vw, 3rem)", lineHeight: 1 }}
                >
                  {r.label}
                </span>
                <span className="hidden md:inline font-mono-label text-[color:rgba(244,239,230,0.55)]">
                  {r.detail}
                </span>
              </div>
              <span className="inline-block h-2 w-2 rotate-45 bg-[color:var(--hf-gold)]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
