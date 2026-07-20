import { AMCS } from "@/lib/data";

export default function AMCPartners() {
  return (
    <section
      data-testid="amc-partners-section"
      className="bg-ivory-2 py-16 md:py-24 border-t border-hair overflow-hidden"
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 mb-10 md:mb-14">
        <div className="flex items-baseline justify-between gap-6 flex-wrap">
          <p className="font-mono-label text-mute">— Distribution partners</p>
          <p className="text-obsidian max-w-lg text-sm md:text-base">
            AMFI-registered distributor for {AMCS.length}+ leading asset management companies.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, dup) => (
            <div key={dup} className="flex items-center gap-16 md:gap-24 pr-16 md:pr-24" aria-hidden={dup === 1}>
              {AMCS.map((name, i) => (
                <div
                  key={`${dup}-${i}`}
                  className="flex items-center gap-4 shrink-0"
                >
                  <span
                    className="font-display text-obsidian"
                    style={{ fontSize: "clamp(1.6rem, 3vw, 2.6rem)", lineHeight: 1 }}
                  >
                    {name}
                  </span>
                  <span className="inline-block h-2 w-2 rotate-45 bg-[color:var(--hf-gold)]" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
