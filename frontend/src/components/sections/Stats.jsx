import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { STATS } from "@/lib/data";

function CountUp({ target, prefix = "", suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const numeric = parseFloat(String(target).replace(/[^\d.]/g, "")) || 0;
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => {
    if (numeric >= 100) return Math.round(v).toLocaleString("en-IN");
    return v.toFixed(0);
  });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, numeric, { duration: 2, ease: [0.22, 1, 0.36, 1] });
    return controls.stop;
  }, [inView, numeric, mv]);

  return (
    <span ref={ref}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

// Parse "25+", "1,200+", "₹850 Cr", "24"
function parseStat(v) {
  const raw = String(v);
  let prefix = "";
  let suffix = "";
  const numMatch = raw.match(/[\d,\.]+/);
  if (!numMatch) return { prefix: raw, target: "0", suffix: "" };
  const idx = raw.indexOf(numMatch[0]);
  prefix = raw.slice(0, idx);
  suffix = raw.slice(idx + numMatch[0].length);
  const target = numMatch[0].replace(/,/g, "");
  return { prefix, target, suffix };
}

export default function Stats() {
  return (
    <section
      data-testid="stats-section"
      className="bg-ivory py-24 md:py-36 border-t border-hair"
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14">
        <div className="grid grid-cols-12 gap-6 md:gap-10 mb-16">
          <div className="col-span-12 md:col-span-6">
            <p className="font-mono-label text-mute">— By the numbers</p>
            <h2
              className="font-display mt-6 text-obsidian"
              style={{ fontSize: "clamp(2.2rem, 4.5vw, 4.5rem)", lineHeight: 0.98 }}
            >
              A quiet track record,<br />
              two decades in the making.
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-hair">
          {STATS.map((s, i) => {
            const { prefix, target, suffix } = parseStat(s.value);
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={`py-10 md:py-16 pr-4 ${i > 0 ? "border-t sm:border-t-0 sm:border-l border-hair" : ""}`}
                data-testid={`stat-${i}`}
              >
                <div
                  className="font-display text-obsidian"
                  style={{ fontSize: "clamp(2.6rem, 6vw, 6rem)", lineHeight: 0.9 }}
                >
                  <CountUp target={target} prefix={prefix} suffix={suffix} />
                </div>
                <p className="mt-4 font-mono-label text-mute">— {s.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
