import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowUpRight, X } from "lucide-react";
import { REGULATORS } from "@/lib/data";

/**
 * Footer "Verify Us" widget — opens a modal with each regulator's
 * registration number + a link to the official verification page.
 */
export default function VerifyUsButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="verify-us-open"
        className="inline-flex items-center gap-3 px-4 py-2 transition-colors"
        style={{
          background: "rgba(253,249,238,0.06)",
          border: "1px solid rgba(253,249,238,0.2)",
          color: "var(--hf-on-dark-primary)",
          borderRadius: 999,
        }}
      >
        <ShieldCheck size={14} strokeWidth={1.6} style={{ color: "var(--hf-gold)" }} />
        <span className="font-mono-label text-[0.62rem]">Verify us</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="verify-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="fixed inset-0 z-[150]"
              style={{ background: "rgba(10,12,8,0.7)", backdropFilter: "blur(4px)" }}
              onClick={() => setOpen(false)}
              data-testid="verify-us-backdrop"
              aria-hidden="true"
            />
            <motion.div
              key="verify-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Verify our registrations"
              data-testid="verify-us-modal"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="fixed z-[151] left-1/2 top-1/2 w-[min(680px,92vw)] max-h-[86vh] overflow-y-auto"
              style={{
                transform: "translate(-50%, -50%)",
                background: "var(--hf-bone)",
                color: "var(--hf-obsidian)",
                border: "1px solid rgba(14,15,12,0.15)",
                boxShadow: "0 40px 80px -20px rgba(10,12,8,0.5)",
              }}
            >
              <div className="flex items-start justify-between gap-6 px-8 md:px-10 pt-8">
                <div>
                  <p className="font-mono-label text-mute">— Verify Us</p>
                  <h3
                    className="font-display text-obsidian mt-3"
                    style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1 }}
                  >
                    Five registrations,<br />
                    each independently verifiable.
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  data-testid="verify-us-close"
                  className="h-10 w-10 flex items-center justify-center shrink-0"
                  style={{ border: "1px solid rgba(14,15,12,0.2)" }}
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>

              <ul className="mt-8 px-8 md:px-10 pb-8">
                {REGULATORS.map((r) => (
                  <li
                    key={r.key}
                    className="py-5"
                    style={{ borderTop: "1px solid rgba(14,15,12,0.12)" }}
                    data-testid={`verify-item-${r.key}`}
                  >
                    <a
                      href={r.verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-6 group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-3">
                          <span
                            className="font-display text-obsidian"
                            style={{ fontSize: "1.4rem", lineHeight: 1 }}
                          >
                            {r.name}
                          </span>
                          <span className="font-mono-label text-mute truncate">
                            {r.full}
                          </span>
                        </div>
                        <p className="text-obsidian mt-2 text-sm">{r.regNo}</p>
                      </div>
                      <span
                        className="h-11 w-11 flex items-center justify-center shrink-0 transition-colors group-hover:bg-obsidian group-hover:text-[color:var(--hf-on-dark-primary)]"
                        style={{ border: "1px solid rgba(14,15,12,0.25)" }}
                      >
                        <ArrowUpRight size={16} strokeWidth={1.5} />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>

              <p className="font-mono-label text-mute px-8 md:px-10 pb-8 leading-relaxed">
                Each link opens the respective regulator's official verification portal in
                a new tab. We publish our registration numbers because you should never
                have to take our word for it.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
