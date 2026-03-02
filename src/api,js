// Centraliza todas las llamadas al backend
const API_URL = import.meta.env.VITE_API_URL;

export async function api(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  const res = await fetch(`${API_URL}${endpoint}`, config);

  let data = null;
  try {
    data = await res.json();
  } catch {}

  return { ok: res.ok, data };
}