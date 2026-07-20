import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, X, Save, RefreshCw, History, Eye, EyeOff, AlertTriangle } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL;

// ---------- Reusable branded confirm dialog + imperative hook ----------
function useConfirm() {
  const [state, setState] = useState(null); // { title, message, confirmLabel, cancelLabel, tone, resolve }
  const confirm = (opts) =>
    new Promise((resolve) => {
      setState({
        title: "Are you sure?",
        message: "",
        confirmLabel: "Confirm",
        cancelLabel: "Cancel",
        tone: "obsidian", // "obsidian" | "danger"
        ...opts,
        resolve,
      });
    });
  const settle = (result) => {
    if (state) state.resolve(result);
    setState(null);
  };
  const dialog = state ? (
    <ConfirmDialog
      state={state}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  ) : null;
  return { confirm, dialog };
}

function ConfirmDialog({ state, onConfirm, onCancel }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, onConfirm]);

  const isDanger = state.tone === "danger";
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center px-6"
      style={{ background: "rgba(14,15,12,0.68)" }}
      onClick={onCancel}
      data-testid="confirm-dialog"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] bg-ivory shadow-2xl"
        style={{ border: "1px solid var(--hf-hair)" }}
      >
        <div className="px-6 pt-6 pb-4 flex items-start gap-3">
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 36,
              height: 36,
              background: isDanger ? "rgba(242,122,84,0.14)" : "rgba(14,15,12,0.08)",
              color: isDanger ? "var(--hf-coral)" : "var(--hf-obsidian)",
              border: `1px solid ${isDanger ? "var(--hf-coral)" : "var(--hf-hair)"}`,
            }}
          >
            <AlertTriangle size={16} strokeWidth={1.6} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono-label text-mute" style={{ fontSize: "0.62rem", letterSpacing: "0.16em" }}>
              — {isDanger ? "CONFIRM DESTRUCTIVE ACTION" : "CONFIRM"}
            </p>
            <h3 className="font-display text-obsidian mt-1.5" style={{ fontSize: "1.35rem", lineHeight: 1.1 }}>
              {state.title}
            </h3>
            {state.message && (
              <p className="mt-3 text-obsidian/80" style={{ fontSize: "0.9rem", lineHeight: 1.55 }}>
                {state.message}
              </p>
            )}
          </div>
        </div>
        <div className="px-6 pb-5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="font-mono-label text-mute hover:text-obsidian transition-colors px-3 py-2"
            style={{ fontSize: "0.7rem" }}
            data-testid="confirm-cancel"
          >
            {state.cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            data-testid="confirm-accept"
            className="inline-flex items-center gap-1.5 font-mono-label px-4 py-2 text-white"
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              background: isDanger ? "var(--hf-coral)" : "var(--hf-obsidian)",
            }}
          >
            {state.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const BLOCK_TYPES = [
  { key: "p", label: "Paragraph" },
  { key: "h2", label: "Heading" },
  { key: "quote", label: "Quote" },
  { key: "list", label: "List" },
];

const CATEGORIES = ["investing", "insurance", "planning", "behaviour"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function emptyDraft() {
  return {
    slug: "",
    title: "",
    excerpt: "",
    category: "investing",
    date: today(),
    readMinutes: 5,
    cover: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80",
    body: [{ type: "p", text: "" }],
    published: true,
  };
}

function BlockEditor({ block, onChange, onRemove, onMoveUp, onMoveDown }) {
  return (
    <div className="border border-hair p-4 bg-white" data-testid={`block-${block.type}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <select
          value={block.type}
          onChange={(e) => {
            const next = { ...block, type: e.target.value };
            if (e.target.value === "list" && !Array.isArray(next.items)) next.items = [""];
            if (e.target.value !== "list") delete next.items;
            if (e.target.value === "list") next.text = undefined;
            else if (typeof next.text !== "string") next.text = "";
            onChange(next);
          }}
          className="border border-hair px-3 py-1 bg-transparent text-obsidian font-mono-label"
          style={{ fontSize: "0.66rem" }}
        >
          {BLOCK_TYPES.map((b) => (
            <option key={b.key} value={b.key}>{b.label}</option>
          ))}
        </select>
        <div className="flex gap-1">
          <button type="button" onClick={onMoveUp} className="px-2 py-1 border border-hair text-mute hover:text-obsidian" title="Move up">↑</button>
          <button type="button" onClick={onMoveDown} className="px-2 py-1 border border-hair text-mute hover:text-obsidian" title="Move down">↓</button>
          <button type="button" onClick={onRemove} className="px-2 py-1 border border-hair text-mute hover:text-obsidian" title="Remove block">
            <X size={12} />
          </button>
        </div>
      </div>

      {block.type === "list" ? (
        <div className="space-y-2">
          {(block.items || []).map((it, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <input
                value={it}
                onChange={(e) => {
                  const items = [...block.items];
                  items[idx] = e.target.value;
                  onChange({ ...block, items });
                }}
                placeholder={`List item ${idx + 1}`}
                className="flex-1 border border-hair px-3 py-2 bg-white text-obsidian"
              />
              <button
                type="button"
                onClick={() => onChange({ ...block, items: block.items.filter((_, i) => i !== idx) })}
                className="px-2 py-2 border border-hair text-mute hover:text-obsidian"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ ...block, items: [...(block.items || []), ""] })}
            className="font-mono-label text-mute hover:text-obsidian"
            style={{ fontSize: "0.66rem" }}
          >
            + Add list item
          </button>
        </div>
      ) : (
        <textarea
          value={block.text || ""}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          rows={block.type === "p" ? 4 : 2}
          placeholder={block.type === "quote" ? "A memorable line…" : "Write here…"}
          className="w-full border border-hair px-3 py-2 bg-white text-obsidian font-serif"
          style={{ fontSize: block.type === "h2" ? "1.1rem" : "0.95rem", lineHeight: 1.6 }}
        />
      )}
    </div>
  );
}

function PostEditor({ token, initial, onClose, onSaved, isNew, confirm }) {
  const [draft, setDraft] = useState(initial || emptyDraft());
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function set(k, v) { setDraft((d) => ({ ...d, [k]: v })); setDirty(true); }

  function updateBlock(i, next) {
    const body = [...draft.body];
    body[i] = next;
    set("body", body);
  }
  function removeBlock(i) { set("body", draft.body.filter((_, idx) => idx !== i)); }
  function moveBlock(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= draft.body.length) return;
    const body = [...draft.body];
    [body[i], body[j]] = [body[j], body[i]];
    set("body", body);
  }
  function addBlock() { set("body", [...draft.body, { type: "p", text: "" }]); }

  async function tryClose() {
    if (dirty) {
      const ok = await confirm({
        title: "Discard changes?",
        message: "You have unsaved edits on this post. Closing now will lose them.",
        confirmLabel: "Discard",
        cancelLabel: "Keep editing",
        tone: "danger",
      });
      if (!ok) return;
    }
    onClose();
  }

  async function save() {
    setErr("");
    if (!draft.slug || !/^[a-z0-9-]+$/.test(draft.slug)) return setErr("Slug must be lowercase, numbers and dashes only.");
    if (!draft.title || draft.title.length < 6) return setErr("Title must be at least 6 characters.");
    if (!draft.excerpt || draft.excerpt.length < 10) return setErr("Excerpt must be at least 10 characters.");
    if (!draft.cover) return setErr("Cover URL is required.");

    setBusy(true);
    try {
      const payload = { ...draft, readMinutes: Number(draft.readMinutes) || 5 };
      if (isNew) {
        await axios.post(`${API}/api/admin/blog`, payload, { headers: { "X-Admin-Token": token } });
      } else {
        // On PUT, slug is path-scoped and not part of the body
        const { slug, ...rest } = payload;
        await axios.put(`${API}/api/admin/blog/${slug}`, rest, { headers: { "X-Admin-Token": token } });
      }
      onSaved();
      setDirty(false);
    } catch (e) {
      const msg = e.response?.data?.detail || e.message;
      setErr(typeof msg === "string" ? msg : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[95] flex justify-end"
      data-testid="blog-editor"
      style={{ background: "rgba(14,15,12,0.55)" }}
      onClick={tryClose}
    >
      <SlideOver onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-hair sticky top-0 bg-ivory z-10">
          <div>
            <p className="font-mono-label text-mute" style={{ fontSize: "0.66rem" }}>
              — {isNew ? "NEW POST" : "EDIT POST"}
              {dirty && (
                <span className="ml-2" style={{ color: "var(--hf-coral)" }} data-testid="blog-editor-dirty">
                  · UNSAVED
                </span>
              )}
            </p>
            <h3 className="font-display text-obsidian mt-1" style={{ fontSize: "1.4rem", lineHeight: 1 }}>
              {isNew ? "Draft a new piece" : draft.title || "Untitled"}
            </h3>
          </div>
          <button onClick={tryClose} className="p-2 border border-hair text-obsidian" data-testid="blog-editor-close">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <Field label="Slug (URL)">
            <div className="flex gap-2 items-center">
              <input
                value={draft.slug}
                onChange={(e) => set("slug", e.target.value.toLowerCase())}
                disabled={!isNew}
                placeholder="url-friendly-slug"
                data-testid="blog-editor-slug"
                className="flex-1 border border-hair px-3 py-2 bg-white text-obsidian disabled:opacity-60"
              />
              {isNew && (
                <button
                  type="button"
                  onClick={() => set("slug", slugify(draft.title))}
                  className="font-mono-label text-mute hover:text-obsidian border border-hair px-3 py-2"
                  style={{ fontSize: "0.66rem" }}
                >
                  From title
                </button>
              )}
            </div>
          </Field>

          <Field label="Title">
            <input
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              data-testid="blog-editor-title"
              className="w-full border border-hair px-3 py-2 bg-white text-obsidian font-display"
              style={{ fontSize: "1.1rem" }}
            />
          </Field>

          <Field label="Excerpt (shown in list + digest email)">
            <textarea
              value={draft.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={3}
              data-testid="blog-editor-excerpt"
              className="w-full border border-hair px-3 py-2 bg-white text-obsidian"
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Category">
              <select
                value={draft.category}
                onChange={(e) => set("category", e.target.value)}
                data-testid="blog-editor-category"
                className="w-full border border-hair px-3 py-2 bg-white text-obsidian"
              >
                {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </Field>
            <Field label="Date (YYYY-MM-DD)">
              <input
                type="date"
                value={draft.date}
                onChange={(e) => set("date", e.target.value)}
                data-testid="blog-editor-date"
                className="w-full border border-hair px-3 py-2 bg-white text-obsidian"
              />
            </Field>
            <Field label="Read (mins)">
              <input
                type="number"
                min={1}
                max={60}
                value={draft.readMinutes}
                onChange={(e) => set("readMinutes", e.target.value)}
                data-testid="blog-editor-read-minutes"
                className="w-full border border-hair px-3 py-2 bg-white text-obsidian"
              />
            </Field>
          </div>

          <Field label="Cover image URL">
            <input
              value={draft.cover}
              onChange={(e) => set("cover", e.target.value)}
              data-testid="blog-editor-cover"
              className="w-full border border-hair px-3 py-2 bg-white text-obsidian"
            />
            {draft.cover && (
              <img src={draft.cover} alt="cover preview" className="mt-2 w-full max-h-40 object-cover border border-hair" />
            )}
          </Field>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono-label text-mute" style={{ fontSize: "0.66rem", letterSpacing: "0.18em" }}>
                BODY · {draft.body.length} BLOCK{draft.body.length === 1 ? "" : "S"}
              </p>
              <button
                type="button"
                onClick={addBlock}
                className="hf-btn-outline"
                data-testid="blog-editor-add-block"
              >
                <Plus size={12} />
                Add block
              </button>
            </div>
            <div className="space-y-3">
              {draft.body.map((b, i) => (
                <BlockEditor
                  key={i}
                  block={b}
                  onChange={(next) => updateBlock(i, next)}
                  onRemove={() => removeBlock(i)}
                  onMoveUp={() => moveBlock(i, -1)}
                  onMoveDown={() => moveBlock(i, +1)}
                />
              ))}
            </div>
          </div>

          <Field label="Published">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!draft.published}
                onChange={(e) => set("published", e.target.checked)}
                data-testid="blog-editor-published"
              />
              <span className="font-mono-label" style={{ fontSize: "0.66rem" }}>
                {draft.published ? "Visible on /blog" : "Draft (hidden from public)"}
              </span>
            </label>
          </Field>

          {err && (
            <p className="font-mono-label" style={{ color: "var(--hf-coral)", fontSize: "0.7rem" }} data-testid="blog-editor-error">
              {err}
            </p>
          )}
        </div>

        <div className="sticky bottom-0 bg-ivory border-t border-hair px-6 py-4 flex items-center justify-end gap-3">
          <button onClick={tryClose} className="font-mono-label text-mute hover:text-obsidian" style={{ fontSize: "0.7rem" }}>
            Cancel
          </button>
          <button onClick={save} disabled={busy} className="hf-btn-coral disabled:opacity-50" data-testid="blog-editor-save">
            <Save size={14} strokeWidth={1.6} />
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </SlideOver>
    </div>
  );
}

// Simple slide-over wrapper — kept as a plain div for zero framer-motion dep here.
function SlideOver({ children, onClick }) {
  return (
    <section
      onClick={onClick}
      className="bg-ivory h-full w-full max-w-[720px] overflow-y-auto shadow-2xl"
      style={{ borderLeft: "1px solid var(--hf-hair)" }}
    >
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block font-mono-label text-mute mb-1.5" style={{ fontSize: "0.66rem", letterSpacing: "0.16em" }}>
        {label.toUpperCase()}
      </label>
      {children}
    </div>
  );
}

export function BlogTab({ token, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null); // { post, isNew }
  const [deleting, setDeleting] = useState(""); // slug
  const [toggling, setToggling] = useState(""); // slug currently mid-toggle
  const [historyOpen, setHistoryOpen] = useState(false);
  const { confirm, dialog: confirmDialog } = useConfirm();

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get(`${API}/api/admin/blog`, { headers: { "X-Admin-Token": token } });
      setPosts(res.data);
    } catch (e) {
      if (e.response?.status === 401) onLogout();
      else setErr("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function del(slug) {
    const ok = await confirm({
      title: `Delete "${slug}"?`,
      message: "This removes the post permanently. Audit rows are kept.",
      confirmLabel: "Delete post",
      cancelLabel: "Keep",
      tone: "danger",
    });
    if (!ok) return;
    setDeleting(slug);
    try {
      await axios.delete(`${API}/api/admin/blog/${slug}`, { headers: { "X-Admin-Token": token } });
      setPosts((p) => p.filter((x) => x.slug !== slug));
    } catch (e) {
      alert(e.response?.data?.detail || "Delete failed.");
    } finally {
      setDeleting("");
    }
  }

  async function togglePublish(slug, next) {
    setToggling(slug);
    // Optimistic
    setPosts((rows) => rows.map((r) => (r.slug === slug ? { ...r, published: next } : r)));
    try {
      await axios.put(
        `${API}/api/admin/blog/${slug}`,
        { published: next },
        { headers: { "X-Admin-Token": token } }
      );
    } catch (e) {
      // Roll back on failure
      setPosts((rows) => rows.map((r) => (r.slug === slug ? { ...r, published: !next } : r)));
      alert(e.response?.data?.detail || "Toggle failed.");
    } finally {
      setToggling("");
    }
  }

  return (
    <div data-testid="blog-tab">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 className="font-display text-obsidian" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)", lineHeight: 1 }}>
          {posts.length} post{posts.length === 1 ? "" : "s"}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={load} className="hf-btn-outline" data-testid="blog-refresh">
            <RefreshCw size={14} strokeWidth={1.6} />
            Refresh
          </button>
          <button
            onClick={() => setHistoryOpen(true)}
            className="hf-btn-outline"
            data-testid="blog-history-open"
          >
            <History size={14} strokeWidth={1.6} />
            History
          </button>
          <button
            onClick={() => setEditing({ post: emptyDraft(), isNew: true })}
            className="hf-btn-coral"
            data-testid="blog-new"
          >
            <Plus size={14} strokeWidth={1.6} />
            New post
          </button>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto" data-testid="blog-posts-table">
        {loading ? (
          <p className="py-16 text-center font-mono-label text-mute">Loading…</p>
        ) : err ? (
          <p className="py-16 text-center font-mono-label" style={{ color: "var(--hf-coral)" }}>{err}</p>
        ) : posts.length === 0 ? (
          <p className="py-16 text-center font-mono-label text-mute">No posts yet.</p>
        ) : (
          <table className="w-full text-left" style={{ fontSize: "0.88rem" }}>
            <thead>
              <tr className="border-b border-hair">
                {["Date", "Title", "Category", "Slug", "Read", "Status", ""].map((h) => (
                  <th key={h} className="py-3 pr-4 font-mono-label text-mute whitespace-nowrap" style={{ fontSize: "0.66rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.slug} className="border-b border-hair align-top" data-testid={`blog-row-${p.slug}`}>
                  <td className="py-4 pr-4 text-obsidian whitespace-nowrap">{p.date}</td>
                  <td className="py-4 pr-4 text-obsidian font-display" style={{ fontSize: "1rem" }}>{p.title}</td>
                  <td className="py-4 pr-4 text-mute">{p.category}</td>
                  <td className="py-4 pr-4 text-mute" style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>{p.slug}</td>
                  <td className="py-4 pr-4 text-mute whitespace-nowrap">{p.readMinutes} min</td>
                  <td className="py-4 pr-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => togglePublish(p.slug, !p.published)}
                      disabled={toggling === p.slug}
                      data-testid={`blog-toggle-publish-${p.slug}`}
                      data-published={p.published ? "true" : "false"}
                      title={p.published ? "Click to unpublish (hide from /blog)" : "Click to publish"}
                      className="inline-flex items-center gap-1.5 font-mono-label px-2.5 py-1.5 border transition-colors disabled:opacity-50"
                      style={{
                        fontSize: "0.62rem",
                        letterSpacing: "0.14em",
                        color: p.published ? "#0E0F0C" : "var(--hf-mute)",
                        background: p.published ? "var(--hf-gold-soft, #F7E7B0)" : "transparent",
                        borderColor: p.published ? "var(--hf-gold)" : "var(--hf-hair)",
                      }}
                    >
                      {p.published ? <Eye size={11} /> : <EyeOff size={11} />}
                      {toggling === p.slug ? "…" : p.published ? "PUBLISHED" : "DRAFT"}
                    </button>
                  </td>
                  <td className="py-4 pr-0 text-right whitespace-nowrap">
                    <button
                      onClick={() => setEditing({ post: { ...p }, isNew: false })}
                      className="inline-flex items-center gap-1 border border-hair px-3 py-2 text-obsidian hover:bg-white transition-colors"
                      data-testid={`blog-edit-${p.slug}`}
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => del(p.slug)}
                      disabled={deleting === p.slug}
                      className="inline-flex items-center gap-1 border border-hair px-3 py-2 ml-2 text-obsidian hover:bg-white transition-colors disabled:opacity-50"
                      data-testid={`blog-delete-${p.slug}`}
                    >
                      <Trash2 size={12} />
                      {deleting === p.slug ? "…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <PostEditor
          token={token}
          initial={editing.post}
          isNew={editing.isNew}
          confirm={confirm}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
      {historyOpen && (
        <HistoryDrawer token={token} onClose={() => setHistoryOpen(false)} />
      )}
      {confirmDialog}
    </div>
  );
}

const ACTION_TONE = {
  created: "var(--hf-emerald-deep)",
  updated: "var(--hf-obsidian)",
  published: "var(--hf-gold)",
  unpublished: "var(--hf-mute)",
  deleted: "var(--hf-coral)",
};

function fmtTs(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function HistoryDrawer({ token, onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get(`${API}/api/admin/blog/audit?limit=200`, {
        headers: { "X-Admin-Token": token },
      });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch {
      setErr("Couldn't load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div
      className="fixed inset-0 z-[95] flex justify-end"
      data-testid="blog-history-drawer"
      style={{ background: "rgba(14,15,12,0.55)" }}
      onClick={onClose}
    >
      <section
        onClick={(e) => e.stopPropagation()}
        className="bg-ivory h-full w-full max-w-[520px] overflow-y-auto shadow-2xl"
        style={{ borderLeft: "1px solid var(--hf-hair)" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-hair sticky top-0 bg-ivory z-10">
          <div>
            <p className="font-mono-label text-mute" style={{ fontSize: "0.66rem" }}>— BLOG · HISTORY</p>
            <h3 className="font-display text-obsidian mt-1" style={{ fontSize: "1.4rem", lineHeight: 1 }}>
              Recent activity
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="p-2 border border-hair text-obsidian"
              data-testid="blog-history-refresh"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-2 border border-hair text-obsidian"
              data-testid="blog-history-close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="py-10 text-center font-mono-label text-mute">Loading…</p>
          ) : err ? (
            <p className="py-10 text-center font-mono-label" style={{ color: "var(--hf-coral)" }}>{err}</p>
          ) : rows.length === 0 ? (
            <p className="py-10 text-center font-mono-label text-mute" data-testid="blog-history-empty">
              No activity yet.
            </p>
          ) : (
            <ol className="space-y-3" data-testid="blog-history-list">
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="border border-hair p-4 bg-white"
                  data-testid={`blog-history-row-${r.id}`}
                  data-action={r.action}
                  data-slug={r.slug}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-mono-label px-2 py-0.5 text-white"
                          style={{
                            fontSize: "0.6rem",
                            letterSpacing: "0.14em",
                            background: ACTION_TONE[r.action] || "var(--hf-obsidian)",
                          }}
                        >
                          {(r.action || "").toUpperCase()}
                        </span>
                        <span className="font-mono-label text-mute" style={{ fontSize: "0.66rem" }}>
                          {fmtTs(r.ts)}
                        </span>
                      </div>
                      <p
                        className="mt-2 font-display text-obsidian truncate"
                        style={{ fontSize: "0.98rem" }}
                        title={r.title || r.slug}
                      >
                        {r.title || r.slug}
                      </p>
                      <p className="text-mute mt-0.5" style={{ fontSize: "0.78rem", fontFamily: "monospace" }}>
                        {r.slug}
                      </p>
                      {r.changed_fields?.length > 0 && (
                        <p className="text-mute mt-1.5" style={{ fontSize: "0.75rem" }}>
                          fields: <span className="text-obsidian">{r.changed_fields.join(", ")}</span>
                        </p>
                      )}
                    </div>
                    <span
                      className="font-mono-label text-mute whitespace-nowrap"
                      style={{ fontSize: "0.62rem" }}
                      title="Admin session hash (first 8 chars of SHA256 of the session token)"
                    >
                      by {r.actor}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}
