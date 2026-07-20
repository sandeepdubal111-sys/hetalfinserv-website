import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { FOUNDER } from "@/lib/data";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Founder() {
  const wrap = useRef(null);
  const { scrollYProgress } = useScroll({
    target: wrap,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-4%", "10%"]);

  return (
    <section
      ref={wrap}
      data-testid="founder-section"
      className="on-dark bg-emerald-deep text-ivory py-28 md:py-40 relative overflow-hidden"
      style={{ background: "var(--hf-emerald-deep)" }}
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14">
        <div className="grid grid-cols-12 gap-6 md:gap-12 items-start">
          {/* Portrait */}
          <div className="col-span-12 lg:col-span-5">
            <div className="relative aspect-[3/4] w-full max-w-[540px] overflow-hidden framed-img border border-hair-light">
              <motion.img
                style={{ y: imgY }}
                src={FOUNDER.portrait}
                alt={`${FOUNDER.name}, ${FOUNDER.role}`}
                className="absolute inset-0 h-[115%] w-full object-cover object-[center_30%]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,42,32,0.4)] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 z-10">
                <p className="font-mono-label text-[color:var(--hf-gold)]">— At the practice</p>
                <p className="font-display text-2xl mt-2">{FOUNDER.name}</p>
                <p className="font-mono-label text-[color:rgba(244,239,230,0.7)] mt-1">
                  {FOUNDER.role}
                </p>
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="col-span-12 lg:col-span-7">
            <p className="font-mono-label text-[color:var(--hf-gold)]">— Founder & Director</p>
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-ivory mt-6"
              style={{ fontSize: "clamp(2.4rem, 5.2vw, 5rem)", lineHeight: 0.95 }}
            >
              {FOUNDER.name}<span className="text-gold">.</span>
            </motion.h2>
            <p className="font-mono-label text-[color:rgba(244,239,230,0.7)] mt-3">
              {FOUNDER.years}
            </p>
            <p className="mt-8 text-lg md:text-xl leading-[1.7] text-[color:rgba(244,239,230,0.85)] max-w-2xl">
              {FOUNDER.bio}
            </p>

            {/* Certifications */}
            <div className="mt-14">
              <p className="font-mono-label text-[color:var(--hf-gold)] mb-6">
                — International & Professional Certifications
              </p>
              <ul
                className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3"
                data-testid="founder-certifications"
              >
                {FOUNDER.certifications.map((c) => (
                  <li
                    key={c}
                    className="flex items-start gap-3 py-2 border-t border-hair-light"
                  >
                    <span className="mt-2 h-1.5 w-1.5 bg-[color:var(--hf-gold)] shrink-0" />
                    <span className="text-[color:rgba(244,239,230,0.9)] text-sm md:text-base">
                      {c}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Achievements */}
            <div className="mt-14">
              <p className="font-mono-label text-[color:var(--hf-gold)] mb-6">
                — Accolades & Achievements
              </p>
              <ul className="space-y-4" data-testid="founder-achievements">
                {FOUNDER.achievements.map((a) => (
                  <li
                    key={a.title}
                    className="grid grid-cols-12 gap-4 py-4 border-t border-hair-light"
                  >
                    <span className="col-span-3 md:col-span-2 font-mono-label text-[color:var(--hf-gold)]">
                      {a.year}
                    </span>
                    <span className="col-span-9 md:col-span-10 text-[color:rgba(244,239,230,0.9)]">
                      {a.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12">
              <Link to="/about" className="hf-btn-outline" data-testid="founder-full-story">
                Read the full story
                <ArrowUpRight size={16} strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
