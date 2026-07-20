import { AMCS } from "@/lib/data";

/**
 * AMC partners marquee — high contrast, dual-row, alternating direction.
 * Text is rendered dark on cream, with a gold diamond separator between names.
 */
export default function AMCPartners() {
  const half = Math.ceil(AMCS.length / 2);
  const row1 = AMCS.slice(0, half);
  const row2 = AMCS.slice(half);
  return (
    <section
      data-testid="amc-partners-section"
      className="bg-ivory-2 py-20 md:py-28 border-t border-b border-hair overflow-hidden"
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 mb-12 md:mb-16">
        <div className="grid grid-cols-12 gap-6 md:gap-10 items-end">
          <div className="col-span-12 md:col-span-6">
            <p className="font-mono-label text-mute">— Our AMC partners</p>
            <h2
              className="font-display text-obsidian mt-6"
              style={{ fontSize: "clamp(2rem, 4vw, 3.6rem)", lineHeight: 0.98 }}
            >
              Top Mutual Fund<br />
              Houses in India.
            </h2>
          </div>
          <div className="col-span-12 md:col-span-6">
            <p className="text-obsidian max-w-lg leading-relaxed">
              AMFI-Registered MFD (ARN-254254). {AMCS.length} leading Asset Management
              Companies. Regular Plans only, with full commission disclosure.
            </p>
          </div>
        </div>
      </div>

      {/* Row 1 — left direction */}
      <div className="relative">
        <div className="marquee-track marquee-track-fast">
          {Array.from({ length: 2 }).map((_, dup) => (
            <div
              key={dup}
              className="flex items-center gap-12 md:gap-16 pr-12 md:pr-16"
              aria-hidden={dup === 1}
            >
              {row1.map((name, i) => (
                <div key={`r1-${dup}-${i}`} className="flex items-center gap-6 shrink-0">
                  <span
                    className="font-display text-obsidian"
                    style={{
                      fontSize: "clamp(1.4rem, 2.6vw, 2.4rem)",
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {name}
                  </span>
                  <span
                    className="inline-block h-2 w-2 rotate-45 shrink-0"
                    style={{ background: "var(--hf-gold)" }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 — reversed direction */}
      <div className="relative mt-6 md:mt-8">
        <div
          className="marquee-track marquee-track-fast"
          style={{ animationDirection: "reverse" }}
        >
          {Array.from({ length: 2 }).map((_, dup) => (
            <div
              key={dup}
              className="flex items-center gap-12 md:gap-16 pr-12 md:pr-16"
              aria-hidden={dup === 1}
            >
              {row2.map((name, i) => (
                <div key={`r2-${dup}-${i}`} className="flex items-center gap-6 shrink-0">
                  <span
                    className="font-display italic"
                    style={{
                      fontSize: "clamp(1.4rem, 2.6vw, 2.4rem)",
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                      color: "var(--hf-emerald)",
                    }}
                  >
                    {name}
                  </span>
                  <span
                    className="inline-block h-2 w-2 rotate-45 shrink-0"
                    style={{ background: "var(--hf-coral)" }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
