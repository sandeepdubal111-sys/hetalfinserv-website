import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Download, RefreshCw, Search, ArrowUpDown } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL;

function toCSV(leads) {
  const cols = ["created_at", "name", "phone", "email", "service", "source", "message", "id", "contacted"];
  const header = cols.join(",");
  const rows = leads.map((l) =>
    cols
      .map((c) => {
        const v = l[c] ?? "";
        const s = String(v).replaceAll('"', '""');
        return `"${s}"`;
      })
      .join(",")
  );
  return [header, ...rows].join("\n");
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function LeadsTab({ token, onLogout }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [service, setService] = useState("all");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get(`${API}/api/admin/leads`, { headers: { "X-Admin-Token": token } });
      setLeads(res.data);
    } catch (e) {
      if (e.response?.status === 401) onLogout();
      else setErr("Failed to load leads. Try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const services = useMemo(() => {
    const s = new Set(leads.map((l) => l.service).filter(Boolean));
    return ["all", ...Array.from(s)];
  }, [leads]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = leads.filter((l) => {
      if (service !== "all" && l.service !== service) return false;
      if (!q) return true;
      return (
        (l.name || "").toLowerCase().includes(q) ||
        (l.phone || "").toLowerCase().includes(q) ||
        (l.email || "").toLowerCase().includes(q) ||
        (l.message || "").toLowerCase().includes(q)
      );
    });
    list = [...list].sort((a, b) => {
      const va = a[sortKey] ?? "";
      const vb = b[sortKey] ?? "";
      const cmp = String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [leads, query, service, sortKey, sortDir]);

  async function markContacted(id, contacted) {
    try {
      await axios.patch(
        `${API}/api/admin/leads/${id}`,
        { contacted },
        { headers: { "X-Admin-Token": token } }
      );
      setLeads((rows) => rows.map((r) => (r.id === id ? { ...r, contacted } : r)));
    } catch {
      /* ignore */
    }
  }

  function toggleSort(k) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  }

  return (
    <div data-testid="leads-tab">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 className="font-display text-obsidian" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)", lineHeight: 1 }}>
          {filtered.length} of {leads.length} leads
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={load} className="hf-btn-outline" data-testid="admin-refresh">
            <RefreshCw size={14} strokeWidth={1.6} />
            Refresh
          </button>
          <button
            onClick={() => downloadCSV(toCSV(filtered), `hetal-leads-${new Date().toISOString().slice(0, 10)}.csv`)}
            className="hf-btn-coral"
            data-testid="admin-export-csv"
          >
            <Download size={14} strokeWidth={1.6} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 border border-hair px-4 py-2 flex-1 min-w-[220px] max-w-md">
          <Search size={14} className="text-mute" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, email, message…"
            className="bg-transparent outline-none flex-1 text-obsidian"
            data-testid="admin-search"
          />
        </div>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="border border-hair px-4 py-2 bg-transparent text-obsidian"
          data-testid="admin-service-filter"
        >
          {services.map((s) => (
            <option key={s} value={s}>{s === "all" ? "All services" : s}</option>
          ))}
        </select>
      </div>

      <div className="mt-8 overflow-x-auto" data-testid="admin-leads-table">
        {loading ? (
          <p className="py-16 text-center font-mono-label text-mute">Loading…</p>
        ) : err ? (
          <p className="py-16 text-center font-mono-label" style={{ color: "var(--hf-coral)" }}>{err}</p>
        ) : (
          <table className="w-full text-left" style={{ fontSize: "0.88rem" }}>
            <thead>
              <tr className="border-b border-hair">
                {[
                  ["created_at", "When"],
                  ["name", "Name"],
                  ["phone", "Phone"],
                  ["email", "Email"],
                  ["service", "Service"],
                  ["source", "Source"],
                ].map(([k, label]) => (
                  <th key={k} onClick={() => toggleSort(k)} className="py-3 pr-4 font-mono-label text-mute cursor-pointer whitespace-nowrap" style={{ fontSize: "0.66rem" }}>
                    <span className="inline-flex items-center gap-1.5">
                      {label}
                      <ArrowUpDown size={10} className={sortKey === k ? "text-obsidian" : "opacity-40"} />
                    </span>
                  </th>
                ))}
                <th className="py-3 pr-4 font-mono-label text-mute" style={{ fontSize: "0.66rem" }}>Message</th>
                <th className="py-3 pr-4 font-mono-label text-mute" style={{ fontSize: "0.66rem" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-hair align-top" data-testid={`admin-lead-${l.id}`}>
                  <td className="py-4 pr-4 text-obsidian whitespace-nowrap">{fmtDate(l.created_at)}</td>
                  <td className="py-4 pr-4 text-obsidian font-display" style={{ fontSize: "1rem" }}>{l.name}</td>
                  <td className="py-4 pr-4 text-obsidian whitespace-nowrap">
                    <a href={`tel:${l.phone}`} className="link-underline">{l.phone}</a>
                  </td>
                  <td className="py-4 pr-4 text-obsidian">
                    {l.email ? <a href={`mailto:${l.email}`} className="link-underline">{l.email}</a> : "—"}
                  </td>
                  <td className="py-4 pr-4 text-obsidian">{l.service || "—"}</td>
                  <td className="py-4 pr-4 text-mute">{l.source || "website"}</td>
                  <td className="py-4 pr-4 text-obsidian max-w-[380px]">
                    <div className="whitespace-pre-wrap leading-snug" style={{ fontSize: "0.85rem" }}>{l.message || "—"}</div>
                  </td>
                  <td className="py-4 pr-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!l.contacted}
                        onChange={(e) => markContacted(l.id, e.target.checked)}
                        data-testid={`admin-contacted-${l.id}`}
                      />
                      <span className="font-mono-label" style={{ fontSize: "0.66rem", color: l.contacted ? "var(--hf-gold)" : "var(--hf-mute)" }}>
                        {l.contacted ? "Contacted" : "Pending"}
                      </span>
                    </label>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center font-mono-label text-mute">No leads match this filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
