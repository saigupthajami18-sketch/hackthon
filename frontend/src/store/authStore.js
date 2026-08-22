import { create } from 'zustand';
import api from '../api/client';

const _getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const _getStoredToken = () => localStorage.getItem('access_token') || null;

const useAuthStore = create((set, get) => ({
  user: _getStoredUser(),
  token: _getStoredToken(),
  isAuthenticated: !!(_getStoredToken() && _getStoredUser()),
  loading: false,

  // Called after successful login
  login: (token, user) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  setUser: (user) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  // Hydrate user from /auth/me if token exists but user is null (e.g. hard refresh with old format)
  hydrateFromToken: async () => {
    const token = _getStoredToken();
    if (!token) return;

    const storedUser = _getStoredUser();
    if (storedUser) {
      set({ user: storedUser, isAuthenticated: true });
      return;
    }

    // Token exists but user isn't cached — fetch from API
    set({ loading: true });
    try {
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = res.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true, loading: false });
    } catch {
      // Token invalid/expired — clear everything
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      set({ token: null, user: null, isAuthenticated: false, loading: false });
    }
  },
}));

export default useAuthStore;
