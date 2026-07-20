import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TESTIMONIALS } from "@/lib/data";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";

export default function Testimonials() {
  const [i, setI] = useState(0);
  const count = TESTIMONIALS.length;
  const t = TESTIMONIALS[i];

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % count), 7000);
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
            <p className="font-mono-label text-mute">— In their words</p>
          </div>
          <div className="col-span-12 md:col-span-8">
            <h2
              className="font-display text-obsidian"
              style={{ fontSize: "clamp(2.2rem, 4.5vw, 4.5rem)", lineHeight: 0.98 }}
            >
              The best endorsement<br />
              is one you don't ask for.
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 md:gap-10 items-end">
          <div className="col-span-12 md:col-span-9 relative min-h-[220px]">
            <Quote
              size={64}
              strokeWidth={1}
              className="text-[color:var(--hf-gold)] mb-6 opacity-80"
            />
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
                  style={{ fontSize: "clamp(1.6rem, 3.4vw, 3.2rem)", lineHeight: 1.1 }}
                >
                  “{t.quote}”
                </p>
                <footer className="mt-8 flex items-center gap-6">
                  <span className="h-px w-14 bg-obsidian" />
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
