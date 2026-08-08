import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { MaskLine } from "@/components/MaskedReveal";
import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/data";

export default function Hero() {
  const wrapRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);

  // Wait for the intro loader to exit before we start the hero reveal
  const [ready, setReady] = useState(() =>
    typeof window !== "undefined" ? !!window.__hfIntroDone : true
  );
  useEffect(() => {
    if (ready) return;
    const handler = (e) => e?.detail?.done && setReady(true);
    window.addEventListener("hf:intro-done", handler);
    // Safety net — if intro never signals, reveal after 2.6s
    const fallback = setTimeout(() => setReady(true), 2600);
    return () => {
      window.removeEventListener("hf:intro-done", handler);
      clearTimeout(fallback);
    };
  }, [ready]);

  useEffect(() => {
    document.body.style.overflowX = "hidden";
  }, []);

  return (
    <section
      ref={wrapRef}
      data-testid="hero-section"
      className="relative min-h-[100svh] w-full overflow-hidden bg-ivory pt-28"
    >
      {/* Background editorial ticker (huge outlined type) */}
      <div className="absolute inset-x-0 top-[28%] pointer-events-none select-none opacity-[0.06]">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex whitespace-nowrap pr-16">
              {["WEALTH", "TRUST", "PLAN", "LEGACY", "GROWTH"].map((w, i) => (
                <span
                  key={`${k}-${i}`}
                  className="font-display text-obsidian pr-16"
                  style={{
                    fontSize: "clamp(9rem, 22vw, 22rem)",
                    lineHeight: 1,
                    WebkitTextStroke: "1px currentColor",
                    color: "transparent",
                  }}
                >
                  {w} ·
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div
        key={ready ? "hero-on" : "hero-off"}
        className="relative max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 grid grid-cols-12 gap-6 h-full min-h-[calc(100svh-6rem)] pb-40 md:pb-16 pt-8 md:pt-12"
      >
        {/* Left copy */}
        <motion.div
          style={{ y: textY }}
          className="col-span-12 lg:col-span-8 flex flex-col justify-end"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-4 mb-8"
          >
            <span className="h-px w-10 bg-obsidian" />
            <span className="font-mono-label text-obsidian">
              Hetal Finserv Private Limited — Pune, India
            </span>
          </motion.div>

          <h1
            className="font-display text-obsidian"
            style={{ fontSize: "clamp(3rem, 10vw, 11rem)", lineHeight: 0.9 }}
          >
            <span className="block">
              <MaskLine delay={0.35}>It's Not Just</MaskLine>
            </span>
            <span className="block">
              <MaskLine delay={0.55}>a Strategy.</MaskLine>
            </span>
            <span className="block italic text-[color:var(--hf-gold-2)]">
              <MaskLine delay={0.75}>It's Personal.</MaskLine>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 max-w-xl text-lg md:text-xl text-[color:var(--hf-ink)]/80 leading-relaxed"
          >
            One-stop financial partner for Mutual Funds, PMS, Insurance, Loans and
            Real Estate. Founded by certified experts. Personally delivered — from Pune,
            across India.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.25, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link to="/contact" className="hf-btn-coral" data-testid="hero-book-cta">
              Book Free Consultation
              <ArrowUpRight size={16} strokeWidth={1.5} />
            </Link>
            <Link to="/about" className="hf-btn-outline" data-testid="hero-explore-cta">
              Discover Our Firm
            </Link>
          </motion.div>
        </motion.div>

        {/* Right editorial portrait */}
        <motion.div
          style={{ y: imageY }}
          className="col-span-12 lg:col-span-4 hidden lg:flex items-end justify-end"
        >
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(100% 0 0 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0% 0 0 0)" }}
            transition={{ duration: 1.4, delay: 0.5, ease: [0.7, 0, 0.2, 1] }}
            className="relative w-full aspect-[3/4] max-w-[420px] overflow-hidden framed-img"
            style={{ background: "#1a1a1a" }}
          >
            <motion.img
              style={{ scale: imageScale }}
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80"
              alt="Advisor consulting with client"
              className="h-full w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[rgba(14,15,12,0.5)] via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 z-10 text-ivory">
              <p className="font-mono-label text-[color:var(--hf-gold)]">— At the desk</p>
              <p className="font-display text-xl mt-1">
                Advice, in person.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-8 left-6 md:left-10 lg:left-14 flex items-center gap-3 z-10"
      >
        <span className="font-mono-label text-obsidian">Scroll</span>
        <span className="h-px w-16 bg-obsidian" />
      </motion.div>

      {/* Rotating logo seal — editorial trust mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:block absolute z-10"
        style={{ top: "9rem", right: "3rem" }}
        aria-hidden="true"
      >
        <div className="relative h-24 w-24 lg:h-28 lg:w-28">
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 200 200" className="h-full w-full">
              <defs>
                <path
                  id="hero-seal-path"
                  d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0"
                />
              </defs>
              <text
                fill="var(--hf-obsidian)"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "14px",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                }}
              >
                <textPath xlinkHref="#hero-seal-path" startOffset="0">
                  Hetal Finserv · Make Your Money Grow ·
                </textPath>
              </text>
            </svg>
          </motion.div>
          <div className="absolute inset-5 flex items-center justify-center">
            <img
              src={SITE.logo}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
