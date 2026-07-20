import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { FAQS } from "@/lib/data";

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section
      data-testid="faq-section"
      className="bg-bone py-28 md:py-40 border-t border-hair"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14">
        <div className="grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 md:col-span-5">
            <p className="font-mono-label text-mute">— Frequently asked</p>
            <h2
              className="font-display mt-6 text-obsidian"
              style={{ fontSize: "clamp(2.2rem, 4.4vw, 4.4rem)", lineHeight: 0.98 }}
            >
              Questions,<br />
              answered directly.
            </h2>
            <p className="mt-8 text-mute leading-relaxed max-w-md">
              If your question isn't listed here, write to us. Most enquiries receive a
              considered reply within one working day.
            </p>
          </div>

          <div className="col-span-12 md:col-span-7">
            <div data-testid="faq-list">
              {FAQS.map((f, i) => {
                const isOpen = open === i;
                return (
                  <div key={f.q} className="hf-accordion-item">
                    <button
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      data-testid={`faq-toggle-${i}`}
                      className="w-full flex items-start justify-between gap-6 py-6 md:py-8 text-left"
                      aria-expanded={isOpen}
                    >
                      <span
                        className={`font-display transition-colors ${isOpen ? "text-[color:var(--hf-gold-2)]" : "text-obsidian"}`}
                        style={{ fontSize: "clamp(1.25rem, 2vw, 1.9rem)", lineHeight: 1.15 }}
                      >
                        {f.q}
                      </span>
                      <span className="shrink-0 h-8 w-8 border border-[rgba(14,15,12,0.3)] flex items-center justify-center text-obsidian mt-1">
                        {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="pb-8 max-w-2xl text-[color:var(--hf-ink)]/80 leading-[1.75]">
                            {f.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
