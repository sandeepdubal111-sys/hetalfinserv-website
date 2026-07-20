import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { BLOG_POSTS, BLOG_CATEGORIES, formatDate } from "@/lib/blog";
import { useState } from "react";
import { MaskLine } from "@/components/MaskedReveal";

const catToneColor = {
  gold: "var(--hf-gold)",
  coral: "var(--hf-coral)",
  emerald: "var(--hf-emerald-deep)",
  obsidian: "var(--hf-obsidian)",
};

function CategoryPill({ cat, active, onClick }) {
  const tone = active ? catToneColor[cat?.tone] || "var(--hf-obsidian)" : "transparent";
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2 rounded-full font-mono-label transition-all border"
      style={{
        fontSize: "0.7rem",
        letterSpacing: "0.18em",
        background: tone,
        borderColor: active ? tone : "rgba(14,15,12,0.18)",
        color: active ? "#fff" : "var(--hf-obsidian)",
      }}
      data-testid={`blog-cat-${cat?.key || "all"}`}
    >
      {cat?.label || "All"}
    </button>
  );
}

export default function BlogPage() {
  const [category, setCategory] = useState(null);
  const posts = category
    ? BLOG_POSTS.filter((p) => p.category === category)
    : BLOG_POSTS;
  const [featured, ...rest] = posts;

  return (
    <main data-testid="blog-page" className="bg-ivory pt-40 md:pt-52 pb-24">
      <section className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14">
        <p className="font-mono-label text-mute">— The Hetal Finserv Knowledge Center</p>
        <h1
          className="font-display text-obsidian mt-6"
          style={{ fontSize: "clamp(2.6rem, 7vw, 7rem)", lineHeight: 0.92 }}
        >
          <span className="block"><MaskLine delay={0.15}>Notes on money,</MaskLine></span>
          <span className="block italic" style={{ color: "var(--hf-gold)" }}>
            <MaskLine delay={0.35}>plainly written.</MaskLine>
          </span>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.9 }}
          className="mt-8 max-w-2xl text-obsidian leading-[1.75]"
        >
          Every article here is written by the same team that manages your money. No
          click-bait, no jargon — just the ideas we return to in client conversations.
        </motion.p>

        {/* Category filters */}
        <div className="mt-14 flex flex-wrap gap-3" data-testid="blog-filters">
          <CategoryPill cat={{ key: "all", label: "All" }} active={!category} onClick={() => setCategory(null)} />
          {BLOG_CATEGORIES.map((c) => (
            <CategoryPill
              key={c.key}
              cat={c}
              active={category === c.key}
              onClick={() => setCategory(c.key)}
            />
          ))}
        </div>

        {/* Featured post */}
        {featured && (
          <Link
            to={`/blog/${featured.slug}`}
            data-testid={`blog-featured-${featured.slug}`}
            className="group mt-16 md:mt-20 grid grid-cols-12 gap-8 md:gap-14 items-center"
          >
            <div className="col-span-12 md:col-span-7 aspect-[4/3] md:aspect-[16/11] overflow-hidden bg-hair">
              <img
                src={featured.cover}
                alt={featured.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>
            <div className="col-span-12 md:col-span-5">
              <p className="font-mono-label text-mute">
                — {BLOG_CATEGORIES.find((c) => c.key === featured.category)?.label} · {formatDate(featured.date)} · {featured.readMinutes} min read
              </p>
              <h2
                className="font-display text-obsidian mt-6 group-hover:text-[color:var(--hf-coral)] transition-colors"
                style={{ fontSize: "clamp(1.8rem, 3.4vw, 3.2rem)", lineHeight: 1.0 }}
              >
                {featured.title}
              </h2>
              <p className="mt-6 text-obsidian leading-[1.75]">{featured.excerpt}</p>
              <span className="mt-8 inline-flex items-center gap-2 link-underline font-mono-label text-obsidian">
                Read the piece <ArrowUpRight size={14} strokeWidth={1.5} />
              </span>
            </div>
          </Link>
        )}

        {/* Grid */}
        <ul
          className="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14"
          data-testid="blog-grid"
        >
          {rest.map((post, i) => (
            <motion.li
              key={post.slug}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, delay: (i % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={`/blog/${post.slug}`}
                data-testid={`blog-card-${post.slug}`}
                className="group block h-full"
              >
                <div className="aspect-[4/3] overflow-hidden bg-hair">
                  <img
                    src={post.cover}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                </div>
                <p className="mt-6 font-mono-label text-mute">
                  — {BLOG_CATEGORIES.find((c) => c.key === post.category)?.label} · {formatDate(post.date)}
                </p>
                <h3
                  className="font-display text-obsidian mt-3 group-hover:text-[color:var(--hf-coral)] transition-colors"
                  style={{ fontSize: "1.4rem", lineHeight: 1.15 }}
                >
                  {post.title}
                </h3>
                <p className="mt-3 text-mute leading-relaxed" style={{ fontSize: "0.95rem" }}>
                  {post.excerpt}
                </p>
              </Link>
            </motion.li>
          ))}
        </ul>
      </section>
    </main>
  );
}
