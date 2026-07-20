import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TESTIMONIALS } from "@/lib/data";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";

export default function Testimonials() {
  const [i, setI] = useState(0);
  const count = TESTIMONIALS.length;
  const t = TESTIMONIALS[i];

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % count), 8000);
    return () => clearInterval(id);
  }, [count]);

  return (
    <section
      data-testid="testimonials-section"
      className="bg-ivory py-28 md:py-40 border-t border-hair"
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14">
        <div className="grid grid-cols-12 gap-6 md:gap-10 mb-16">
          <div className="col-span-12 md:col-span-4">
            <p className="font-mono-label text-mute">— Client testimonials</p>
            <div className="mt-6 flex items-baseline gap-3">
              <span
                className="font-display text-obsidian"
                style={{ fontSize: "clamp(2.4rem, 4.6vw, 4.4rem)", lineHeight: 1 }}
              >
                4.9
              </span>
              <div className="flex items-center gap-0.5" aria-label="4.9 out of 5 stars">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star
                    key={k}
                    size={16}
                    fill="var(--hf-gold)"
                    stroke="var(--hf-gold)"
                    strokeWidth={0.5}
                  />
                ))}
              </div>
            </div>
            <p className="font-mono-label text-mute mt-3">Based on 200+ verified reviews</p>
          </div>
          <div className="col-span-12 md:col-span-8">
            <h2
              className="font-display text-obsidian"
              style={{ fontSize: "clamp(2.2rem, 4.5vw, 4.5rem)", lineHeight: 0.98 }}
            >
              What our clients<br />
              say about us.
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 md:gap-10 items-end">
          <div className="col-span-12 md:col-span-9 relative min-h-[260px]">
            <div className="flex items-center gap-1 mb-6" aria-hidden="true">
              {Array.from({ length: t.rating || 5 }).map((_, k) => (
                <Star
                  key={k}
                  size={20}
                  fill="var(--hf-gold)"
                  stroke="var(--hf-gold)"
                  strokeWidth={0}
                />
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                data-testid="testimonial-quote"
              >
                <p
                  className="font-display text-obsidian italic"
                  style={{ fontSize: "clamp(1.4rem, 2.7vw, 2.5rem)", lineHeight: 1.22 }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="mt-10 flex items-center gap-5">
                  <span
                    aria-hidden="true"
                    className="h-12 w-12 rounded-full bg-obsidian text-ivory font-mono-label flex items-center justify-center shrink-0"
                  >
                    {t.initials || t.author.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </span>
                  <div>
                    <div className="font-mono-label text-obsidian">— {t.author}</div>
                    <div className="font-mono-label text-mute mt-1">{t.context}</div>
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="col-span-12 md:col-span-3 flex md:flex-col items-center md:items-end gap-4 mt-10 md:mt-0 justify-end">
            <div className="flex items-center gap-3">
              <button
                aria-label="Previous testimonial"
                data-testid="testimonial-prev"
                onClick={() => setI((v) => (v - 1 + count) % count)}
                className="h-11 w-11 border border-[rgba(14,15,12,0.3)] flex items-center justify-center hover:bg-obsidian hover:text-ivory transition-colors"
              >
                <ArrowLeft size={16} strokeWidth={1.5} />
              </button>
              <button
                aria-label="Next testimonial"
                data-testid="testimonial-next"
                onClick={() => setI((v) => (v + 1) % count)}
                className="h-11 w-11 border border-[rgba(14,15,12,0.3)] flex items-center justify-center hover:bg-obsidian hover:text-ivory transition-colors"
              >
                <ArrowRight size={16} strokeWidth={1.5} />
              </button>
            </div>
            <p className="font-mono-label text-mute">
              {String(i + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
