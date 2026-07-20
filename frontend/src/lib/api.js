import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL;
export const API = `${BASE}/api`;

export const api = axios.create({
  baseURL: API,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export async function createLead(payload) {
  const { data } = await api.post("/leads", payload);
  return data;
}

export async function createContact(payload) {
  const { data } = await api.post("/contacts", payload);
  return data;
}

export async function createCallback(payload) {
  const { data } = await api.post("/callbacks", payload);
  return data;
}
