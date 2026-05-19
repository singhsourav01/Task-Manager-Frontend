import { apiRequest } from "../api/client";
import { successResponse, errorResponse } from "../utils/responseHelper";
import { STORAGE_KEYS } from "../utils/constants";
import { mapUser } from "../utils/mappers";

function persistSession({ user, accessToken, refreshToken }) {
  localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

const authService = {
  async register({ name, email, password }) {
    const { ok, data } = await apiRequest("/register", {
      method: "POST",
      auth: false,
      body: { name, email, password },
    });

    if (!ok) {
      return errorResponse(data.message || "Registration failed", 400);
    }

    const user = mapUser(data.data.user);
    persistSession({
      user,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    });

    return successResponse(
      { user, token: data.data.accessToken, refreshToken: data.data.refreshToken },
      data.message,
    );
  },

  async login(email, password) {
    const { ok, data } = await apiRequest("/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    });

    if (!ok) {
      return errorResponse(data.message || "Invalid email or password", 401);
    }

    const user = mapUser(data.data.user);
    persistSession({
      user,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    });

    return successResponse(
      { user, token: data.data.accessToken, refreshToken: data.data.refreshToken },
      data.message,
    );
  },

  async logout() {
    await apiRequest("/logout", { method: "POST" });
    clearSession();
    return successResponse(null, "Logged out successfully");
  },

  async getCurrentUser() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      return errorResponse("No session found", 401);
    }

    const { ok, data } = await apiRequest("/profile");
    if (!ok) {
      clearSession();
      return errorResponse(data.message || "Session expired. Please log in again.", 401);
    }

    const user = mapUser(data.data);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return successResponse(user, "Session valid");
  },

  getStoredToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem(STORAGE_KEYS.TOKEN));
  },
};

export default authService;
