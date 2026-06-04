const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setStoredUser(user) {
  if (user) localStorage.setItem('user', JSON.stringify(user));
  else localStorage.removeItem('user');
}

export async function api(endpoint, options = {}) {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  if (res.status === 401) {
    // Token expired or invalid — clear auth and redirect
    setToken(null);
    setStoredUser(null);
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.details?.[0]?.message || `Request failed (${res.status})`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// Convenience methods
export const apiGet = (url) => api(url);
export const apiPost = (url, body) => api(url, { method: 'POST', body: JSON.stringify(body) });
export const apiPut = (url, body) => api(url, { method: 'PUT', body: JSON.stringify(body) });
export const apiDelete = (url) => api(url, { method: 'DELETE' });
