const BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, opts = {}) {
  const token = getToken();
  const res = await fetch(BASE + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    ...opts,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : null; } catch { throw new Error(`Invalid JSON from ${path}`); }
  if (!res.ok) throw new Error(json?.message || `Request failed ${res.status}`);
  return json;
}

export default {
  login: (credentials) => request('/login', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: () => request('/logout', { method: 'POST' }),

  getProducts: () => request('/products'),
  createProduct: (payload) => request('/products', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  getUsers: () => request('/users'),
  createUser: (payload) => request('/users', { method: 'POST', body: JSON.stringify(payload) }),
  updateUser: (id, payload) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  getSales: () => request('/sales'),
  createSale: (payload) => request('/sales', { method: 'POST', body: JSON.stringify(payload) }),
  getSale: (id) => request(`/sales/${id}`),
  getUserSales: (userId) => request(`/sales/user/${userId}`),

  getVoidRequests: () => request('/void-requests'),
  createVoidRequest: (payload) => request('/void-requests', { method: 'POST', body: JSON.stringify(payload) }),
  reviewVoidRequest: (id, payload) => request(`/void-requests/${id}/review`, { method: 'PATCH', body: JSON.stringify(payload) }),
};