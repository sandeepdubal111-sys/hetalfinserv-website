import { motion } from "framer-motion";

export default function EditorialMarquee({
  words = ["Disciplined", "Transparent", "Boutique", "Multi-decade", "Family-first", "Discreet"],
  variant = "light", // "light" | "dark"
  speed = 60,
}) {
  const dark = variant === "dark";
  return (
    <section
      data-testid="editorial-marquee"
      className={`relative overflow-hidden ${dark ? "on-dark bg-obsidian text-ivory" : "bg-ivory-2 text-obsidian"} border-t border-b ${dark ? "border-hair-light" : "border-hair"}`}
    >
      <div
        className="flex whitespace-nowrap py-10 md:py-14"
        style={{
          animation: `marquee-x ${speed}s linear infinite`,
        }}
      >
        {Array.from({ length: 2 }).map((_, dup) => (
          <div key={dup} className="flex items-center gap-14 md:gap-24 pr-14 md:pr-24" aria-hidden={dup === 1}>
            {words.map((w, i) => (
              <span key={`${dup}-${i}`} className="flex items-center gap-14 md:gap-24">
                <motion.span
                  className="font-display italic"
                  style={{
                    fontSize: "clamp(2.4rem, 6vw, 6rem)",
                    lineHeight: 1,
                  }}
                >
                  {w}
                </motion.span>
                <span
                  className={`inline-block h-2 w-2 rotate-45 ${dark ? "bg-[color:var(--hf-gold)]" : "bg-obsidian"}`}
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
