// Blog UI config + tiny API client. Post data is now DB-managed via /api/blog.
import axios from "axios";

const API = process.env.REACT_APP_BACKEND_URL;

export const BLOG_CATEGORIES = [
  { key: "investing", label: "Investing", tone: "gold" },
  { key: "insurance", label: "Insurance", tone: "coral" },
  { key: "planning", label: "Planning", tone: "emerald" },
  { key: "behaviour", label: "Behaviour", tone: "obsidian" },
];

export async function fetchPosts(category) {
  const url = category ? `${API}/api/blog?category=${encodeURIComponent(category)}` : `${API}/api/blog`;
  const res = await axios.get(url);
  return res.data;
}

export async function fetchPost(slug) {
  const res = await axios.get(`${API}/api/blog/${slug}`);
  return res.data;
}

export async function fetchRelated(slug, limit = 3) {
  const res = await axios.get(`${API}/api/blog/${slug}/related?limit=${limit}`);
  return res.data;
}

export function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
