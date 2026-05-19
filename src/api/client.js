import { STORAGE_KEYS } from "../utils/constants";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/auth";

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) return null;

  const tokens = body.data;
  if (tokens?.accessToken) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, tokens.accessToken);
  }
  if (tokens?.refreshToken) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  }
  return tokens?.accessToken;
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, auth = true, headers = {} } = options;

  const requestHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (auth) {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const doFetch = (tokenOverride) =>
    fetch(`${API_BASE}${path}`, {
      method,
      headers: tokenOverride
        ? { ...requestHeaders, Authorization: `Bearer ${tokenOverride}` }
        : requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let response = await doFetch();
  let data = await response.json().catch(() => ({}));

  if (response.status === 401 && auth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await doFetch(newToken);
      data = await response.json().catch(() => ({}));
    }
  }

  return { ok: response.ok, status: response.status, data };
}

export { API_BASE };
