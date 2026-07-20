import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { fetchPost, fetchRelated, formatDate, BLOG_CATEGORIES } from "@/lib/blog";
import { SITE } from "@/lib/data";

function Block({ block }) {
  if (block.type === "h2") {
    return (
      <h2
        className="font-display text-obsidian mt-14 mb-6"
        style={{ fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)", lineHeight: 1.1 }}
      >
        {block.text}
      </h2>
    );
  }
  if (block.type === "quote") {
    return (
      <blockquote
        className="my-14 md:my-16 py-2 pl-6 md:pl-10 border-l-2 font-display italic"
        style={{
          borderColor: "var(--hf-gold)",
          fontSize: "clamp(1.3rem, 2.2vw, 1.8rem)",
          lineHeight: 1.35,
          color: "var(--hf-obsidian)",
        }}
      >
        {block.text}
      </blockquote>
    );
  }
  if (block.type === "list") {
    return (
      <ul className="my-6 space-y-3 pl-1">
        {block.items.map((it, i) => (
          <li key={i} className="flex items-start gap-4 text-obsidian leading-[1.75]">
            <span
              className="mt-2 shrink-0 h-1.5 w-1.5 rotate-45"
              style={{ background: "var(--hf-coral)" }}
            />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    );
  }
  // default: paragraph
  return (
    <p className="text-obsidian leading-[1.85] my-5" style={{ fontSize: "1.05rem" }}>
      {block.text}
    </p>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const cat = BLOG_CATEGORIES.find((c) => c.key === post?.category);

  useEffect(() => {
    let cancelled = false;
    window.scrollTo({ top: 0, behavior: "instant" });
    setLoading(true);
    fetchPost(slug)
      .then(async (data) => {
        if (cancelled) return;
        setPost(data);
        try {
          const r = await fetchRelated(slug, 3);
          if (!cancelled) setRelated(r);
        } catch {
          if (!cancelled) setRelated([]);
        }
      })
      .catch(() => {
        if (!cancelled) navigate("/blog", { replace: true });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug, navigate]);

  if (loading) {
    return (
      <main className="bg-ivory pt-40 md:pt-52 pb-24">
        <p className="max-w-[900px] mx-auto px-6 md:px-10 font-mono-label text-mute" data-testid="post-loading">
          — Fetching the piece…
        </p>
      </main>
    );
  }
  if (!post) return null;

  return (
    <main data-testid="blog-post-page" className="bg-ivory pt-40 md:pt-48 pb-24">
      {/* Hero */}
      <article className="max-w-[900px] mx-auto px-6 md:px-10">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 font-mono-label text-mute hover:text-obsidian transition-colors"
          data-testid="back-to-blog"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to the knowledge center
        </Link>

        <p className="mt-10 font-mono-label text-mute">
          — {cat?.label} · {formatDate(post.date)} · {post.readMinutes} min read
        </p>
        <h1
          className="font-display text-obsidian mt-6"
          style={{ fontSize: "clamp(2.2rem, 5.2vw, 4.4rem)", lineHeight: 1.0 }}
        >
          {post.title}
        </h1>
        <p className="mt-8 text-obsidian leading-[1.85]" style={{ fontSize: "1.15rem" }}>
          {post.excerpt}
        </p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 aspect-[16/9] overflow-hidden bg-hair"
        >
          <img
            src={post.cover}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="mt-14" data-testid="post-body">
          {post.body.map((b, i) => (
            <Block key={i} block={b} />
          ))}
        </div>

        {/* Advisor CTA */}
        <div
          className="mt-24 p-10 md:p-14"
          style={{
            background: "var(--hf-obsidian)",
            color: "var(--hf-on-dark-primary)",
          }}
          data-testid="post-cta"
        >
          <p className="font-mono-label" style={{ color: "var(--hf-gold-soft)" }}>
            — Ready to act on this
          </p>
          <h3
            className="font-display mt-4"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1.1, color: "#f4efe6" }}
          >
            Bring these ideas to your money.
          </h3>
          <p className="mt-4 text-on-dark-2 leading-[1.75] max-w-lg">
            A senior advisor will translate this article into a specific action for your
            portfolio in one working day.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link
              to="/contact"
              state={{ service: "Financial Planning", message: `I read your article "${post.title}" and would like to discuss what it means for my portfolio.` }}
              className="hf-btn-coral"
              data-testid="post-cta-book"
            >
              Book a conversation
              <ArrowUpRight size={16} strokeWidth={1.5} />
            </Link>
            <a
              href={`mailto:${SITE.email}?subject=${encodeURIComponent(`On your article: ${post.title}`)}`}
              className="link-underline font-mono-label"
              style={{ color: "var(--hf-on-dark-primary)" }}
            >
              Or email {SITE.email}
            </a>
          </div>
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="max-w-[1300px] mx-auto px-6 md:px-10 mt-24 md:mt-32">
          <p className="font-mono-label text-mute mb-10">— More from the practice</p>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  to={`/blog/${r.slug}`}
                  className="group block"
                  data-testid={`related-${r.slug}`}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-hair">
                    <img
                      src={r.cover}
                      alt={r.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                  </div>
                  <p className="mt-5 font-mono-label text-mute">
                    — {BLOG_CATEGORIES.find((c) => c.key === r.category)?.label}
                  </p>
                  <h4
                    className="font-display text-obsidian mt-2 group-hover:text-[color:var(--hf-coral)] transition-colors"
                    style={{ fontSize: "1.2rem", lineHeight: 1.2 }}
                  >
                    {r.title}
                  </h4>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
