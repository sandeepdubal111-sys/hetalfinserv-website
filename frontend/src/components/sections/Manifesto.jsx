import { motion } from "framer-motion";
import { MANIFESTO } from "@/lib/data";

export default function Manifesto() {
  return (
    <section
      data-testid="manifesto-section"
      className="relative bg-ivory py-28 md:py-40 lg:py-56"
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14">
        <div className="grid grid-cols-12 gap-6 md:gap-10 mb-20">
          <div className="col-span-12 md:col-span-4">
            <p className="font-mono-label text-mute">— Manifesto</p>
          </div>
          <div className="col-span-12 md:col-span-8">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-obsidian"
              style={{ fontSize: "clamp(2.6rem, 5.5vw, 5.5rem)", lineHeight: 0.95 }}
            >
              Three chapters that shape<br />
              every recommendation we make.
            </motion.h2>
          </div>
        </div>

        <div className="space-y-24 md:space-y-32">
          {MANIFESTO.map((c, idx) => (
            <motion.article
              key={c.number}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 1, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-12 gap-6 md:gap-10 items-start"
              data-testid={`manifesto-chapter-${c.number}`}
            >
              <div className="col-span-12 md:col-span-4">
                <div className="sticky top-28">
                  <span
                    className="font-display block text-[color:var(--hf-gold)] italic"
                    style={{ fontSize: "clamp(5rem, 12vw, 11rem)", lineHeight: 0.85 }}
                  >
                    {c.number}
                  </span>
                  <p className="font-mono-label text-obsidian mt-6">— {c.kicker}</p>
                </div>
              </div>
              <div className="col-span-12 md:col-span-8">
                <h3
                  className="font-display text-obsidian"
                  style={{ fontSize: "clamp(1.8rem, 3.6vw, 3.6rem)", lineHeight: 0.98 }}
                >
                  {c.title}
                </h3>
                <p className="mt-8 md:mt-10 text-lg md:text-xl leading-[1.7] text-[color:var(--hf-ink)]/85 max-w-2xl">
                  {c.body}
                </p>
                <div className="mt-10 h-px w-24 bg-[color:var(--hf-gold)]" />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
