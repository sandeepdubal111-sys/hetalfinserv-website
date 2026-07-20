import { useState } from "react";
import axios from "axios";
import { LogOut } from "lucide-react";
import { LeadsTab } from "@/pages/admin/LeadsTab";
import { BlogTab } from "@/pages/admin/BlogTab";

const API = process.env.REACT_APP_BACKEND_URL;
const TOKEN_KEY = "hf-admin-token";

function useAdminToken() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const save = (t) => {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
    setToken(t || "");
  };
  return [token, save];
}

function LoginPanel({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await axios.post(`${API}/api/admin/login`, { password: pw });
      onLogin(res.data.token);
    } catch {
      setErr("Wrong password. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="min-h-screen bg-obsidian on-dark text-ivory flex items-center justify-center px-6">
      <form
        onSubmit={submit}
        data-testid="admin-login-form"
        className="w-full max-w-[420px] p-10"
        style={{ border: "1px solid rgba(244,239,230,0.14)" }}
      >
        <p className="font-mono-label" style={{ color: "var(--hf-gold-soft)" }}>
          — HETAL FINSERV · ADMIN
        </p>
        <h1
          className="font-display mt-6"
          style={{ fontSize: "clamp(1.8rem, 3.4vw, 2.6rem)", lineHeight: 1, color: "#f4efe6" }}
        >
          Sign in.
        </h1>
        <label className="block mt-10 font-mono-label text-on-dark-2" style={{ fontSize: "0.7rem" }}>
          Admin password
        </label>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoFocus
          data-testid="admin-password"
          className="w-full mt-3 bg-transparent px-4 py-3 outline-none text-on-dark"
          style={{ border: "1px solid rgba(244,239,230,0.22)" }}
        />
        {err && (
          <p className="mt-3 font-mono-label" style={{ color: "var(--hf-coral)", fontSize: "0.7rem" }}>
            {err}
          </p>
        )}
        <button
          type="submit"
          disabled={!pw || busy}
          data-testid="admin-login-submit"
          className="hf-btn-coral mt-8 w-full justify-center disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

const TABS = [
  { key: "leads", label: "Leads" },
  { key: "blog", label: "Blog" },
];

function Shell({ token, onLogout }) {
  const [tab, setTab] = useState("leads");
  return (
    <main data-testid="admin-dashboard" className="bg-ivory min-h-screen">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-14 pt-16 md:pt-24 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono-label text-mute">— HETAL FINSERV · ADMIN</p>
            <h1 className="font-display text-obsidian mt-4" style={{ fontSize: "clamp(2rem, 4vw, 3.4rem)", lineHeight: 0.98 }}>
              Dashboard.
            </h1>
          </div>
          <button
            onClick={onLogout}
            className="font-mono-label text-mute hover:text-obsidian transition-colors"
            style={{ fontSize: "0.7rem" }}
            data-testid="admin-logout"
          >
            <LogOut size={14} strokeWidth={1.6} className="inline mr-1" />
            Sign out
          </button>
        </div>

        <div className="mt-10 flex gap-6 border-b border-hair" data-testid="admin-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              data-testid={`admin-tab-${t.key}`}
              className="font-mono-label py-3 relative transition-colors"
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                color: tab === t.key ? "var(--hf-obsidian)" : "var(--hf-mute)",
              }}
            >
              {t.label.toUpperCase()}
              {tab === t.key && (
                <span
                  className="absolute left-0 right-0 -bottom-px h-[2px]"
                  style={{ background: "var(--hf-obsidian)" }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="mt-10">
          {tab === "leads" && <LeadsTab token={token} onLogout={onLogout} />}
          {tab === "blog" && <BlogTab token={token} onLogout={onLogout} />}
        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  const [token, setToken] = useAdminToken();
  const logout = async () => {
    if (token) {
      try {
        await axios.post(`${API}/api/admin/logout`, {}, { headers: { "X-Admin-Token": token } });
      } catch {
        /* best-effort */
      }
    }
    setToken("");
  };
  if (!token) return <LoginPanel onLogin={setToken} />;
  return <Shell token={token} onLogout={logout} />;
}
