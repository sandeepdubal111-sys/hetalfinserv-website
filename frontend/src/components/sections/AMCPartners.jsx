import { AMCS } from "@/lib/data";
import BrandLogo from "@/components/BrandLogo";

function LogoChip({ item, variant = "light" }) {
  const dark = variant === "dark";
  return (
    <div className="flex items-center gap-4 shrink-0">
      <BrandLogo
        domain={item.domain}
        name={item.name}
        brandColor="#0E0F0C"
        size={64}
        shape="rounded"
      />
      <span
        className={dark ? "font-display italic" : "font-display"}
        style={{
          fontSize: "clamp(1.3rem, 2.4vw, 2.2rem)",
          lineHeight: 1,
          whiteSpace: "nowrap",
          color: dark ? "var(--hf-on-dark-primary)" : "var(--hf-obsidian)",
        }}
      >
        {item.name}
      </span>
    </div>
  );
}

/**
 * AMC partners marquee — real brand logos + names, dual-row alternating direction.
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

      {/* Row 1 — left */}
      <div className="relative">
        <div className="marquee-track marquee-track-fast">
          {Array.from({ length: 2 }).map((_, dup) => (
            <div
              key={dup}
              className="flex items-center gap-10 md:gap-14 pr-10 md:pr-14"
              aria-hidden={dup === 1}
            >
              {row1.map((item, i) => (
                <div
                  key={`r1-${dup}-${i}`}
                  className="flex items-center gap-8 shrink-0"
                >
                  <LogoChip item={item} />
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

      {/* Row 2 — reversed */}
      <div className="relative mt-8 md:mt-10">
        <div
          className="marquee-track marquee-track-fast"
          style={{ animationDirection: "reverse" }}
        >
          {Array.from({ length: 2 }).map((_, dup) => (
            <div
              key={dup}
              className="flex items-center gap-10 md:gap-14 pr-10 md:pr-14"
              aria-hidden={dup === 1}
            >
              {row2.map((item, i) => (
                <div
                  key={`r2-${dup}-${i}`}
                  className="flex items-center gap-8 shrink-0"
                >
                  <LogoChip item={item} />
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
