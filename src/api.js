const API_URL = import.meta.env.VITE_API_URL || "https://shorashopp-server-1.onrender.com";

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Error ${response.status}`);
  }
  return data;
}

export { API_URL };