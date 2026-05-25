const API_BASE = '/api';
const TOKEN_KEY = 'bidbazaar_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(path, options = {}) {
  const headers = { ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  if (!(options.body instanceof FormData) && options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...options,
      headers,
    });
  } catch {
    const err = new Error(
      'Cannot reach the API server. Start the backend: cd backend && npm run dev',
    );
    err.status = 0;
    throw err;
  }

  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text.slice(0, 200) || 'Invalid server response' };
    }
  }

  if (!res.ok) {
    const err = new Error(data.error || data.detail || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  getListings: () => apiFetch('/listings/'),
  getListing: (id) => apiFetch(`/listings/${id}/`),
  createListing: (formData) => apiFetch('/listings/create/', { method: 'POST', body: formData }),
  yourListings: () => apiFetch('/listings/mine/'),
  wonListings: () => apiFetch('/listings/won/'),
  watchList: () => apiFetch('/listings/watch/'),
  placeBid: (id, value) => apiFetch(`/listings/${id}/bid/`, { method: 'POST', body: { value } }),
  toggleWatch: (id) => apiFetch(`/listings/${id}/watch/`, { method: 'POST' }),
  closeAuction: (id) => apiFetch(`/listings/${id}/close/`, { method: 'POST' }),
  addComment: (id, comment) => apiFetch(`/listings/${id}/comments/`, { method: 'POST', body: { comment } }),
  getCategories: () => apiFetch('/categories/'),
  getCategoryListings: (cat) => apiFetch(`/categories/${encodeURIComponent(cat)}/`),
  me: () => apiFetch('/auth/me/'),
  login: (username, password) => apiFetch('/auth/login/', { method: 'POST', body: { username, password } }),
  logout: () => apiFetch('/auth/logout/', { method: 'POST' }),
  register: (data) => apiFetch('/auth/register/', { method: 'POST', body: data }),
  otpVerify: (otp, sid) => apiFetch('/auth/otp-verify/', { method: 'POST', body: { otp, ...(sid ? { sid } : {}) } }),
  forgotPassword: (username, email) => apiFetch('/auth/forgot-password/', { method: 'POST', body: { username, email } }),
  passwordOtp: (otp) => apiFetch('/auth/password-otp/', { method: 'POST', body: { otp } }),
  getProfile: () => apiFetch('/profile/'),
  updateProfile: (formData) => apiFetch('/profile/', { method: 'PUT', body: formData }),
  changePassword: (data) => apiFetch('/profile/password/', { method: 'POST', body: data }),
  adminDashboard: () => apiFetch('/admin/dashboard/'),
  adminUsers: () => apiFetch('/admin/users/'),
  adminToggleStaff: (id) => apiFetch(`/admin/users/${id}/toggle-staff/`, { method: 'POST' }),
  adminToggleAdmin: (id) => apiFetch(`/admin/users/${id}/toggle-admin/`, { method: 'POST' }),
  adminDeleteUser: (id) => apiFetch(`/admin/users/${id}/delete/`, { method: 'POST' }),
  adminListings: (q) => apiFetch(q ? `/admin/listings/?q=${encodeURIComponent(q)}` : '/admin/listings/'),
  adminDeactivate: (id) => apiFetch(`/admin/listings/${id}/deactivate/`, { method: 'POST' }),
  adminDelete: (id) => apiFetch(`/admin/listings/${id}/delete/`, { method: 'POST' }),
  adminReports: () => apiFetch('/admin/reports/'),
};
