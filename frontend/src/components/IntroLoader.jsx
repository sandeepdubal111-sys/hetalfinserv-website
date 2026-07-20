import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SITE } from "@/lib/data";

const KEY = "hf-intro-played-v1";
const DURATION_MS = 2400;

export default function IntroLoader({ onDone }) {
  // Decide once per session
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    try {
      return !sessionStorage.getItem(KEY);
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!visible) {
      onDone?.();
      return;
    }
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
      setVisible(false);
      document.body.style.overflow = "";
      onDone?.();
    }, DURATION_MS);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-testid="intro-loader"
          aria-hidden="true"
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: "var(--hf-ivory)" }}
          initial={{ opacity: 1 }}
          exit={{
            clipPath: "inset(0 0 100% 0)",
            transition: { duration: 0.9, ease: [0.7, 0, 0.2, 1], delay: 0.05 },
          }}
        >
          {/* Emerald curtain that sweeps in behind at exit */}
          <motion.div
            className="absolute inset-0"
            style={{ background: "var(--hf-emerald-deep)" }}
            initial={{ y: "100%" }}
            animate={{ y: "100%" }}
            exit={{
              y: "0%",
              transition: { duration: 0.6, ease: [0.7, 0, 0.2, 1] },
            }}
          />

          <div className="relative flex flex-col items-center gap-8 px-6">
            {/* Logo mark */}
            <motion.div
              className="relative"
              initial={{ scale: 0.6, opacity: 0, filter: "blur(8px)" }}
              animate={{
                scale: 1,
                opacity: 1,
                filter: "blur(0px)",
                transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
              }}
              exit={{
                scale: 1.15,
                opacity: 0,
                transition: { duration: 0.5, ease: [0.7, 0, 0.2, 1] },
              }}
            >
              {/* Slow rotating orbital ring */}
              <motion.div
                className="absolute -inset-6 md:-inset-8 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              >
                <svg viewBox="0 0 200 200" className="h-full w-full">
                  <defs>
                    <path
                      id="intro-ring-path"
                      d="M 100, 100 m -90, 0 a 90,90 0 1,1 180,0 a 90,90 0 1,1 -180,0"
                    />
                  </defs>
                  <text
                    fill="var(--hf-obsidian)"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "10px",
                      letterSpacing: "0.32em",
                      textTransform: "uppercase",
                      opacity: 0.75,
                    }}
                  >
                    <textPath xlinkHref="#intro-ring-path" startOffset="0">
                      Hetal Finserv · Pvt Ltd · Make Your Money Grow · Est · Pune ·
                    </textPath>
                  </text>
                </svg>
              </motion.div>

              <img
                src={SITE.logo}
                alt=""
                className="h-28 w-28 md:h-36 md:w-36 rounded-full object-cover"
                style={{ boxShadow: "0 20px 40px -20px rgba(14,15,12,0.45)" }}
                width="144"
                height="144"
              />
            </motion.div>

            {/* Wordmark reveal */}
            <div className="text-center overflow-hidden">
              <motion.div
                className="font-display leading-none text-obsidian"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
                initial={{ y: "110%" }}
                animate={{
                  y: "0%",
                  transition: { duration: 0.9, delay: 0.35, ease: [0.7, 0, 0.2, 1] },
                }}
              >
                Hetal<span style={{ color: "var(--hf-gold)" }}>.</span> Finserv
              </motion.div>
              <motion.p
                className="font-mono-label mt-3 text-obsidian"
                style={{ letterSpacing: "0.4em" }}
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: 0.7,
                  y: 0,
                  transition: { duration: 0.6, delay: 0.85 },
                }}
              >
                PVT LTD · MAKE YOUR MONEY GROW
              </motion.p>
            </div>

            {/* Progress bar */}
            <motion.div
              className="w-56 md:w-72 h-px overflow-hidden mt-2"
              style={{ background: "rgba(14,15,12,0.15)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.4 } }}
            >
              <motion.div
                className="h-full"
                style={{
                  background:
                    "linear-gradient(90deg, var(--hf-gold), var(--hf-coral))",
                  transformOrigin: "left center",
                }}
                initial={{ scaleX: 0 }}
                animate={{
                  scaleX: 1,
                  transition: { duration: 1.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 },
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
