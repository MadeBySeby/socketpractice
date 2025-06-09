// src/utils/api.js
const API_BASE = "/api"; // Always use proxy

// Helper function for API calls
export const apiFetch = (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  return fetch(url, options);
};

// Usage examples:
// apiFetch('/user')
// apiFetch('/posts', { method: 'POST', body: JSON.stringify(data) })
// apiFetch('/auth/login', { method: 'POST', body: formData })

// Or create a more complete API client:
export const api = {
  get: (endpoint) => apiFetch(endpoint),
  post: (endpoint, data) =>
    apiFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  put: (endpoint, data) =>
    apiFetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  delete: (endpoint) => apiFetch(endpoint, { method: "DELETE" }),
};

// Usage:
// const user = await api.get('/user');
// const result = await api.post('/auth/login', { username, password });
