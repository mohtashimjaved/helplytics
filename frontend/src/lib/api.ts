const API_BASE = process.env.NEXT_PUBLIC_API_URL

import { getCookie, setCookie, removeCookie } from './cookies';

// Helper to get stored token
function getToken(): string | null {
  return getCookie('token');
}

// Generic fetch wrapper with Next.js 16 caching
async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['x-auth-token'] = token;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    // Latest Next.js 16 caching strategy
    next: {
      revalidate: options.method === 'GET' ? 60 : 0, // Cache for 60s on GET, no cache on others
      ...(options as any).next,
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.msg || data.message || 'Something went wrong');
  }
  return data;
}

// ─── Auth ────────────────────────────────────
export async function loginUser(email: string, password: string) {
  const data = await request('/auth/login', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json', // 👈 Crucial! Without this, Express might parse body as undefined
  },
    body: JSON.stringify({ email, password }),
  });
  
  // Set cookies for proxy file access
  setCookie('token', data.token);
  setCookie('user', JSON.stringify(data.user));
  
  return data;
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  role: string;
  skills: string[];
  interests: string[];
  location: string;
}) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  
  setCookie('token', data.token);
  setCookie('user', JSON.stringify(data.user));
  
  return data;
}

export async function fetchMe() {
  return request('/auth/me');
}

export function logoutUser() {
  removeCookie('token');
  removeCookie('user');
}

export function getCurrentUser() {
  const raw = getCookie('user');
  return raw ? JSON.parse(decodeURIComponent(raw)) : null;
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// ─── Help Requests ───────────────────────────
export async function getRequests(filters?: { category?: string; urgency?: string; tag?: string }) {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.urgency) params.set('urgency', filters.urgency);
  if (filters?.tag) params.set('tag', filters.tag);
  const qs = params.toString();
  return request(`/requests${qs ? `?${qs}` : ''}`);
}

export async function getRequestById(id: string) {
  return request(`/requests/${id}`);
}

export async function getMyRequests() {
  return request('/requests/me');
}

export async function createRequest(payload: {
  title: string;
  description: string;
  category: string;
  tags: string[];
  urgency: string;
}) {
  return request('/requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function offerHelp(requestId: string) {
  return request(`/requests/${requestId}/offer-help`, {
    method: 'POST',
  });
}

export async function markSolved(requestId: string, helperId?: string) {
  return request(`/requests/${requestId}/solve`, {
    method: 'POST',
    body: JSON.stringify({ helperId }),
  });
}

export async function addMessage(requestId: string, text: string) {
  return request(`/requests/${requestId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export async function updateHelpRequest(id: string, payload: {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  urgency?: string;
  status?: string;
}) {
  return request(`/requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteHelpRequest(id: string) {
  return request(`/requests/${id}`, {
    method: 'DELETE',
  });
}

// ─── Users / Leaderboard ─────────────────────
export async function getLeaderboard() {
  return request('/users/leaderboard');
}

export async function getUserProfile(id: string) {
  return request(`/users/${id}`);
}

export async function updateProfile(payload: {
  name?: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  location?: string;
}) {
  const data = await request('/users/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  
  // Update the user cookie with the fresh data
  setCookie('user', JSON.stringify(data.user));
  
  return data;
}

export async function getTrends() {
  return request('/requests/stats/trends');
}
